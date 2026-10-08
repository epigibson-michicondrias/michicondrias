from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
import time
from jose import jwt, JWTError

from app.db.session import get_db
from app.models.mascotas import Pet
from app.api import deps
from app.core.config import settings
from app.core.ai_triage import assess_symptoms, _norm
from app.core.passport_page import render_passport_page, render_passport_error, mask_policy_number
from app.api.internal import require_internal_token, require_admin, identity_or_internal

router = APIRouter()

# Mismos roles clínicos que en carnet/app/api/pet_access.py (alineados): el dueño, el equipo clínico o un admin
VET_ROLES = {"veterinario", "clinica", "hospital", "admin"}


class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str
    public_url: str | None = None


@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_photo_presigned_url(
    ext: str = "jpg",
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Generate a presigned URL to upload a pet photo to S3."""
    from app.core.s3 import generate_presigned_url, image_content_type
    from app.core.config import settings
    import mimetypes
    import uuid

    try:
        clean_ext, content_type = image_content_type(ext)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Usa jpg, png, webp, gif o heic.")
    object_name = f"mascotas/{user_id}/{uuid.uuid4()}.{clean_ext}"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")

    public_url = f"{settings.STORAGE_BASE_URL}/{object_name}"
    return PresignedUrlResponse(url=url, object_key=object_name, public_url=public_url)

class PetCreate(BaseModel):
    owner_id: str
    name: str
    species: str
    breed: Optional[str] = None
    age_months: Optional[int] = None
    size: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    adopted_from_listing_id: Optional[str] = None
    
    # Enrichment Fields
    is_vaccinated: Optional[bool] = False
    is_sterilized: Optional[bool] = False
    is_dewormed: Optional[bool] = False
    temperament: Optional[str] = None
    energy_level: Optional[str] = None
    social_cats: Optional[bool] = True
    social_dogs: Optional[bool] = True
    social_children: Optional[bool] = True
    weight_kg: Optional[float] = None
    microchip_number: Optional[str] = None
    gender: Optional[str] = None
    gallery: Optional[List[str]] = None
    
    # Michi-Tracker Pro
    has_active_subscription: Optional[bool] = False
    stripe_subscription_id: Optional[str] = None

class PetResponse(PetCreate):
    id: str
    is_active: bool
    
    class Config:
        from_attributes = True

class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    age_months: Optional[int] = None
    size: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    is_vaccinated: Optional[bool] = None
    is_sterilized: Optional[bool] = None
    is_dewormed: Optional[bool] = None
    temperament: Optional[str] = None
    energy_level: Optional[str] = None
    social_cats: Optional[bool] = None
    social_dogs: Optional[bool] = None
    social_children: Optional[bool] = None
    weight_kg: Optional[float] = None
    microchip_number: Optional[str] = None
    gender: Optional[str] = None
    gallery: Optional[List[str]] = None

class PetSubscriptionUpdate(BaseModel):
    has_active_subscription: bool
    stripe_subscription_id: Optional[str] = None


@router.post("/", response_model=PetResponse)
def create_pet(
    *,
    db: Session = Depends(get_db),
    pet_in: PetCreate,
    identity: dict = Depends(identity_or_internal),
) -> Any:
    """
    Create a new permanent pet record.
    Called by the adoption service when an adoption is finalized (token interno),
    or by the user registering their own pet (solo con owner_id propio).
    """
    if not identity["internal"] and pet_in.owner_id != identity["user_id"]:
        raise HTTPException(status_code=403, detail="Solo puedes registrar mascotas a tu nombre")
    print(f"[MASCOTAS] Creating pet for owner {pet_in.owner_id}: {pet_in.name}")
    try:
        pet_data = pet_in.model_dump()
        # La suscripcion Pro solo la activa ecommerce (PATCH interno), nunca el cliente
        pet_data["has_active_subscription"] = False
        pet_data["stripe_subscription_id"] = None
        db_obj = Pet(**pet_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        print(f"[MASCOTAS] Pet created successfully ID: {db_obj.id}")
        return db_obj
    except Exception as e:
        print(f"[MASCOTAS ERROR] Failed to create pet: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en base de datos: {str(e)}")

@router.get("/user/{user_id}", response_model=List[PetResponse])
def get_user_pets(user_id: str, db: Session = Depends(get_db), identity: dict = Depends(identity_or_internal)) -> Any:
    """Mascotas de un usuario. Solo ese usuario, un admin o un servicio interno."""
    if not identity["internal"] and identity["user_id"] != user_id and identity["role"] != "admin":
        raise HTTPException(status_code=403, detail="No puedes ver las mascotas de otro usuario")
    print(f"[MASCOTAS] Fetching pets for user_id: {user_id}")
    pets = db.query(Pet).filter(Pet.owner_id == user_id, Pet.is_active == True).all()
    print(f"[MASCOTAS] Found {len(pets)} pets for user {user_id}")
    return pets


@router.get("/admin/all", response_model=List[PetResponse])
def get_all_pets_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _admin_id: str = Depends(require_admin),
) -> Any:
    """Admin endpoint: Get all pets across all users."""
    pets = db.query(Pet).filter(Pet.is_active == True).offset(skip).limit(limit).all()
    return pets


@router.get("/{pet_id}", response_model=PetResponse)
def get_pet_by_id(pet_id: str, db: Session = Depends(get_db), identity: dict = Depends(identity_or_internal)) -> Any:
    """Get a specific permanent pet by its ID. Solo el dueño, el equipo clínico o un admin (o un servicio interno)."""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active.isnot(False)).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    # Privacidad (F22): la ficha trae microchip y datos sensibles; no es pública para cualquier sesión
    if not identity.get("internal"):
        role = (identity.get("role") or "").lower()
        if pet.owner_id != identity.get("user_id") and role not in VET_ROLES:
            raise HTTPException(status_code=403, detail="Solo el dueño o el equipo clínico pueden ver esta mascota")
    return pet

@router.put("/{pet_id}", response_model=PetResponse)
def update_pet(
    pet_id: str,
    pet_in: PetUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Update a pet's information. Only its owner can."""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active.isnot(False)).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if pet.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede editar esta mascota")
    update_data = pet_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pet, key, value)
    db.commit()
    db.refresh(pet)
    return pet


