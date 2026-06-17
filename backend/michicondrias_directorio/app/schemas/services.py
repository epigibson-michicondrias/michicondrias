from pydantic import BaseModel, model_validator
from typing import Optional, Any
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
    date: Optional[str] = None         # "YYYY-MM-DD"
    start_time: Optional[str] = None   # "09:00"
    notes: Optional[str] = None
    
    # Optional fields sent by the mobile frontend
    appointment_date: Optional[str] = None
    reason: Optional[str] = None
    is_emergency: Optional[bool] = None

    @model_validator(mode='before')
    @classmethod
    def parse_appointment_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 1. Parse date and start_time from appointment_date if date/start_time are not directly provided
            appt_date = data.get("appointment_date")
            if appt_date and not data.get("date") and not data.get("start_time"):
                parts = appt_date.strip().split()
                if len(parts) >= 2:
                    data["date"] = parts[0]
                    # Combine time part and optional AM/PM indicator
                    time_part = " ".join(parts[1:])
                    if "AM" in time_part or "PM" in time_part:
                        try:
                            from datetime import datetime as dt_parser
                            dt = dt_parser.strptime(time_part, "%I:%M %p")
                            data["start_time"] = dt.strftime("%H:%M")
                        except Exception:
                            data["start_time"] = parts[1]
                    else:
                        data["start_time"] = parts[1]
            
            # 2. Encode is_emergency and reason into notes if notes is not directly provided
            reason_text = data.get("reason")
            is_emerg = data.get("is_emergency")
            
            if not data.get("notes"):
                encoded_notes = []
                if is_emerg:
                    encoded_notes.append("[EMERGENCIA]")
                if reason_text:
                    encoded_notes.append(reason_text.strip())
                if encoded_notes:
                    data["notes"] = " ".join(encoded_notes)
        return data

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
    
    # Enrichment fields to match mobile expectations
    appointment_date: Optional[str] = None
    pet_name: Optional[str] = None
    reason: Optional[str] = None
    is_emergency: bool = False

    class Config:
        from_attributes = True


# --- Available Slot ---

class AvailableSlot(BaseModel):
    start_time: str
    end_time: str
