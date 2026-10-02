from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.carnet import VaccineCreate, VaccineUpdate, VaccineResponse

router = APIRouter()

from sqlalchemy import text
from app.api.pet_access import get_identity, assert_can_write_pet_record, assert_can_read_pet_record

@router.get("/pet/{pet_id}", response_model=List[VaccineResponse])
def read_vaccines_by_pet(
    pet_id: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    identity: dict = Depends(get_identity),
) -> Any:
    """
    Retrieve vaccines for a specific pet.
    Security: Only the pet owner or a registered veterinarian can view these records.
    """
    assert_can_read_pet_record(db, pet_id, identity)

    vaccines = crud.crud_carnet.get_vaccines_by_pet(db, pet_id=pet_id, skip=skip, limit=limit)
    return vaccines

@router.post("/", response_model=VaccineResponse)
def create_vaccine(
    *,
    db: Session = Depends(get_db),
    vaccine_in: VaccineCreate,
    identity: dict = Depends(get_identity),
) -> Any:
    """
    Create a new vaccine record.
    """
    assert_can_write_pet_record(db, vaccine_in.pet_id, identity)
    vaccine = crud.crud_carnet.create_vaccine(db=db, vaccine=vaccine_in, vet_id=identity["user_id"])
    return vaccine
