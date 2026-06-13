from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time

# Grooming File Schemas
class GroomingFileBase(BaseModel):
    pet_id: str
    hair_type: Optional[str] = None
    preferred_shampoo: Optional[str] = None
    behavior_notes: Optional[str] = None
    allergies_detected: Optional[str] = None
    last_service_date: Optional[date] = None

class GroomingFileCreate(GroomingFileBase):
    pass

class GroomingFileUpdate(BaseModel):
    hair_type: Optional[str] = None
    preferred_shampoo: Optional[str] = None
    behavior_notes: Optional[str] = None
    allergies_detected: Optional[str] = None
    last_service_date: Optional[date] = None

class GroomingFileOut(GroomingFileBase):
    id: str

    class Config:
        from_attributes = True


# Grooming Appointment Schemas
class GroomingAppointmentBase(BaseModel):
    groomer_id: str
    pet_id: str
    date: date
    time: time
    service_type: str
    status: Optional[str] = "pending"

class GroomingAppointmentCreate(GroomingAppointmentBase):
    pass

class GroomingAppointmentUpdatePhotos(BaseModel):
    before_photo_url: Optional[str] = None
    after_photo_url: Optional[str] = None
    status: Optional[str] = None
    skin_report: Optional[str] = None

class GroomingAppointmentOut(GroomingAppointmentBase):
    id: str
    before_photo_url: Optional[str] = None
    after_photo_url: Optional[str] = None
    skin_report: Optional[str] = None

    class Config:
        from_attributes = True


# History response
class GroomingHistory(BaseModel):
    file: Optional[GroomingFileOut] = None
    appointments: List[GroomingAppointmentOut] = []
