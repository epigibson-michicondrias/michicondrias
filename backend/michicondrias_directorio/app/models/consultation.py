from sqlalchemy import Column, String, Text, DateTime
from app.models.base import BaseModel

class Consultation(BaseModel):
    __tablename__ = "consultations"

    clinic_id = Column(String(36), nullable=True)
    vet_id = Column(String(36), nullable=True)
    user_id = Column(String(36), nullable=False)
    pet_id = Column(String(36), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(30), default="scheduled")
    room_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
