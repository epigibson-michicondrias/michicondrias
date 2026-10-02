from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.api import deps
from app.db.session import get_db
from app.crud.crud_petfriendly import create_place, get_places, get_place_by_id
from app.schemas.petfriendly import PlaceCreate, PlaceOut, PetfriendlyReviewCreate, PetfriendlyReviewOut

router = APIRouter()


class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str
    public_url: str | None = None


@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_photo_presigned_url(ext: str = "jpg", user_id: str = Depends(deps.get_current_user_id)) -> Any:
    """Generate a presigned URL to upload a pet-friendly place photo."""
    from app.core.s3 import generate_presigned_url, image_content_type
    from app.core.config import settings
    import mimetypes

    try:
        clean_ext, content_type = image_content_type(ext)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Usa jpg, png, webp, gif o heic.")
    object_name = f"petfriendly/{user_id}/{uuid.uuid4()}.{clean_ext}"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")

    public_url = f"{settings.STORAGE_BASE_URL}/{object_name}"
    return PresignedUrlResponse(url=url, object_key=object_name, public_url=public_url)


@router.get("/", response_model=List[PlaceOut])
def list_places(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    city: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return get_places(db, category=category, city=city, skip=skip, limit=limit)


@router.get("/{place_id}", response_model=PlaceOut)
def read_place(place_id: str, db: Session = Depends(get_db)) -> Any:
    place = get_place_by_id(db, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")
    return place


@router.post("/", response_model=PlaceOut)
def add_place(
    *,
    db: Session = Depends(get_db),
    place_in: PlaceCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    return create_place(db, place_in=place_in, user_id=user_id)


@router.post("/{place_id}/reviews", response_model=PetfriendlyReviewOut)
def create_place_review(
    *,
    db: Session = Depends(get_db),
    place_id: str,
    review_in: PetfriendlyReviewCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Leave a review for a pet-friendly place."""
    from app.models.petfriendly import PetfriendlyReview, PetfriendlyPlace
    from sqlalchemy.sql import func
    
    place = db.query(PetfriendlyPlace).filter(PetfriendlyPlace.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")

    if not (1 <= review_in.rating <= 5):
        raise HTTPException(status_code=400, detail="La calificación debe estar entre 1 y 5 estrellas")

    db_review = PetfriendlyReview(
        place_id=place_id,
        user_id=user_id,
        **review_in.model_dump(),
    )
    db.add(db_review)
    db.commit()

    # Recalculate average rating of the place
    avg = db.query(func.avg(PetfriendlyReview.rating)).filter(PetfriendlyReview.place_id == place_id).scalar()
    place.rating = float(avg) if avg else 0.0
    db.commit()

    db.refresh(db_review)
    return db_review


@router.get("/{place_id}/reviews", response_model=List[PetfriendlyReviewOut])
def read_place_reviews(
    place_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """Get all reviews for a specific pet-friendly place."""
    from app.models.petfriendly import PetfriendlyReview
    return db.query(PetfriendlyReview).filter(PetfriendlyReview.place_id == place_id).order_by(PetfriendlyReview.created_at.desc()).all()
