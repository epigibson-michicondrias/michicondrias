from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LostPetBase(BaseModel):
    pet_name: str
    species: str
    breed: Optional[str] = None
    description: Optional[str] = None
    last_seen_location: str
    date_lost: datetime
    contact_phone: str
    image_url: Optional[str] = None
    is_found: Optional[bool] = False

class LostPetCreate(LostPetBase):
    pass

class LostPetUpdate(BaseModel):
    pet_name: Optional[str] = None
    description: Optional[str] = None
    last_seen_location: Optional[str] = None
    contact_phone: Optional[str] = None
    image_url: Optional[str] = None
    is_found: Optional[bool] = None

class LostPetResponse(LostPetBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class PetfriendlyPlaceBase(BaseModel):
    name: str
    category: str
    address: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = 0
    pet_sizes_allowed: Optional[str] = "todos"
    has_water_bowls: Optional[str] = "no"
    has_pet_menu: Optional[str] = "no"

class PetfriendlyPlaceCreate(PetfriendlyPlaceBase):
    pass

class PetfriendlyPlaceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    image_url: Optional[str] = None

class PetfriendlyPlaceResponse(PetfriendlyPlaceBase):
    id: str
    added_by: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
