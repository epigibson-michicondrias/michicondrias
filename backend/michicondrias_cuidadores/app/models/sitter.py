from sqlalchemy import Column, String, Integer, Text, Float, Boolean
from sqlalchemy.orm import declarative_base
from app.models.base import BaseModel

Base = declarative_base()


class Sitter(Base, BaseModel):
    """A registered pet sitter / caretaker."""
    __tablename__ = "sitters"

    user_id = Column(String(36), nullable=False, unique=True, index=True)
    display_name = Column(String(200), nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    location = Column(String(300), nullable=True)
    price_per_day = Column(Float, nullable=True)        # MXN - for hosting
    price_per_visit = Column(Float, nullable=True)      # MXN - for visiting
    rating = Column(Float, nullable=True, default=0.0)
    total_sits = Column(Integer, nullable=False, default=0)
    is_verified = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True, index=True)
    service_type = Column(String(30), nullable=False, default="both")  # hosting, visiting, both
    max_pets = Column(Integer, nullable=False, default=2)
    has_yard = Column(Boolean, default=False)
    home_type = Column(String(100), nullable=True)  # "Casa", "Departamento", etc.
    accepts_dogs = Column(Boolean, default=True)
    accepts_cats = Column(Boolean, default=True)
    experience_years = Column(Integer, nullable=True, default=0)
    gallery = Column(Text, nullable=True)  # JSON array of URLs


class SitRequest(Base, BaseModel):
    """A request for pet sitting between a client and a sitter."""
    __tablename__ = "sit_requests"

    sitter_id = Column(String(36), nullable=False, index=True)
    client_user_id = Column(String(36), nullable=False, index=True)
    pet_id = Column(String(36), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="pending", index=True)
    # Statuses: pending, accepted, in_progress, completed, cancelled
    service_type = Column(String(30), nullable=False, default="hosting")  # hosting or visiting
    start_date = Column(String(20), nullable=False)  # ISO date
    end_date = Column(String(20), nullable=False)     # ISO date
    address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    total_price = Column(Float, nullable=True)


class SitReview(Base, BaseModel):
    """A review left after a completed sit."""
    __tablename__ = "sit_reviews"

    sit_request_id = Column(String(36), nullable=False, unique=True, index=True)
    reviewer_user_id = Column(String(36), nullable=False, index=True)
    sitter_id = Column(String(36), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
