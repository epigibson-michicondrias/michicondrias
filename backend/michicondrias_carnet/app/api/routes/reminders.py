from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.carnet import MedicationReminderResponse

router = APIRouter()

@router.get("/pet/{pet_id}", response_model=List[MedicationReminderResponse])
def read_reminders_by_pet(
    pet_id: str,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Retrieve medication reminders for a specific pet.
    Security: Only the pet owner or a registered veterinarian can view these reminders.
    """
    pet_result = db.execute(
        text("SELECT owner_id FROM pets WHERE id = :pet_id"),
        {"pet_id": pet_id}
    ).fetchone()
    if not pet_result:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    
    owner_id = pet_result[0]
    if owner_id != user_id:
        # Check if the user is a vet
        vet_result = db.execute(
            text("SELECT id FROM veterinarians WHERE id = :user_id"),
            {"user_id": user_id}
        ).fetchone()
        if not vet_result:
            raise HTTPException(status_code=403, detail="No tienes permiso para ver los recordatorios de esta mascota")

    reminders = crud.crud_carnet.get_reminders_by_pet(
        db, pet_id=pet_id, unread_only=unread_only, skip=skip, limit=limit
    )
    return reminders

@router.post("/{reminder_id}/check", response_model=MedicationReminderResponse)
def check_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Mark a medication reminder as taken/completed.
    Security: Only the pet owner can register that the medication was administered.
    """
    reminder = db.query(crud.crud_carnet.MedicationReminder).filter(
        crud.crud_carnet.MedicationReminder.id == reminder_id
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Recordatorio no encontrado")
        
    # Check if user is the pet owner
    pet_result = db.execute(
        text("SELECT owner_id FROM pets WHERE id = :pet_id"),
        {"pet_id": reminder.pet_id}
    ).fetchone()
    
    if not pet_result or pet_result[0] != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para marcar este recordatorio como tomado")
        
    updated_reminder = crud.crud_carnet.check_reminder(db, reminder_id=reminder_id)
    return updated_reminder
