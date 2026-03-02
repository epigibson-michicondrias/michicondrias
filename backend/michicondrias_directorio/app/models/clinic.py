from sqlalchemy import Column, String, Integer, Text, ForeignKey, Boolean
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
    is_24_hours = Column(Boolean, default=False)
    has_emergency = Column(Boolean, default=False)
    owner_user_id = Column(String(36), index=True, nullable=True) # Ligado al microservicio core

class Veterinarian(BaseModel):
    __tablename__ = "veterinarians"

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    specialty = Column(String(150))
    license_number = Column(String(100))
    phone = Column(String(50))
    email = Column(String(150))
    bio = Column(Text)
    user_id = Column(String(36), index=True, nullable=True) # Ligado al usuario del microservicio core
    clinic_id = Column(String(36), ForeignKey("clinics.id"), nullable=True) # A qué clínica pertenece
