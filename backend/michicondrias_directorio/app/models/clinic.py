from sqlalchemy import Column, String, Integer, Text, ForeignKey, Boolean, Float
from app.models.base import BaseModel

class Clinic(BaseModel):
    __tablename__ = "clinics"

    name = Column(String(150), nullable=False)
    address = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    phone = Column(String(50))
    email = Column(String(150))
    website = Column(String(255))
    description = Column(Text)
    logo_url = Column(String(500), nullable=True)
    is_24_hours = Column(Boolean, default=False)
    has_emergency = Column(Boolean, default=False)
    owner_user_id = Column(String(36), index=True, nullable=True) # Ligado al microservicio core
    is_approved = Column(Boolean, default=False, index=True)

class Veterinarian(BaseModel):
    __tablename__ = "veterinarians"

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    specialty = Column(String(150))
    license_number = Column(String(100))
    phone = Column(String(50))
    email = Column(String(150))
    bio = Column(Text)
    photo_url = Column(String(500), nullable=True)
    user_id = Column(String(36), index=True, nullable=True)
    clinic_id = Column(String(36), ForeignKey("clinics.id"), nullable=True) # A qué clínica pertenece
    is_approved = Column(Boolean, default=False)

class ClinicReview(BaseModel):
    __tablename__ = "clinic_reviews"

    clinic_id = Column(String(36), ForeignKey("clinics.id"), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
