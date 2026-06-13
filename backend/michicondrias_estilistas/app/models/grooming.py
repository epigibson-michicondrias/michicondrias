import uuid
from sqlalchemy import Column, String, Text, Date, Time, Boolean, Float, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class GroomingFile(Base):
    __tablename__ = "grooming_files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id = Column(String(36), nullable=False, index=True)
    hair_type = Column(String(100), nullable=True)
    preferred_shampoo = Column(String(100), nullable=True)
    behavior_notes = Column(Text, nullable=True)
    allergies_detected = Column(Text, nullable=True)
    last_service_date = Column(Date, nullable=True)


class GroomingAppointment(Base):
    __tablename__ = "grooming_appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    groomer_id = Column(String(36), nullable=False, index=True)
    pet_id = Column(String(36), nullable=False, index=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    service_type = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    before_photo_url = Column(String(500), nullable=True)
    after_photo_url = Column(String(500), nullable=True)
    skin_report = Column(Text, nullable=True)


class GroomingService(Base):
    __tablename__ = "grooming_services"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    groomer_id = Column(String(36), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Float, default=60.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
