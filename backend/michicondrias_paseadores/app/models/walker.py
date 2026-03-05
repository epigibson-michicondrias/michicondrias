from sqlalchemy import Column, String, Integer, Text, Float, Boolean
from sqlalchemy.orm import declarative_base
from app.models.base import BaseModel

Base = declarative_base()


class Walker(Base, BaseModel):
    """A registered dog walker / pet walker."""
    __tablename__ = "walkers"

    user_id = Column(String(36), nullable=False, unique=True, index=True)
    display_name = Column(String(200), nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    location = Column(String(300), nullable=True)
    price_per_walk = Column(Float, nullable=True)       # MXN
    price_per_hour = Column(Float, nullable=True)       # MXN
    rating = Column(Float, nullable=True, default=0.0)
    total_walks = Column(Integer, nullable=False, default=0)
    is_verified = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True, index=True)
    experience_years = Column(Integer, nullable=True, default=0)
    accepts_dogs = Column(Boolean, default=True)
    accepts_cats = Column(Boolean, default=False)
    max_pets_per_walk = Column(Integer, nullable=False, default=3)
    service_radius_km = Column(Float, nullable=True, default=5.0)
    schedule_preference = Column(String(100), nullable=True)  # "Mañanas", "Tardes", "Flexible"
    gallery = Column(Text, nullable=True)  # JSON array of URLs


class WalkRequest(Base, BaseModel):
    """A request for a walk between a client and a walker."""
    __tablename__ = "walk_requests"

    walker_id = Column(String(36), nullable=False, index=True)
    client_user_id = Column(String(36), nullable=False, index=True)
    pet_id = Column(String(36), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="pending", index=True)
    # Statuses: pending, accepted, in_progress, completed, cancelled
    requested_date = Column(String(20), nullable=False)  # ISO date
    requested_time = Column(String(10), nullable=True)   # HH:MM
    duration_minutes = Column(Integer, nullable=False, default=60)
    pickup_address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    total_price = Column(Float, nullable=True)


class WalkReview(Base, BaseModel):
    """A review left after a completed walk."""
    __tablename__ = "walk_reviews"

    walk_request_id = Column(String(36), nullable=False, unique=True, index=True)
    reviewer_user_id = Column(String(36), nullable=False, index=True)
    walker_id = Column(String(36), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
