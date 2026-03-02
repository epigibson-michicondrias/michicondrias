from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.crud_petfriendly import create_place, get_places, get_place_by_id
from app.schemas.petfriendly import PlaceCreate, PlaceOut

router = APIRouter()


@router.get("/", response_model=List[PlaceOut])
def list_places(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    city: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return get_places(db, category=category, city=city, skip=skip, limit=limit)


@router.get("/{place_id}", response_model=PlaceOut)
def read_place(place_id: str, db: Session = Depends(get_db)) -> Any:
    place = get_place_by_id(db, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")
    return place


@router.post("/", response_model=PlaceOut)
def add_place(
    *,
    db: Session = Depends(get_db),
    place_in: PlaceCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    return create_place(db, place_in=place_in, user_id=user_id)
