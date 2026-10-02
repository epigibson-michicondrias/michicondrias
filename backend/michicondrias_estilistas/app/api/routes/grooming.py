from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import bindparam, func, text
from sqlalchemy.orm import Session
from datetime import date, timedelta
import logging

import httpx
from jose import jwt, JWTError

from app.api import deps
from app.db.session import get_db
from app.crud import crud_grooming
from app.core.config import settings
from app.models.grooming import GroomingAppointment
from app.schemas.grooming import (
    GroomingAppointmentCreate,
    GroomingAppointmentUpdatePhotos,
    GroomingAppointmentOut,
    GroomingHistory,
    GroomingServiceCreate,
    GroomingServiceUpdate,
    GroomingServiceOut,
    GroomingReviewCreate,
    GroomingReviewOut,
    GroomingReviewsSummary,
)
from app.models.grooming import GroomingService, GroomingReview

logger = logging.getLogger(__name__)


def _optional_user_id(token: str | None = Depends(deps.oauth2_scheme)) -> str | None:
    """Id del usuario si manda un token válido; None si es anónimo (deps.py no trae esta variante)."""
    if not token:
        return None
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[deps.ALGORITHM]).get("sub")
    except JWTError:
        return None


def _pet_owner_id(db: Session, pet_id: str):
    row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": pet_id}).first()
    return row[0] if row else None

router = APIRouter()

# Quién puede mover una cita de un estado a otro. "pending" es el estado heredado de citas anteriores.
# El cliente solo puede cancelar; antes el estilista podía poner cualquier texto como estado.
OPEN_STATUSES = {"scheduled", "pending", "confirmed"}
PROVIDER_TRANSITIONS = {
    "scheduled": {"confirmed", "in_progress", "completed", "cancelled"},
    "pending": {"confirmed", "in_progress", "completed", "cancelled"},
    "confirmed": {"in_progress", "completed", "cancelled"},
    "in_progress": {"completed", "cancelled"},
}
CLIENT_TRANSITIONS = {"scheduled": {"cancelled"}, "pending": {"cancelled"}, "confirmed": {"cancelled"}}
VALID_STATUSES = {"scheduled", "pending", "confirmed", "in_progress", "completed", "cancelled"}


def _names(db: Session, table: str, column: str, ids: set) -> dict:
    """Mapa id -> nombre leyendo tablas hermanas (misma BD). Si falla, devuelve vacío sin romper la respuesta."""
    if not ids:
        return {}
    try:
        stmt = text(f"SELECT id, {column} FROM {table} WHERE id IN :ids").bindparams(bindparam("ids", expanding=True))
        return {str(r[0]): r[1] for r in db.execute(stmt, {"ids": list(ids)}).fetchall()}
    except Exception:
        db.rollback()
        return {}


def _appointments_out(db: Session, appts: list, viewer_id: str | None = None) -> list:
    reviewed = set()
    if appts and viewer_id:
        rows = db.query(GroomingReview.appointment_id).filter(
            GroomingReview.appointment_id.in_([a.id for a in appts]), GroomingReview.user_id == viewer_id
        ).all()
        reviewed = {r[0] for r in rows}
    pets = {}
    owners = {}
    if appts:
        try:
            stmt = text("SELECT id, name, owner_id FROM pets WHERE id IN :ids").bindparams(bindparam("ids", expanding=True))
            for r in db.execute(stmt, {"ids": list({a.pet_id for a in appts})}).fetchall():
                pets[str(r[0])] = r[1]
                owners[str(r[0])] = r[2]
        except Exception:
            db.rollback()
    users = _names(db, "users", "full_name", {a.groomer_id for a in appts} | {o for o in owners.values() if o})
    out = []
    for a in appts:
        item = GroomingAppointmentOut.model_validate(a)
        item.pet_name = pets.get(a.pet_id)
        item.client_name = users.get(owners.get(a.pet_id))
        item.groomer_name = users.get(a.groomer_id)
        item.reviewed = a.id in reviewed
        out.append(item)
    return out


