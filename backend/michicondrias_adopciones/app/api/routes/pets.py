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
    PresignedUrlResponse
)

router = APIRouter()


# ========================================
# PUBLIC — Approved listings only
# ========================================

@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_photo_presigned_url(
    ext: str = "jpg",
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Generate a presigned URL to upload a pet photo."""
    from app.core.s3 import generate_presigned_url
    import mimetypes
    import uuid
    
    clean_ext = ext.replace(".", "")
    object_name = f"adopciones/{user_id}/{uuid.uuid4()}.{clean_ext}"
    
    content_type, _ = mimetypes.guess_type(f"file.{clean_ext}")
    if not content_type:
        content_type = "image/jpeg" if clean_ext in ["jpg", "jpeg"] else "application/octet-stream"
        
    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")
        
    public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
    return PresignedUrlResponse(url=url, object_key=public_url)

@router.get("/", response_model=List[ListingResponse])
def read_listings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Browse approved adoption listings. Public."""
    return crud.get_approved_listings(db, skip=skip, limit=limit)

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

@router.get("/me", response_model=List[ListingResponse])
def read_my_listings(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """My published listings (see approval status)."""
    return crud.get_listings_by_user(db, user_id=user_id)

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
def request_adoption(
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

    return crud.create_adoption_request(db=db, listing_id=listing_id, user_id=user_id, req=req_in)

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
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """View all requests for a listing. Admin only."""
    return crud.get_requests_for_listing(db, listing_id)

@router.put("/admin/requests/{request_id}/status", response_model=AdoptionRequestResponse)
def update_adoption_request_status(
    request_id: str,
    status: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """
    Transition a request to an intermediate state (e.g., REVIEWING, INTERVIEW_SCHEDULED, APPROVED).
    This doesn't finalize adoption, only updates the timeline.
    """
    req = crud.update_request_status(db, request_id, status)
    if not req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return req

@router.post("/admin/requests/{request_id}/approve", response_model=AdoptionRequestResponse)
async def approve_adoption(
    request_id: str,
    request: Request,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """
    Approve an adoption request. Admin only.
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
            
            headers = {"X-Correlation-ID": correlation_id}
            
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
    return result
