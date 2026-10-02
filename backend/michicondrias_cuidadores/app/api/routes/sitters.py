from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import bindparam, func, text
from pydantic import BaseModel, Field
from datetime import date, datetime, timedelta

from app.db.session import get_db
from app.models.sitter import Sitter, SitRequest, SitReview
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
    sitters = {s.id: s.display_name for s in db.query(Sitter).filter(Sitter.id.in_({r.sitter_id for r in reqs})).all()} if reqs else {}
    reviewed = {x[0] for x in db.query(SitReview.sit_request_id).filter(SitReview.sit_request_id.in_([r.id for r in reqs])).all()} if reqs else set()
    out = []
    for r in reqs:
        item = SitRequestResponse.model_validate(r)
        item.pet_name = pets.get(r.pet_id)
        item.client_name = users.get(r.client_user_id)
        item.sitter_name = sitters.get(r.sitter_id)
        item.has_review = r.id in reviewed
        out.append(item)
    return out


# ===================== SCHEMAS =====================

class SitterCreate(BaseModel):
    display_name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    price_per_day: Optional[float] = Field(None, ge=0)
    price_per_visit: Optional[float] = Field(None, ge=0)
    service_type: str = "both"  # hosting, visiting, both
    max_pets: int = 2
    has_yard: bool = False
    home_type: Optional[str] = None
    accepts_dogs: bool = True
    accepts_cats: bool = True
    experience_years: Optional[int] = 0


class SitterUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    price_per_day: Optional[float] = Field(None, ge=0)
    price_per_visit: Optional[float] = Field(None, ge=0)
    service_type: Optional[str] = None
    max_pets: Optional[int] = None
    has_yard: Optional[bool] = None
    home_type: Optional[str] = None
    accepts_dogs: Optional[bool] = None
    accepts_cats: Optional[bool] = None
    experience_years: Optional[int] = None
    gallery: Optional[str] = None


class SitterResponse(BaseModel):
    id: str
    user_id: str
    display_name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    price_per_day: Optional[float] = None
    price_per_visit: Optional[float] = None
    rating: Optional[float] = 0.0
    total_sits: int = 0
    is_verified: bool = False
    is_active: bool = True
    service_type: str = "both"
    max_pets: int = 2
    has_yard: bool = False
    home_type: Optional[str] = None
    accepts_dogs: bool = True
    accepts_cats: bool = True
    experience_years: Optional[int] = 0
    gallery: Optional[str] = None

    class Config:
        from_attributes = True


class SitRequestCreate(BaseModel):
    pet_id: str
    service_type: str = "hosting"  # hosting or visiting
    start_date: str   # ISO date
    end_date: str     # ISO date
    address: Optional[str] = None
    notes: Optional[str] = None


class SitRequestResponse(BaseModel):
    id: str
    sitter_id: str
    client_user_id: str
    pet_id: str
    status: str
    service_type: str
    start_date: str
    end_date: str
    address: Optional[str] = None
    notes: Optional[str] = None
    total_price: Optional[float] = None
    # Datos de apoyo para mostrar la solicitud sin exponer IDs (opcionales: no rompen clientes anteriores)
    pet_name: Optional[str] = None
    client_name: Optional[str] = None
    sitter_name: Optional[str] = None
    has_review: bool = False

    class Config:
        from_attributes = True


class SitReviewCreate(BaseModel):
    rating: int  # 1-5
    comment: Optional[str] = None


class SitReviewResponse(BaseModel):
    id: str
    sit_request_id: str
    reviewer_user_id: str
    sitter_id: str
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
    """Generate a presigned URL to upload a sitter photo."""
    from app.core.s3 import generate_presigned_url, image_content_type
    import mimetypes
    import uuid

    try:
        clean_ext, content_type = image_content_type(ext)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Usa jpg, png, webp, gif o heic.")
    object_name = f"cuidadores/{user_id}/{uuid.uuid4()}.{clean_ext}"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")

    public_url = f"{settings.STORAGE_BASE_URL}/{object_name}"
    return PresignedUrlResponse(url=url, object_key=object_name, public_url=public_url)


# ===================== SITTERS CRUD =====================

@router.get("/", response_model=List[SitterResponse])
def list_sitters(
    location: Optional[str] = None,
    service_type: Optional[str] = None,
    has_yard: Optional[bool] = None,
    accepts_dogs: Optional[bool] = None,
    accepts_cats: Optional[bool] = None,
    db: Session = Depends(get_db),
) -> Any:
    """List all active sitters with optional filters."""
    query = db.query(Sitter).filter(Sitter.is_active == True)
    if location:
        query = query.filter(Sitter.location.ilike(f"%{location}%"))
    if service_type:
        query = query.filter((Sitter.service_type == service_type) | (Sitter.service_type == "both"))
    if has_yard is not None:
        query = query.filter(Sitter.has_yard == has_yard)
    if accepts_dogs is not None:
        query = query.filter(Sitter.accepts_dogs == accepts_dogs)
    if accepts_cats is not None:
        query = query.filter(Sitter.accepts_cats == accepts_cats)
    return query.order_by(Sitter.rating.desc().nullslast()).all()


