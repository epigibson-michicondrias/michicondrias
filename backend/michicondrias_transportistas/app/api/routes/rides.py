from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api import deps
from app.db.session import get_db
from app.crud.crud_ride import (
    create_ride,
    get_ride_by_id,
    update_ride_location
)
from app.schemas.ride import (
    PetRideCreate,
    PetRideOut,
    RideLocationUpdate,
    RideTrackOut
)

router = APIRouter()

@router.post("/request", response_model=PetRideOut, status_code=status.HTTP_201_CREATED)
def request_ride(
    *,
    db: Session = Depends(get_db),
    ride_in: PetRideCreate,
    user_id: str = Depends(deps.require_consumidor)
) -> Any:
    """
    Request a new ride for a pet. Requires 'consumidor' role.
    """
    try:
        db_ride = create_ride(db, ride_in=ride_in)
        return db_ride
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad: El driver_id o pet_id no existe en la base de datos."
        )

@router.patch("/{id}/location", response_model=PetRideOut)
def update_location(
    *,
    db: Session = Depends(get_db),
    id: str,
    location_in: RideLocationUpdate,
    user_id: str = Depends(deps.require_transportista)
) -> Any:
    """
    Update driver current latitude and longitude. Requires 'transportista' role.
    """
    db_ride = get_ride_by_id(db, ride_id=id)
    if not db_ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Viaje no encontrado"
        )
    updated_ride = update_ride_location(
        db,
        ride_id=id,
        lat=location_in.current_lat,
        lng=location_in.current_lng
    )
    return updated_ride

@router.get("/{id}/track", response_model=RideTrackOut)
def track_ride(
    *,
    db: Session = Depends(get_db),
    id: str
) -> Any:
    """
    Retrieve real-time coordinates of the ride.
    """
    db_ride = get_ride_by_id(db, ride_id=id)
    if not db_ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Viaje no encontrado"
        )
    return db_ride
