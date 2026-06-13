from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
from datetime import datetime

class VenueBase(BaseModel):
    name: str = Field(..., max_length=150)
    address: str = Field(..., max_length=255)
    amenities: Optional[Dict[str, Any]] = None
    discount_coupon: Optional[str] = Field(None, max_length=50)
    discount_description: Optional[str] = None

class VenueCreate(VenueBase):
    pass

class VenueUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    address: Optional[str] = Field(None, max_length=255)
    amenities: Optional[Dict[str, Any]] = None
    discount_coupon: Optional[str] = Field(None, max_length=50)
    discount_description: Optional[str] = None

class VenueInDBBase(VenueBase):
    id: str
    owner_id: str

    class Config:
        from_attributes = True

class Venue(VenueInDBBase):
    pass


# ClaimedCoupon Schemas
class ClaimedCouponOut(BaseModel):
    id: str
    client_id: str
    venue_id: str
    coupon_code: str
    status: str
    claimed_at: datetime

    class Config:
        from_attributes = True


# VenueReview Schemas
class VenueReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None

class VenueReviewOut(BaseModel):
    id: str
    client_id: str
    venue_id: str
    rating: int
    review_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
