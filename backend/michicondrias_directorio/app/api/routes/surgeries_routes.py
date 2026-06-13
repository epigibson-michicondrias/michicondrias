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

router = APIRouter()

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
    from app.models.dashboard import Surgeries
    data = surgery_in.model_dump()
    data["clinic_id"] = clinic_id
    db_obj = Surgeries(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