def _services_out(db: Session, services: list) -> list:
    users = _names(db, "users", "full_name", {s.groomer_id for s in services})
    ratings = {}
    if services:
        rows = (
            db.query(GroomingReview.groomer_id, func.avg(GroomingReview.rating), func.count(GroomingReview.id))
            .filter(GroomingReview.groomer_id.in_({s.groomer_id for s in services}))
            .group_by(GroomingReview.groomer_id)
            .all()
        )
        ratings = {r[0]: (float(r[1] or 0), r[2]) for r in rows}
    out = []
    for svc in services:
        item = GroomingServiceOut.model_validate(svc)
        item.groomer_name = users.get(svc.groomer_id)
        avg, cnt = ratings.get(svc.groomer_id, (0.0, 0))
        item.groomer_rating_avg = round(avg, 2)
        item.groomer_rating_count = cnt
        out.append(item)
    return out


@router.post("/appointments", response_model=GroomingAppointmentOut, status_code=status.HTTP_201_CREATED)
def create_grooming_appointment(
    *,
    db: Session = Depends(get_db),
    appointment_in: GroomingAppointmentCreate,
    current_user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """
    Create a new grooming appointment. Solo el dueño de la mascota puede agendar.
    """
    if role != "admin" and _pet_owner_id(db, appointment_in.pet_id) != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el dueño de la mascota puede agendar su cita")
    if appointment_in.groomer_id == current_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes agendar una cita contigo mismo")
    if appointment_in.date < date.today() - timedelta(days=1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La fecha de la cita no puede ser en el pasado")
    taken = db.query(GroomingAppointment).filter(
        GroomingAppointment.groomer_id == appointment_in.groomer_id,
        GroomingAppointment.date == appointment_in.date,
        GroomingAppointment.time == appointment_in.time,
        GroomingAppointment.status != "cancelled",
    ).first()
    if taken:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ese horario ya fue reservado. Elige otro.")
    # El estado inicial siempre es "scheduled": el cliente no decide el estado de su cita
    appointment_in.status = "scheduled"
    appointment = crud_grooming.create_appointment(db, appointment_in=appointment_in)
    return _appointments_out(db, [appointment])[0]


@router.put("/appointments/{id}/photos", response_model=GroomingAppointmentOut)
def upload_appointment_photos(
    *,
    db: Session = Depends(get_db),
    id: str,
    update_in: GroomingAppointmentUpdatePhotos,
    current_user_id: str = Depends(deps.require_estilista)
) -> Any:
    """
    Upload before and after photos, and update status and skin report of an appointment.
    Requires 'estilista' role.
    """
    appointment = crud_grooming.get_appointment(db, appointment_id=id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita de estilismo no encontrada"
        )
    if appointment.groomer_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el estilista de esta cita puede actualizarla")

    if update_in.status is not None and update_in.status != appointment.status:
        if update_in.status not in VALID_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Estado inválido. Opciones: {sorted(VALID_STATUSES)}")
        if update_in.status not in PROVIDER_TRANSITIONS.get(appointment.status, set()):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ese cambio de estado no está permitido")

    updated_appointment = crud_grooming.update_appointment_photos(db, db_appt=appointment, update_in=update_in)
    return _appointments_out(db, [updated_appointment])[0]


@router.get("/files/{pet_id}", response_model=GroomingHistory)
def read_grooming_history(
    *,
    db: Session = Depends(get_db),
    pet_id: str,
    current_user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """
    Historial de estilismo de una mascota. Solo su dueño, un estilista con una cita de esa mascota, o un admin.
    """
    if role != "admin" and _pet_owner_id(db, pet_id) != current_user_id:
        attended = db.query(GroomingAppointment).filter(
            GroomingAppointment.pet_id == pet_id, GroomingAppointment.groomer_id == current_user_id
        ).first()
        if not attended:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso al historial de esta mascota")
    file = crud_grooming.get_or_create_grooming_file(db, pet_id=pet_id)
    appointments = crud_grooming.get_appointments_by_pet(db, pet_id=pet_id)
    return {
        "file": file,
        "appointments": _appointments_out(db, appointments)
    }


# New GroomingService endpoints
@router.post("/services", response_model=GroomingServiceOut, status_code=status.HTTP_201_CREATED)
def add_grooming_service(
    *,
    db: Session = Depends(get_db),
    service_in: GroomingServiceCreate,
    current_user_id: str = Depends(deps.require_estilista)
) -> Any:
    """
    Create a grooming service catalog item. Requires 'estilista' role.
    """
    created = crud_grooming.create_grooming_service(db=db, service_in=service_in, groomer_id=current_user_id)
    return _services_out(db, [created])[0]


@router.get("/services", response_model=List[GroomingServiceOut])
def read_active_services(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all active grooming services. Public endpoint.
    """
    return _services_out(db, crud_grooming.get_active_grooming_services(db=db))


@router.get("/services/mine", response_model=List[GroomingServiceOut])
def read_my_services(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_estilista),
) -> Any:
    """
    Catálogo propio del estilista, incluidos los servicios pausados. Requires 'estilista' role.
    """
    mine = db.query(GroomingService).filter(GroomingService.groomer_id == current_user_id).order_by(GroomingService.created_at.desc()).all()
    return _services_out(db, mine)


@router.patch("/services/{service_id}", response_model=GroomingServiceOut)
def update_grooming_service(
    service_id: str,
    service_in: GroomingServiceUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_estilista),
) -> Any:
    """
    Edita o pausa/reactiva un servicio propio. Requires 'estilista' role.
    """
    svc = db.query(GroomingService).filter(GroomingService.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")
    if svc.groomer_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes editar tus propios servicios")
    for key, value in service_in.model_dump(exclude_unset=True).items():
        setattr(svc, key, value)
    db.commit()
    db.refresh(svc)
    return _services_out(db, [svc])[0]


# Additional appointments endpoints
@router.get("/appointments/client", response_model=List[GroomingAppointmentOut])
def read_client_appointments(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Get the grooming appointments of the pets owned by the logged-in client.
    """
    pet_ids = [r[0] for r in db.execute(text("SELECT id FROM pets WHERE owner_id = :uid"), {"uid": current_user_id}).fetchall()]
    appts = crud_grooming.get_appointments_by_pet_ids(db=db, pet_ids=pet_ids)
    appts.sort(key=lambda a: (a.date, a.time), reverse=True)
    return _appointments_out(db, appts, viewer_id=current_user_id)


@router.get("/appointments/provider", response_model=List[GroomingAppointmentOut])
def read_provider_appointments(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_estilista)
) -> Any:
    """
    Get all grooming appointments requested from the logged-in groomer. Requires 'estilista' role.
    """
    appts = crud_grooming.get_appointments_for_provider(db=db, groomer_id=current_user_id)
    appts.sort(key=lambda a: (a.date, a.time), reverse=True)
    return _appointments_out(db, appts)


@router.patch("/appointments/{appointment_id}/status", response_model=GroomingAppointmentOut)
def update_appointment_status(
    appointment_id: str,
    new_status: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Cambia el estado de una cita. El estilista confirma/inicia/completa/cancela; el dueño de la mascota solo cancela.
    """
    appt = crud_grooming.get_appointment(db, appointment_id=appointment_id)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita de estilismo no encontrada")
    is_provider = appt.groomer_id == current_user_id
    is_client = _pet_owner_id(db, appt.pet_id) == current_user_id
    if not is_provider and not is_client:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para modificar esta cita")
    if new_status not in VALID_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Estado inválido. Opciones: {sorted(VALID_STATUSES)}")
    transitions = PROVIDER_TRANSITIONS if is_provider else CLIENT_TRANSITIONS
    if new_status not in transitions.get(appt.status, set()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ese cambio de estado no está permitido")
    updated = crud_grooming.update_appointment_photos(
        db, db_appt=appt, update_in=GroomingAppointmentUpdatePhotos(status=new_status)
    )
    return _appointments_out(db, [updated], viewer_id=current_user_id)[0]


@router.get("/groomers/{groomer_id}/available-slots", response_model=List[str])
def read_available_slots(
    groomer_id: str,
    target_date: date,
    *,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all available grooming slots for a stylist on a specific date.
    """
    appointments = db.query(GroomingAppointment).filter(
        GroomingAppointment.groomer_id == groomer_id,
        GroomingAppointment.date == target_date,
        GroomingAppointment.status != "cancelled"
    ).all()
    
    taken_hours = {appt.time.strftime("%H:%M") for appt in appointments}
    
    # 9:00 AM to 5:00 PM standard business hours
    all_hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
    available = [h for h in all_hours if h not in taken_hours]
    return available


# ==========================================
# RESEÑAS
# ==========================================

@router.get("/groomers/{groomer_id}/reviews", response_model=GroomingReviewsSummary)
def read_groomer_reviews(
    groomer_id: str,
    *,
    db: Session = Depends(get_db),
    current_user_id: str | None = Depends(_optional_user_id),
) -> Any:
    """Promedio y reseñas de un estilista (público)."""
    reviews = (
        db.query(GroomingReview)
        .filter(GroomingReview.groomer_id == groomer_id)
        .order_by(GroomingReview.created_at.desc())
        .limit(100)
        .all()
    )
    stats = db.query(func.avg(GroomingReview.rating), func.count(GroomingReview.id)).filter(GroomingReview.groomer_id == groomer_id).first()
    names = _names(db, "users", "full_name", {r.user_id for r in reviews})
    return GroomingReviewsSummary(
        average=round(float(stats[0] or 0), 2),
        count=stats[1] or 0,
        reviews=[
            GroomingReviewOut(
                id=r.id, appointment_id=r.appointment_id, rating=r.rating, comment=r.comment, created_at=r.created_at,
                author_name=names.get(r.user_id) or "Usuario", is_mine=bool(current_user_id and r.user_id == current_user_id),
            )
            for r in reviews
        ],
    )


@router.post("/appointments/{appointment_id}/reviews", response_model=GroomingReviewOut, status_code=status.HTTP_201_CREATED)
def create_appointment_review(
    appointment_id: str,
    review_in: GroomingReviewCreate,
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Reseña una cita completada (1 a 5). Solo el dueño de la mascota, una vez por cita; el estilista no puede reseñarse."""
    appt = crud_grooming.get_appointment(db, appointment_id=appointment_id)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita de estilismo no encontrada")
    if appt.groomer_id == current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes reseñar tu propio servicio")
    if _pet_owner_id(db, appt.pet_id) != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el dueño de la mascota puede reseñar esta cita")
    if appt.status != "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo puedes reseñar una cita completada")
    if db.query(GroomingReview.id).filter(GroomingReview.appointment_id == appointment_id, GroomingReview.user_id == current_user_id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya reseñaste esta cita")
    review = GroomingReview(
        appointment_id=appointment_id, groomer_id=appt.groomer_id, user_id=current_user_id,
        rating=review_in.rating, comment=(review_in.comment or "").strip() or None,
    )
    db.add(review)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya reseñaste esta cita")
    db.refresh(review)
    names = _names(db, "users", "full_name", {current_user_id})
    return GroomingReviewOut(
        id=review.id, appointment_id=review.appointment_id, rating=review.rating, comment=review.comment,
        created_at=review.created_at, author_name=names.get(current_user_id) or "Usuario", is_mine=True,
    )
