from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(BaseModel):
    require_2fa: bool = False
    temp_token: Optional[str] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = "consumidor"
    is_temp: Optional[bool] = False
    purpose: Optional[str] = "auth"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    verification_status: Optional[str] = "UNVERIFIED"
    id_front_url: Optional[str] = None
    id_back_url: Optional[str] = None
    proof_of_address_url: Optional[str] = None
    is_two_factor_enabled: Optional[bool] = False

class UserCreate(UserBase):
    password: str
    role_id: Optional[str] = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        # El correo se guarda en minúsculas: el login tampoco distingue mayúsculas
        return value.strip().lower()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return value

class UserUpdate(UserBase):
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and len(value) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return value

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
    # "Miembro desde" en la app
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserMeResponse(UserBase):
    id: str
    role_name: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class KYCPresignedUrl(BaseModel):
    key: str
    url: str
    object_key: str

class KYCPresignedUrlsResponse(BaseModel):
    urls: List[KYCPresignedUrl]

class KYCFinalizeRequest(BaseModel):
    id_front_url: str
    id_back_url: str
    proof_of_address_url: str

class TwoFactorSetupResponse(BaseModel):
    secret: str
    otpauth_url: str

class TwoFactorVerifyRequest(BaseModel):
    code: str
    secret: str

class TwoFactorVerifyLoginRequest(BaseModel):
    temp_token: str
    code: str


