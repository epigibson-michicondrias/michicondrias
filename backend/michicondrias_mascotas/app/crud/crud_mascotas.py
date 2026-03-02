from sqlalchemy.orm import Session
from app.models.mascotas import LostPet, PetfriendlyPlace
from app.schemas.mascotas import LostPetCreate, LostPetUpdate, PetfriendlyPlaceCreate, PetfriendlyPlaceUpdate

# CRUD LOST PETS
def get_lost_pet(db: Session, pet_id: str):
    return db.query(LostPet).filter(LostPet.id == pet_id).first()

def get_lost_pets(db: Session, skip: int = 0, limit: int = 100, is_found: bool = None):
    query = db.query(LostPet)
    if is_found is not None:
        query = query.filter(LostPet.is_found == is_found)
    return query.order_by(LostPet.created_at.desc()).offset(skip).limit(limit).all()

def create_lost_pet(db: Session, pet: LostPetCreate, user_id: str):
    db_pet = LostPet(**pet.model_dump())
    db_pet.user_id = user_id
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

def update_lost_pet(db: Session, db_pet: LostPet, pet_update: LostPetUpdate):
    update_data = pet_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_pet, key, value)
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

# CRUD PETFRIENDLY PLACES
def get_place(db: Session, place_id: str):
    return db.query(PetfriendlyPlace).filter(PetfriendlyPlace.id == place_id).first()

def get_places(db: Session, skip: int = 0, limit: int = 100, category: str = None, city: str = None):
    query = db.query(PetfriendlyPlace)
    if category:
        query = query.filter(PetfriendlyPlace.category == category)
    if city:
        query = query.filter(PetfriendlyPlace.city == city)
    return query.offset(skip).limit(limit).all()

def create_place(db: Session, place: PetfriendlyPlaceCreate, user_id: str):
    db_place = PetfriendlyPlace(**place.model_dump())
    db_place.created_by_user_id = user_id
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

def update_place(db: Session, db_place: PetfriendlyPlace, place_update: PetfriendlyPlaceUpdate):
    update_data = place_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_place, key, value)
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place
