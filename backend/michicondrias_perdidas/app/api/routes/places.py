from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.api import deps
from app.db.session import get_db
from app.crud.crud_petfriendly import create_place, get_places, get_place_by_id
from app.schemas.petfriendly import PlaceCreate, PlaceOut

router = APIRouter()


class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str


@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_photo_presigned_url(ext: str = "jpg") -> Any:
    """Generate a presigned URL to upload a pet-friendly place photo."""
    from app.core.s3 import generate_presigned_url
    from app.core.config import settings
    import mimetypes

    clean_ext = ext.replace(".", "")
    object_name = f"petfriendly/{uuid.uuid4()}.{clean_ext}"

    content_type, _ = mimetypes.guess_type(f"file.{clean_ext}")
    if not content_type:
        content_type = "image/jpeg" if clean_ext in ["jpg", "jpeg"] else "application/octet-stream"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")

    public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
    return PresignedUrlResponse(url=url, object_key=public_url)


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
