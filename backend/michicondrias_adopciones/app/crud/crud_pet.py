from sqlalchemy.orm import Session
from app.models.pet import AdoptionListing, AdoptionRequest
from app.schemas.pet import ListingCreate, ListingUpdate, AdoptionRequestCreate


# ============================
# LISTINGS
# ============================

def get_listing(db: Session, listing_id: str):
    return db.query(AdoptionListing).filter(AdoptionListing.id == listing_id).first()

def get_approved_listings(db: Session, skip: int = 0, limit: int = 100):
    """Visible to everyone — only approved & open listings."""
    return (
        db.query(AdoptionListing)
        .filter(AdoptionListing.is_approved == True, AdoptionListing.status == "abierto")
        .offset(skip).limit(limit).all()
    )

def get_pending_listings(db: Session, skip: int = 0, limit: int = 100):
    """Admin queue — not yet approved."""
    return db.query(AdoptionListing).filter(AdoptionListing.is_approved == False).offset(skip).limit(limit).all()

def get_listings_by_user(db: Session, user_id: str):
    return db.query(AdoptionListing).filter(AdoptionListing.published_by == user_id).all()

def create_listing(db: Session, listing: ListingCreate, user_id: str):
    db_listing = AdoptionListing(
        **listing.model_dump(),
        published_by=user_id,
        is_approved=False,
        status="abierto",
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

def approve_listing(db: Session, listing_id: str):
    listing = get_listing(db, listing_id)
    if listing:
        listing.is_approved = True
        db.commit()
        db.refresh(listing)
    return listing

def reject_listing(db: Session, listing_id: str):
    listing = get_listing(db, listing_id)
    if listing:
        db.delete(listing)
        db.commit()
    return listing

def update_listing(db: Session, listing: AdoptionListing, data: ListingCreate):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(listing, key, value)
    # Only require re-approval if it was already approved
    if listing.is_approved:
        listing.is_approved = False
    db.commit()
    db.refresh(listing)
    return listing

def delete_listing(db: Session, listing_id: str):
    listing = get_listing(db, listing_id)
    if listing:
        db.delete(listing)
        db.commit()
    return listing


# ============================
# ADOPTION REQUESTS
# ============================

def calculate_compatibility_score(req: AdoptionRequest, listing: AdoptionListing) -> tuple[int, str]:
    score = 50
    notes = []
    
    # 1. Financial Commitment
    if not req.financial_commitment:
        score -= 25
        notes.append("No se compromete financieramente.")
    else:
        score += 10
        notes.append("Compromiso financiero confirmado.")

    # 2. Landlord Permission (if renting)
    if req.own_or_rent == "rent":
        if not req.landlord_permission:
            score -= 30
            notes.append("Renta sin autorización de arrendador.")
        else:
            score += 10
            notes.append("Autorización de arrendador confirmada.")
    else:
        score += 15
        notes.append("Propietario de vivienda.")

    # 3. Hours Alone
    if req.hours_alone > 8:
        score -= 15
        notes.append(f"Mucha soledad para mascota ({req.hours_alone}h).")
    elif req.hours_alone <= 4:
        score += 15
        notes.append(f"Excelente disponibilidad de tiempo (sola < 4h).")
    else:
        score += 5

    # 4. Space Compatibility for dogs
    if listing and listing.species.lower() in ["perro", "dog"]:
        is_large_dog = listing.size and listing.size.lower() in ["grande", "large", "gigante", "giant"]
        if is_large_dog:
            if not req.has_yard:
                score -= 20
                notes.append("Perro grande en casa sin patio.")
            else:
                score += 10
                notes.append("Espacio de patio adecuado para perro grande.")
        else:
            if req.has_yard:
                score += 5

    # 5. Children compatibility
    if req.has_children:
        if listing and not listing.social_children:
            score -= 20
            notes.append("Niños en casa pero la mascota no es sociable con niños.")
        else:
            score += 5
            
    # 6. Other pets compatibility
    if req.other_pets and req.other_pets.strip() and req.other_pets.lower() != "ninguno":
        if listing and (not listing.social_dogs or not listing.social_cats):
            score -= 20
            notes.append("Mascotas en casa pero el animal no es sociable con otras mascotas.")
        else:
            score += 5

    score = max(0, min(100, score))
    status_text = "Recomendado" if score >= 75 else ("Bajo revisión" if score >= 50 else "No recomendado")
    notes_summary = f"{status_text}. " + " ".join(notes)
    return score, notes_summary


def enrich_adoption_request_with_vetting(db: Session, req: AdoptionRequest):
    if not req:
        return req
    listing = db.query(AdoptionListing).filter(AdoptionListing.id == req.listing_id).first()
    score, notes = calculate_compatibility_score(req, listing)
    req.compatibility_score = score
    req.vetting_notes = notes
    return req


def create_adoption_request(db: Session, listing_id: str, user_id: str, req: AdoptionRequestCreate):
    db_req = AdoptionRequest(
        listing_id=listing_id,
        user_id=user_id,
        **req.model_dump(),
        status="PENDING",
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return enrich_adoption_request_with_vetting(db, db_req)

def get_requests_for_listing(db: Session, listing_id: str):
    reqs = db.query(AdoptionRequest).filter(AdoptionRequest.listing_id == listing_id).all()
    return [enrich_adoption_request_with_vetting(db, r) for r in reqs]

def get_requests_by_user(db: Session, user_id: str):
    """
    Get all adoption requests for a user.
    Enriches with pet info from AdoptionListing via a JOIN to avoid N+1 queries.
    """
    results = (
        db.query(AdoptionRequest, AdoptionListing.name.label("pet_name"), AdoptionListing.photo_url.label("pet_photo_url"))
        .join(AdoptionListing, AdoptionRequest.listing_id == AdoptionListing.id)
        .filter(AdoptionRequest.user_id == user_id)
        .all()
    )
    
    final_list = []
    for req, pet_name, pet_photo_url in results:
        req.pet_name = pet_name
        req.pet_photo_url = pet_photo_url
        enrich_adoption_request_with_vetting(db, req)
        final_list.append(req)
    
    return final_list


def update_request_status(db: Session, request_id: str, new_status: str):
    """
    Transition a request to an intermediate state (e.g., REVIEWING, INTERVIEW_SCHEDULED, APPROVED).
    """
    req = db.query(AdoptionRequest).filter(AdoptionRequest.id == request_id).first()
    if not req:
        return None
    req.status = new_status
    db.commit()
    db.refresh(req)
    return req

def approve_adoption(db: Session, request_id: str):
    """
    Approve an adoption request:
    1. Mark the request as approved
    2. Mark the listing as adopted
    3. Record who adopted it
    """
    req = db.query(AdoptionRequest).filter(AdoptionRequest.id == request_id).first()
    if not req:
        return None

    # Update request
    req.status = "ADOPTED"

    # Update listing
    listing = get_listing(db, req.listing_id)
    if listing:
        listing.status = "ADOPTED"
        listing.adopted_by = req.user_id

    # Reject all other requests for this listing
    other_reqs = (
        db.query(AdoptionRequest)
        .filter(AdoptionRequest.listing_id == req.listing_id, AdoptionRequest.id != req.id)
        .all()
    )
    for other in other_reqs:
        other.status = "REJECTED"

    db.commit()
    db.refresh(req)
    return req

def get_all_pending_requests(db: Session, skip: int = 0, limit: int = 100):
    """
    Get all PENDING adoption requests globally (across all listings).
    Enriches with pet info from AdoptionListing.
    """
    results = (
        db.query(AdoptionRequest, AdoptionListing.name.label("pet_name"), AdoptionListing.photo_url.label("pet_photo_url"))
        .join(AdoptionListing, AdoptionRequest.listing_id == AdoptionListing.id)
        .filter(AdoptionRequest.status == "PENDING")
        .offset(skip).limit(limit).all()
    )
    
    final_list = []
    for req, pet_name, pet_photo_url in results:
        # We manually attach the labels to the object or return it in a way 
        # that AdoptionRequestResponse can pick it up.
        # Since AdoptionRequestResponse expects pet_name and pet_photo_url, 
        # and SQLAlchemy labels match those in the schema, it works.
        req.pet_name = pet_name
        req.pet_photo_url = pet_photo_url
        enrich_adoption_request_with_vetting(db, req)
        final_list.append(req)
    
    return final_list

