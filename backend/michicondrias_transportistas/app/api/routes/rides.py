from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import math

from app.api import deps
from app.db.session import get_db
from app.crud import crud_ride
from app.schemas.ride import (
    PetRideCreate,
    PetRideOut,
    RideLocationUpdate,
    RideTrackOut,
    DriverProfileCreate,
    DriverProfileOut,
    RideEstimateRequest,
    RideEstimateOut,
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
        db_ride = crud_ride.create_ride(db, ride_in=ride_in)
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
    db_ride = crud_ride.get_ride_by_id(db, ride_id=id)
    if not db_ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Viaje no encontrado"
        )
    updated_ride = crud_ride.update_ride_location(
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
    db_ride = crud_ride.get_ride_by_id(db, ride_id=id)
    if not db_ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Viaje no encontrado"
        )
    return db_ride


# Driver Profile Endpoints
@router.post("/driver-profile", response_model=DriverProfileOut)
def update_my_driver_profile(
    *,
    db: Session = Depends(get_db),
    profile_in: DriverProfileCreate,
    current_user_id: str = Depends(deps.require_transportista)
) -> Any:
    """
    Create or update driver settings/vehicle info. Requires 'transportista' role.
    """
    return crud_ride.create_or_update_driver_profile(db=db, profile_in=profile_in, driver_id=current_user_id)


@router.get("/driver-profile", response_model=DriverProfileOut)
def get_my_driver_profile(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_transportista)
) -> Any:
    """
    Get current logged-in driver's settings. Requires 'transportista' role.
    """
    profile = crud_ride.get_driver_profile(db=db, driver_id=current_user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró un perfil de transportista configurado"
        )
    return profile


@router.get("/drivers/available", response_model=List[DriverProfileOut])
def read_available_drivers(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all transportistas who are currently active and available. Public endpoint.
    """
    return crud_ride.get_available_drivers(db=db)


# Ride fare estimation endpoint
@router.post("/estimate", response_model=RideEstimateOut)
def estimate_fare(
    *,
    estimate_req: RideEstimateRequest
) -> Any:
    """
    Calculate estimated fare and duration based on travel distance. Public endpoint.
    """
    # Simple Euclidean distance approximation multiplied by ~111 to convert degrees to km
    dx = estimate_req.destination_lat - estimate_req.origin_lat
    dy = estimate_req.destination_lng - estimate_req.origin_lng
    distance_km = math.sqrt(dx*dx + dy*dy) * 111.0
    
    # 2.5 minutes per km on average (24 km/h speed in city)
    duration_min = distance_km * 2.5
    
    # Base price is 50 pesos, plus 15 pesos per kilometer
    base_fare = 50.0
    per_km_rate = 15.0
    estimated_fare = base_fare + (distance_km * per_km_rate)
    
    # Extra 20 pesos if driver must provide a carrier box
    if estimate_req.requires_carrier:
        estimated_fare += 20.0

    return RideEstimateOut(
        distance_km=round(distance_km, 2),
        estimated_duration_minutes=round(duration_min, 1),
        estimated_fare=round(estimated_fare, 2)
    )
