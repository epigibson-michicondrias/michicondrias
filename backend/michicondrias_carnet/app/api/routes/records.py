from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.carnet import MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse

router = APIRouter()

@router.get("/pet/{pet_id}", response_model=List[MedicalRecordResponse])
def read_medical_records_by_pet(
    pet_id: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve medical records for a specific pet.
    """
    records = crud.crud_carnet.get_medical_records_by_pet(db, pet_id=pet_id, skip=skip, limit=limit)
    return records

@router.post("/", response_model=MedicalRecordResponse)
def create_medical_record(
    *,
    db: Session = Depends(get_db),
    record_in: MedicalRecordCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create new medical record.
    """
    record = crud.crud_carnet.create_medical_record(db=db, record=record_in, vet_id=user_id)
    return record
