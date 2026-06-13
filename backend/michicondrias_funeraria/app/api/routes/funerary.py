from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import RoleChecker, get_current_user_id
from app.db.session import get_db
from app.models.funerary import PetDeath, PetMemorialPost
from app.schemas.funerary import (
    PetDeathCreate,
    PetDeathResponse,
    PetMemorialPostCreate,
    PetMemorialPostResponse,
    FuneraryServiceCreate,
    FuneraryServiceResponse,
    FuneraryBookingCreate,
    FuneraryBookingResponse,
)
from app.crud import crud_funerary

router = APIRouter()

@router.post("/death-report", response_model=PetDeathResponse, status_code=status.HTTP_201_CREATED)
def record_death_report(
    *,
    db: Session = Depends(get_db),
    death_in: PetDeathCreate,
    current_user: dict = Depends(RoleChecker(["funeraria", "veterinario"]))
):
    """
    Records a pet's death. Requires 'funeraria' or 'veterinario' role.
    Updates the pet's status to 'in_memoriam' in the database.
    """
    pet = crud_funerary.get_pet(db, death_in.pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La mascota especificada no existe."
        )
    
    funerary_id = current_user.get("sub")
    death_report = crud_funerary.create_death_report(db, death_in=death_in, funerary_id=funerary_id)
    if not death_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo registrar el reporte de fallecimiento."
        )
    return death_report

@router.get("/memorial/{pet_id}", response_model=List[PetMemorialPostResponse])
def read_memorial_posts(
    pet_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve all memorial posts for a pet.
    """
    posts = crud_funerary.get_memorial_posts(db, pet_id=pet_id)
    return posts

@router.post("/memorial/post", response_model=PetMemorialPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    *,
    db: Session = Depends(get_db),
    post_in: PetMemorialPostCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a new memorial post for a pet. Requires authentication.
    """
    pet = crud_funerary.get_pet(db, post_in.pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La mascota especificada no existe."
        )
    
    post = crud_funerary.create_memorial_post(db, post_in=post_in, user_id=current_user_id)
    return post

@router.post("/services", response_model=FuneraryServiceResponse, status_code=status.HTTP_201_CREATED)
def add_service(
    *,
    db: Session = Depends(get_db),
    service_in: FuneraryServiceCreate,
    current_user: dict = Depends(RoleChecker(["funeraria"]))
):
    """
    Create a new funerary service package. Requires 'funeraria' role.
    """
    funerary_id = current_user.get("sub")
    service = crud_funerary.create_funerary_service(db, service_in=service_in, funerary_id=funerary_id)
    return service

@router.get("/services", response_model=List[FuneraryServiceResponse])
def read_active_services(
    db: Session = Depends(get_db)
):
    """
    Get all active funerary services. Public endpoint.
    """
    services = crud_funerary.get_active_funerary_services(db)
    return services

@router.post("/bookings", response_model=FuneraryBookingResponse, status_code=status.HTTP_201_CREATED)
def add_booking(
    *,
    db: Session = Depends(get_db),
    booking_in: FuneraryBookingCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Book a funerary service. Requires authentication ('consumidor' or any role).
    """
    pet = crud_funerary.get_pet(db, booking_in.pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La mascota especificada no existe."
        )
    
    booking = crud_funerary.create_funerary_booking(db, booking_in=booking_in, client_id=current_user_id)
    return booking

@router.get("/bookings/client", response_model=List[FuneraryBookingResponse])
def read_client_bookings(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Get all bookings for the logged-in client.
    """
    bookings = crud_funerary.get_bookings_for_client(db, client_id=current_user_id)
    return bookings

@router.get("/bookings/provider", response_model=List[FuneraryBookingResponse])
def read_provider_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["funeraria"]))
):
    """
    Get all bookings requested from the logged-in funerary provider. Requires 'funeraria' role.
    """
    funerary_id = current_user.get("sub")
    bookings = crud_funerary.get_bookings_for_provider(db, provider_id=funerary_id)
    return bookings

@router.get("/certificate/{death_id}/pdf", response_model=dict)
def download_death_certificate(
    death_id: str,
    db: Session = Depends(get_db)
):
    """
    Generate and retrieve the digital death certificate PDF URL/data.
    """
    death_report = db.query(PetDeath).filter(PetDeath.id == death_id).first()
    if not death_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte de defunción no encontrado."
        )
    
    # Return mock certificate details and dummy URL
    return {
        "death_id": death_id,
        "pet_id": death_report.pet_id,
        "funerary_id": death_report.funerary_id,
        "date_of_death": death_report.date_of_death.isoformat(),
        "cremation_type": death_report.cremation_type,
        "certificate_url": f"https://michicondrias-storage-1.s3.amazonaws.com/certificates/cert-{death_id}.pdf",
        "qr_code_link": f"https://michicondrias.app/funerary/memorial/{death_report.pet_id}"
    }

@router.get("/memorial/{pet_id}/feed", response_model=List[PetMemorialPostResponse])
def read_memorial_feed(
    pet_id: str,
    db: Session = Depends(get_db),
    sort_by: Optional[str] = "date"
):
    """
    Retrieve all memorial posts for a pet sorted by date.
    """
    query = db.query(PetMemorialPost).filter(PetMemorialPost.pet_id == pet_id)
    if sort_by == "date":
        query = query.order_by(PetMemorialPost.created_at.desc())
    else:
        query = query.order_by(PetMemorialPost.created_at.asc())
    return query.all()
