from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
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
)

router = APIRouter()


# ========================================
# PUBLIC — Approved listings only
# ========================================

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
        listing = crud.get_listing(db, r.listing_id)
        if listing:
            r_dict["pet_name"] = listing.name
            r_dict["pet_photo_url"] = listing.photo_url
        results.append(r_dict)
    return results


# ========================================
# ADMIN — Approval flow
# ========================================

@router.get("/admin/pending", response_model=List[ListingResponse])
def read_pending_listings(
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """Pending listings awaiting approval. Admin only."""
    return crud.get_pending_listings(db)

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
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    from app.main import correlation_id_ctx
    correlation_id = correlation_id_ctx.get()
    """
    Approve an adoption request. Admin only.
    This marks the listing as 'ADOPTED', rejects other requests,
    and creates a permanent Pet record in the mascotas microservice
    linked to the adopter (user_id) and listing (adopted_from_listing_id).
    """
    result = crud.approve_adoption(db, request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Get listing info to create the real pet record
    listing = crud.get_listing(db, result.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing no encontrado")
    
    # Create permanent pet record in michicondrias_mascotas service
    pet_created = False
    try:
        # Configure transport with retries (3 attempts)
        transport = httpx.AsyncHTTPTransport(retries=3)
        async with httpx.AsyncClient(transport=transport) as client:
            pet_data = {
                "owner_id": result.user_id,
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
            # Use service URL from settings
            headers = {"X-Correlation-ID": correlation_id}
            response = await client.post(
                f"{settings.MASCOTAS_SERVICE_URL}/api/v1/pets/",
                json=pet_data,
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            pet_created = True
            print(f"[ADOPTION] Pet created successfully for user {result.user_id} from listing {listing.id}")
    except httpx.ConnectError:
        print(f"[ADOPTION ERROR] Cannot connect to mascotas service. Pet not created for listing {listing.id}")
    except httpx.HTTPStatusError as e:
        print(f"[ADOPTION ERROR] Mascotas service returned {e.response.status_code}: {e.response.text}")
    except Exception as e:
        print(f"[ADOPTION ERROR] Unexpected error creating pet: {type(e).__name__}: {e}")
    
    if not pet_created:
        print(f"[ADOPTION WARNING] Adoption approved but pet NOT created. Manual creation needed for listing {listing.id}, user {result.user_id}")
        
    return result
