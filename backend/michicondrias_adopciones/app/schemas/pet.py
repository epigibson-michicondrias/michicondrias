from pydantic import BaseModel
from typing import Optional


# ============================
# ADOPTION LISTING (the ad/post)
# ============================

class ListingBase(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    age_months: Optional[int] = None
    size: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    
    # Enrichment Fields
    is_vaccinated: Optional[bool] = False
    is_sterilized: Optional[bool] = False
    is_dewormed: Optional[bool] = False
    temperament: Optional[str] = None
    energy_level: Optional[str] = None
    social_cats: Optional[bool] = True
    social_dogs: Optional[bool] = True
    social_children: Optional[bool] = True
    weight_kg: Optional[float] = None
    microchip_number: Optional[str] = None

class ListingCreate(ListingBase):
    pass

class ListingUpdate(ListingBase):
    name: Optional[str] = None
    species: Optional[str] = None

class ListingResponse(ListingBase):
    id: str
    status: str
    is_approved: bool
    published_by: str
    adopted_by: Optional[str] = None

    class Config:
        from_attributes = True


# ============================
# ADOPTION REQUEST
# ============================

class AdoptionRequestCreate(BaseModel):
    applicant_name: Optional[str] = None
    house_type: str
    has_yard: bool
    own_or_rent: str
    landlord_permission: Optional[bool] = True
    other_pets: Optional[str] = None
    has_children: bool
    children_ages: Optional[str] = None
    hours_alone: int
    financial_commitment: bool
    reason: str
    previous_experience: Optional[str] = None

class AdoptionRequestResponse(AdoptionRequestCreate):
    id: str
    listing_id: str
    user_id: str
    status: str
    # Info extra anexada de la Mascota
    pet_name: Optional[str] = None
    pet_photo_url: Optional[str] = None

    class Config:
        from_attributes = True
