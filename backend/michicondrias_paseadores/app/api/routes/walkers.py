from datetime import date, datetime, timedelta
import re
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import bindparam, func, text
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.walker import Walker, WalkRequest, WalkReview
from app.api import deps
from app.core.config import settings

router = APIRouter()

def _pet_owner_id(db: Session, pet_id: str):
    row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": pet_id}).first()
    return row[0] if row else None


# Quien puede mover una solicitud de un estado a otro. El cliente solo puede cancelar;
# antes cualquiera de los dos podía poner cualquier estado (incluido "completed") y inflar los contadores.
PROVIDER_TRANSITIONS = {
    "pending": {"accepted", "cancelled"},
    "accepted": {"in_progress", "completed", "cancelled"},
    "in_progress": {"completed", "cancelled"},
}
CLIENT_TRANSITIONS = {"pending": {"cancelled"}, "accepted": {"cancelled"}}



def _names(db: Session, table: str, column: str, ids: set) -> dict:
    """Mapa id -> nombre leyendo tablas hermanas (misma BD). Si falla, devuelve vacío sin romper la respuesta."""
    if not ids:
        return {}
    try:
        stmt = text(f"SELECT id, {column} FROM {table} WHERE id IN :ids").bindparams(bindparam("ids", expanding=True))
        return {str(r[0]): r[1] for r in db.execute(stmt, {"ids": list(ids)}).fetchall()}
    except Exception:
        db.rollback()
        return {}


def _with_names(db: Session, reqs: list) -> list:
    pets = _names(db, "pets", "name", {r.pet_id for r in reqs})
    users = _names(db, "users", "full_name", {r.client_user_id for r in reqs})
    walkers = {w.id: w.display_name for w in db.query(Walker).filter(Walker.id.in_({r.walker_id for r in reqs})).all()} if reqs else {}
    reviewed = {x[0] for x in db.query(WalkReview.walk_request_id).filter(WalkReview.walk_request_id.in_([r.id for r in reqs])).all()} if reqs else set()
    out = []
    for r in reqs:
        item = WalkRequestResponse.model_validate(r)
        item.pet_name = pets.get(r.pet_id)
        item.client_name = users.get(r.client_user_id)
        item.walker_name = walkers.get(r.walker_id)
        item.has_review = r.id in reviewed
        out.append(item)
    return out


# ===================== SCHEMAS =====================

class WalkerCreate(BaseModel):
    display_name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    price_per_walk: Optional[float] = Field(None, ge=0)
    price_per_hour: Optional[float] = Field(None, ge=0)
    experience_years: Optional[int] = 0
    accepts_dogs: bool = True
    accepts_cats: bool = False
    max_pets_per_walk: int = 3
    service_radius_km: Optional[float] = 5.0
    schedule_preference: Optional[str] = None


class WalkerUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    price_per_walk: Optional[float] = Field(None, ge=0)
    price_per_hour: Optional[float] = Field(None, ge=0)
    experience_years: Optional[int] = None
    accepts_dogs: Optional[bool] = None
    accepts_cats: Optional[bool] = None
    max_pets_per_walk: Optional[int] = None
    service_radius_km: Optional[float] = None
    schedule_preference: Optional[str] = None
    gallery: Optional[str] = None


class WalkerResponse(BaseModel):
    id: str
    user_id: str
    display_name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    price_per_walk: Optional[float] = None
    price_per_hour: Optional[float] = None
    rating: Optional[float] = 0.0
    total_walks: int = 0
    is_verified: bool = False
    is_active: bool = True
    experience_years: Optional[int] = 0
    accepts_dogs: bool = True
    accepts_cats: bool = False
    max_pets_per_walk: int = 3
    service_radius_km: Optional[float] = 5.0
    schedule_preference: Optional[str] = None
    gallery: Optional[str] = None

    class Config:
        from_attributes = True


class WalkRequestCreate(BaseModel):
    pet_id: str
    requested_date: str
    requested_time: Optional[str] = None
    duration_minutes: int = Field(default=60, ge=15, le=720)
    pickup_address: Optional[str] = None
    notes: Optional[str] = None


class WalkRequestResponse(BaseModel):
    id: str
    walker_id: str
    client_user_id: str
    pet_id: str
    status: str
    requested_date: str
    requested_time: Optional[str] = None
    duration_minutes: int
    pickup_address: Optional[str] = None
    notes: Optional[str] = None
    total_price: Optional[float] = None
    # Datos de apoyo para mostrar la solicitud sin exponer IDs (opcionales: no rompen clientes anteriores)
    pet_name: Optional[str] = None
    client_name: Optional[str] = None
    walker_name: Optional[str] = None
    has_review: bool = False

    class Config:
        from_attributes = True


