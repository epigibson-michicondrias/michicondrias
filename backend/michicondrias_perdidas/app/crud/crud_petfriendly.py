from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List

from app.models.petfriendly import PetfriendlyPlace
from app.schemas.petfriendly import PlaceCreate


def create_place(db: Session, place_in: PlaceCreate, user_id: str) -> PetfriendlyPlace:
    db_place = PetfriendlyPlace(added_by=user_id, **place_in.model_dump())
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place


def get_places(
    db: Session,
    category: Optional[str] = None,
    city: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[PetfriendlyPlace]:
    query = db.query(PetfriendlyPlace)
    if category:
        query = query.filter(PetfriendlyPlace.category == category)
    if city:
        query = query.filter(PetfriendlyPlace.city.ilike(f"%{city}%"))
    return query.order_by(desc(PetfriendlyPlace.created_at)).offset(skip).limit(limit).all()


def get_place_by_id(db: Session, place_id: str) -> Optional[PetfriendlyPlace]:
    return db.query(PetfriendlyPlace).filter(PetfriendlyPlace.id == place_id).first()
