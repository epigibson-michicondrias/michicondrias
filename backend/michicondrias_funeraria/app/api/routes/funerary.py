from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import RoleChecker, get_current_user_id, _decode_token, oauth2_scheme
from app.db.session import get_db
from app.models.funerary import PetDeath, PetMemorialPost, FuneraryBooking, FuneraryService
from sqlalchemy import text, bindparam
import uuid
from app.schemas.funerary import (
    PetDeathCreate,
    PetDeathResponse,
    PetMemorialPostCreate,
    PetMemorialPostResponse,
    FuneraryServiceCreate,
    FuneraryServiceResponse,
    FuneraryBookingCreate,
    FuneraryBookingResponse,
    FuneraryBookingStatusUpdate,
    FuneraryServiceActiveUpdate,
)
from app.crud import crud_funerary
from app.core.config import settings
from app.core.certificate import build_certificate_pdf
import httpx
from datetime import date

router = APIRouter()


def get_current_user_payload(token: str = Depends(oauth2_scheme)) -> dict:
    return _decode_token(token)


def _pet_owner_id(db: Session, pet_id: str):
    row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": pet_id}).first()
    return row[0] if row else None


def _notify(db: Session, user_id: str, title: str, message: str, ntype: str = "funeraria") -> None:
    """Notificación en la bandeja del usuario (misma BD que core). Nunca debe romper el flujo principal."""
    try:
        db.execute(text(
            "INSERT INTO notifications (id, user_id, title, message, type, is_read) "
            "VALUES (:id, :uid, :title, :msg, :type, false)"
        ), {"id": str(uuid.uuid4()), "uid": user_id, "title": title, "msg": message, "type": ntype})
        db.commit()
    except Exception:
        db.rollback()


def _enrich_bookings(db: Session, bookings: list) -> list:
    """Agrega nombre de mascota y de servicio para que la app no muestre solo IDs."""
    if not bookings:
        return []
    pet_ids = list({b.pet_id for b in bookings if b.pet_id})
    svc_ids = list({b.service_id for b in bookings if b.service_id})
    pets = {}
    if pet_ids:
        try:
            rows = db.execute(text("SELECT id, name FROM pets WHERE id IN :ids").bindparams(bindparam("ids", expanding=True)), {"ids": pet_ids}).fetchall()
            pets = {r[0]: r[1] for r in rows}
        except Exception:
            db.rollback()
    svcs = {s.id: s for s in db.query(FuneraryService).filter(FuneraryService.id.in_(svc_ids)).all()} if svc_ids else {}
    out = []
    for b in bookings:
        svc = svcs.get(b.service_id)
        out.append({
            "id": b.id, "client_id": b.client_id, "pet_id": b.pet_id, "service_id": b.service_id,
            "scheduled_date": b.scheduled_date, "status": b.status, "notes": b.notes, "created_at": b.created_at,
            "pet_name": pets.get(b.pet_id), "service_name": svc.name if svc else None,
            "service_price": svc.price if svc else None,
        })
    return out


def _can_report_death(db: Session, pet_id: str, user_id: str, role: str) -> bool:
    """Quién puede dar de baja a una mascota: su dueño, un admin, la funeraria con una reserva para ella,
    o el veterinario cuya clínica la atendió. Antes cualquiera con rol funeraria/veterinario podía hacerlo con cualquier mascota."""
    if role == "admin" or _pet_owner_id(db, pet_id) == user_id:
        return True
    if role == "funeraria":
        return db.query(FuneraryBooking).join(FuneraryService, FuneraryService.id == FuneraryBooking.service_id).filter(
            FuneraryBooking.pet_id == pet_id, FuneraryService.funerary_id == user_id, FuneraryBooking.status != "cancelled"
        ).first() is not None
    if role in ("veterinario", "clinica", "hospital"):
        row = db.execute(text(
            "SELECT 1 FROM appointments a JOIN clinics c ON c.id = a.clinic_id "
            "WHERE a.pet_id = :pet_id AND c.owner_user_id = :user_id LIMIT 1"
        ), {"pet_id": pet_id, "user_id": user_id}).first()
        return row is not None
    return False

