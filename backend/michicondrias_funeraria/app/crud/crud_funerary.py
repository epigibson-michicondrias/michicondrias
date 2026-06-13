from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.funerary import Pet, PetDeath, PetMemorialPost
from app.schemas.funerary import PetDeathCreate, PetMemorialPostCreate

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
