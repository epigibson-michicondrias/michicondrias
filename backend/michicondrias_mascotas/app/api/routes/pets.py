from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.models.mascotas import Pet

router = APIRouter()

class PetCreate(BaseModel):
    owner_id: str
    name: str
    species: str
    breed: Optional[str] = None
    age_months: Optional[int] = None
    size: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    adopted_from_listing_id: Optional[str] = None
    
    # Enrichment Fields
    is_vaccinated: bool = False
    is_sterilized: bool = False
    is_dewormed: bool = False
    temperament: Optional[str] = None
    energy_level: Optional[str] = None
    social_cats: bool = True
    social_dogs: bool = True
    social_children: bool = True
    weight_kg: Optional[float] = None
    microchip_number: Optional[str] = None
    gender: Optional[str] = None
    gallery: Optional[List[str]] = None
    
    # Michi-Tracker Pro
    has_active_subscription: bool = False
    stripe_subscription_id: Optional[str] = None

class PetResponse(PetCreate):
    id: str
    is_active: bool
    
    class Config:
        from_attributes = True

class PetUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    age_months: Optional[int] = None
    size: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    is_vaccinated: Optional[bool] = None
    is_sterilized: Optional[bool] = None
    is_dewormed: Optional[bool] = None
    temperament: Optional[str] = None
    energy_level: Optional[str] = None
    social_cats: Optional[bool] = None
    social_dogs: Optional[bool] = None
    social_children: Optional[bool] = None
    weight_kg: Optional[float] = None
    microchip_number: Optional[str] = None
    gender: Optional[str] = None
    gallery: Optional[List[str]] = None
    
    has_active_subscription: Optional[bool] = None
    stripe_subscription_id: Optional[str] = None

class PetSubscriptionUpdate(BaseModel):
    has_active_subscription: bool
    stripe_subscription_id: Optional[str] = None


@router.post("/", response_model=PetResponse)
def create_pet(
    *,
    db: Session = Depends(get_db),
    pet_in: PetCreate,
) -> Any:
    """
    Create a new permanent pet record.
    Called by the adoption service when an adoption is finalized,
    or by the user registering their own pet.
    """
    print(f"[MASCOTAS] Creating pet for owner {pet_in.owner_id}: {pet_in.name}")
    try:
        db_obj = Pet(**pet_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        print(f"[MASCOTAS] Pet created successfully ID: {db_obj.id}")
        return db_obj
    except Exception as e:
        print(f"[MASCOTAS ERROR] Failed to create pet: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en base de datos: {str(e)}")

@router.get("/user/{user_id}", response_model=List[PetResponse])
def get_user_pets(user_id: str, db: Session = Depends(get_db)) -> Any:
    """Get all permanent pets owned by a specific user."""
    print(f"[MASCOTAS] Fetching pets for user_id: {user_id}")
    pets = db.query(Pet).filter(Pet.owner_id == user_id, Pet.is_active == True).all()
    print(f"[MASCOTAS] Found {len(pets)} pets for user {user_id}")
    return pets

@router.get("/{pet_id}", response_model=PetResponse)
def get_pet_by_id(pet_id: str, db: Session = Depends(get_db)) -> Any:
    """Get a specific permanent pet by its ID."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return pet

@router.put("/{pet_id}", response_model=PetResponse)
def update_pet(
    pet_id: str,
    pet_in: PetUpdate,
    db: Session = Depends(get_db),
) -> Any:
    """Update a pet's information."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    update_data = pet_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pet, key, value)
    db.commit()
    db.refresh(pet)
    return pet

@router.get("/adopted-from/{listing_id}", response_model=PetResponse)
def get_pet_by_listing(listing_id: str, db: Session = Depends(get_db)) -> Any:
    """Get the pet created from a specific adoption listing. Useful for verification."""
    pet = db.query(Pet).filter(Pet.adopted_from_listing_id == listing_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="No se encontró mascota vinculada a este listing")
    return pet

@router.patch("/{pet_id}/subscription", response_model=PetResponse)
def update_pet_subscription(
    pet_id: str,
    sub_in: PetSubscriptionUpdate,
    db: Session = Depends(get_db),
) -> Any:
    """Internal use: Toggles Michi-Tracker Pro subscription status from the Ecommerce webhook."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    pet.has_active_subscription = sub_in.has_active_subscription
    pet.stripe_subscription_id = sub_in.stripe_subscription_id
    db.commit()
    db.refresh(pet)
    return pet

@router.patch("/by-subscription/{sub_id}", response_model=PetResponse)
def revoke_pet_subscription(
    sub_id: str,
    sub_in: PetSubscriptionUpdate,
    db: Session = Depends(get_db),
) -> Any:
    """Internal use: Revokes Michi-Tracker Pro tracking using only the stripe_subscription_id."""
    pet = db.query(Pet).filter(Pet.stripe_subscription_id == sub_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota con esta suscripcion no fue encontrada")
    pet.has_active_subscription = sub_in.has_active_subscription
    pet.stripe_subscription_id = sub_in.stripe_subscription_id
    db.commit()
    db.refresh(pet)
    return pet
