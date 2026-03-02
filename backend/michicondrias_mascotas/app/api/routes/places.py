from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.mascotas import PetfriendlyPlaceCreate, PetfriendlyPlaceUpdate, PetfriendlyPlaceResponse

router = APIRouter()

@router.get("/", response_model=List[PetfriendlyPlaceResponse])
def read_places(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    city: Optional[str] = None
) -> Any:
    """
    Retrieve petfriendly places.
    """
    places = crud.crud_mascotas.get_places(db, skip=skip, limit=limit, category=category, city=city)
    return places

@router.get("/{place_id}", response_model=PetfriendlyPlaceResponse)
def read_place(
    place_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific place by id.
    """
    place = crud.crud_mascotas.get_place(db, place_id=place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place

@router.post("/", response_model=PetfriendlyPlaceResponse)
def create_place(
    *,
    db: Session = Depends(get_db),
    place_in: PetfriendlyPlaceCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Add a petfriendly place.
    """
    place = crud.crud_mascotas.create_place(db=db, place=place_in, user_id=user_id)
    return place
