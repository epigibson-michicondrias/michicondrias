from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx
import time
from jose import jwt, JWTError

from app.db.session import get_db
from app.models.mascotas import Pet
from app.api import deps
from app.core.config import settings

router = APIRouter()


class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str


@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_photo_presigned_url(
    ext: str = "jpg",
) -> Any:
    """Generate a presigned URL to upload a pet photo to S3."""
    from app.core.s3 import generate_presigned_url
    from app.core.config import settings
    import mimetypes
    import uuid

    clean_ext = ext.replace(".", "")
    object_name = f"mascotas/{uuid.uuid4()}.{clean_ext}"

    content_type, _ = mimetypes.guess_type(f"file.{clean_ext}")
    if not content_type:
        content_type = "image/jpeg" if clean_ext in ["jpg", "jpeg"] else "application/octet-stream"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")

    public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
    return PresignedUrlResponse(url=url, object_key=public_url)

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
    
    has_active_subscription: Optional[bool] = None
    stripe_subscription_id: Optional[str] = None

class PetSubscriptionUpdate(BaseModel):
    has_active_subscription: bool
    stripe_subscription_id: Optional[str] = None


@router.post("/", response_model=PetResponse)
def create_pet(
    *,
    db: Session = Depends(get_db),
    pet_in: PetCreate,
) -> Any:
    """
    Create a new permanent pet record.
    Called by the adoption service when an adoption is finalized,
    or by the user registering their own pet.
    """
    print(f"[MASCOTAS] Creating pet for owner {pet_in.owner_id}: {pet_in.name}")
    try:
        db_obj = Pet(**pet_in.model_dump())
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
def get_user_pets(user_id: str, db: Session = Depends(get_db)) -> Any:
    """Get all permanent pets owned by a specific user."""
    print(f"[MASCOTAS] Fetching pets for user_id: {user_id}")
    pets = db.query(Pet).filter(Pet.owner_id == user_id, Pet.is_active == True).all()
    print(f"[MASCOTAS] Found {len(pets)} pets for user {user_id}")
    return pets


@router.get("/admin/all", response_model=List[PetResponse])
def get_all_pets_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> Any:
    """Admin endpoint: Get all pets across all users."""
    pets = db.query(Pet).filter(Pet.is_active == True).offset(skip).limit(limit).all()
    return pets


@router.get("/{pet_id}", response_model=PetResponse)
def get_pet_by_id(pet_id: str, db: Session = Depends(get_db)) -> Any:
    """Get a specific permanent pet by its ID."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return pet

@router.put("/{pet_id}", response_model=PetResponse)
def update_pet(
    pet_id: str,
    pet_in: PetUpdate,
    db: Session = Depends(get_db),
) -> Any:
    """Update a pet's information."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    update_data = pet_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pet, key, value)
    db.commit()
    db.refresh(pet)
    return pet

@router.get("/adopted-from/{listing_id}", response_model=PetResponse)
def get_pet_by_listing(listing_id: str, db: Session = Depends(get_db)) -> Any:
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
    symptom_description: str
    duration_hours: int

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
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
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


@router.get("/passport/view/{signed_token}")
async def view_public_passport(
    signed_token: str,
    db: Session = Depends(get_db)
) -> Any:
    """Public endpoint to view consolidated pet records using a temporary signed token."""
    try:
        payload = jwt.decode(signed_token, settings.SECRET_KEY, algorithms=["HS256"])
        pet_id = payload.get("pet_id")
    except JWTError:
        raise HTTPException(status_code=403, detail="El enlace para compartir ha expirado o es inválido")
        
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")

    # Fetch vaccines from carnet service
    vaccines = []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{settings.API_GATEWAY_URL}/carnet/api/v1/vaccines/pet/{pet_id}", timeout=5.0)
            if resp.status_code == 200:
                vaccines = resp.json()
    except Exception as e:
        print(f"Error fetching vaccines: {e}")

    # Fetch active insurance policy from insurance service
    insurance = {}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{settings.API_GATEWAY_URL}/aseguradoras/api/v1/insurance/policies/pet/{pet_id}", timeout=5.0)
            if resp.status_code == 200:
                insurance = resp.json()
    except Exception as e:
        print(f"Error fetching insurance: {e}")

    return {
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


@router.post("/ai/symptom-check")
def ai_symptom_check(
    req: SymptomCheckRequest,
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """AI symptom checker (Simulated Gemini AI analysis)."""
    symptom = req.symptom_description.lower()
    
    if any(w in symptom for w in ["sangre", "vomito constante", "convulsion", "no respira", "ahogo", "envenenamiento"]):
        triage = "ROJO (Emergencia Veterinaria Inmediata)"
        recommendation = "Lleve a su mascota inmediatamente a una clínica de urgencias 24h. No intente inducir el vómito sin supervisión médica."
        urgency = "alta"
    elif any(w in symptom for w in ["diarrea", "vomito", "decaimiento", "no quiere comer", "tos"]):
        triage = "AMARILLO (Cita Veterinaria Prioritaria)"
        recommendation = "Monitoree la hidratación. Agende una cita prioritaria dentro de las próximas 12-24 horas."
        urgency = "media"
    else:
        triage = "VERDE (Cuidado en Casa)"
        recommendation = "Los síntomas parecen leves. Mantenga a su mascota descansada y observe evolución. Si persisten por más de 48h, consulte a su veterinario."
        urgency = "baja"
        
    return {
        "analysis_source": "Gemini AI Triaje",
        "triage_level": triage,
        "urgency": urgency,
        "summary": f"Se analizaron los síntomas '{req.symptom_description}' con duración de {req.duration_hours} horas.",
        "action_plan": recommendation,
        "disclaimer": "Este es un análisis pre-clínico automatizado por IA y no sustituye la consulta con un profesional calificado."
    }


@router.post("/{pet_id}/ai/diet-plan")
def ai_diet_plan(
    pet_id: str,
    req: DietPlanRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """AI customized nutritional planner (Simulated Gemini AI)."""
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if pet.owner_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    weight = pet.weight_kg or 10.0
    rer = round(70 * (weight ** 0.75), 1)
    
    activity_factors = {"bajo": 1.2, "medio": 1.6, "alto": 2.0}
    factor = activity_factors.get(req.activity_level.lower(), 1.6)
    daily_calories = round(rer * factor, 1)
    
    diet_guidelines = (
        f"Dieta balanceada recomendada para {pet.name} ({pet.species}, {weight}kg):\n"
        f"- Porción diaria sugerida: {round(daily_calories / 3.5, 1)}g de alimento premium (dividido en 2 porciones).\n"
        f"- Ingrediente principal aconsejado: Proteína magra (pollo o salmón).\n"
        f"- Restricciones por Alergias: {req.allergies if req.allergies else 'Ninguna detectada'}."
    )
    
    return {
        "analysis_source": "Gemini AI Nutrición",
        "pet_name": pet.name,
        "resting_energy_requirement_kcal": rer,
        "daily_energy_needs_kcal": daily_calories,
        "recommended_diet": diet_guidelines,
        "hydration_target_ml": round(weight * 50, 1)
    }

