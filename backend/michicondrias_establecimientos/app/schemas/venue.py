from pydantic import BaseModel, Field
from typing import Any, Dict, Optional

class VenueBase(BaseModel):
    name: str = Field(..., max_length=150)
    address: str = Field(..., max_length=255)
    amenities: Optional[Dict[str, Any]] = None
    discount_coupon: Optional[str] = Field(None, max_length=50)
    discount_description: Optional[str] = None

class VenueCreate(VenueBase):
    pass

class VenueUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    address: Optional[str] = Field(None, max_length=255)
    amenities: Optional[Dict[str, Any]] = None
    discount_coupon: Optional[str] = Field(None, max_length=50)
    discount_description: Optional[str] = None

class VenueInDBBase(VenueBase):
    id: str
    owner_id: str

    class Config:
        from_attributes = True

class Venue(VenueInDBBase):
    pass
