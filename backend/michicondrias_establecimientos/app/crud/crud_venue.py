from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from typing import Optional, List
from app.models.venue import PetFriendlyVenue
from app.schemas.venue import VenueCreate, VenueUpdate

def create_venue(db: Session, *, venue_in: VenueCreate, owner_id: str) -> PetFriendlyVenue:
    db_venue = PetFriendlyVenue(
        owner_id=owner_id,
        name=venue_in.name,
        address=venue_in.address,
        amenities=venue_in.amenities,
        discount_coupon=venue_in.discount_coupon,
        discount_description=venue_in.discount_description
    )
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue

def get_venue_by_id(db: Session, venue_id: str) -> Optional[PetFriendlyVenue]:
    return db.query(PetFriendlyVenue).filter(PetFriendlyVenue.id == venue_id).first()

def get_venues_by_owner(db: Session, owner_id: str, skip: int = 0, limit: int = 50) -> List[PetFriendlyVenue]:
    return db.query(PetFriendlyVenue).filter(PetFriendlyVenue.owner_id == owner_id).offset(skip).limit(limit).all()

def get_all_venues(db: Session, skip: int = 0, limit: int = 50) -> List[PetFriendlyVenue]:
    return db.query(PetFriendlyVenue).offset(skip).limit(limit).all()

def update_venue(db: Session, *, db_venue: PetFriendlyVenue, venue_in: VenueUpdate) -> PetFriendlyVenue:
    update_data = venue_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_venue, field, update_data[field])
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue

def delete_venue(db: Session, venue_id: str) -> bool:
    db_venue = get_venue_by_id(db, venue_id)
    if not db_venue:
        return False
    db.delete(db_venue)
    db.commit()
    return True

def search_venues(
    db: Session,
    *,
    q: Optional[str] = None,
    name: Optional[str] = None,
    address: Optional[str] = None,
    amenity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[PetFriendlyVenue]:
    query = db.query(PetFriendlyVenue)
    if q:
        query = query.filter(
            PetFriendlyVenue.name.ilike(f"%{q}%") |
            PetFriendlyVenue.address.ilike(f"%{q}%") |
            cast(PetFriendlyVenue.amenities, String).ilike(f"%{q}%")
        )
    if name:
        query = query.filter(PetFriendlyVenue.name.ilike(f"%{name}%"))
    if address:
        query = query.filter(PetFriendlyVenue.address.ilike(f"%{address}%"))
    if amenity:
        # PostgreSQL JSONB-specific has_key filter (compiles to the '?' operator in PG)
        query = query.filter(PetFriendlyVenue.amenities.has_key(amenity))
        
    return query.offset(skip).limit(limit).all()
