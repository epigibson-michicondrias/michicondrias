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
    description: Optional[str] = None
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: Optional[float] = 0.0
    image_url: Optional[str] = None

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
    created_by_user_id: str

    class Config:
        from_attributes = True
