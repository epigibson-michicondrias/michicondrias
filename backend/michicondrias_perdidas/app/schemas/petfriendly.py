from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PlaceBase(BaseModel):
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


class PlaceCreate(PlaceBase):
    pass


class PlaceOut(PlaceBase):
    id: str
    added_by: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PetfriendlyReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None


class PetfriendlyReviewOut(BaseModel):
    id: str
    place_id: str
    user_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
