import os
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import httpx

from app.crud import crud_pet as crud
from app.api import deps
from app.db.session import get_db
from app.core.config import settings
from app.schemas.pet import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    AdoptionRequestCreate,
    AdoptionRequestResponse,
    PresignedUrlResponse,
    AdoptionFormCreate,
    AdoptionFormResponse,
    AdoptionContractCreate,
    AdoptionContractResponse
)

router = APIRouter()

# Estados válidos de una solicitud. Se aceptan sinónimos en español de versiones anteriores de la app.
VALID_REQUEST_STATUSES = {"PENDING", "REVIEWING", "INTERVIEW_SCHEDULED", "APPROVED", "REJECTED"}
STATUS_ALIASES = {"PENDIENTE": "PENDING", "APROBADO": "APPROVED", "RECHAZADO": "REJECTED"}
STATUS_LABELS_ES = {
    "REVIEWING": "está en revisión",
    "INTERVIEW_SCHEDULED": "tiene una entrevista programada",
    "APPROVED": "fue pre-aprobada",
    "REJECTED": "no fue aceptada",
    "ADOPTED": "fue aprobada: ¡la adopción se concretó!",
}


def _normalize_status(raw: str) -> str:
    value = (raw or "").strip().upper()
    value = STATUS_ALIASES.get(value, value)
    if value not in VALID_REQUEST_STATUSES:
        raise HTTPException(status_code=400, detail="Estado de solicitud no válido")
    return value


async def _notify(user_id: str, title: str, message: str) -> None:
    """Notificación real vía el servicio core (con push por WebSocket). Un fallo no rompe el flujo."""
    try:
        payload = {"user_id": user_id, "title": title, "message": message, "type": "general"}
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{settings.CORE_SERVICE_URL}/api/v1/notifications/broadcast", json=payload,
                headers={"X-Internal-Token": os.getenv("INTERNAL_SERVICE_TOKEN", "")}, timeout=5.0,
            )
    except Exception as e:
        print(f"[ADOPTION] No se pudo notificar a {user_id}: {e}")


def _require_listing_owner_or_admin(db: Session, listing_id: str, user_id: str, role: str):
    """La publicación debe existir y el usuario ser quien la publicó (refugio) o admin."""
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    if role != "admin" and listing.published_by != user_id:
        raise HTTPException(status_code=403, detail="Solo quien publicó la mascota puede gestionar sus solicitudes")
    return listing



# ========================================
# PUBLIC — Approved listings only
# ========================================

