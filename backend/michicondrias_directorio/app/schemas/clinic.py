from pydantic import BaseModel, HttpUrl
from typing import Optional

class ClinicBase(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    is_24_hours: Optional[bool] = False
    has_emergency: Optional[bool] = False
    owner_user_id: Optional[str] = None

class ClinicCreate(ClinicBase):
    pass

class ClinicUpdate(ClinicBase):
    name: Optional[str] = None

class ClinicResponse(ClinicBase):
    id: str

    class Config:
        from_attributes = True

class VeterinarianBase(BaseModel):
    first_name: str
    last_name: str
    specialty: Optional[str] = None
    license_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    clinic_id: Optional[str] = None

class VeterinarianCreate(VeterinarianBase):
    pass

class VeterinarianUpdate(VeterinarianBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class VeterinarianResponse(VeterinarianBase):
    id: str
    user_id: Optional[str] = None

    class Config:
        from_attributes = True
