from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.carnet import VaccineCreate, VaccineUpdate, VaccineResponse

router = APIRouter()

@router.get("/pet/{pet_id}", response_model=List[VaccineResponse])
def read_vaccines_by_pet(
    pet_id: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve vaccines for a specific pet.
    """
    vaccines = crud.crud_carnet.get_vaccines_by_pet(db, pet_id=pet_id, skip=skip, limit=limit)
    return vaccines

@router.post("/", response_model=VaccineResponse)
def create_vaccine(
    *,
    db: Session = Depends(get_db),
    vaccine_in: VaccineCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create a new vaccine record.
    """
    vaccine = crud.crud_carnet.create_vaccine(db=db, vaccine=vaccine_in, vet_id=user_id)
    return vaccine
