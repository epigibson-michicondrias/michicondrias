from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RideStatus:
    PENDING = "pending"
    ACCEPTED = "accepted"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    ALL = (PENDING, ACCEPTED, IN_TRANSIT, COMPLETED, CANCELLED, REJECTED)
    ACTIVE = (PENDING, ACCEPTED, IN_TRANSIT)


# Properties to receive via API on creation.
# El servidor calcula precio/distancia y NO acepta driver_id/precio/posición actual del cliente:
# `driver_id` se mantiene solo por compatibilidad con la app publicada y se interpreta como
# conductor *sugerido* (id de usuario o id de perfil); `price`, `current_lat` y `current_lng` se ignoran.
class PetRideCreate(BaseModel):
    pet_id: str = Field(..., max_length=36)
    origin_address: str = Field(..., min_length=3, max_length=255)
    destination_address: str = Field(..., min_length=3, max_length=255)
    requires_carrier: bool = True
    origin_lat: Optional[float] = Field(None, ge=-90, le=90)
    origin_lng: Optional[float] = Field(None, ge=-180, le=180)
    destination_lat: Optional[float] = Field(None, ge=-90, le=90)
    destination_lng: Optional[float] = Field(None, ge=-180, le=180)
    scheduled_at: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)
    preferred_driver_id: Optional[str] = Field(None, max_length=36)
    # Legado (ignorados o reinterpretados, ver arriba)
    driver_id: Optional[str] = Field(None, max_length=36)
    price: Optional[float] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None


# Properties to receive via API on location update
class RideLocationUpdate(BaseModel):
    current_lat: float = Field(..., ge=-90, le=90)
    current_lng: float = Field(..., ge=-180, le=180)


class RideCancelIn(BaseModel):
    reason: Optional[str] = Field(None, max_length=255)


class RideRateIn(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=500)


# Properties to receive via API on update (uso interno)
class PetRideUpdate(BaseModel):
    driver_id: Optional[str] = None
    pet_id: Optional[str] = None
    origin_address: Optional[str] = None
    destination_address: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    requires_carrier: Optional[bool] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None


# Respuesta de viaje. Los campos originales se conservan; el resto son opcionales.
class PetRideOut(BaseModel):
    id: str
    driver_id: Optional[str] = None
    pet_id: str
    origin_address: str
    destination_address: str
    status: str
    price: Optional[float] = None
    requires_carrier: bool = True
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    # Extras
    client_id: Optional[str] = None
    preferred_driver_id: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    distance_km: Optional[float] = None
    scheduled_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancelled_by: Optional[str] = None
    cancel_reason: Optional[str] = None
    rating: Optional[int] = None
    rating_comment: Optional[str] = None
    # Enriquecidos por el servidor
    pet_name: Optional[str] = None
    client_name: Optional[str] = None
    driver_name: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_plate: Optional[str] = None
    # Perspectiva de quien consulta: "client" | "driver" | "admin" | "candidate" (conductor que ve una solicitud abierta)
    viewer_role: Optional[str] = None
    can_cancel: Optional[bool] = None
    can_rate: Optional[bool] = None
    # Distancia del conductor al origen (solo /driver/requests con lat/lng)
    pickup_distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class RideTrackOut(BaseModel):
    id: str
    status: str
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    # Extras opcionales
    origin_address: Optional[str] = None
    destination_address: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    driver_id: Optional[str] = None
    viewer_role: Optional[str] = None

    class Config:
        from_attributes = True


# DriverProfile Schemas
class DriverProfileCreate(BaseModel):
    vehicle_model: str = Field(..., min_length=1, max_length=100)
    vehicle_plate: str = Field(..., min_length=1, max_length=30)
    max_capacity: Optional[int] = Field(1, ge=1, le=20)
    has_air_conditioning: Optional[bool] = False
    has_carriers: Optional[bool] = False
    is_available: Optional[bool] = True

class DriverProfileOut(BaseModel):
    rating_avg: Optional[float] = None
    rating_count: Optional[int] = None
    id: str
    driver_id: str
    vehicle_model: str
    vehicle_plate: str
    max_capacity: int
    has_air_conditioning: bool
    has_carriers: bool
    is_available: bool
    updated_at: datetime

    class Config:
        from_attributes = True


# RideEstimate Schemas
class RideEstimateRequest(BaseModel):
    origin_lat: float = Field(..., ge=-90, le=90)
    origin_lng: float = Field(..., ge=-180, le=180)
    destination_lat: float = Field(..., ge=-90, le=90)
    destination_lng: float = Field(..., ge=-180, le=180)
    requires_carrier: Optional[bool] = True

class RideEstimateOut(BaseModel):
    distance_km: float
    estimated_duration_minutes: float
    estimated_fare: float
