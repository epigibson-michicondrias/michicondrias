"""
Viajes de mascotas (transportistas).

Flujo: cliente pide viaje (pending) -> conductor lo acepta (accepted) o lo rechaza (rejected, solo
si iba dirigido a él) -> inicia (in_transit) -> completa (completed) -> el cliente califica.
Cancelación: el cliente puede cancelar en pending/accepted; el conductor puede liberar un viaje
aceptado (vuelve a pending, abierto a otros conductores). Toda transición se valida (409) y se
ejecuta con bloqueo de fila para evitar carreras (dos conductores aceptando el mismo viaje).
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import math
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import bindparam, func, or_, text
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.crud import crud_ride
from app.db.session import get_db
from app.models.ride import DriverProfile, PetRide
from app.schemas.ride import (
    DriverProfileCreate,
    DriverProfileOut,
    PetRideCreate,
    PetRideOut,
    RideCancelIn,
    RideEstimateOut,
    RideEstimateRequest,
    RideLocationUpdate,
    RideRateIn,
    RideStatus as S,
    RideTrackOut,
)

router = APIRouter()
logger = logging.getLogger("michicondrias")

MIN_TRIP_KM = 0.05


# ─────────────────────────── helpers ───────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(min(1.0, math.sqrt(a)))


def _compute_fare(distance_km: Optional[float], requires_carrier: bool) -> float:
    """Tarifa decidida por el servidor. Sin coordenadas solo se cobra base (+ transportín)."""
    fare = settings.RIDE_BASE_FARE
    if distance_km is not None:
        fare += distance_km * settings.RIDE_PER_KM_RATE
    if requires_carrier:
        fare += settings.RIDE_CARRIER_FEE
    return round(max(fare, settings.RIDE_MIN_FARE if distance_km is not None else 0.0), 2)


def _notify(db: Session, user_id: Optional[str], title: str, message: str, ntype: str = "transportistas") -> None:
    """Notificación en la bandeja del usuario (misma BD que core). Nunca debe romper el flujo principal."""
    if not user_id:
        return
    try:
        db.execute(text(
            "INSERT INTO notifications (id, user_id, title, message, type, is_read) "
            "VALUES (:id, :uid, :title, :msg, :type, false)"
        ), {"id": str(uuid.uuid4()), "uid": user_id, "title": title, "msg": message, "type": ntype})
        db.commit()
    except Exception:
        db.rollback()
        logger.warning("No se pudo insertar la notificación para %s", user_id)


def _pet_rows(db: Session, pet_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    ids = list({p for p in pet_ids if p})
    if not ids:
        return {}
    try:
        rows = db.execute(
            text("SELECT id, name, owner_id FROM pets WHERE id IN :ids").bindparams(bindparam("ids", expanding=True)),
            {"ids": ids},
        ).fetchall()
        return {r[0]: {"name": r[1], "owner_id": r[2]} for r in rows}
    except Exception:
        db.rollback()
        return {}


def _user_names(db: Session, user_ids: List[Optional[str]]) -> Dict[str, str]:
    ids = list({u for u in user_ids if u})
    if not ids:
        return {}
    try:
        rows = db.execute(
            text("SELECT id, full_name FROM users WHERE id IN :ids").bindparams(bindparam("ids", expanding=True)),
            {"ids": ids},
        ).fetchall()
        return {r[0]: r[1] for r in rows if r[1]}
    except Exception:
        db.rollback()
        return {}


def _pet_owner_id(db: Session, pet_id: str) -> Optional[str]:
    row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": pet_id}).first()
    return row[0] if row else None


def _client_of(ride: PetRide, pets: Dict[str, Dict[str, Any]]) -> Optional[str]:
    return ride.client_id or (pets.get(ride.pet_id) or {}).get("owner_id")


def _viewer_role(ride: PetRide, uid: str, role: str, pets: Dict[str, Dict[str, Any]]) -> Optional[str]:
    if _client_of(ride, pets) == uid:
        return "client"
    if ride.driver_id == uid:
        return "driver"
    if role == "admin":
        return "admin"
    if role == "transportista" and ride.status == S.PENDING and (ride.driver_id is None or ride.driver_id == uid):
        if ride.preferred_driver_id in (None, uid):
            return "candidate"
    return None


def _rides_out(
    db: Session,
    rides: List[PetRide],
    uid: str,
    role: str,
    pickup_distances: Optional[Dict[str, float]] = None,
) -> List[PetRideOut]:
    pets = _pet_rows(db, [r.pet_id for r in rides])
    users = _user_names(db, [_client_of(r, pets) for r in rides] + [r.driver_id for r in rides])
    driver_ids = list({r.driver_id for r in rides if r.driver_id})
    profiles: Dict[str, DriverProfile] = {}
    if driver_ids:
        for p in db.query(DriverProfile).filter(DriverProfile.driver_id.in_(driver_ids)).all():
            profiles[p.driver_id] = p
    out: List[PetRideOut] = []
    for r in rides:
        o = PetRideOut.model_validate(r)
        client_id = _client_of(r, pets)
        o.client_id = client_id
        o.pet_name = (pets.get(r.pet_id) or {}).get("name")
        o.client_name = users.get(client_id) if client_id else None
        o.driver_name = users.get(r.driver_id) if r.driver_id else None
        prof = profiles.get(r.driver_id) if r.driver_id else None
        if prof:
            o.vehicle_model = prof.vehicle_model
            o.vehicle_plate = prof.vehicle_plate
        vr = _viewer_role(r, uid, role, pets)
        o.viewer_role = vr
        o.can_cancel = bool(
            (vr == "client" and r.status in (S.PENDING, S.ACCEPTED))
            or (vr == "driver" and r.status == S.ACCEPTED)
            or (vr == "admin" and r.status in S.ACTIVE)
        )
        o.can_rate = bool(vr == "client" and r.status == S.COMPLETED and r.rating is None)
        if pickup_distances is not None:
            o.pickup_distance_km = pickup_distances.get(r.id)
        out.append(o)
    return out


def _status_filter(query, value: Optional[str]):
    """`active` (pending/accepted/in_transit), `history` (completed/cancelled/rejected) o un estado concreto."""
    if not value or value == "all":
        return query
    if value == "active":
        return query.filter(PetRide.status.in_(S.ACTIVE))
    if value == "history":
        return query.filter(PetRide.status.in_((S.COMPLETED, S.CANCELLED, S.REJECTED)))
    if value not in S.ALL:
        raise HTTPException(status_code=422, detail="Estado de filtro inválido")
    return query.filter(PetRide.status == value)


def _locked_ride(db: Session, ride_id: str) -> PetRide:
    ride = db.query(PetRide).filter(PetRide.id == ride_id).with_for_update().first()
    if not ride:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    return ride


def _conflict(ride: PetRide, expected: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"El viaje está '{ride.status}' y no puede pasar a '{expected}'",
    )


def _short(ride: PetRide) -> str:
    return f"{ride.origin_address} → {ride.destination_address}"


def _driver_rating(db: Session, driver_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    if not driver_ids:
        return {}
    rows = db.query(PetRide.driver_id, func.avg(PetRide.rating), func.count(PetRide.rating)).filter(
        PetRide.driver_id.in_(driver_ids), PetRide.rating.isnot(None)
    ).group_by(PetRide.driver_id).all()
    return {r[0]: {"avg": round(float(r[1]), 2), "count": int(r[2])} for r in rows}


def _profile_out(db: Session, profiles: List[DriverProfile]) -> List[DriverProfileOut]:
    ratings = _driver_rating(db, [p.driver_id for p in profiles])
    out = []
    for p in profiles:
        o = DriverProfileOut.model_validate(p)
        rt = ratings.get(p.driver_id)
        o.rating_avg = rt["avg"] if rt else None
        o.rating_count = rt["count"] if rt else 0
        out.append(o)
    return out


# ─────────────────────────── cliente ───────────────────────────

@router.post("/request", response_model=PetRideOut, status_code=status.HTTP_201_CREATED)
def request_ride(
    *,
    db: Session = Depends(get_db),
    ride_in: PetRideCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Pide un viaje para una mascota propia. El servidor calcula distancia y tarifa; el conductor lo
    asigna/acepta el conductor. `preferred_driver_id` (o el legado `driver_id`) solo dirige la
    solicitud a un conductor, no lo asigna.
    """
    owner = _pet_owner_id(db, ride_in.pet_id)
    if owner is None:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if owner != user_id:
        raise HTTPException(status_code=403, detail="Solo puedes pedir un viaje para tu propia mascota")

    o_has = ride_in.origin_lat is not None and ride_in.origin_lng is not None
    d_has = ride_in.destination_lat is not None and ride_in.destination_lng is not None
    if (ride_in.origin_lat is None) != (ride_in.origin_lng is None) or (
        ride_in.destination_lat is None
    ) != (ride_in.destination_lng is None):
        raise HTTPException(status_code=422, detail="Las coordenadas deben enviarse como pareja latitud/longitud")

    distance_km: Optional[float] = None
    if o_has and d_has:
        distance_km = round(
            _haversine_km(ride_in.origin_lat, ride_in.origin_lng, ride_in.destination_lat, ride_in.destination_lng), 2
        )
        if distance_km < MIN_TRIP_KM:
            raise HTTPException(status_code=422, detail="El origen y el destino son el mismo lugar")
        if distance_km > settings.RIDE_MAX_DISTANCE_KM:
            raise HTTPException(
                status_code=422,
                detail=f"La distancia máxima por viaje es {settings.RIDE_MAX_DISTANCE_KM:.0f} km",
            )

    scheduled = ride_in.scheduled_at
    if scheduled is not None:
        if scheduled.tzinfo is None:
            scheduled = scheduled.replace(tzinfo=timezone.utc)
        if scheduled < _now() - timedelta(minutes=5):
            raise HTTPException(status_code=422, detail="La fecha del viaje no puede estar en el pasado")
        if scheduled > _now() + timedelta(days=settings.RIDE_MAX_SCHEDULE_DAYS):
            raise HTTPException(
                status_code=422,
                detail=f"Solo puedes programar viajes con hasta {settings.RIDE_MAX_SCHEDULE_DAYS} días de anticipación",
            )

    active = db.query(PetRide.id).filter(PetRide.pet_id == ride_in.pet_id, PetRide.status.in_(S.ACTIVE)).first()
    if active:
        raise HTTPException(status_code=409, detail="Esta mascota ya tiene un viaje en curso o pendiente")

    preferred: Optional[str] = None
    candidate = ride_in.preferred_driver_id or ride_in.driver_id
    if candidate:
        prof = db.query(DriverProfile).filter(
            or_(DriverProfile.driver_id == candidate, DriverProfile.id == candidate)
        ).first()
        if prof and prof.driver_id != user_id:
            preferred = prof.driver_id
        elif ride_in.preferred_driver_id:
            raise HTTPException(status_code=404, detail="El conductor seleccionado no existe")

    ride = crud_ride.create_ride(
        db,
        client_id=user_id,
        pet_id=ride_in.pet_id,
        preferred_driver_id=preferred,
        origin_address=ride_in.origin_address.strip(),
        destination_address=ride_in.destination_address.strip(),
        requires_carrier=ride_in.requires_carrier,
        origin_lat=ride_in.origin_lat,
        origin_lng=ride_in.origin_lng,
        destination_lat=ride_in.destination_lat,
        destination_lng=ride_in.destination_lng,
        distance_km=distance_km,
        price=_compute_fare(distance_km, ride_in.requires_carrier),
        scheduled_at=scheduled,
        notes=(ride_in.notes or "").strip() or None,
    )

    # Avisar a conductores: al sugerido, o a los disponibles si el viaje está abierto.
    if preferred:
        targets = [preferred]
    else:
        targets = [
            p.driver_id for p in db.query(DriverProfile).filter(DriverProfile.is_available == True).limit(30).all()  # noqa: E712
        ]
    for t in targets:
        if t != user_id:
            _notify(db, t, "Nueva solicitud de transporte", f"{_short(ride)}. Revisa las solicitudes disponibles.")

    return _rides_out(db, [ride], user_id, "consumidor")[0]


