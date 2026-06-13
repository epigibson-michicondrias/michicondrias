from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.api import deps
from app.db.session import get_db
from app.models.consultation import Consultation
from app.schemas.consultation import ConsultationCreate, ConsultationResponse

router = APIRouter()


@router.post("/", response_model=ConsultationResponse)
def book_consultation(
    *,
    db: Session = Depends(get_db),
    consultation_in: ConsultationCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Book a new telemedicine veterinary consultation."""
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
    """List all incoming consultations assigned to this veterinarian."""
    if role not in ["veterinario", "admin"]:
        raise HTTPException(status_code=403, detail="Permiso denegado")
    return db.query(Consultation).filter(Consultation.vet_id == user_id).all()


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
    
    if consultation.user_id != user_id and consultation.vet_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    valid_statuses = ["scheduled", "active", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Estado no válido")
        
    consultation.status = status
    db.commit()
    db.refresh(consultation)
    return consultation