@router.get("/{sitter_id}", response_model=SitterResponse)
def get_sitter(sitter_id: str, db: Session = Depends(get_db)) -> Any:
    """Get a sitter profile by ID."""
    sitter = db.query(Sitter).filter(Sitter.id == sitter_id).first()
    if not sitter:
        raise HTTPException(status_code=404, detail="Cuidador no encontrado")
    return sitter


@router.post("/", response_model=SitterResponse)
def register_as_sitter(
    sitter_in: SitterCreate,
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
    db: Session = Depends(get_db),
) -> Any:
    """Register the current user as a sitter."""
    if role not in ("cuidador", "sitter", "admin"):
        raise HTTPException(status_code=403, detail="Necesitas el rol de cuidador (verifica tu identidad en 'Ser Profesional')")
    existing = db.query(Sitter).filter(Sitter.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya estás registrado como cuidador")

    db_obj = Sitter(user_id=user_id, **sitter_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.put("/{sitter_id}", response_model=SitterResponse)
def update_sitter(
    sitter_id: str,
    sitter_in: SitterUpdate,
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Update a sitter profile (only the owner can update)."""
    sitter = db.query(Sitter).filter(Sitter.id == sitter_id).first()
    if not sitter:
        raise HTTPException(status_code=404, detail="Cuidador no encontrado")
    if sitter.user_id != user_id:
        raise HTTPException(status_code=403, detail="No puedes editar el perfil de otro cuidador")

    update_data = sitter_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sitter, key, value)
    db.commit()
    db.refresh(sitter)
    return sitter


@router.get("/me/profile", response_model=SitterResponse)
def get_my_sitter_profile(
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Get the sitter profile of the current user."""
    sitter = db.query(Sitter).filter(Sitter.user_id == user_id).first()
    if not sitter:
        raise HTTPException(status_code=404, detail="No tienes un perfil de cuidador registrado")
    return sitter


# ===================== SIT REQUESTS =====================

@router.post("/{sitter_id}/request", response_model=SitRequestResponse)
def request_sit(
    sitter_id: str,
    req_in: SitRequestCreate,
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Request pet sitting from a specific sitter."""
    sitter = db.query(Sitter).filter(Sitter.id == sitter_id, Sitter.is_active == True).first()
    if not sitter:
        raise HTTPException(status_code=404, detail="Cuidador no encontrado o inactivo")
    if _pet_owner_id(db, req_in.pet_id) != user_id:
        raise HTTPException(status_code=403, detail="Solo puedes solicitar el servicio para tu propia mascota")
    if sitter.user_id == user_id:
        raise HTTPException(status_code=400, detail="No puedes solicitar cuidado a ti mismo")

    # Fechas: válidas, fin >= inicio y no en el pasado
    try:
        start_d = date.fromisoformat(req_in.start_date[:10])
        end_d = date.fromisoformat(req_in.end_date[:10])
    except ValueError:
        raise HTTPException(status_code=400, detail="Las fechas no son válidas (usa AAAA-MM-DD)")
    if end_d < start_d:
        raise HTTPException(status_code=400, detail="La fecha de fin no puede ser anterior a la de inicio")
    if start_d < date.today() - timedelta(days=1):
        raise HTTPException(status_code=400, detail="La fecha de inicio no puede ser en el pasado")

    # Tipo de servicio: las versiones anteriores de la app enviaban el tipo del cuidador ("both"); se resuelve aquí
    requested = req_in.service_type
    if requested not in ("hosting", "visiting"):
        if sitter.service_type in ("hosting", "visiting"):
            requested = sitter.service_type
        else:
            requested = "hosting" if sitter.price_per_day or not sitter.price_per_visit else "visiting"
    if sitter.service_type in ("hosting", "visiting") and sitter.service_type != requested:
        label = "hospedaje" if sitter.service_type == "hosting" else "visitas a domicilio"
        raise HTTPException(status_code=400, detail=f"Este cuidador solo ofrece {label}")
    req_in.service_type = requested

    duplicate = db.query(SitRequest).filter(
        SitRequest.sitter_id == sitter_id,
        SitRequest.client_user_id == user_id,
        SitRequest.pet_id == req_in.pet_id,
        SitRequest.start_date == req_in.start_date,
        SitRequest.status.in_(["pending", "accepted", "in_progress"]),
    ).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud activa para esta mascota y fecha con este cuidador")

    # Estimado de precio: hospedaje = noches; visitas = una por día (inclusive)
    total = None
    nights = max((end_d - start_d).days, 1)
    if requested == "hosting" and sitter.price_per_day:
        total = round(sitter.price_per_day * nights, 2)
    elif requested == "visiting" and sitter.price_per_visit:
        total = round(sitter.price_per_visit * ((end_d - start_d).days + 1), 2)

    db_obj = SitRequest(
        sitter_id=sitter_id,
        client_user_id=user_id,
        total_price=total,
        **req_in.model_dump()
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return _with_names(db, [db_obj])[0]


@router.get("/requests/me", response_model=List[SitRequestResponse])
def get_my_sit_requests(
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Get sit requests made by the current user (as a client)."""
    reqs = db.query(SitRequest).filter(SitRequest.client_user_id == user_id).order_by(SitRequest.created_at.desc()).all()
    return _with_names(db, reqs)


@router.get("/requests/incoming", response_model=List[SitRequestResponse])
def get_incoming_sit_requests(
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Get sit requests received by the current user (as a sitter)."""
    sitter = db.query(Sitter).filter(Sitter.user_id == user_id).first()
    if not sitter:
        raise HTTPException(status_code=404, detail="No tienes un perfil de cuidador")
    reqs = db.query(SitRequest).filter(SitRequest.sitter_id == sitter.id).order_by(SitRequest.created_at.desc()).all()
    return _with_names(db, reqs)


@router.patch("/requests/{request_id}/status", response_model=SitRequestResponse)
def update_sit_request_status(
    request_id: str,
    status: str,
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Update the status of a sit request."""
    sit_req = db.query(SitRequest).filter(SitRequest.id == request_id).first()
    if not sit_req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    sitter = db.query(Sitter).filter(Sitter.id == sit_req.sitter_id).first()
    if sit_req.client_user_id != user_id and (not sitter or sitter.user_id != user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta solicitud")

    valid_statuses = ["pending", "accepted", "in_progress", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status inválido. Opciones: {valid_statuses}")

    is_provider = bool(sitter) and sitter.user_id == user_id
    transitions = PROVIDER_TRANSITIONS if is_provider else CLIENT_TRANSITIONS
    if status not in transitions.get(sit_req.status, set()):
        raise HTTPException(status_code=400, detail="Ese cambio de estado no está permitido")

    sit_req.status = status

    if status == "completed" and sitter:
        sitter.total_sits = (sitter.total_sits or 0) + 1

    db.commit()
    db.refresh(sit_req)
    return _with_names(db, [sit_req])[0]


# ===================== REVIEWS =====================

@router.post("/requests/{request_id}/review", response_model=SitReviewResponse)
def create_sit_review(
    request_id: str,
    review_in: SitReviewCreate,
    user_id: str = Depends(deps.get_current_user_id),
    db: Session = Depends(get_db),
) -> Any:
    """Leave a review after completed pet sitting."""
    sit_req = db.query(SitRequest).filter(SitRequest.id == request_id).first()
    if not sit_req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if sit_req.client_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el cliente puede dejar reseña")
    if sit_req.status != "completed":
        raise HTTPException(status_code=400, detail="El servicio debe estar completado para dejar reseña")

    existing = db.query(SitReview).filter(SitReview.sit_request_id == request_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya dejaste una reseña para este servicio")

    if not (1 <= review_in.rating <= 5):
        raise HTTPException(status_code=400, detail="El rating debe ser entre 1 y 5")

    db_review = SitReview(
        sit_request_id=request_id,
        reviewer_user_id=user_id,
        sitter_id=sit_req.sitter_id,
        **review_in.model_dump()
    )
    db.add(db_review)

    # Recalculate sitter rating
    sitter = db.query(Sitter).filter(Sitter.id == sit_req.sitter_id).first()
    if sitter:
        avg = db.query(func.avg(SitReview.rating)).filter(SitReview.sitter_id == sitter.id).scalar()
        sitter.rating = round(float(avg or 0), 2)

    db.commit()
    db.refresh(db_review)
    return db_review


@router.get("/{sitter_id}/reviews", response_model=List[SitReviewResponse])
def get_sitter_reviews(sitter_id: str, db: Session = Depends(get_db)) -> Any:
    """Get all reviews for a specific sitter."""
    return db.query(SitReview).filter(SitReview.sitter_id == sitter_id).order_by(SitReview.created_at.desc()).all()