@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_photo_presigned_url(
    ext: str = "jpg",
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Generate a presigned URL to upload a pet photo."""
    from app.core.s3 import generate_presigned_url, image_content_type
    import uuid

    try:
        clean_ext, content_type = image_content_type(ext)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Usa jpg, png, webp, gif o heic.")
    object_name = f"adopciones/{user_id}/{uuid.uuid4()}.{clean_ext}"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")
        
    public_url = f"{settings.STORAGE_BASE_URL}/{object_name}"
    return PresignedUrlResponse(url=url, object_key=object_name, public_url=public_url)

@router.get("/", response_model=List[ListingResponse])
def read_listings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Browse approved adoption listings. Public."""
    return crud.get_approved_listings(db, skip=skip, limit=limit)

@router.get("/me", response_model=List[ListingResponse])
def read_my_listings(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """My published listings (see approval status)."""
    return crud.get_listings_by_user(db, user_id=user_id)

@router.get("/{listing_id}", response_model=ListingResponse)
def read_listing(
    listing_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """Read a specific listing by ID. Public."""
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return listing


# ========================================
# AUTHENTICATED — Any user
# ========================================

@router.post("/", response_model=ListingResponse)
def create_listing(
    *,
    db: Session = Depends(get_db),
    listing_in: ListingCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Publish an adoption listing. Pending admin approval."""
    return crud.create_listing(db=db, listing=listing_in, user_id=user_id)

@router.put("/{listing_id}", response_model=ListingResponse)
def update_my_listing(
    listing_id: str,
    listing_in: ListingCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Edit my own listing. Only the creator can edit."""
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    if listing.published_by != user_id:
        raise HTTPException(status_code=403, detail="Solo puedes editar tus propias publicaciones")
    if listing.status == "adoptado":
        raise HTTPException(status_code=400, detail="No puedes editar una publicación ya adoptada")
    updated = crud.update_listing(db, listing, listing_in)
    return updated

@router.delete("/{listing_id}")
def delete_my_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Delete my own listing. Only the creator can delete."""
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    if listing.published_by != user_id:
        raise HTTPException(status_code=403, detail="Solo puedes eliminar tus propias publicaciones")
    if listing.status == "adoptado":
        raise HTTPException(status_code=400, detail="No puedes eliminar una publicación ya adoptada")
    crud.delete_listing(db, listing_id)
    return {"message": "Publicación eliminada"}

@router.post("/{listing_id}/request", response_model=AdoptionRequestResponse)
async def request_adoption(
    listing_id: str,
    req_in: AdoptionRequestCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Request to adopt from a listing."""
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    if not listing.is_approved:
        raise HTTPException(status_code=400, detail="Esta publicación aún no ha sido aprobada")
    if listing.status != "abierto":
        raise HTTPException(status_code=400, detail="Esta mascota ya fue adoptada")

    if listing.published_by == user_id:
        raise HTTPException(status_code=400, detail="No puedes postularte a adoptar tu propia publicación")
    if crud.get_active_request_for(db, listing_id, user_id):
        raise HTTPException(status_code=409, detail="Ya enviaste una solicitud para esta mascota")

    created = crud.create_adoption_request(db=db, listing_id=listing_id, user_id=user_id, req=req_in)
    await _notify(
        listing.published_by,
        f"Nueva solicitud de adopción: {listing.name}",
        f"{req_in.applicant_name or 'Una persona'} quiere adoptar a {listing.name}. Revísala en Solicitudes recibidas.",
    )
    return created

@router.get("/requests/me", response_model=List[AdoptionRequestResponse])
def read_my_requests(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """My adoption requests."""
    reqs = crud.get_requests_by_user(db, user_id=user_id)
    results = []
    for r in reqs:
        # Convert ORM to dict to append extra data
        r_dict = r.__dict__.copy()
        
        # We already have pet_name attached via the JOIN in crud
        r_dict["pet_name"] = r.pet_name
        
        # PROTECT AGAINST Lambda 6MB limit (413 Payload Too Large)
        # If the photo is a huge base64 string, drop it for the list view
        photo = r.pet_photo_url
        if photo and photo.startswith("data:image") and len(photo) > 100000:
            pass # The frontend will show a fallback paw icon
        else:
            r_dict["pet_photo_url"] = photo
            
        results.append(r_dict)
    return results


@router.get("/requests/{request_id}", response_model=AdoptionRequestResponse)
def read_request(
    request_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Una solicitud: la ve su solicitante, quien publicó la mascota o un admin."""
    req = db.query(AdoptionRequest).filter(AdoptionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    listing = crud.get_listing(db, req.listing_id)
    if req.user_id != user_id and role != "admin" and (not listing or listing.published_by != user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta solicitud")
    if listing:
        req.pet_name = listing.name
        req.pet_photo_url = listing.photo_url
    return crud.enrich_adoption_request_with_vetting(db, req)


from app.models.pet import AdoptionRequest

# ========================================
# ADMIN — Approval flow
# ========================================

@router.get("/admin/pending", response_model=List[ListingResponse])
def read_pending_listings(
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """All pending listings awaiting approval. Admin only."""
    return crud.get_pending_listings(db)

@router.get("/admin/requests/pending", response_model=List[AdoptionRequestResponse])
def read_pending_requests(
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """All pending adoption requests awaiting review. Admin only."""
    return crud.get_all_pending_requests(db)

@router.post("/admin/{listing_id}/approve", response_model=ListingResponse)
def approve_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """Approve a listing to be visible. Admin only."""
    listing = crud.approve_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    return listing

@router.delete("/admin/{listing_id}/reject")
def reject_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """Reject and delete a listing. Admin only."""
    listing = crud.reject_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    return {"message": "Publicación rechazada y eliminada"}

@router.get("/admin/{listing_id}/requests", response_model=List[AdoptionRequestResponse])
def read_listing_requests(
    listing_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Solicitudes de una publicación. Solo quien la publicó (refugio) o un admin."""
    _require_listing_owner_or_admin(db, listing_id, user_id, role)
    return crud.get_requests_for_listing(db, listing_id)

@router.put("/admin/requests/{request_id}/status", response_model=AdoptionRequestResponse)
async def update_adoption_request_status(
    request_id: str,
    status: str,
    note: str | None = None,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """
    Transition a request to an intermediate state (REVIEWING, INTERVIEW_SCHEDULED, APPROVED, REJECTED).
    Solo quien publicó la mascota (refugio) o un admin. No finaliza la adopción, solo actualiza la línea de tiempo.
    """
    new_status = _normalize_status(status)
    existing = db.query(AdoptionRequest).filter(AdoptionRequest.id == request_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if existing.status == "ADOPTED":
        raise HTTPException(status_code=400, detail="Esta adopción ya se concretó")
    listing = _require_listing_owner_or_admin(db, existing.listing_id, user_id, role)
    req = crud.update_request_status(db, request_id, new_status)
    await _notify(
        existing.user_id,
        f"Tu solicitud por {listing.name}",
        f"Tu solicitud para adoptar a {listing.name} {STATUS_LABELS_ES.get(new_status, 'cambió de estado')}." + (f" Mensaje del refugio: {note.strip()[:300]}" if note and note.strip() else ""),
    )
    return req

@router.post("/admin/requests/{request_id}/approve", response_model=AdoptionRequestResponse)
async def approve_adoption(
    request_id: str,
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """
    Approve an adoption request. Solo quien publicó la mascota (refugio) o un admin.
    This marks the listing as 'ADOPTED', rejects other requests,
    and creates a permanent Pet record in the mascotas microservice
    linked to the adopter (user_id) and listing (adopted_from_listing_id).
    """
    from app.main import correlation_id_ctx
    correlation_id = correlation_id_ctx.get()

    # 1. Get request and listing info first
    req = db.query(AdoptionRequest).filter(AdoptionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    listing = crud.get_listing(db, req.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Publicación original no encontrada")
    _require_listing_owner_or_admin(db, listing.id, user_id, role)
    if listing.status != "abierto" or req.status == "ADOPTED":
        raise HTTPException(status_code=400, detail="Esta mascota ya fue adoptada")
    if req.status == "REJECTED":
        raise HTTPException(status_code=400, detail="Esta solicitud fue rechazada")

    # 2. Determine the service URL dynamically based on the current request Host
    # This allows it to work in local (localhost:8000), staging or production seamlessly
    host = request.headers.get("host", "localhost:8000")
    # If the request arrived at localhost:8001 (direct to microservice), we still want to target the gateway (8000)
    # but usually internal calls go through the gateway or direct. 
    # Let's be smart: if they use the gateway prefix, follow it.
    
    # Check if we are in local development vs production (simple check)
    is_local = "localhost" in host or "127.0.0.1" in host
    
    # Build internal URL. We assume /mascotas/api/v1 is the path in the gateway.
    # If is_local and port is 8001, the gateway is likely at 8000.
    target_host = host
    if is_local and ":8001" in host:
        target_host = host.replace(":8001", ":8000")
    
    protocol = "https" if request.url.scheme == "https" else "http"
    mascotas_url = f"{protocol}://{target_host}/mascotas/api/v1/pets/"

    print(f"[ADOPTION] Targeting mascotas service at: {mascotas_url}")

    # 3. Create permanent pet record in michicondrias_mascotas service
    transport = httpx.AsyncHTTPTransport(retries=3)
    try:
        async with httpx.AsyncClient(transport=transport) as client:
            pet_data = {
                "owner_id": req.user_id,
                "name": listing.name,
                "species": listing.species,
                "breed": listing.breed,
                "age_months": listing.age_months,
                "size": listing.size,
                "description": listing.description,
                "photo_url": listing.photo_url,
                "adopted_from_listing_id": listing.id,
                # Enrichment Fields
                "is_vaccinated": listing.is_vaccinated,
                "is_sterilized": listing.is_sterilized,
                "is_dewormed": listing.is_dewormed,
                "temperament": listing.temperament,
                "energy_level": listing.energy_level,
                "social_cats": listing.social_cats,
                "social_dogs": listing.social_dogs,
                "social_children": listing.social_children,
                "weight_kg": listing.weight_kg,
                "microchip_number": listing.microchip_number,
                "gender": listing.gender,
                "gallery": listing.gallery
            }
            
            headers = {"X-Correlation-ID": correlation_id, "X-Internal-Token": os.getenv("INTERNAL_SERVICE_TOKEN", "")}
            
            import json
            print(f"[ADOPTION] Sending pet creation to mascotas service at {mascotas_url}")
            print(f"[ADOPTION] Pet data to send: {json.dumps(pet_data)}")
            
            response = await client.post(
                mascotas_url,
                json=pet_data,
                headers=headers,
                timeout=12.0
            )
            
            if response.status_code >= 400:
                print(f"[ADOPTION ERROR] Mascotas service {response.status_code}: {response.text}")
                response.raise_for_status()
                
            print(f"[ADOPTION] Pet created successfully in mascotas service.")
            
    except Exception as e:
        err_detail = f"Falla en registro de mascota (Servicio Mascotas): {type(e).__name__}: {str(e)}"
        print(f"[ADOPTION ERROR] {err_detail}")
        raise HTTPException(status_code=500, detail=err_detail)
    
    # 4. If pet creation succeeded, finalize the adoption in local DB
    result = crud.approve_adoption(db, request_id)
    await _notify(
        req.user_id,
        f"¡Adopción aprobada: {listing.name}!",
        f"Tu solicitud para adoptar a {listing.name} fue aprobada. La mascota ya aparece en tu cuenta.",
    )
    return result


# ========================================
# ADOPTION FORMS & CONTRACTS FLOWS
# ========================================

@router.post("/adoptions/forms", response_model=AdoptionFormResponse)
async def submit_adoption_form(
    *,
    db: Session = Depends(get_db),
    form_in: AdoptionFormCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Submit a detailed adoption questionnaire/form for a pet."""
    existing_form = crud.get_active_form_for(db, form_in.pet_id, user_id)
    if existing_form:
        raise HTTPException(status_code=409, detail="Ya enviaste un formulario para esta mascota")
    # Verify the pet/listing exists
    listing = crud.get_listing(db, form_in.pet_id)
    if not listing:
        raise HTTPException(status_code=404, detail="La mascota/publicación no existe")
    if listing.status != "abierto":
        raise HTTPException(status_code=400, detail="Esta mascota ya no está disponible para adopción")
    
    if listing.published_by == user_id:
        raise HTTPException(status_code=400, detail="No puedes postularte a tu propia publicación")
    if form_in.hours_left_alone is not None and not (0 <= form_in.hours_left_alone <= 24):
        raise HTTPException(status_code=400, detail="Las horas a solas deben estar entre 0 y 24")

    created = crud.create_adoption_form(db=db, form_in=form_in, applicant_id=user_id)
    await _notify(
        listing.published_by,
        f"Nuevo formulario de compatibilidad: {listing.name}",
        f"Una persona completó el formulario para adoptar a {listing.name} (compatibilidad {created.compatibility_score}%). Revísalo en Postulaciones.",
    )
    created.pet_name = listing.name
    return created


@router.get("/adoptions/refuge/applications", response_model=List[AdoptionFormResponse])
def get_refuge_applications(
    *,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """List all adoption applications/forms received for listings published by this refuge/user."""
    if role not in ["refugio", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios con rol refugio o admin pueden listar aplicaciones",
        )
    forms = crud.get_adoption_forms_for_refuge(db=db, refuge_id=user_id)
    names: dict = {}
    for f in forms:
        if f.pet_id not in names:
            l = crud.get_listing(db, f.pet_id)
            names[f.pet_id] = l.name if l else None
        f.pet_name = names[f.pet_id]
    return forms


@router.post("/adoptions/contracts/sign", response_model=AdoptionContractResponse)
async def sign_adoption_contract(
    *,
    db: Session = Depends(get_db),
    contract_in: AdoptionContractCreate,
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Sign an adoption contract (requires refugio/admin/association role)."""
    # Verify the form exists and is approved
    form = crud.get_adoption_form(db, contract_in.form_id)
    if not form:
        raise HTTPException(status_code=404, detail="El formulario de adopción no existe")
    
    # Verify that the refuge signing the contract actually published the listing
    listing = crud.get_listing(db, form.pet_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    
    if role != "admin" and listing.published_by != user_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para firmar contratos para esta mascota",
        )
    
    # Un contrato por formulario (evita duplicados al tocar "Firmar" dos veces)
    from app.models.pet import AdoptionContract
    if db.query(AdoptionContract).filter(AdoptionContract.form_id == form.id).first():
        raise HTTPException(status_code=409, detail="Este formulario ya tiene un contrato firmado")
    if form.status == "rejected":
        raise HTTPException(status_code=400, detail="Este formulario fue rechazado")

    # El firmante es siempre quien está autenticado (no lo que diga el cuerpo de la petición)
    contract_in.refuge_id = user_id
    contract = crud.create_adoption_contract(db=db, contract_in=contract_in)
    # Update form status to 'approved' if not already
    crud.update_adoption_form_status(db, form.id, "approved")
    await _notify(
        form.applicant_id,
        f"Contrato de adopción: {listing.name}",
        f"El refugio firmó el contrato de adopción de {listing.name}. Tu postulación fue aprobada.",
    )
    return contract



@router.put("/adoptions/forms/{form_id}/status", response_model=AdoptionFormResponse)
async def update_adoption_form_status_route(
    form_id: str,
    status: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """El refugio (o admin) marca un formulario como 'under_review' o 'rejected'. La aprobación se hace firmando el contrato."""
    if status not in ("under_review", "rejected"):
        raise HTTPException(status_code=400, detail="Estado no válido")
    form = crud.get_adoption_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="El formulario de adopción no existe")
    listing = crud.get_listing(db, form.pet_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if role != "admin" and listing.published_by != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso sobre esta postulación")
    if form.status == "approved":
        raise HTTPException(status_code=409, detail="Esta postulación ya fue aprobada")
    updated = crud.update_adoption_form_status(db, form_id, status)
    await _notify(
        form.applicant_id,
        f"Tu formulario por {listing.name}",
        f"Tu formulario para adoptar a {listing.name} " + ("está en revisión." if status == "under_review" else "no fue aceptado."),
    )
    updated.pet_name = listing.name
    return updated
