from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.db.session import get_db
from app.api import deps
from app.crud import dashboard_crud
from pydantic import BaseModel, ConfigDict
from typing import Optional, List as PydanticList
from datetime import datetime
from uuid import UUID
from sqlalchemy import text
from app.crud.crud_services import notify_user

router = APIRouter()


def _assert_clinic_owner(db: Session, clinic_id: str, user_id: str) -> None:
    """Las cirugías son datos clínicos: solo el dueño de la clínica puede verlas o programarlas."""
    from app.crud.crud_clinic import get_clinic
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos sobre esta clínica")

# Schema for Surgeries
class SurgeryBase(BaseModel):
    surgery_type: str
    surgery_name: str
    description: Optional[str] = None
    scheduled_date: datetime
    estimated_duration: Optional[int] = None
    surgeon_id: Optional[str] = None
    assistant_ids: Optional[PydanticList[str]] = None
    operating_room: Optional[str] = None
    equipment_needed: Optional[PydanticList[str]] = None
    anesthesia_type: Optional[str] = None
    anesthesiologist_id: Optional[str] = None
    status: str = "scheduled"
    pre_op_notes: Optional[str] = None
    estimated_cost: Optional[float] = None

class SurgeryCreate(SurgeryBase):
    patient_id: str

class SurgeryResponse(SurgeryBase):
    id: UUID
    clinic_id: str
    patient_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[SurgeryResponse])
def read_surgeries(
    clinic_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Retrieve all surgeries for a clinic.
    """
    _assert_clinic_owner(db, clinic_id, current_user_id)
    surgeries = dashboard_crud.get_surgeries(db=db, clinic_id=clinic_id, status_filter=status)
    return surgeries

@router.get("/today", response_model=List[SurgeryResponse])
def read_today_surgeries(
    clinic_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Retrieve today's surgeries for a clinic.
    """
    _assert_clinic_owner(db, clinic_id, current_user_id)
    surgeries = dashboard_crud.get_today_surgeries(db=db, clinic_id=clinic_id)
    return surgeries

@router.post("/", response_model=SurgeryResponse)
def create_surgery(
    clinic_id: str,
    surgery_in: SurgeryCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create a new scheduled surgery.
    """
    # This relies on the model taking dict unpacking
    _assert_clinic_owner(db, clinic_id, current_user_id)
    from app.models.dashboard import Surgeries
    if not surgery_in.surgery_name.strip():
        raise HTTPException(status_code=400, detail="El nombre del procedimiento es obligatorio")
    if surgery_in.estimated_duration is not None and surgery_in.estimated_duration <= 0:
        raise HTTPException(status_code=400, detail="La duración debe ser mayor a 0")
    pet_row = db.execute(text("SELECT owner_id, name FROM pets WHERE id = :pid"), {"pid": surgery_in.patient_id}).first()
    if not pet_row:
        raise HTTPException(status_code=404, detail="La mascota indicada no existe")
    data = surgery_in.model_dump()
    data["clinic_id"] = clinic_id
    data["status"] = "scheduled"  # el estado inicial lo fija el servidor
    db_obj = Surgeries(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    if pet_row[0] and pet_row[0] != current_user_id:
        notify_user(db, pet_row[0], "Cirugía programada",
                    f"Se programó {surgery_in.surgery_name} para {pet_row[1] or 'tu mascota'} el {surgery_in.scheduled_date.strftime('%Y-%m-%d %H:%M')}.", "cirugias", link=f"/mascotas/{surgery_in.patient_id}")
    return db_obj


class SurgeryStatusUpdate(BaseModel):
    status: str


_SURGERY_FLOW = {
    "scheduled": {"in-progress", "cancelled"},
    "in-progress": {"completed", "cancelled"},
}
_SURGERY_LABELS = {"in-progress": "comenzó", "completed": "terminó con éxito", "cancelled": "fue cancelada"}


@router.put("/{surgery_id}/status", response_model=SurgeryResponse)
def update_surgery_status(
    clinic_id: str,
    surgery_id: UUID,
    body: SurgeryStatusUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Avanza una cirugía (programada -> en curso -> completada, o cancelada). Solo el dueño de la clínica."""
    _assert_clinic_owner(db, clinic_id, current_user_id)
    from app.models.dashboard import Surgeries
    surgery = db.query(Surgeries).filter(Surgeries.id == surgery_id, Surgeries.clinic_id == clinic_id).first()
    if not surgery:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")
    if body.status not in _SURGERY_FLOW.get(surgery.status, set()):
        raise HTTPException(status_code=409, detail="Ese cambio de estado no es válido para esta cirugía")
    surgery.status = body.status
    db.commit()
    db.refresh(surgery)
    pet_row = db.execute(text("SELECT owner_id, name FROM pets WHERE id = :pid"), {"pid": surgery.patient_id}).first()
    if pet_row and pet_row[0] and pet_row[0] != current_user_id:
        notify_user(db, pet_row[0], "Actualización de cirugía",
                    f"La cirugía {surgery.surgery_name} de {pet_row[1] or 'tu mascota'} {_SURGERY_LABELS[body.status]}.", "cirugias", link=f"/mascotas/{surgery.patient_id}")
    return surgery
