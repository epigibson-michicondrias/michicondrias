import uuid
from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime, Text
from sqlalchemy.sql import func
from app.db.session import Base

class PetRide(Base):
    __tablename__ = "pet_rides"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # Conductor que aceptó el viaje (NULL mientras está abierto a cualquier conductor).
    driver_id = Column(String(36), nullable=True, index=True)
    pet_id = Column(String(36), nullable=False)
    # Quien pidió el viaje (dueño de la mascota). NULL en viajes anteriores a la migración.
    client_id = Column(String(36), nullable=True, index=True)
    # Conductor sugerido por el cliente (solo recibe la solicitud; no es asignación).
    preferred_driver_id = Column(String(36), nullable=True, index=True)
    origin_address = Column(String(255), nullable=False)
    destination_address = Column(String(255), nullable=False)
    # pending | accepted | in_transit | completed | cancelled | rejected
    status = Column(String(20), default="pending", index=True)
    price = Column(Float, nullable=True)
    requires_carrier = Column(Boolean, default=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    origin_lat = Column(Float, nullable=True)
    origin_lng = Column(Float, nullable=True)
    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)
    distance_km = Column(Float, nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_by = Column(String(36), nullable=True)
    cancel_reason = Column(String(255), nullable=True)
    rating = Column(Integer, nullable=True)
    rating_comment = Column(String(500), nullable=True)
    rated_at = Column(DateTime(timezone=True), nullable=True)


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
