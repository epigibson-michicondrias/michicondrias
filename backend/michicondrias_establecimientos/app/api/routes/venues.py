from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.crud import crud_venue
from app.schemas.venue import (
    VenueCreate,
    VenueUpdate,
    Venue,
    ClaimedCouponOut,
    VenueReviewCreate,
    VenueReviewOut,
)

router = APIRouter()

@router.post("/", response_model=Venue, status_code=status.HTTP_201_CREATED)
def register_venue(
    *,
    db: Session = Depends(get_db),
    venue_in: VenueCreate,
    owner_id: str = Depends(deps.require_establecimiento)
) -> Any:
    """
    Register a pet friendly establishment. Requires 'establecimiento' role.
    """
    return crud_venue.create_venue(db, venue_in=venue_in, owner_id=owner_id)

@router.get("/search", response_model=List[Venue])
def search_for_venues(
    *,
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    name: Optional[str] = None,
    address: Optional[str] = None,
    amenity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Any:
    """
    Search for venues by name, address, or amenity (uses PostgreSQL JSONB filter).
    """
    return crud_venue.search_venues(
        db,
        q=q,
        name=name,
        address=address,
        amenity=amenity,
        skip=skip,
        limit=limit
    )

@router.get("/{venue_id}", response_model=Venue)
def read_venue(
    venue_id: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific pet friendly venue by ID.
    """
    venue = crud_venue.get_venue_by_id(db, venue_id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    return venue

@router.put("/{venue_id}", response_model=Venue)
def update_existing_venue(
    venue_id: str,
    *,
    db: Session = Depends(get_db),
    venue_in: VenueUpdate,
    owner_id: str = Depends(deps.require_establecimiento)
) -> Any:
    """
    Update a pet friendly establishment. Only the owner can update.
    """
    db_venue = crud_venue.get_venue_by_id(db, venue_id=venue_id)
    if not db_venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    if db_venue.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar este establecimiento"
        )
    return crud_venue.update_venue(db, db_venue=db_venue, venue_in=venue_in)

@router.delete("/{venue_id}", response_model=dict)
def delete_existing_venue(
    venue_id: str,
    *,
    db: Session = Depends(get_db),
    owner_id: str = Depends(deps.require_establecimiento)
) -> Any:
    """
    Delete a pet friendly establishment. Only the owner can delete.
    """
    db_venue = crud_venue.get_venue_by_id(db, venue_id=venue_id)
    if not db_venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    if db_venue.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para eliminar este establecimiento"
        )
    crud_venue.delete_venue(db, venue_id=venue_id)
    return {"message": "Establecimiento eliminado exitosamente"}


# New Coupon Claiming Endpoints
@router.post("/{venue_id}/coupons/claim", response_model=ClaimedCouponOut)
def claim_venue_coupon(
    venue_id: str,
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Claim the active discount coupon of a pet friendly venue. Requires authentication.
    """
    venue = crud_venue.get_venue_by_id(db, venue_id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    if not venue.discount_coupon:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este establecimiento no tiene un cupón de descuento activo actualmente."
        )
    return crud_venue.claim_coupon(db=db, venue_id=venue_id, client_id=current_user_id, coupon_code=venue.discount_coupon)


# New Venue Review Endpoints
@router.post("/{venue_id}/reviews", response_model=VenueReviewOut, status_code=status.HTTP_201_CREATED)
def write_venue_review(
    venue_id: str,
    *,
    db: Session = Depends(get_db),
    review_in: VenueReviewCreate,
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Write a rating and review for a pet friendly establishment. Requires authentication.
    """
    venue = crud_venue.get_venue_by_id(db, venue_id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    return crud_venue.create_review(db=db, venue_id=venue_id, client_id=current_user_id, review_in=review_in)


@router.get("/{venue_id}/reviews", response_model=List[VenueReviewOut])
def read_venue_reviews(
    venue_id: str,
    *,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all user reviews and ratings for a venue. Public endpoint.
    """
    venue = crud_venue.get_venue_by_id(db, venue_id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    return crud_venue.get_reviews_for_venue(db=db, venue_id=venue_id)
