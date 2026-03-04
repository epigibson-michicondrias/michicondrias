from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud import crud_services
from app.api import deps
from app.db.session import get_db
from app.schemas.services import (
    ClinicScheduleCreate, ClinicScheduleResponse,
    ScheduleExceptionCreate, ScheduleExceptionResponse,
)
from app.crud.crud_clinic import get_clinic

router = APIRouter()


@router.get("/clinics/{clinic_id}/schedule", response_model=List[ClinicScheduleResponse])
def read_clinic_schedule(
    clinic_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """Get the weekly schedule for a clinic (Public)."""
    schedules = crud_services.get_clinic_schedule(db, clinic_id)
    result = []
    for s in schedules:
        result.append({
            "id": s.id,
            "clinic_id": s.clinic_id,
            "day_of_week": s.day_of_week,
            "start_time": s.start_time.strftime("%H:%M") if s.start_time else "",
            "end_time": s.end_time.strftime("%H:%M") if s.end_time else "",
            "slot_duration_minutes": s.slot_duration_minutes,
            "is_active": s.is_active,
        })
    return result


@router.post("/clinics/{clinic_id}/schedule", response_model=List[ClinicScheduleResponse])
def set_schedule(
    clinic_id: str,
    *,
    db: Session = Depends(get_db),
    schedules_in: List[ClinicScheduleCreate],
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Set the entire weekly schedule for a clinic (Owner only)."""
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede configurar el horario")

    results = crud_services.set_clinic_schedule(db, clinic_id, schedules_in)
    return [
        {
            "id": s.id,
            "clinic_id": s.clinic_id,
            "day_of_week": s.day_of_week,
            "start_time": s.start_time.strftime("%H:%M") if s.start_time else "",
            "end_time": s.end_time.strftime("%H:%M") if s.end_time else "",
            "slot_duration_minutes": s.slot_duration_minutes,
            "is_active": s.is_active,
        }
        for s in results
    ]


@router.get("/clinics/{clinic_id}/schedule/exceptions", response_model=List[ScheduleExceptionResponse])
def read_exceptions(
    clinic_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """Get schedule exceptions/holidays for a clinic."""
    excs = crud_services.get_schedule_exceptions(db, clinic_id)
    result = []
    for e in excs:
        result.append({
            "id": e.id,
            "clinic_id": e.clinic_id,
            "date": e.date.isoformat() if e.date else "",
            "is_closed": e.is_closed,
            "custom_start": e.custom_start.strftime("%H:%M") if e.custom_start else None,
            "custom_end": e.custom_end.strftime("%H:%M") if e.custom_end else None,
            "reason": e.reason,
        })
    return result


@router.post("/clinics/{clinic_id}/schedule/exceptions", response_model=ScheduleExceptionResponse)
def create_exception(
    clinic_id: str,
    *,
    db: Session = Depends(get_db),
    exc_in: ScheduleExceptionCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Add a schedule exception/holiday (Owner only)."""
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede agregar excepciones")

    exc = crud_services.create_schedule_exception(db, clinic_id, exc_in)
    return {
        "id": exc.id,
        "clinic_id": exc.clinic_id,
        "date": exc.date.isoformat() if exc.date else "",
        "is_closed": exc.is_closed,
        "custom_start": exc.custom_start.strftime("%H:%M") if exc.custom_start else None,
        "custom_end": exc.custom_end.strftime("%H:%M") if exc.custom_end else None,
        "reason": exc.reason,
    }
