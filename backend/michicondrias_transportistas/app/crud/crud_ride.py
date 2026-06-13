from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.ride import PetRide
from app.schemas.ride import PetRideCreate, PetRideUpdate

def create_ride(db: Session, ride_in: PetRideCreate) -> PetRide:
    db_ride = PetRide(
        driver_id=ride_in.driver_id,
        pet_id=ride_in.pet_id,
        origin_address=ride_in.origin_address,
        destination_address=ride_in.destination_address,
        price=ride_in.price,
        requires_carrier=ride_in.requires_carrier,
        current_lat=ride_in.current_lat,
        current_lng=ride_in.current_lng,
        status="pending"
    )
    db.add(db_ride)
    db.commit()
    db.refresh(db_ride)
    return db_ride

def get_ride_by_id(db: Session, ride_id: str) -> Optional[PetRide]:
    return db.query(PetRide).filter(PetRide.id == ride_id).first()

def update_ride_location(db: Session, ride_id: str, lat: float, lng: float) -> Optional[PetRide]:
    db_ride = get_ride_by_id(db, ride_id)
    if not db_ride:
        return None
    db_ride.current_lat = lat
    db_ride.current_lng = lng
    db.commit()
    db.refresh(db_ride)
    return db_ride

def get_rides(db: Session, skip: int = 0, limit: int = 100) -> List[PetRide]:
    return db.query(PetRide).offset(skip).limit(limit).all()

def update_ride(db: Session, ride_id: str, ride_in: PetRideUpdate) -> Optional[PetRide]:
    db_ride = get_ride_by_id(db, ride_id)
    if not db_ride:
        return None
    update_data = ride_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ride, key, value)
    db.commit()
    db.refresh(db_ride)
    return db_ride

def delete_ride(db: Session, ride_id: str) -> bool:
    db_ride = get_ride_by_id(db, ride_id)
    if not db_ride:
        return False
    db.delete(db_ride)
    db.commit()
    return True
