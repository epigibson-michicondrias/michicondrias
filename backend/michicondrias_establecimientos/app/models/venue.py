import uuid
from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.db.session import Base

class PetFriendlyVenue(Base):
    __tablename__ = "pet_friendly_venues"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), nullable=False)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    amenities = Column(JSONB, nullable=True)
    discount_coupon = Column(String(50), nullable=True)
    discount_description = Column(Text, nullable=True)