@router.get("/my", response_model=List[PetRideOut])
def my_rides(
    *,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> Any:
    """Viajes que pedí como cliente (dueño de mascota). `status`: active | history | <estado>."""
    pet_ids = [r[0] for r in db.execute(text("SELECT id FROM pets WHERE owner_id = :u"), {"u": user_id}).fetchall()]
    cond = PetRide.client_id == user_id
    if pet_ids:
        cond = or_(cond, PetRide.pet_id.in_(pet_ids))
    q = _status_filter(db.query(PetRide).filter(cond), status_filter)
    rides = q.order_by(PetRide.created_at.desc().nullslast(), PetRide.id).offset(offset).limit(limit).all()
    return _rides_out(db, rides, user_id, role)


# ─────────────────────────── conductor ───────────────────────────

@router.get("/driver/requests", response_model=List[PetRideOut])
def driver_requests(
    *,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.require_transportista),
    role: str = Depends(deps.get_current_user_role),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lng: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: Optional[float] = Query(None, gt=0, le=1000),
    limit: int = Query(50, ge=1, le=100),
) -> Any:
    """
    Solicitudes pendientes que puede tomar el conductor: abiertas o dirigidas a él. Con lat/lng
    se ordenan por cercanía y se filtran por radio (los viajes sin coordenadas de origen se
    incluyen sin distancia).
    """
    horizon = _now() - timedelta(hours=24)
    rides = (
        db.query(PetRide)
        .filter(
            PetRide.status == S.PENDING,
            or_(
                (PetRide.driver_id.is_(None)) & (or_(PetRide.preferred_driver_id.is_(None), PetRide.preferred_driver_id == user_id)),
                PetRide.driver_id == user_id,  # viajes dirigidos con el flujo anterior
            ),
            or_(PetRide.created_at.is_(None), PetRide.created_at >= horizon, PetRide.scheduled_at >= _now()),
            or_(PetRide.client_id.is_(None), PetRide.client_id != user_id),
        )
        .order_by(PetRide.created_at.desc().nullslast())
        .limit(300)
        .all()
    )
    dists: Optional[Dict[str, float]] = None
    if lat is not None and lng is not None:
        radius = radius_km or settings.RIDE_NEARBY_RADIUS_KM
        dists = {}
        kept = []
        for r in rides:
            if r.origin_lat is not None and r.origin_lng is not None:
                d = round(_haversine_km(lat, lng, r.origin_lat, r.origin_lng), 2)
                if d > radius:
                    continue
                dists[r.id] = d
            kept.append(r)
        rides = sorted(kept, key=lambda r: (dists.get(r.id) is None, dists.get(r.id) or 0))
    return _rides_out(db, rides[:limit], user_id, role, dists)


