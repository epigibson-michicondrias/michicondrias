from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.mascotas import LostPetCreate, LostPetUpdate, LostPetResponse

router = APIRouter()

@router.get("/", response_model=List[LostPetResponse])
def read_lost_pets(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    is_found: Optional[bool] = None
) -> Any:
    """
    Retrieve lost pets.
    """
    pets = crud.crud_mascotas.get_lost_pets(db, skip=skip, limit=limit, is_found=is_found)
    return pets

@router.get("/{pet_id}", response_model=LostPetResponse)
def read_lost_pet(
    pet_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific lost pet by id.
    """
    pet = crud.crud_mascotas.get_lost_pet(db, pet_id=pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@router.post("/", response_model=LostPetResponse)
def create_lost_pet(
    *,
    db: Session = Depends(get_db),
    pet_in: LostPetCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Report a lost pet.
    """
    pet = crud.crud_mascotas.create_lost_pet(db=db, pet=pet_in, user_id=user_id)
    return pet

@router.put("/{pet_id}", response_model=LostPetResponse)
def update_lost_pet(
    *,
    db: Session = Depends(get_db),
    pet_id: str,
    pet_in: LostPetUpdate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Update a lost pet (e.g., mark as found).
    """
    pet = crud.crud_mascotas.get_lost_pet(db, pet_id=pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if pet.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    pet = crud.crud_mascotas.update_lost_pet(db=db, db_pet=pet, pet_update=pet_in)
    return pet
