import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
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


class ClaimedCoupon(Base):
    __tablename__ = "claimed_coupons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), nullable=False, index=True)
    venue_id = Column(String(36), ForeignKey("pet_friendly_venues.id", ondelete="CASCADE"), nullable=False, index=True)
    coupon_code = Column(String(50), nullable=False)
    status = Column(String(20), default="active")  # 'active', 'redeemed', 'expired'
    claimed_at = Column(DateTime(timezone=True), server_default=func.now())


class VenueReview(Base):
    __tablename__ = "venue_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), nullable=False, index=True)
    venue_id = Column(String(36), ForeignKey("pet_friendly_venues.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