@router.get("/driver/mine", response_model=List[PetRideOut])
def driver_rides(
    *,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.require_transportista),
    role: str = Depends(deps.get_current_user_role),
    status_filter: Optional[str] = Query("active", alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> Any:
    """Viajes asignados al conductor. `status`: active (por defecto) | history | <estado> | all."""
    q = _status_filter(db.query(PetRide).filter(PetRide.driver_id == user_id), status_filter)
    rides = q.order_by(PetRide.created_at.desc().nullslast(), PetRide.id).offset(offset).limit(limit).all()
    return _rides_out(db, rides, user_id, role)


@router.get("/history/driver", response_model=dict)
def read_driver_ride_history(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_transportista),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Viajes completados del conductor con ganancias acumuladas y calificación promedio."""
    rides = (
        db.query(PetRide)
        .filter(PetRide.driver_id == current_user_id, PetRide.status == S.COMPLETED)
        .order_by(PetRide.completed_at.desc().nullslast(), PetRide.id)
        .limit(500)
        .all()
    )
    total_earnings = sum(r.price for r in rides if r.price)
    rt = _driver_rating(db, [current_user_id]).get(current_user_id)
    return {
        "driver_id": current_user_id,
        "total_earnings": round(total_earnings, 2),
        "rides_count": len(rides),
        "rating_avg": rt["avg"] if rt else None,
        "rating_count": rt["count"] if rt else 0,
        "rides": [o.model_dump(mode="json") for o in _rides_out(db, rides, current_user_id, role)],
    }


@router.post("/driver-profile", response_model=DriverProfileOut)
def update_my_driver_profile(
    *,
    db: Session = Depends(get_db),
    profile_in: DriverProfileCreate,
    current_user_id: str = Depends(deps.require_transportista),
) -> Any:
    """Crea o actualiza los datos del vehículo. Requiere rol transportista."""
    profile = crud_ride.create_or_update_driver_profile(db=db, profile_in=profile_in, driver_id=current_user_id)
    return _profile_out(db, [profile])[0]


@router.get("/driver-profile", response_model=DriverProfileOut)
def get_my_driver_profile(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_transportista),
) -> Any:
    """Perfil del conductor autenticado. Requiere rol transportista."""
    profile = crud_ride.get_driver_profile(db=db, driver_id=current_user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró un perfil de transportista configurado",
        )
    return _profile_out(db, [profile])[0]


@router.get("/drivers/available", response_model=List[DriverProfileOut])
def read_available_drivers(
    db: Session = Depends(get_db),
    _user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Transportistas activos y disponibles. Requiere sesión (expone vehículo y placa)."""
    return _profile_out(db, crud_ride.get_available_drivers(db=db))


@router.post("/estimate", response_model=RideEstimateOut)
def estimate_fare(*, estimate_req: RideEstimateRequest) -> Any:
    """Tarifa y duración estimadas por distancia (haversine). Parámetros en settings."""
    distance_km = _haversine_km(
        estimate_req.origin_lat, estimate_req.origin_lng, estimate_req.destination_lat, estimate_req.destination_lng
    )
    if distance_km > settings.RIDE_MAX_DISTANCE_KM:
        raise HTTPException(
            status_code=422, detail=f"La distancia máxima por viaje es {settings.RIDE_MAX_DISTANCE_KM:.0f} km"
        )
    duration_min = distance_km / settings.RIDE_AVG_SPEED_KMH * 60.0
    return RideEstimateOut(
        distance_km=round(distance_km, 2),
        estimated_duration_minutes=round(duration_min, 1),
        estimated_fare=_compute_fare(distance_km, bool(estimate_req.requires_carrier)),
    )


# ─────────────────────────── transiciones ───────────────────────────

@router.post("/{ride_id}/accept", response_model=PetRideOut)
def accept_ride(
    ride_id: str,
    *,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.require_transportista),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """El conductor acepta un viaje pendiente (abierto o dirigido a él)."""
    ride = _locked_ride(db, ride_id)
    if ride.client_id == user_id:
        db.rollback()
        raise HTTPException(status_code=403, detail="No puedes aceptar tu propio viaje")
    if ride.status != S.PENDING or ride.driver_id not in (None, user_id) or ride.preferred_driver_id not in (None, user_id):
        db.rollback()
        raise HTTPException(status_code=409, detail="Este viaje ya no está disponible")
    if not crud_ride.get_driver_profile(db, user_id):
        db.rollback()
        raise HTTPException(status_code=409, detail="Configura tu perfil de vehículo antes de aceptar viajes")
    busy = db.query(PetRide.id).filter(PetRide.driver_id == user_id, PetRide.status == S.IN_TRANSIT).first()
    if busy:
        db.rollback()
        raise HTTPException(status_code=409, detail="Termina tu viaje en curso antes de aceptar otro")
    ride.status = S.ACCEPTED
    ride.driver_id = user_id
    ride.accepted_at = _now()
    db.commit()
    db.refresh(ride)
    out = _rides_out(db, [ride], user_id, role)[0]
    _notify(db, out.client_id, "Tu viaje fue aceptado", f"{out.driver_name or 'Un conductor'} va por {out.pet_name or 'tu mascota'}. {_short(ride)}")
    return out


@router.post("/{ride_id}/reject", response_model=PetRideOut)
def reject_ride(
    ride_id: str,
    body: Optional[RideCancelIn] = None,
    *,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.require_transportista),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """El conductor rechaza una solicitud dirigida a él (las abiertas simplemente se ignoran)."""
    ride = _locked_ride(db, ride_id)
    if user_id not in (ride.preferred_driver_id, ride.driver_id):
        db.rollback()
        raise HTTPException(status_code=403, detail="Esta solicitud no fue dirigida a ti")
    if ride.status != S.PENDING:
        db.rollback()
        raise _conflict(ride, S.REJECTED)
    ride.status = S.REJECTED
    ride.cancelled_at = _now()
    ride.cancelled_by = user_id
    ride.cancel_reason = (body.reason if body else None) or None
    db.commit()
    db.refresh(ride)
    out = _rides_out(db, [ride], user_id, role)[0]
    _notify(db, out.client_id, "Solicitud rechazada", f"El conductor no pudo tomar tu viaje ({_short(ride)}). Puedes pedirlo de nuevo.")
    return out


@router.post("/{ride_id}/cancel", response_model=PetRideOut)
def cancel_ride(
    ride_id: str,
    body: Optional[RideCancelIn] = None,
    *,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """
    Cliente: cancela en pending/accepted (no en curso). Conductor: libera un viaje aceptado (vuelve
    a quedar abierto). Admin: cancela cualquier viaje activo.
    """
    ride = _locked_ride(db, ride_id)
    pets = _pet_rows(db, [ride.pet_id])
    vr = _viewer_role(ride, user_id, role, pets)
    if vr not in ("client", "driver", "admin"):
        db.rollback()
        raise HTTPException(status_code=403, detail="No tienes acceso a este viaje")
    reason = ((body.reason if body else None) or "").strip() or None
    client_id = _client_of(ride, pets)
    driver_id = ride.driver_id
    short = _short(ride)

    if vr == "driver" and role != "admin":
        if ride.status != S.ACCEPTED:
            db.rollback()
            raise HTTPException(status_code=409, detail="Solo puedes liberar un viaje que ya aceptaste y no ha iniciado")
        ride.status = S.PENDING
        ride.driver_id = None
        ride.preferred_driver_id = None
        ride.accepted_at = None
        ride.current_lat = None
        ride.current_lng = None
        db.commit()
        db.refresh(ride)
        _notify(db, client_id, "El conductor canceló", f"Tu viaje ({short}) volvió a buscar conductor.")
        notify_msg = None
    else:
        allowed = S.ACTIVE if vr == "admin" else (S.PENDING, S.ACCEPTED)
        if ride.status not in allowed:
            db.rollback()
            if ride.status == S.IN_TRANSIT:
                raise HTTPException(status_code=409, detail="El viaje ya está en curso y no se puede cancelar")
            raise _conflict(ride, S.CANCELLED)
        ride.status = S.CANCELLED
        ride.cancelled_at = _now()
        ride.cancelled_by = user_id
        ride.cancel_reason = reason
        db.commit()
        db.refresh(ride)
        notify_msg = True

    out = _rides_out(db, [ride], user_id, role)[0]
    if notify_msg:
        counterpart = driver_id if user_id == client_id else client_id
        _notify(db, counterpart, "Viaje cancelado", f"Se canceló el viaje ({short}).{(' Motivo: ' + reason) if reason else ''}")
    return out


@router.post("/{ride_id}/start", response_model=PetRideOut)
def start_ride(
    ride_id: str,
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_transportista),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Inicia el viaje aceptado (accepted -> in_transit). Solo su conductor."""
    ride = _locked_ride(db, ride_id)
    if ride.driver_id != current_user_id:
        db.rollback()
        raise HTTPException(status_code=403, detail="No eres el conductor de este viaje")
    if ride.status != S.ACCEPTED:
        db.rollback()
        raise _conflict(ride, S.IN_TRANSIT)
    busy = db.query(PetRide.id).filter(
        PetRide.driver_id == current_user_id, PetRide.status == S.IN_TRANSIT, PetRide.id != ride.id
    ).first()
    if busy:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ya tienes otro viaje en curso")
    ride.status = S.IN_TRANSIT
    ride.started_at = _now()
    db.commit()
    db.refresh(ride)
    out = _rides_out(db, [ride], current_user_id, role)[0]
    _notify(db, out.client_id, "Tu viaje comenzó", f"{out.pet_name or 'Tu mascota'} va en camino. Puedes seguirlo en tiempo real.")
    return out


@router.post("/{ride_id}/finish", response_model=PetRideOut)
def finish_ride(
    ride_id: str,
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_transportista),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Completa el viaje (in_transit -> completed). Solo su conductor."""
    ride = _locked_ride(db, ride_id)
    if ride.driver_id != current_user_id:
        db.rollback()
        raise HTTPException(status_code=403, detail="No eres el conductor de este viaje")
    if ride.status != S.IN_TRANSIT:
        db.rollback()
        raise _conflict(ride, S.COMPLETED)
    ride.status = S.COMPLETED
    ride.completed_at = _now()
    db.commit()
    db.refresh(ride)
    out = _rides_out(db, [ride], current_user_id, role)[0]
    _notify(db, out.client_id, "Viaje completado", f"{out.pet_name or 'Tu mascota'} llegó a su destino. Califica al conductor.")
    return out


@router.post("/{ride_id}/rate", response_model=PetRideOut)
def rate_ride(
    ride_id: str,
    body: RideRateIn,
    *,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """El cliente califica (1-5) un viaje completado, una sola vez."""
    ride = _locked_ride(db, ride_id)
    pets = _pet_rows(db, [ride.pet_id])
    if _client_of(ride, pets) != user_id:
        db.rollback()
        raise HTTPException(status_code=403, detail="Solo quien pidió el viaje puede calificarlo")
    if ride.status != S.COMPLETED:
        db.rollback()
        raise HTTPException(status_code=409, detail="Solo puedes calificar viajes completados")
    if ride.rating is not None:
        db.rollback()
        raise HTTPException(status_code=409, detail="Este viaje ya fue calificado")
    ride.rating = body.rating
    ride.rating_comment = (body.comment or "").strip() or None
    ride.rated_at = _now()
    db.commit()
    db.refresh(ride)
    _notify(db, ride.driver_id, "Recibiste una calificación", f"Calificaron tu viaje con {body.rating}/5.")
    return _rides_out(db, [ride], user_id, role)[0]


# ─────────────────────────── seguimiento y detalle ───────────────────────────

@router.patch("/{id}/location", response_model=PetRideOut)
def update_location(
    *,
    db: Session = Depends(get_db),
    id: str,
    location_in: RideLocationUpdate,
    user_id: str = Depends(deps.require_transportista),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Actualiza la posición del conductor. Solo en viajes aceptados o en curso."""
    ride = crud_ride.get_ride_by_id(db, ride_id=id)
    if not ride:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    if ride.driver_id != user_id:
        raise HTTPException(status_code=403, detail="No eres el conductor de este viaje")
    if ride.status not in (S.ACCEPTED, S.IN_TRANSIT):
        raise HTTPException(status_code=409, detail="Solo se comparte ubicación en viajes aceptados o en curso")
    updated = crud_ride.update_ride_location(db, ride_id=id, lat=location_in.current_lat, lng=location_in.current_lng)
    return _rides_out(db, [updated], user_id, role)[0]


@router.get("/{id}/track", response_model=RideTrackOut)
def track_ride(
    *,
    db: Session = Depends(get_db),
    id: str,
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Estado y posición del viaje. Solo el conductor, el dueño de la mascota o un admin."""
    ride = crud_ride.get_ride_by_id(db, ride_id=id)
    if not ride:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    pets = _pet_rows(db, [ride.pet_id])
    vr = _viewer_role(ride, user_id, role, pets)
    if vr not in ("client", "driver", "admin"):
        raise HTTPException(status_code=403, detail="No tienes acceso a este viaje")
    out = RideTrackOut.model_validate(ride)
    out.viewer_role = vr
    return out


@router.get("/{id}", response_model=PetRideOut)
def read_ride(
    *,
    db: Session = Depends(get_db),
    id: str,
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """Detalle de un viaje: cliente, conductor asignado, admin o transportista ante una solicitud abierta."""
    ride = crud_ride.get_ride_by_id(db, ride_id=id)
    if not ride:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    pets = _pet_rows(db, [ride.pet_id])
    if _viewer_role(ride, user_id, role, pets) is None:
        raise HTTPException(status_code=403, detail="No tienes acceso a este viaje")
    return _rides_out(db, [ride], user_id, role)[0]