@router.post("/death-report", response_model=PetDeathResponse, status_code=status.HTTP_201_CREATED)
def record_death_report(
    *,
    db: Session = Depends(get_db),
    death_in: PetDeathCreate,
    current_user: dict = Depends(RoleChecker(["funeraria", "veterinario", "consumidor", "clinica", "hospital", "admin"]))
):
    """
    Records a pet's death. Solo su dueño, la funeraria con una reserva, el veterinario que la atendió o un admin.
    Updates the pet's status to 'in_memoriam' in the database.
    """
    pet = crud_funerary.get_pet(db, death_in.pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La mascota especificada no existe."
        )
    
    if not _can_report_death(db, death_in.pet_id, current_user.get("sub"), current_user.get("role", "consumidor")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes relación con esta mascota para registrar su fallecimiento."
        )

    funerary_id = current_user.get("sub")
    death_report = crud_funerary.create_death_report(db, death_in=death_in, funerary_id=funerary_id)
    if not death_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo registrar el reporte de fallecimiento."
        )
    return death_report

@router.get("/memorial/{pet_id}", response_model=List[PetMemorialPostResponse])
def read_memorial_posts(
    pet_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve all memorial posts for a pet.
    """
    posts = crud_funerary.get_memorial_posts(db, pet_id=pet_id)
    return posts

@router.post("/memorial/post", response_model=PetMemorialPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    *,
    db: Session = Depends(get_db),
    post_in: PetMemorialPostCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a new memorial post for a pet. Requires authentication.
    """
    pet = crud_funerary.get_pet(db, post_in.pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La mascota especificada no existe."
        )
    
    post = crud_funerary.create_memorial_post(db, post_in=post_in, user_id=current_user_id)
    return post

@router.post("/services", response_model=FuneraryServiceResponse, status_code=status.HTTP_201_CREATED)
def add_service(
    *,
    db: Session = Depends(get_db),
    service_in: FuneraryServiceCreate,
    current_user: dict = Depends(RoleChecker(["funeraria"]))
):
    """
    Create a new funerary service package. Requires 'funeraria' role.
    """
    funerary_id = current_user.get("sub")
    service = crud_funerary.create_funerary_service(db, service_in=service_in, funerary_id=funerary_id)
    return service

@router.get("/services", response_model=List[FuneraryServiceResponse])
def read_active_services(
    db: Session = Depends(get_db)
):
    """
    Get all active funerary services. Public endpoint.
    """
    services = crud_funerary.get_active_funerary_services(db)
    return services

@router.get("/services/mine", response_model=List[FuneraryServiceResponse])
def read_my_services(
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["funeraria", "admin"])),
):
    """Todos los servicios (activos o no) de la funeraria autenticada."""
    return db.query(FuneraryService).filter(FuneraryService.funerary_id == current_user.get("sub")).order_by(FuneraryService.created_at.desc()).all()


@router.patch("/services/{service_id}/active", response_model=FuneraryServiceResponse)
def set_service_active(
    service_id: str,
    body: FuneraryServiceActiveUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["funeraria", "admin"])),
):
    """Publica u oculta un servicio propio del catálogo."""
    service = db.query(FuneraryService).filter(FuneraryService.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    if service.funerary_id != current_user.get("sub") and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Este servicio no es tuyo.")
    service.is_active = body.is_active
    db.commit()
    db.refresh(service)
    return service


@router.post("/bookings", response_model=FuneraryBookingResponse, status_code=status.HTTP_201_CREATED)
def add_booking(
    *,
    db: Session = Depends(get_db),
    booking_in: FuneraryBookingCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Book a funerary service. Requires authentication ('consumidor' or any role).
    """
    pet = crud_funerary.get_pet(db, booking_in.pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La mascota especificada no existe."
        )
    
    if _pet_owner_id(db, booking_in.pet_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el dueño de la mascota puede reservar este servicio."
        )

    service = db.query(FuneraryService).filter(FuneraryService.id == booking_in.service_id).first()
    if not service or not service.is_active:
        raise HTTPException(status_code=404, detail="El servicio funerario no existe o ya no está disponible.")
    if booking_in.scheduled_date < date.today():
        raise HTTPException(status_code=422, detail="La fecha de la reserva no puede estar en el pasado.")

    booking = crud_funerary.create_funerary_booking(db, booking_in=booking_in, client_id=current_user_id)
    _notify(db, service.funerary_id, "Nueva reserva funeraria", f"Tienes una nueva solicitud para {service.name}.")
    return _enrich_bookings(db, [booking])[0]

@router.get("/bookings/client", response_model=List[FuneraryBookingResponse])
def read_client_bookings(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Get all bookings for the logged-in client.
    """
    bookings = crud_funerary.get_bookings_for_client(db, client_id=current_user_id)
    return _enrich_bookings(db, bookings)

@router.get("/bookings/provider", response_model=List[FuneraryBookingResponse])
def read_provider_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["funeraria"]))
):
    """
    Get all bookings requested from the logged-in funerary provider. Requires 'funeraria' role.
    """
    funerary_id = current_user.get("sub")
    bookings = crud_funerary.get_bookings_for_provider(db, provider_id=funerary_id)
    return _enrich_bookings(db, bookings)

