from pydantic import BaseModel, Field
from typing import Optional

# Shared properties
class PetRideBase(BaseModel):
    driver_id: str = Field(..., max_length=36)
    pet_id: str = Field(..., max_length=36)
    origin_address: str = Field(..., max_length=255)
    destination_address: str = Field(..., max_length=255)
    price: Optional[float] = None
    requires_carrier: bool = True
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

# Properties to receive via API on creation
class PetRideCreate(PetRideBase):
    pass

# Properties to receive via API on location update
class RideLocationUpdate(BaseModel):
    current_lat: float
    current_lng: float

# Properties to receive via API on update
class PetRideUpdate(BaseModel):
    driver_id: Optional[str] = None
    pet_id: Optional[str] = None
    origin_address: Optional[str] = None
    destination_address: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    requires_carrier: Optional[bool] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

# Properties stored in DB
class PetRideInDBBase(PetRideBase):
    id: str
    status: str

    class Config:
        from_attributes = True

# Additional properties to return via API
class PetRideOut(PetRideInDBBase):
    pass

# Track coordinates response
class RideTrackOut(BaseModel):
    id: str
    status: str
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

    class Config:
        from_attributes = True
