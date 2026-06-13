import uuid
from sqlalchemy import Column, String, Float, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class SponsorCampaign(Base):
    __tablename__ = "sponsor_campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sponsor_id = Column(String(36), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    banner_url = Column(String(500), nullable=False)
    target_link = Column(String(255), nullable=True)
    budget_limit = Column(Float, nullable=False)
    spent = Column(Float, default=0.0, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

class BoostedAlert(Base):
    __tablename__ = "boosted_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("sponsor_campaigns.id", ondelete="SET NULL"), nullable=True)
    lost_pet_report_id = Column(String(36), nullable=False, index=True)
    extra_radius_meters = Column(Integer, default=5000, nullable=False)
    amount_paid = Column(Float, nullable=False)
