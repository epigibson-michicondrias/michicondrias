from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.clinic import ClinicCreate, ClinicUpdate, ClinicResponse

router = APIRouter()

@router.get("/", response_model=List[ClinicResponse])
def read_clinics(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve clinics. (Public endpoint)
    """
    clinics = crud.crud_clinic.get_clinics(db, skip=skip, limit=limit)
    return clinics

@router.get("/{clinic_id}", response_model=ClinicResponse)
def read_clinic(
    clinic_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve a specific clinic."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    return clinic

@router.post("/", response_model=ClinicResponse)
def create_clinic(
    *,
    db: Session = Depends(get_db),
    clinic_in: ClinicCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create new clinic. (Requires auth)
    """
    clinic = crud.crud_clinic.create_clinic(db=db, clinic=clinic_in, owner_user_id=user_id)
    return clinic

# --- ADMIN ENDPOINTS FOR MODERATION ---

@router.get("/admin/pending", response_model=List[ClinicResponse])
def get_pending_clinics(
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Retrieve clinics pending approval (Admin only)."""
    return crud.crud_clinic.get_pending_clinics(db)

@router.post("/admin/{clinic_id}/approve", response_model=ClinicResponse)
def approve_clinic(
    clinic_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Approve a clinic to be visible publicly (Admin only)."""
    clinic = crud.crud_clinic.approve_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    return clinic

@router.delete("/admin/{clinic_id}/reject")
def reject_clinic(
    clinic_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Reject and delete a clinic (Admin only)."""
    clinic = crud.crud_clinic.remove_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    return {"message": "Clínica eliminada exitosamente"}
