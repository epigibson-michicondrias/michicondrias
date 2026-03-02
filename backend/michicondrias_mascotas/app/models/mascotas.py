import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Integer
from sqlalchemy.sql import func
from app.db.session import Base

class Pet(Base):
    __tablename__ = "pets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    owner_id = Column(String, index=True, nullable=False) # User from Core
    name = Column(String, index=True, nullable=False)
    species = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    age_months = Column(Integer, nullable=True)
    size = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    # Traceability: which adoption listing originated this pet record
    adopted_from_listing_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LostPet(Base):
    __tablename__ = "lost_pets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, index=True, nullable=False) # Refers to users.id from core app.
    pet_name = Column(String, index=True, nullable=False)
    species = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    last_seen_location = Column(String, nullable=False)
    date_lost = Column(DateTime(timezone=True), nullable=False)
    contact_phone = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    is_found = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PetfriendlyPlace(Base):
    __tablename__ = "petfriendly_places"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False) # e.g. "restaurant", "park", "hotel"
    description = Column(Text, nullable=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    rating = Column(Float, default=0.0)
    image_url = Column(String, nullable=True)
    created_by_user_id = Column(String, nullable=False)
