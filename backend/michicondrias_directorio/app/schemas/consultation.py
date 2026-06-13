from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConsultationBase(BaseModel):
    clinic_id: Optional[str] = None
    vet_id: Optional[str] = None
    pet_id: Optional[str] = None
    scheduled_at: datetime
    notes: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationResponse(ConsultationBase):
    id: str
    user_id: str
    status: str
    room_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