class WalkReviewCreate(BaseModel):
    rating: int  # 1-5
    comment: Optional[str] = None


class WalkReviewResponse(BaseModel):
    id: str
    walk_request_id: str
    reviewer_user_id: str
    walker_id: str
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str
    public_url: str | None = None


# ===================== PRESIGNED URL =====================

@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_photo_presigned_url(ext: str = "jpg", user_id: str = Depends(deps.get_current_user_id)) -> Any:
    """Generate a presigned URL to upload a walker photo."""
    from app.core.s3 import generate_presigned_url, image_content_type
    import mimetypes
    import uuid

    try:
        clean_ext, content_type = image_content_type(ext)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Usa jpg, png, webp, gif o heic.")
    object_name = f"paseadores/{user_id}/{uuid.uuid4()}.{clean_ext}"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")

    public_url = f"{settings.STORAGE_BASE_URL}/{object_name}"
    return PresignedUrlResponse(url=url, object_key=object_name, public_url=public_url)


# ===================== WALKERS CRUD =====================

@router.get("/", response_model=List[WalkerResponse])
def list_walkers(
    location: Optional[str] = None,
    accepts_dogs: Optional[bool] = None,
    accepts_cats: Optional[bool] = None,
    db: Session = Depends(get_db),
) -> Any:
    """List all active walkers with optional filters."""
    query = db.query(Walker).filter(Walker.is_active == True)
    if location:
        query = query.filter(Walker.location.ilike(f"%{location}%"))
    if accepts_dogs is not None:
        query = query.filter(Walker.accepts_dogs == accepts_dogs)
    if accepts_cats is not None:
        query = query.filter(Walker.accepts_cats == accepts_cats)
    return query.order_by(Walker.rating.desc().nullslast()).all()


@router.get("/{walker_id}", response_model=WalkerResponse)
def get_walker(walker_id: str, db: Session = Depends(get_db)) -> Any:
    """Get a walker profile by ID."""
    walker = db.query(Walker).filter(Walker.id == walker_id).first()
    if not walker:
        raise HTTPException(status_code=404, detail="Paseador no encontrado")
    return walker


