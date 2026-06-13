from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.sponsor import SponsorCampaign, BoostedAlert
from app.schemas.sponsor import SponsorCampaignCreate, BoostedAlertCreate

def create_campaign(db: Session, campaign_in: SponsorCampaignCreate, sponsor_id: str) -> SponsorCampaign:
    db_campaign = SponsorCampaign(
        sponsor_id=sponsor_id,
        title=campaign_in.title,
        banner_url=campaign_in.banner_url,
        target_link=campaign_in.target_link,
        budget_limit=campaign_in.budget_limit,
        spent=0.0,
        active=True
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def get_campaign(db: Session, campaign_id: str) -> Optional[SponsorCampaign]:
    return db.query(SponsorCampaign).filter(SponsorCampaign.id == campaign_id).first()

def get_campaigns_by_sponsor(db: Session, sponsor_id: str) -> List[SponsorCampaign]:
    return db.query(SponsorCampaign).filter(SponsorCampaign.sponsor_id == sponsor_id).all()

def create_boosted_alert(db: Session, alert_in: BoostedAlertCreate) -> BoostedAlert:
    if alert_in.campaign_id:
        campaign = db.query(SponsorCampaign).filter(SponsorCampaign.id == alert_in.campaign_id).first()
        if campaign:
            campaign.spent += alert_in.amount_paid
            if campaign.spent >= campaign.budget_limit:
                campaign.active = False
            db.add(campaign)

    db_alert = BoostedAlert(
        campaign_id=alert_in.campaign_id,
        lost_pet_report_id=alert_in.lost_pet_report_id,
        extra_radius_meters=alert_in.extra_radius_meters,
        amount_paid=alert_in.amount_paid
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_boosted_alerts_by_campaign(db: Session, campaign_id: str) -> List[BoostedAlert]:
    return db.query(BoostedAlert).filter(BoostedAlert.campaign_id == campaign_id).all()
