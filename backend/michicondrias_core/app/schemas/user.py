from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = "consumidor"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    verification_status: Optional[str] = "UNVERIFIED"
    id_front_url: Optional[str] = None
    id_back_url: Optional[str] = None
    proof_of_address_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_id: Optional[str] = None

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserKYCUpdateBase(BaseModel):
    id_front_url: str
    id_back_url: str
    proof_of_address_url: str
    verification_status: str = "PENDING"

class UserResponse(UserBase):
    id: str
    role_id: Optional[str] = None
    role_name: Optional[str] = None
    verification_status: str
    id_front_url: Optional[str] = None
    id_back_url: Optional[str] = None
    proof_of_address_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserMeResponse(UserBase):
    id: str
    role_name: str

    class Config:
        from_attributes = True
