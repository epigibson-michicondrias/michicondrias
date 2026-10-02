from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime

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
    # Datos de apoyo para mostrar la cita sin exponer IDs (opcionales: no rompen clientes anteriores)
    pet_name: Optional[str] = None
    client_name: Optional[str] = None
    groomer_name: Optional[str] = None
    reviewed: bool = False  # el usuario ya reseñó esta cita

    class Config:
        from_attributes = True


# History response
class GroomingHistory(BaseModel):
    file: Optional[GroomingFileOut] = None
    appointments: List[GroomingAppointmentOut] = []


# GroomingService Schemas
class GroomingServiceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    duration_minutes: Optional[float] = Field(60.0, ge=5, le=720)


class GroomingServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    duration_minutes: Optional[float] = Field(None, ge=5, le=720)
    is_active: Optional[bool] = None

class GroomingServiceOut(BaseModel):
    id: str
    groomer_id: str
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: float
    is_active: bool
    created_at: datetime
    groomer_name: Optional[str] = None
    groomer_rating_avg: float = 0.0
    groomer_rating_count: int = 0

    class Config:
        from_attributes = True


# Reviews
class GroomingReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)

class GroomingReviewOut(BaseModel):
    id: str
    appointment_id: str
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    author_name: Optional[str] = None
    is_mine: bool = False

class GroomingReviewsSummary(BaseModel):
    average: float = 0.0
    count: int = 0
    reviews: List[GroomingReviewOut] = []