@router.delete("/{pet_id}")
def delete_pet(
    pet_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Elimina (borrado lógico) una mascota. Solo su dueño.
    Se conserva la fila con is_active=False para no romper carnet, citas, adopciones ni reportes que la referencian;
    deja de aparecer en listados, detalle y edición. Si tiene Michi-Tracker Pro activo hay que cancelarlo antes."""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active.isnot(False)).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if pet.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede eliminar esta mascota")
    if pet.has_active_subscription:
        raise HTTPException(
            status_code=409,
            detail="Esta mascota tiene Michi-Tracker Pro activo. Cancela la suscripción desde Facturación antes de eliminarla.",
        )
    _soft_delete_pet(pet)
    db.commit()
    return {"deleted": True}  # JSON (no 204): el cliente móvil siempre parsea el cuerpo


def _soft_delete_pet(pet: Pet) -> None:
    pet.is_active = False
    # Datos identificables que no hace falta conservar
    pet.photo_url = None
    pet.gallery = None
    pet.microchip_number = None


@router.get("/adopted-from/{listing_id}", response_model=PetResponse)
def get_pet_by_listing(listing_id: str, db: Session = Depends(get_db), identity: dict = Depends(identity_or_internal)) -> Any:
    """Get the pet created from a specific adoption listing. Useful for verification."""
    pet = db.query(Pet).filter(Pet.adopted_from_listing_id == listing_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="No se encontró mascota vinculada a este listing")
    return pet

@router.patch("/{pet_id}/subscription", response_model=PetResponse)
def update_pet_subscription(
    pet_id: str,
    sub_in: PetSubscriptionUpdate,
    db: Session = Depends(get_db),
    _internal: None = Depends(require_internal_token),
) -> Any:
    """Internal use: Toggles Michi-Tracker Pro subscription status from the Ecommerce webhook."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    pet.has_active_subscription = sub_in.has_active_subscription
    pet.stripe_subscription_id = sub_in.stripe_subscription_id
    db.commit()
    db.refresh(pet)
    return pet

@router.patch("/by-subscription/{sub_id}", response_model=PetResponse)
def revoke_pet_subscription(
    sub_id: str,
    sub_in: PetSubscriptionUpdate,
    db: Session = Depends(get_db),
    _internal: None = Depends(require_internal_token),
) -> Any:
    """Internal use: Revokes Michi-Tracker Pro tracking using only the stripe_subscription_id."""
    pet = db.query(Pet).filter(Pet.stripe_subscription_id == sub_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota con esta suscripcion no fue encontrada")
    pet.has_active_subscription = sub_in.has_active_subscription
    pet.stripe_subscription_id = sub_in.stripe_subscription_id
    db.commit()
    db.refresh(pet)
    return pet


# ========================================
# UNIFIED PASSPORT & GEMINI AI FEATURES
# ========================================

class SymptomCheckRequest(BaseModel):
    symptom_description: str = Field(..., min_length=3, max_length=2000)
    duration_hours: int = Field(..., ge=0, le=24 * 365)
    # Aditivo: contexto de la mascota (especie, peso, edad) para orientar mejor la urgencia
    pet_id: Optional[str] = None

class DietPlanRequest(BaseModel):
    activity_level: str  # bajo, medio, alto
    allergies: Optional[str] = None
    target_weight_kg: Optional[float] = None


@router.get("/{pet_id}/passport/share")
def share_pet_passport(
    pet_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Generate a temporary signed token and shareable link for the pet's passport (QR code target)."""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active.isnot(False)).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if pet.owner_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para compartir el pasaporte de esta mascota")
    
    payload = {
        "pet_id": pet_id,
        "exp": time.time() + 86400  # 24 hours
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    
    share_url = f"{settings.API_GATEWAY_URL}/mascotas/api/v1/pets/passport/view/{token}"
    return {"token": token, "share_url": share_url}


def _iso(value: Any) -> Optional[str]:
    """Fecha de una consulta SQL cruda como texto ISO (el driver puede devolver date/datetime o str)."""
    if value is None:
        return None
    return value.isoformat() if hasattr(value, "isoformat") else str(value)


@router.get("/passport/view/{signed_token}")
def view_public_passport(
    signed_token: str,
    request: Request,
    format: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Any:
    """Pasaporte público con un token firmado temporal (lo que abre el QR).
    F26: un navegador (Accept: text/html) recibe una página legible; el resto, JSON (o `?format=json`)."""
    wants_html = format != "json" and "text/html" in request.headers.get("accept", "")
    try:
        payload = jwt.decode(signed_token, settings.SECRET_KEY, algorithms=["HS256"])
        pet_id = payload.get("pet_id")
    except JWTError:
        message = "El enlace para compartir ha expirado o es inválido"
        if wants_html:
            return HTMLResponse(render_passport_error(message), status_code=403)
        raise HTTPException(status_code=403, detail=message)

    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active.isnot(False)).first()
    if not pet:
        if wants_html:
            return HTMLResponse(render_passport_error("Esta mascota ya no está disponible."), status_code=404)
        raise HTTPException(status_code=404, detail="Mascota no encontrada")

    # Vacunas y póliza se leen directo de la base compartida: las rutas de carnet y aseguradoras exigen la sesión del
    # dueño, que quien abre un enlace público no tiene (antes se llamaban por HTTP sin token y siempre volvían vacías).
    vaccines = [
        {
            "name": v.name,
            "date_administered": _iso(v.date_administered),
            "next_due_date": _iso(v.next_due_date),
            "batch_number": v.batch_number,
        }
        for v in db.execute(
            text(
                "SELECT name, date_administered, next_due_date, batch_number FROM vaccines "
                "WHERE pet_id = :pet_id ORDER BY date_administered DESC LIMIT 50"
            ),
            {"pet_id": pet_id},
        ).fetchall()
    ]

    # Solo lo necesario para acreditar cobertura vigente (sin prima ni reclamos)
    policy = db.execute(
        text(
            "SELECT policy_number, status, start_date, end_date FROM pet_insurance_policies "
            "WHERE pet_id = :pet_id AND status = 'active' AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE "
            "ORDER BY end_date DESC LIMIT 1"
        ),
        {"pet_id": pet_id},
    ).first()
    insurance = (
        {
            "policy_number": mask_policy_number(policy.policy_number),  # F26: solo los últimos 4
            "status": policy.status,
            "start_date": _iso(policy.start_date),
            "end_date": _iso(policy.end_date),
        }
        if policy
        else {}
    )

    data = {
        "pet": {
            "name": pet.name,
            "species": pet.species,
            "breed": pet.breed,
            "age_months": pet.age_months,
            "size": pet.size,
            "description": pet.description,
            "photo_url": pet.photo_url,
            "weight_kg": pet.weight_kg,
            "microchip_number": pet.microchip_number,
            "gender": pet.gender
        },
        "vaccines": vaccines,
        "insurance": insurance
    }
    if wants_html:
        return HTMLResponse(render_passport_page(data))
    return data


@router.post("/ai/symptom-check")
def ai_symptom_check(
    req: SymptomCheckRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """Orientación de urgencia (modelo de Claude si hay clave; siempre con reglas de alarma como piso)."""
    pet_context = None
    if req.pet_id:
        # Solo se usa como contexto la mascota del propio dueño: nada de datos ajenos en el análisis
        pet = db.query(Pet).filter(Pet.id == req.pet_id, Pet.is_active.isnot(False)).first()
        if pet and pet.owner_id == user_id:
            bits = [pet.species or "mascota"]
            if pet.breed:
                bits.append(pet.breed)
            if pet.weight_kg:
                bits.append(f"{float(pet.weight_kg):g} kg")
            if pet.age_months:
                bits.append(f"{int(pet.age_months)} meses")
            pet_context = f"{pet.name} ({', '.join(bits)})"
    return assess_symptoms(user_id, req.symptom_description, req.duration_hours, pet_context)


@router.post("/{pet_id}/ai/diet-plan")
def ai_diet_plan(
    pet_id: str,
    req: DietPlanRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """Plan energético con la fórmula RER/MER. Es un cálculo, no una consulta a un modelo."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if pet.owner_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    if not pet.weight_kg or pet.weight_kg <= 0:
        raise HTTPException(status_code=400, detail="Registra el peso de tu mascota para calcular su plan de nutrición")

    current_weight = float(pet.weight_kg)
    target_weight = req.target_weight_kg if req.target_weight_kg and req.target_weight_kg > 0 else current_weight
    species = _norm(pet.species or "")
    is_cat = any(k in species for k in ("gat", "cat", "felin"))
    factors = {"bajo": 1.0, "medio": 1.2, "alto": 1.4} if is_cat else {"bajo": 1.2, "medio": 1.6, "alto": 2.0}
    factor = factors.get(req.activity_level.lower(), factors["medio"])

    # Se calcula con el peso objetivo: para bajar de peso se alimenta según el peso al que se quiere llegar
    rer = round(70 * (target_weight ** 0.75), 1)
    daily_calories = round(rer * factor, 1)
    grams_per_day = round(daily_calories / 3.5)  # alimento seco típico: ~3.5 kcal/g (ver etiqueta)

    lines = [
        f"Plan para {pet.name} ({pet.species}, {current_weight:g} kg).",
        f"- Energía diaria estimada: {daily_calories:g} kcal (RER {rer:g} kcal × factor de actividad {factor:g}).",
        f"- Con un alimento de unas 3.5 kcal/g, son cerca de {grams_per_day} g al día repartidos en 2 comidas. Ajusta con la etiqueta del alimento.",
    ]
    if target_weight < current_weight:
        lines.append(
            f"- Objetivo de peso {target_weight:g} kg: baja de forma gradual (alrededor de 1 a 2 % del peso por semana) y confírmalo con tu veterinario."
        )
    elif target_weight > current_weight:
        lines.append(f"- Objetivo de peso {target_weight:g} kg: sube de forma gradual y con seguimiento veterinario.")
    if req.allergies and req.allergies.strip():
        lines.append(f"- Evita alimentos con: {req.allergies.strip()}. Revisa los ingredientes de cada alimento y premio.")
    else:
        lines.append("- No indicaste alergias. Si notas picazón, diarrea o vómito tras un alimento nuevo, consúltalo con tu veterinario.")
    lines.append("- Elige un alimento completo y balanceado para su especie y etapa de vida.")

    return {
        "analysis_source": "Cálculo energético (fórmula RER/MER)",
        "pet_name": pet.name,
        "resting_energy_requirement_kcal": rer,
        "daily_energy_needs_kcal": daily_calories,
        "recommended_diet": "\n".join(lines),
        "hydration_target_ml": round(current_weight * 50, 1),
        "disclaimer": "Es una estimación general y no sustituye el plan de un veterinario o nutriólogo veterinario.",
    }
