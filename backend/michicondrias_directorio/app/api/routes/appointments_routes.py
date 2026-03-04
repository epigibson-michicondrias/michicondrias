from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.crud import crud_services
from app.crud.crud_clinic import get_clinic
from app.api import deps
from app.db.session import get_db
from app.schemas.services import (
    AppointmentCreate, AppointmentResponse, AppointmentCancel, AppointmentReschedule,
    AvailableSlot,
)

router = APIRouter()


@router.get("/clinics/{clinic_id}/slots", response_model=List[AvailableSlot])
def read_available_slots(
    clinic_id: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    service_id: str = Query(..., description="Service ID to calculate slot duration"),
    db: Session = Depends(get_db),
) -> Any:
    """Get available time slots for a specific clinic, date, and service (Public)."""
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    return crud_services.get_available_slots(db, clinic_id, date, service_id)


@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    *,
    db: Session = Depends(get_db),
    appt_in: AppointmentCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Book a new appointment (Consumer)."""
    try:
        appt = crud_services.create_appointment(db, user_id, appt_in)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    # Enrich response
    svc = crud_services.get_service(db, appt.service_id)
    clinic = get_clinic(db, appt.clinic_id)
    return _serialize_appointment(appt, svc, clinic)


from app.models.clinic import Clinic
from app.models.services import ClinicService

@router.get("/me", response_model=List[AppointmentResponse])
def read_my_appointments(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Get all appointments for the current user (Consumer)."""
    appointments = crud_services.get_user_appointments(db, user_id)
    if not appointments:
        return []

    # Bulk fetch related data to avoid N+1 queries
    service_ids = list({a.service_id for a in appointments})
    clinic_ids = list({a.clinic_id for a in appointments})
    
    services = db.query(ClinicService).filter(ClinicService.id.in_(service_ids)).all() if service_ids else []
    clinics = db.query(Clinic).filter(Clinic.id.in_(clinic_ids)).all() if clinic_ids else []
    
    svc_map = {s.id: s for s in services}
    clinic_map = {c.id: c for c in clinics}

    result = []
    for appt in appointments:
        svc = svc_map.get(appt.service_id)
        clinic = clinic_map.get(appt.clinic_id)
        result.append(_serialize_appointment(appt, svc, clinic))
    return result


@router.get("/clinic/{clinic_id}", response_model=List[AppointmentResponse])
def read_clinic_appointments(
    clinic_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Get all appointments for a clinic (Owner only)."""
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede ver las citas")
        
    appointments = crud_services.get_clinic_appointments(db, clinic_id, status)
    if not appointments:
        return []
        
    # Bulk fetch services
    service_ids = list({a.service_id for a in appointments})
    services = db.query(ClinicService).filter(ClinicService.id.in_(service_ids)).all() if service_ids else []
    svc_map = {s.id: s for s in services}

    result = []
    for appt in appointments:
        svc = svc_map.get(appt.service_id)
        result.append(_serialize_appointment(appt, svc, clinic))
    return result


@router.put("/{appointment_id}/confirm", response_model=AppointmentResponse)
def confirm_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Confirm an appointment (Owner only)."""
    appt = crud_services.get_appointment(db, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    clinic = get_clinic(db, appt.clinic_id)
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede confirmar citas")
    appt = crud_services.update_appointment_status(db, appointment_id, "confirmed")
    svc = crud_services.get_service(db, appt.service_id)
    return _serialize_appointment(appt, svc, clinic)


@router.put("/{appointment_id}/complete", response_model=AppointmentResponse)
def complete_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Mark appointment as completed (Owner only)."""
    appt = crud_services.get_appointment(db, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    clinic = get_clinic(db, appt.clinic_id)
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede completar citas")
    appt = crud_services.update_appointment_status(db, appointment_id, "completed")
    svc = crud_services.get_service(db, appt.service_id)
    return _serialize_appointment(appt, svc, clinic)


@router.put("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: str,
    *,
    db: Session = Depends(get_db),
    cancel_in: AppointmentCancel,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Cancel an appointment (Consumer or Owner)."""
    appt = crud_services.get_appointment(db, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    clinic = get_clinic(db, appt.clinic_id)
    # Both consumer and owner can cancel
    if appt.user_id != user_id and clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para cancelar esta cita")
    appt = crud_services.update_appointment_status(db, appointment_id, "cancelled", cancel_in.cancellation_reason)
    svc = crud_services.get_service(db, appt.service_id)
    return _serialize_appointment(appt, svc, clinic)


@router.put("/{appointment_id}/reschedule", response_model=AppointmentResponse)
def reschedule_appointment(
    appointment_id: str,
    *,
    db: Session = Depends(get_db),
    reschedule_in: AppointmentReschedule,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Reschedule an appointment to a new date/time (Consumer)."""
    appt = crud_services.get_appointment(db, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if appt.user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo puedes reagendar tus propias citas")
    try:
        appt = crud_services.reschedule_appointment(db, appointment_id, reschedule_in.date, reschedule_in.start_time)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    svc = crud_services.get_service(db, appt.service_id)
    clinic = get_clinic(db, appt.clinic_id)
    return _serialize_appointment(appt, svc, clinic)


# --- Helpers ---

def _serialize_appointment(appt, svc, clinic):
    return {
        "id": appt.id,
        "clinic_id": appt.clinic_id,
        "service_id": appt.service_id,
        "pet_id": appt.pet_id,
        "user_id": appt.user_id,
        "vet_id": appt.vet_id,
        "date": appt.date.isoformat() if appt.date else "",
        "start_time": appt.start_time.strftime("%H:%M") if appt.start_time else "",
        "end_time": appt.end_time.strftime("%H:%M") if appt.end_time else "",
        "status": appt.status,
        "notes": appt.notes,
        "cancellation_reason": appt.cancellation_reason,
        "created_at": appt.created_at,
        "service_name": svc.name if svc else None,
        "clinic_name": clinic.name if clinic else None,
    }