_STATUS_FLOW = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"completed", "cancelled"},
}
_STATUS_LABEL = {"confirmed": "confirmada", "completed": "completada", "cancelled": "cancelada"}


@router.patch("/bookings/{booking_id}/status", response_model=FuneraryBookingResponse)
def update_booking_status(
    booking_id: str,
    body: FuneraryBookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload),
):
    """La funeraria dueña del servicio confirma/completa/cancela; el cliente solo puede cancelar su reserva."""
    booking = db.query(FuneraryBooking).filter(FuneraryBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")
    user_id = current_user.get("sub")
    service = db.query(FuneraryService).filter(FuneraryService.id == booking.service_id).first()
    is_provider = bool(service and service.funerary_id == user_id)
    is_client = booking.client_id == user_id
    if not (is_provider or is_client):
        raise HTTPException(status_code=403, detail="No tienes permisos sobre esta reserva.")
    if is_client and not is_provider and body.status != "cancelled":
        raise HTTPException(status_code=403, detail="Solo puedes cancelar tu reserva.")
    if body.status not in _STATUS_FLOW.get(booking.status or "pending", set()):
        raise HTTPException(status_code=409, detail="La reserva ya no puede cambiar a ese estado.")
    booking.status = body.status
    db.commit()
    db.refresh(booking)
    label = _STATUS_LABEL[body.status]
    if is_provider:
        _notify(db, booking.client_id, "Reserva funeraria " + label, f"Tu reserva para {service.name if service else 'el servicio'} fue {label}.")
    elif service:
        _notify(db, service.funerary_id, "Reserva cancelada", f"El cliente canceló la reserva de {service.name}.")
    return _enrich_bookings(db, [booking])[0]


@router.get("/certificate/{death_id}/pdf", response_model=dict)
def download_death_certificate(
    death_id: str,
    db: Session = Depends(get_db)
):
    """
    Generate and retrieve the digital death certificate PDF URL/data.
    """
    death_report = db.query(PetDeath).filter(PetDeath.id == death_id).first()
    if not death_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte de defunción no encontrado."
        )
    
    pet_row = db.execute(text("SELECT name FROM pets WHERE id = :pet_id"), {"pet_id": death_report.pet_id}).first()
    return {
        "death_id": death_id,
        "pet_id": death_report.pet_id,
        "pet_name": pet_row[0] if pet_row else None,
        "cause_of_death": death_report.cause_of_death,
        "urn_model": death_report.urn_model,
        "funerary_id": death_report.funerary_id,
        "date_of_death": death_report.date_of_death.isoformat(),
        "cremation_type": death_report.cremation_type,
        "certificate_url": f"{settings.API_GATEWAY_URL}/funeraria/api/v1/funerary/certificate/{death_id}/file",
    }


@router.get("/certificate/{death_id}/file")
def certificate_file(death_id: str, db: Session = Depends(get_db)):
    """PDF del certificado conmemorativo, generado al momento."""
    death_report = db.query(PetDeath).filter(PetDeath.id == death_id).first()
    if not death_report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte de defunción no encontrado.")

    # El nombre y la especie están en la tabla de mascotas; si no hay dato, el certificado sale con un nombre genérico
    pet_name, species = "Un michi querido", None
    row = db.execute(text("SELECT name, species FROM pets WHERE id = :pet_id"), {"pet_id": death_report.pet_id}).first()
    if row:
        pet_name, species = row[0] or pet_name, row[1]

    pdf = build_certificate_pdf(
        death_id=death_id, pet_name=pet_name, species=species, date_of_death=death_report.date_of_death,
        cremation_type=death_report.cremation_type, urn_model=death_report.urn_model,
    )
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="certificado-{death_id}.pdf"'})

@router.get("/memorial/{pet_id}/feed", response_model=List[PetMemorialPostResponse])
def read_memorial_feed(
    pet_id: str,
    db: Session = Depends(get_db),
    sort_by: Optional[str] = "date"
):
    """
    Retrieve all memorial posts for a pet sorted by date.
    """
    query = db.query(PetMemorialPost).filter(PetMemorialPost.pet_id == pet_id)
    if sort_by == "date":
        query = query.order_by(PetMemorialPost.created_at.desc())
    else:
        query = query.order_by(PetMemorialPost.created_at.asc())
    return query.all()