@router.post("/", response_model=WalkerResponse)
def register_as_walker(
    walker_in: WalkerCreate,
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
    db: Session = Depends(get_db),
) -> Any:
    """Register the current user as a walker."""
    if role not in ("paseador", "walker", "admin"):
        raise HTTPException(status_code=403, detail="Necesitas el rol de paseador (verifica tu identidad en 'Ser Profesional')")
    existing = db.query(Walker).filter(Walker.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya estás registrado como paseador")

    db_obj = Walker(user_id=user_id, **walker_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.put("/{walker_id}", response_model=WalkerResponse)
def update_walker(
    walker_id: str,
    walker_in: WalkerUpdate,
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Update a walker profile (only the owner can update)."""
    walker = db.query(Walker).filter(Walker.id == walker_id).first()
    if not walker:
        raise HTTPException(status_code=404, detail="Paseador no encontrado")
    if walker.user_id != user_id:
        raise HTTPException(status_code=403, detail="No puedes editar el perfil de otro paseador")

    update_data = walker_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(walker, key, value)
    db.commit()
    db.refresh(walker)
    return walker


@router.get("/me/profile", response_model=WalkerResponse)
def get_my_walker_profile(
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Get the walker profile of the current user."""
    walker = db.query(Walker).filter(Walker.user_id == user_id).first()
    if not walker:
        raise HTTPException(status_code=404, detail="No tienes un perfil de paseador registrado")
    return walker


# ===================== WALK REQUESTS =====================

@router.post("/{walker_id}/request", response_model=WalkRequestResponse)
def request_walk(
    walker_id: str,
    req_in: WalkRequestCreate,
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Request a walk from a specific walker."""
    walker = db.query(Walker).filter(Walker.id == walker_id, Walker.is_active == True).first()
    if not walker:
        raise HTTPException(status_code=404, detail="Paseador no encontrado o inactivo")
    if _pet_owner_id(db, req_in.pet_id) != user_id:
        raise HTTPException(status_code=403, detail="Solo puedes solicitar el servicio para tu propia mascota")
    if walker.user_id == user_id:
        raise HTTPException(status_code=400, detail="No puedes solicitar un paseo a ti mismo")

    try:
        wanted = date.fromisoformat(req_in.requested_date[:10])
    except ValueError:
        raise HTTPException(status_code=400, detail="La fecha del paseo no es válida (usa AAAA-MM-DD)")
    if wanted < date.today() - timedelta(days=1):
        raise HTTPException(status_code=400, detail="La fecha del paseo no puede ser en el pasado")
    if req_in.requested_time and not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", req_in.requested_time):
        raise HTTPException(status_code=400, detail="La hora del paseo no es válida (usa HH:MM)")
    duplicate = db.query(WalkRequest).filter(
        WalkRequest.walker_id == walker_id,
        WalkRequest.client_user_id == user_id,
        WalkRequest.pet_id == req_in.pet_id,
        WalkRequest.requested_date == req_in.requested_date,
        WalkRequest.status.in_(["pending", "accepted", "in_progress"]),
    ).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud activa para esta mascota y fecha con este paseador")

    # Calculate price estimate
    total = None
    if walker.price_per_hour:
        total = round(walker.price_per_hour * (req_in.duration_minutes / 60), 2)
    elif walker.price_per_walk:
        total = walker.price_per_walk

    db_obj = WalkRequest(
        walker_id=walker_id,
        client_user_id=user_id,
        total_price=total,
        **req_in.model_dump()
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return _with_names(db, [db_obj])[0]


@router.get("/requests/me", response_model=List[WalkRequestResponse])
def get_my_walk_requests(
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Get walk requests made by the current user (as a client)."""
    reqs = db.query(WalkRequest).filter(WalkRequest.client_user_id == user_id).order_by(WalkRequest.created_at.desc()).all()
    return _with_names(db, reqs)


@router.get("/requests/incoming", response_model=List[WalkRequestResponse])
def get_incoming_walk_requests(
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Get walk requests received by the current user (as a walker)."""
    walker = db.query(Walker).filter(Walker.user_id == user_id).first()
    if not walker:
        raise HTTPException(status_code=404, detail="No tienes un perfil de paseador")
    reqs = db.query(WalkRequest).filter(WalkRequest.walker_id == walker.id).order_by(WalkRequest.created_at.desc()).all()
    return _with_names(db, reqs)


@router.patch("/requests/{request_id}/status", response_model=WalkRequestResponse)
def update_walk_request_status(
    request_id: str,
    status: str,
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Update the status of a walk request."""
    walk_req = db.query(WalkRequest).filter(WalkRequest.id == request_id).first()
    if not walk_req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    # Only the walker or the client can update
    walker = db.query(Walker).filter(Walker.id == walk_req.walker_id).first()
    if walk_req.client_user_id != user_id and (not walker or walker.user_id != user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta solicitud")

    valid_statuses = ["pending", "accepted", "in_progress", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status inválido. Opciones: {valid_statuses}")

    is_provider = bool(walker) and walker.user_id == user_id
    transitions = PROVIDER_TRANSITIONS if is_provider else CLIENT_TRANSITIONS
    if status not in transitions.get(walk_req.status, set()):
        raise HTTPException(status_code=400, detail="Ese cambio de estado no está permitido")

    walk_req.status = status

    # If completing, increment total_walks
    if status == "completed" and walker:
        walker.total_walks = (walker.total_walks or 0) + 1

    db.commit()
    db.refresh(walk_req)
    return _with_names(db, [walk_req])[0]


# ===================== REVIEWS =====================

@router.post("/requests/{request_id}/review", response_model=WalkReviewResponse)
def create_walk_review(
    request_id: str,
    review_in: WalkReviewCreate,
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Leave a review after a completed walk."""
    walk_req = db.query(WalkRequest).filter(WalkRequest.id == request_id).first()
    if not walk_req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if walk_req.client_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el cliente puede dejar reseña")
    if walk_req.status != "completed":
        raise HTTPException(status_code=400, detail="El paseo debe estar completado para dejar reseña")

    existing = db.query(WalkReview).filter(WalkReview.walk_request_id == request_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya dejaste una reseña para este paseo")

    if not (1 <= review_in.rating <= 5):
        raise HTTPException(status_code=400, detail="El rating debe ser entre 1 y 5")

    db_review = WalkReview(
        walk_request_id=request_id,
        reviewer_user_id=user_id,
        walker_id=walk_req.walker_id,
        **review_in.model_dump()
    )
    db.add(db_review)

    # Recalculate walker rating
    walker = db.query(Walker).filter(Walker.id == walk_req.walker_id).first()
    if walker:
        avg = db.query(func.avg(WalkReview.rating)).filter(WalkReview.walker_id == walker.id).scalar()
        walker.rating = round(float(avg or 0), 2)

    db.commit()
    db.refresh(db_review)
    return db_review


@router.get("/{walker_id}/reviews", response_model=List[WalkReviewResponse])
def get_walker_reviews(walker_id: str, db: Session = Depends(get_db)) -> Any:
    """Get all reviews for a specific walker."""
    return db.query(WalkReview).filter(WalkReview.walker_id == walker_id).order_by(WalkReview.created_at.desc()).all()
