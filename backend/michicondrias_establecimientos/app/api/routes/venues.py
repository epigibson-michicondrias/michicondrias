from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.crud import crud_venue
from app.models.venue import ClaimedCoupon, VenueReview
from app.schemas.venue import (
    VenueCreate,
    VenueUpdate,
    Venue,
    ClaimedCouponOut,
    VenueReviewCreate,
    VenueReviewOut,
)

import secrets
import string

router = APIRouter()


def _for_viewer(venue, viewer_id: Optional[str]) -> Venue:
    out = Venue.model_validate(venue)
    out = out.model_copy(update={"has_coupon": bool(venue.discount_coupon)})
    if viewer_id != venue.owner_id:
        out = out.model_copy(update={"discount_coupon": None})
    return out


def _prefix(base: str) -> str:
    return f"{base.strip().upper()[:42]}-"


def _personal_code(base: str) -> str:
    """Código único por cliente: `BASE-XXXXXX` en mayúsculas (cabe en la columna de 50 caracteres)."""
    suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    return f"{_prefix(base)}{suffix}"


def _is_shared_code(code: str, base: str) -> bool:
    """Reclamo de antes de los códigos personales (todos los clientes con el mismo código)."""
    return code.strip().upper() == base.strip().upper()


def _same_campaign(base: str):
    """Reclamos de esta campaña: el código base (reclamos viejos) o un personal `BASE-XXXXXX` exacto.
    Sin LIKE con comodines y con largo fijo, para no mezclar campañas como `PROMO` y `PROMO-VERANO`."""
    code = func.upper(ClaimedCoupon.coupon_code)
    prefix = _prefix(base)
    personal = code.startswith(prefix, autoescape=True) & (func.length(ClaimedCoupon.coupon_code) == len(prefix) + 6)
    return (code == base.strip().upper()) | personal

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
    return _for_viewer(crud_venue.create_venue(db, venue_in=venue_in, owner_id=owner_id), owner_id)

@router.get("/search", response_model=List[Venue])
def search_for_venues(
    *,
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    name: Optional[str] = None,
    address: Optional[str] = None,
    amenity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    viewer_id: Optional[str] = Depends(deps.get_optional_user_id),
) -> Any:
    """
    Search for venues by name, address, or amenity (uses PostgreSQL JSONB filter).
    """
    venues = crud_venue.search_venues(
        db,
        q=q,
        name=name,
        address=address,
        amenity=amenity,
        skip=skip,
        limit=limit
    )
    return [_for_viewer(v, viewer_id) for v in venues]

@router.get("/{venue_id}", response_model=Venue)
def read_venue(
    venue_id: str,
    db: Session = Depends(get_db),
    viewer_id: Optional[str] = Depends(deps.get_optional_user_id),
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
    return _for_viewer(venue, viewer_id)

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
    return _for_viewer(crud_venue.update_venue(db, db_venue=db_venue, venue_in=venue_in), owner_id)

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
    if venue.owner_id == current_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes reclamar el cupón de tu propio establecimiento")
    # Un solo cupón vigente por cliente y establecimiento: si ya lo reclamó, se devuelve ese mismo
    existing = db.query(ClaimedCoupon).filter(
        ClaimedCoupon.venue_id == venue_id,
        ClaimedCoupon.client_id == current_user_id,
        _same_campaign(venue.discount_coupon),
        ClaimedCoupon.status == "active",
    ).first()
    if existing:
        # Un reclamo viejo con el código compartido pasa a tener su código personal (si no, no se podría canjear)
        if _is_shared_code(existing.coupon_code, venue.discount_coupon):
            existing.coupon_code = _personal_code(venue.discount_coupon)
            db.commit()
            db.refresh(existing)
        return existing
    # Un cupón se canjea una sola vez por cliente: si ya usó este mismo código, no puede reclamarlo de nuevo
    if db.query(ClaimedCoupon).filter(
        ClaimedCoupon.venue_id == venue_id,
        ClaimedCoupon.client_id == current_user_id,
        _same_campaign(venue.discount_coupon),
        ClaimedCoupon.status == "redeemed",
    ).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya usaste este cupón.")
    return crud_venue.claim_coupon(db=db, venue_id=venue_id, client_id=current_user_id, coupon_code=_personal_code(venue.discount_coupon))


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
    if venue.owner_id == current_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes reseñar tu propio establecimiento")
    # Una reseña por usuario y establecimiento: si ya opinó, se actualiza
    existing = db.query(VenueReview).filter(
        VenueReview.venue_id == venue_id, VenueReview.client_id == current_user_id
    ).first()
    if existing:
        existing.rating = review_in.rating
        existing.review_text = review_in.review_text
        db.commit()
        db.refresh(existing)
        return existing
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


@router.post("/coupons/redeem", response_model=ClaimedCouponOut)
def redeem_venue_coupon(
    coupon_code: str,
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_establecimiento)
) -> Any:
    """
    Redeem/validate a claimed coupon code. Requires 'establecimiento' role (the venue owner).
    """
    # Solo cupones activos con ese código que pertenezcan a un establecimiento de quien canjea
    candidates = db.query(ClaimedCoupon).filter(
        func.upper(ClaimedCoupon.coupon_code) == coupon_code.strip().upper(),
        ClaimedCoupon.status == "active"
    ).all()
    if not candidates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cupón no encontrado o ya canjeado."
        )
    mine = [c for c in candidates if (v := crud_venue.get_venue_by_id(db, venue_id=c.venue_id)) and v.owner_id == current_user_id]
    if len(mine) > 1:
        # Código compartido de antes de los códigos personales: no se sabe de qué cliente es
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ese código lo tienen varios clientes. Pide al cliente el código personal que le dio la app.",
        )
    coupon = mine[0] if mine else None
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para canjear cupones de este establecimiento."
        )

    coupon.status = "redeemed"
    db.commit()
    db.refresh(coupon)
    return coupon


@router.get("/{venue_id}/score", response_model=dict)
def read_venue_score(
    venue_id: str,
    *,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve average rating score and total reviews count for a venue. Public endpoint.
    """
    venue = crud_venue.get_venue_by_id(db, venue_id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
        
    reviews = db.query(VenueReview).filter(VenueReview.venue_id == venue_id).all()
    if not reviews:
        return {
            "venue_id": venue_id,
            "average_rating": 0.0,
            "reviews_count": 0
        }
        
    avg_rating = sum(r.rating for r in reviews) / len(reviews)
    return {
        "venue_id": venue_id,
        "average_rating": round(avg_rating, 2),
        "reviews_count": len(reviews)
    }
