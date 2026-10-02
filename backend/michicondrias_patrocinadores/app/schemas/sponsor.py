from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

def _check_http_url(value: Optional[str]) -> Optional[str]:
    if value is None or value == "":
        return None
    if not value.lower().startswith(("http://", "https://")):
        raise ValueError("La URL debe empezar con http:// o https://")
    return value


class SponsorCampaignBase(BaseModel):
    title: str
    banner_url: str
    target_link: Optional[str] = None
    budget_limit: float

class SponsorCampaignCreate(SponsorCampaignBase):
    # Las validaciones viven solo en la creación para no romper la lectura de campañas ya guardadas
    title: str = Field(..., min_length=1, max_length=150)
    banner_url: str = Field(..., max_length=500)
    target_link: Optional[str] = Field(default=None, max_length=255)
    budget_limit: float = Field(..., gt=0)

    @field_validator("banner_url")
    @classmethod
    def _banner(cls, v: str) -> str:
        checked = _check_http_url(v)
        if not checked:
            raise ValueError("El banner es obligatorio")
        return checked

    @field_validator("target_link")
    @classmethod
    def _link(cls, v: Optional[str]) -> Optional[str]:
        return _check_http_url(v)

class SponsorCampaignOut(SponsorCampaignBase):
    id: str
    sponsor_id: str
    spent: float
    active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BoostedAlertBase(BaseModel):
    campaign_id: Optional[str] = None
    lost_pet_report_id: str
    extra_radius_meters: int = 5000
    amount_paid: float

class BoostedAlertCreate(BoostedAlertBase):
    extra_radius_meters: int = Field(default=5000, ge=500, le=50000)
    amount_paid: float = Field(..., gt=0)

class BoostedAlertOut(BoostedAlertBase):
    id: str

    class Config:
        from_attributes = True


# CampaignStats Schemas
class CampaignStatsOut(BaseModel):
    id: str
    campaign_id: str
    views_count: int
    clicks_count: int
    last_tracked_at: datetime

    class Config:
        from_attributes = True


class CampaignWithStatsOut(SponsorCampaignOut):
    stats: Optional[CampaignStatsOut] = None


class CampaignUpdate(BaseModel):
    active: Optional[bool] = None
    title: Optional[str] = Field(default=None, min_length=1, max_length=150)
