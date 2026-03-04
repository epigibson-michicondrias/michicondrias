from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.clinic import ClinicReviewCreate, ClinicReviewResponse

router = APIRouter()

@router.get("/clinics/{clinic_id}/reviews", response_model=List[ClinicReviewResponse])
def read_clinic_reviews(
    clinic_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """Get all reviews for a clinic (Public endpoint)."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    return crud.crud_clinic.get_clinic_reviews(db, clinic_id)

@router.post("/clinics/{clinic_id}/reviews", response_model=ClinicReviewResponse)
def create_review(
    clinic_id: str,
    *,
    db: Session = Depends(get_db),
    review_in: ClinicReviewCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Submit a review for a clinic (Requires auth)."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if review_in.rating < 1 or review_in.rating > 5:
        raise HTTPException(status_code=400, detail="La calificación debe ser entre 1 y 5")
    return crud.crud_clinic.create_clinic_review(db, clinic_id=clinic_id, user_id=user_id, review=review_in)

@router.get("/clinics/{clinic_id}/rating")
def get_clinic_rating(
    clinic_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """Get the average rating for a clinic (Public endpoint)."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    avg = crud.crud_clinic.get_clinic_average_rating(db, clinic_id)
    reviews = crud.crud_clinic.get_clinic_reviews(db, clinic_id)
    return {"average_rating": avg, "total_reviews": len(reviews)}
