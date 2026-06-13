from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, Literal

# PetDeath Schemas
class PetDeathCreate(BaseModel):
    pet_id: str
    date_of_death: date
    cause_of_death: Optional[str] = None
    cremation_type: Optional[Literal['individual', 'collective', 'no_cremation']] = None
    urn_model: Optional[str] = None
    certificate_url: Optional[str] = None
    notes: Optional[str] = None

class PetDeathResponse(BaseModel):
    id: str
    pet_id: str
    funerary_id: str
    date_of_death: date
    cause_of_death: Optional[str] = None
    cremation_type: Optional[str] = None
    urn_model: Optional[str] = None
    certificate_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# PetMemorialPost Schemas
class PetMemorialPostCreate(BaseModel):
    pet_id: str
    message: str
    photo_url: Optional[str] = None

class PetMemorialPostResponse(BaseModel):
    id: str
    pet_id: str
    user_id: str
    message: str
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
