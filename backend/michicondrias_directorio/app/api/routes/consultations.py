from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timezone
from sqlalchemy import or_, text

from app.api import deps
from app.db.session import get_db
from app.models.consultation import Consultation
from app.models.clinic import Clinic, Veterinarian
from app.crud.crud_services import notify_user
from app.schemas.consultation import ConsultationCreate, ConsultationResponse

router = APIRouter()


def _my_vet_scope(db: Session, user_id: str):
    """Ids con los que una consulta puede estar asignada a este usuario: su id, sus perfiles de veterinario y sus clínicas."""
    vet_ids = [v.id for v in db.query(Veterinarian.id).filter(Veterinarian.user_id == user_id).all()]
    clinic_ids = [c.id for c in db.query(Clinic.id).filter(Clinic.owner_user_id == user_id).all()]
    return [user_id] + vet_ids, clinic_ids


def _is_vet_side(db: Session, consultation: Consultation, user_id: str) -> bool:
    vet_ids, clinic_ids = _my_vet_scope(db, user_id)
    return (consultation.vet_id in vet_ids) or (consultation.clinic_id in clinic_ids if consultation.clinic_id else False)


@router.post("/", response_model=ConsultationResponse)
def book_consultation(
    *,
    db: Session = Depends(get_db),
    consultation_in: ConsultationCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Book a new telemedicine veterinary consultation."""
    when = consultation_in.scheduled_at
    now = datetime.now(timezone.utc) if when.tzinfo else datetime.now()
    if when <= now:
        raise HTTPException(status_code=400, detail="La fecha de la videoconsulta debe ser futura")
    if consultation_in.pet_id:
        row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pid"), {"pid": consultation_in.pet_id}).first()
        if not row or row[0] != user_id:
            raise HTTPException(status_code=403, detail="La mascota no te pertenece")
    if consultation_in.vet_id:
        vet = db.query(Veterinarian).filter(Veterinarian.id == consultation_in.vet_id).first()
        if not vet or not vet.is_approved:
            raise HTTPException(status_code=404, detail="Veterinario no encontrado")
        if consultation_in.clinic_id and vet.clinic_id and vet.clinic_id != consultation_in.clinic_id:
            raise HTTPException(status_code=400, detail="El veterinario no pertenece a esa clínica")
    db_obj = Consultation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        clinic_id=consultation_in.clinic_id,
        vet_id=consultation_in.vet_id,
        pet_id=consultation_in.pet_id,
        scheduled_at=consultation_in.scheduled_at,
        notes=consultation_in.notes,
        status="scheduled",
        room_url=f"https://meet.jit.si/michicondrias-telemed-{uuid.uuid4().hex[:12]}"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # Avisar a quien atenderá la consulta (el veterinario o, si no hay, el dueño de la clínica)
    target = None
    if consultation_in.vet_id:
        target = vet.user_id
    if not target and consultation_in.clinic_id:
        clinic = db.query(Clinic).filter(Clinic.id == consultation_in.clinic_id).first()
        target = clinic.owner_user_id if clinic else None
    if target and target != user_id:
        notify_user(db, target, "Nueva videoconsulta", f"Tienes una videoconsulta solicitada para el {when.strftime('%Y-%m-%d %H:%M')}.", link="/mi-clinica/consultas-video")
    return db_obj


@router.get("/me", response_model=List[ConsultationResponse])
def read_my_consultations(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """List all consultations booked by the current user."""
    return db.query(Consultation).filter(Consultation.user_id == user_id).all()


@router.get("/vet/incoming", response_model=List[ConsultationResponse])
def read_vet_consultations(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Consultas asignadas a este veterinario (por su usuario o perfil) o a las clínicas que administra."""
    if role not in ["veterinario", "clinica", "hospital", "admin"]:
        raise HTTPException(status_code=403, detail="Permiso denegado")
    vet_ids, clinic_ids = _my_vet_scope(db, user_id)
    cond = [Consultation.vet_id.in_(vet_ids)]
    if clinic_ids:
        cond.append(Consultation.clinic_id.in_(clinic_ids))
    return db.query(Consultation).filter(or_(*cond)).order_by(Consultation.scheduled_at.desc()).all()


@router.patch("/{consultation_id}/status", response_model=ConsultationResponse)
def update_consultation_status(
    consultation_id: str,
    status: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Update consultation status (e.g. active, completed, cancelled)."""
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    
    vet_side = _is_vet_side(db, consultation, user_id)
    if consultation.user_id != user_id and not vet_side:
        raise HTTPException(status_code=403, detail="No tienes permisos")

    valid_statuses = ["scheduled", "active", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Estado no válido")
    # El dueño solo puede cancelar; iniciar/finalizar es del lado veterinario
    if not vet_side and status != "cancelled":
        raise HTTPException(status_code=403, detail="Solo el veterinario puede iniciar o finalizar la consulta")
    if consultation.status in ("completed", "cancelled"):
        raise HTTPException(status_code=409, detail="Esta videoconsulta ya está cerrada")

    consultation.status = status
    db.commit()
    db.refresh(consultation)

    labels = {"active": "ya está activa, puedes unirte", "completed": "fue finalizada", "cancelled": "fue cancelada"}
    if status in labels:
        counterpart = consultation.user_id if (vet_side and consultation.user_id != user_id) else None
        if not vet_side:
            vet = db.query(Veterinarian).filter(Veterinarian.id == consultation.vet_id).first() if consultation.vet_id else None
            counterpart = (vet.user_id if vet and vet.user_id else None)
            if not counterpart and consultation.clinic_id:
                clinic = db.query(Clinic).filter(Clinic.id == consultation.clinic_id).first()
                counterpart = clinic.owner_user_id if clinic else None
        if counterpart and counterpart != user_id:
            notify_user(db, counterpart, "Videoconsulta", f"Tu videoconsulta {labels[status]}.")
    return consultation
