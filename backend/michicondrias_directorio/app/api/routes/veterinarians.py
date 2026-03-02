from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.clinic import VeterinarianCreate, VeterinarianUpdate, VeterinarianResponse

router = APIRouter()

@router.get("/", response_model=List[VeterinarianResponse])
def read_veterinarians(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    clinic_id: Optional[str] = None
) -> Any:
    """
    Retrieve veterinarians. (Public endpoint)
    """
    vets = crud.crud_clinic.get_veterinarians(db, skip=skip, limit=limit, clinic_id=clinic_id)
    return vets

@router.post("/", response_model=VeterinarianResponse)
def create_veterinarian(
    *,
    db: Session = Depends(get_db),
    vet_in: VeterinarianCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create new veterinarian. (Requires auth)
    """
    vet = crud.crud_clinic.create_veterinarian(db=db, vet=vet_in, user_id=user_id)
    return vet
