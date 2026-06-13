from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud import crud_sponsor
from app.schemas.sponsor import (
    SponsorCampaignCreate,
    SponsorCampaignOut,
    BoostedAlertCreate,
    BoostedAlertOut,
    CampaignStatsOut,
    CampaignWithStatsOut,
)

router = APIRouter()

@router.post("/campaigns", response_model=SponsorCampaignOut, status_code=status.HTTP_201_CREATED)
def create_new_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_in: SponsorCampaignCreate,
    sponsor_id: str = Depends(deps.require_patrocinador)
) -> Any:
    """
    Create a new ad campaign. Requires 'patrocinador' role.
    """
    return crud_sponsor.create_campaign(db, campaign_in=campaign_in, sponsor_id=sponsor_id)

@router.post("/boost-alert", response_model=BoostedAlertOut, status_code=status.HTTP_201_CREATED)
def boost_pet_alert(
    *,
    db: Session = Depends(get_db),
    alert_in: BoostedAlertCreate,
    sponsor_id: str = Depends(deps.require_patrocinador)
) -> Any:
    """
    Boost a lost pet report alert. Requires 'patrocinador' role.
    """
    if alert_in.campaign_id:
        campaign = crud_sponsor.get_campaign(db, alert_in.campaign_id)
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaña no encontrada"
            )
        if campaign.sponsor_id != sponsor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos sobre esta campaña"
            )
        if not campaign.active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La campaña no está activa"
            )
        if campaign.spent + alert_in.amount_paid > campaign.budget_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El monto excede el presupuesto límite de la campaña"
            )
            
    return crud_sponsor.create_boosted_alert(db, alert_in=alert_in)


# New Stats Endpoints
@router.get("/campaigns/active", response_model=List[SponsorCampaignOut])
def read_active_campaigns(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get active campaigns for display. Increments views count automatically. Public endpoint.
    """
    return crud_sponsor.get_active_campaigns_and_increment_views(db=db)


@router.post("/campaigns/{campaign_id}/click", response_model=CampaignStatsOut)
def record_campaign_click(
    campaign_id: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Record a click on a campaign banner. Public endpoint.
    """
    stats = crud_sponsor.increment_click(db=db, campaign_id=campaign_id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    return stats


@router.get("/campaigns/stats", response_model=List[CampaignWithStatsOut])
def read_campaign_stats(
    db: Session = Depends(get_db),
    sponsor_id: str = Depends(deps.require_patrocinador)
) -> Any:
    """
    Get campaign performance stats (views, clicks). Requires 'patrocinador' role.
    """
    campaigns = crud_sponsor.get_campaigns_by_sponsor(db=db, sponsor_id=sponsor_id)
    for camp in campaigns:
        # Pre-populate / ensure stats record exists
        crud_sponsor.get_or_create_stats(db=db, campaign_id=camp.id)
    return campaigns


@router.get("/campaigns/geo-target", response_model=List[SponsorCampaignOut])
def read_geo_targeted_campaigns(
    lat: float,
    lng: float,
    radius_meters: Optional[int] = 5000,
    *,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve active sponsor campaigns that match target geo-coordinates (Mock filter). Public endpoint.
    """
    # For now, return all active campaigns as a mock of matching the coords
    return crud_sponsor.get_active_campaigns_and_increment_views(db=db)
