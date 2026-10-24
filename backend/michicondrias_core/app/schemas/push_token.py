from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class PushTokenCreate(BaseModel):
    token: str = Field(..., description="Token de push del dispositivo")
    platform: str = Field(..., description="Plataforma del dispositivo: android, ios o web")

    @field_validator("token")
    @classmethod
    def validate_token(cls, value: str) -> str:
        v = (value or "").strip()
        if not v:
            raise ValueError("El token no puede estar vacío")
        if len(v) > 512:
            raise ValueError("El token no puede superar los 512 caracteres")
        return v

    @field_validator("platform")
    @classmethod
    def validate_platform(cls, value: str) -> str:
        v = (value or "").strip().lower()
        if v not in ("android", "ios", "web"):
            raise ValueError("La plataforma debe ser 'android', 'ios' o 'web'")
        return v

class PushTokenResponse(BaseModel):
    id: str
    token: str
    platform: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PushTokenDeactivateResponse(BaseModel):
    deactivated: bool
