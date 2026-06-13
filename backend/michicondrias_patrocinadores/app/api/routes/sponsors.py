from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.crud_sponsor import (
    create_campaign,
    get_campaign,
    create_boosted_alert
)
from app.schemas.sponsor import (
    SponsorCampaignCreate,
    SponsorCampaignOut,
    BoostedAlertCreate,
    BoostedAlertOut
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
    return create_campaign(db, campaign_in=campaign_in, sponsor_id=sponsor_id)

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
        campaign = get_campaign(db, alert_in.campaign_id)
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
            
    return create_boosted_alert(db, alert_in=alert_in)
