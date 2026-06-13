import uuid
from sqlalchemy import Column, String, Float, Boolean
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
