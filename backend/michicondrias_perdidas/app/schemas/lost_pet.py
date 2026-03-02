from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LostPetReportBase(BaseModel):
    pet_name: str
    species: str
    breed: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    age_approx: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    report_type: str = "lost"  # lost | found
    last_seen_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class LostPetReportCreate(LostPetReportBase):
    pass


class LostPetReportUpdate(BaseModel):
    pet_name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    last_seen_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    status: Optional[str] = None
    is_resolved: Optional[bool] = None


class LostPetReportOut(LostPetReportBase):
    id: str
    reporter_id: str
    status: str
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
