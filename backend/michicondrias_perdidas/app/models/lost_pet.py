import uuid
from sqlalchemy import Column, String, Text, DateTime, Float, Boolean
from sqlalchemy.sql import func
from app.db.session import Base


class LostPetReport(Base):
    __tablename__ = "lost_pet_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reporter_id = Column(String, nullable=False, index=True)
    
    # Mascota info
    pet_name = Column(String(120), nullable=False)
    species = Column(String(50), nullable=False)  # gato, perro, ave, etc
    breed = Column(String(100), nullable=True)
    color = Column(String(80), nullable=True)
    size = Column(String(30), nullable=True)  # pequeno, mediano, grande
    age_approx = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    
    # Report type
    report_type = Column(String(20), nullable=False, default="lost")  # lost | found
    
    # Location
    last_seen_location = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Michi-Tracker (Real-time tracking)
    has_tracker = Column(Boolean, default=False)
    tracker_device_id = Column(String(100), nullable=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    last_tracked_at = Column(DateTime(timezone=True), nullable=True)

    
    # Contact
    contact_phone = Column(String(30), nullable=True)
    contact_email = Column(String(120), nullable=True)
    
    # Status
    status = Column(String(20), default="active")  # active | resolved | expired
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    is_reviewed = Column(Boolean, default=False)  # Admin moderation queue flag
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
