from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.ecommerce import DonationCreate, DonationUpdate, DonationResponse

router = APIRouter()

@router.get("/", response_model=List[DonationResponse])
def read_donations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all donations. (Public endpoint usually or Admin only)
    """
    donations = crud.crud_ecommerce.get_donations(db, skip=skip, limit=limit)
    return donations

@router.post("/", response_model=DonationResponse)
def create_donation(
    *,
    db: Session = Depends(get_db),
    donation_in: DonationCreate,
    user_id: str = Depends(deps.get_optional_user_id), # Can be null if not logged in
) -> Any:
    """
    Create new donation record.
    """
    donation = crud.crud_ecommerce.create_donation(db=db, donation=donation_in, user_id=user_id)
    return donation
