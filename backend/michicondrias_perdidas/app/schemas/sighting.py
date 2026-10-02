from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SightingCreate(BaseModel):
    location_text: Optional[str] = Field(default=None, max_length=255)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    note: Optional[str] = Field(default=None, max_length=1000)


class SightingOut(SightingCreate):
    id: str
    report_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
