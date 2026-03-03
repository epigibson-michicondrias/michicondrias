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
    return db_req

def get_requests_for_listing(db: Session, listing_id: str):
    return db.query(AdoptionRequest).filter(AdoptionRequest.listing_id == listing_id).all()

def get_requests_by_user(db: Session, user_id: str):
    return db.query(AdoptionRequest).filter(AdoptionRequest.user_id == user_id).all()

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
        final_list.append(req)
    
    return final_list
