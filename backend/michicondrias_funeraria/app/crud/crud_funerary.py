from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.models.funerary import Pet, PetDeath, PetMemorialPost, FuneraryService, FuneraryBooking
from app.schemas.funerary import PetDeathCreate, PetMemorialPostCreate, FuneraryServiceCreate, FuneraryBookingCreate

def get_pet(db: Session, pet_id: str) -> Optional[Pet]:
    return db.query(Pet).filter(Pet.id == pet_id).first()

def create_death_report(db: Session, *, death_in: PetDeathCreate, funerary_id: str) -> Optional[PetDeath]:
    pet = get_pet(db, death_in.pet_id)
    if not pet:
        return None
    
    # Update pet status to in_memoriam
    pet.status = "in_memoriam"
    db.add(pet)
    
    db_death = PetDeath(
        funerary_id=funerary_id,
        **death_in.model_dump()
    )
    db.add(db_death)
    db.commit()
    db.refresh(db_death)
    return db_death

def get_memorial_posts(db: Session, pet_id: str) -> List[PetMemorialPost]:
    return db.query(PetMemorialPost).filter(PetMemorialPost.pet_id == pet_id).order_by(PetMemorialPost.created_at.desc()).all()

def create_memorial_post(db: Session, *, post_in: PetMemorialPostCreate, user_id: str) -> PetMemorialPost:
    db_post = PetMemorialPost(
        user_id=user_id,
        **post_in.model_dump()
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def create_funerary_service(db: Session, *, service_in: FuneraryServiceCreate, funerary_id: str) -> FuneraryService:
    db_service = FuneraryService(
        funerary_id=funerary_id,
        **service_in.model_dump()
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def get_active_funerary_services(db: Session) -> List[FuneraryService]:
    return db.query(FuneraryService).filter(FuneraryService.is_active == True).all()

def create_funerary_booking(db: Session, *, booking_in: FuneraryBookingCreate, client_id: str) -> FuneraryBooking:
    db_booking = FuneraryBooking(
        client_id=client_id,
        **booking_in.model_dump()
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_bookings_for_client(db: Session, client_id: str) -> List[FuneraryBooking]:
    return db.query(FuneraryBooking).filter(FuneraryBooking.client_id == client_id).all()

def get_bookings_for_provider(db: Session, provider_id: str) -> List[FuneraryBooking]:
    return db.query(FuneraryBooking).join(
        FuneraryService, FuneraryBooking.service_id == FuneraryService.id
    ).filter(FuneraryService.funerary_id == provider_id).all()
