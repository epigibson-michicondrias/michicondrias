import uuid
from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class PetRide(Base):
    __tablename__ = "pet_rides"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    driver_id = Column(String(36), nullable=False)
    pet_id = Column(String(36), nullable=False)
    origin_address = Column(String(255), nullable=False)
    destination_address = Column(String(255), nullable=False)
    status = Column(String(20), default="pending")
    price = Column(Float, nullable=True)
    requires_carrier = Column(Boolean, default=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)


class DriverProfile(Base):
    __tablename__ = "driver_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    driver_id = Column(String(36), unique=True, nullable=False, index=True)
    vehicle_model = Column(String(100), nullable=False)
    vehicle_plate = Column(String(30), nullable=False)
    max_capacity = Column(Integer, default=1)
    has_air_conditioning = Column(Boolean, default=False)
    has_carriers = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
