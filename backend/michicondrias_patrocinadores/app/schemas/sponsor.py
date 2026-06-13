from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SponsorCampaignBase(BaseModel):
    title: str
    banner_url: str
    target_link: Optional[str] = None
    budget_limit: float

class SponsorCampaignCreate(SponsorCampaignBase):
    pass

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
    pass

class BoostedAlertOut(BoostedAlertBase):
    id: str

    class Config:
        from_attributes = True
