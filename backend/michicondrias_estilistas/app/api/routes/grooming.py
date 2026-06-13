from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.crud_grooming import (
    create_appointment,
    get_appointment,
    update_appointment_photos,
    get_or_create_grooming_file,
    get_appointments_by_pet
)
from app.schemas.grooming import (
    GroomingAppointmentCreate,
    GroomingAppointmentUpdatePhotos,
    GroomingAppointmentOut,
    GroomingHistory
)

router = APIRouter()


@router.post("/appointments", response_model=GroomingAppointmentOut, status_code=status.HTTP_201_CREATED)
def create_grooming_appointment(
    *,
    db: Session = Depends(get_db),
    appointment_in: GroomingAppointmentCreate,
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Create a new grooming appointment.
    """
    appointment = create_appointment(db, appointment_in=appointment_in)
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
    Requires 'estilista' or 'admin' role.
    """
    appointment = get_appointment(db, appointment_id=id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita de estilismo no encontrada"
        )
    
    updated_appointment = update_appointment_photos(db, db_appt=appointment, update_in=update_in)
    return updated_appointment


@router.get("/files/{pet_id}", response_model=GroomingHistory)
def read_grooming_history(
    *,
    db: Session = Depends(get_db),
    pet_id: str,
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Retrieve grooming history and notes for a specific pet.
    """
    # Retrieve or create grooming file (guarantees we return a file record)
    file = get_or_create_grooming_file(db, pet_id=pet_id)
    appointments = get_appointments_by_pet(db, pet_id=pet_id)
    return {
        "file": file,
        "appointments": appointments
    }
