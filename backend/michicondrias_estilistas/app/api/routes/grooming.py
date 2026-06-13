from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud import crud_grooming
from app.schemas.grooming import (
    GroomingAppointmentCreate,
    GroomingAppointmentUpdatePhotos,
    GroomingAppointmentOut,
    GroomingHistory,
    GroomingServiceCreate,
    GroomingServiceOut,
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
    
    updated_appointment = crud_grooming.update_appointment_photos(db, db_appt=appointment, update_in=update_in)
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
    Get all grooming appointments for the logged-in client.
    """
    return crud_grooming.get_appointments_for_client(db=db, client_id=current_user_id)


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
