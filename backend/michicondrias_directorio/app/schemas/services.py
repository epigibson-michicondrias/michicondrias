from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime


# --- Clinic Services ---

class ClinicServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: int = 30
    category: Optional[str] = None

class ClinicServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class ClinicServiceResponse(BaseModel):
    id: str
    clinic_id: str
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: int
    category: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


# --- Clinic Schedule ---

class ClinicScheduleCreate(BaseModel):
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: str   # "09:00"
    end_time: str      # "18:00"
    slot_duration_minutes: int = 30

class ClinicScheduleResponse(BaseModel):
    id: str
    clinic_id: str
    day_of_week: int
    start_time: str
    end_time: str
    slot_duration_minutes: int
    is_active: bool

    class Config:
        from_attributes = True


# --- Schedule Exceptions ---

class ScheduleExceptionCreate(BaseModel):
    date: str  # "YYYY-MM-DD"
    is_closed: bool = True
    custom_start: Optional[str] = None  # "09:00"
    custom_end: Optional[str] = None
    reason: Optional[str] = None

class ScheduleExceptionResponse(BaseModel):
    id: str
    clinic_id: str
    date: str
    is_closed: bool
    custom_start: Optional[str] = None
    custom_end: Optional[str] = None
    reason: Optional[str] = None

    class Config:
        from_attributes = True


# --- Appointments ---

class AppointmentCreate(BaseModel):
    clinic_id: str
    service_id: str
    pet_id: str
    vet_id: Optional[str] = None
    date: str         # "YYYY-MM-DD"
    start_time: str   # "09:00"
    notes: Optional[str] = None

class AppointmentReschedule(BaseModel):
    date: str
    start_time: str

class AppointmentCancel(BaseModel):
    cancellation_reason: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    clinic_id: str
    service_id: str
    pet_id: str
    user_id: str
    vet_id: Optional[str] = None
    date: str
    start_time: str
    end_time: str
    status: str
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: Optional[datetime] = None

    # Joined fields (populated at route level)
    service_name: Optional[str] = None
    clinic_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Available Slot ---

class AvailableSlot(BaseModel):
    start_time: str
    end_time: str
