from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import date
import logging

import httpx

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
    GroomingServiceOut,
)

logger = logging.getLogger(__name__)


def _pet_owner_id(db: Session, pet_id: str):
    row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": pet_id}).first()
    return row[0] if row else None

router = APIRouter()


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
    appointment = crud_grooming.create_appointment(db, appointment_in=appointment_in)
    return appointment


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

    updated_appointment = crud_grooming.update_appointment_photos(db, db_appt=appointment, update_in=update_in)
    return updated_appointment


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
        "appointments": appointments
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
    return crud_grooming.create_grooming_service(db=db, service_in=service_in, groomer_id=current_user_id)


@router.get("/services", response_model=List[GroomingServiceOut])
def read_active_services(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all active grooming services. Public endpoint.
    """
    return crud_grooming.get_active_grooming_services(db=db)


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
    return crud_grooming.get_appointments_by_pet_ids(db=db, pet_ids=pet_ids)


@router.get("/appointments/provider", response_model=List[GroomingAppointmentOut])
def read_provider_appointments(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_estilista)
) -> Any:
    """
    Get all grooming appointments requested from the logged-in groomer. Requires 'estilista' role.
    """
    return crud_grooming.get_appointments_for_provider(db=db, groomer_id=current_user_id)


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
