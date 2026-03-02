from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.crud_lost_pets import (
    create_report, get_reports, get_report_by_id, 
    get_reports_by_user, update_report, delete_report
)
from app.schemas.lost_pet import LostPetReportCreate, LostPetReportUpdate, LostPetReportOut

router = APIRouter()


@router.get("/", response_model=List[LostPetReportOut])
def list_reports(
    db: Session = Depends(get_db),
    report_type: Optional[str] = None,
    status: str = "active",
    species: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Any:
    """
    Retrieve all active lost/found pet reports. Public endpoint.
    """
    return get_reports(db, report_type=report_type, status=status, species=species, skip=skip, limit=limit)


@router.get("/mine", response_model=List[LostPetReportOut])
def list_my_reports(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Retrieve all reports created by the current user.
    """
    return get_reports_by_user(db, reporter_id=user_id)


@router.get("/{report_id}", response_model=LostPetReportOut)
def read_report(
    report_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific report by ID.
    """
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return report


@router.post("/", response_model=LostPetReportOut)
def create_new_report(
    *,
    db: Session = Depends(get_db),
    report_in: LostPetReportCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create a new lost or found pet report.
    """
    return create_report(db, report_in=report_in, reporter_id=user_id)


@router.patch("/{report_id}", response_model=LostPetReportOut)
def patch_report(
    report_id: str,
    *,
    db: Session = Depends(get_db),
    report_in: LostPetReportUpdate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Update an existing report. Only the owner can update.
    """
    existing = get_report_by_id(db, report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    if existing.reporter_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar este reporte")
    return update_report(db, report_id=report_id, report_in=report_in)


@router.delete("/{report_id}")
def remove_report(
    report_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Delete a report. Only the owner can delete.
    """
    existing = get_report_by_id(db, report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    if existing.reporter_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este reporte")
    delete_report(db, report_id=report_id)
    return {"detail": "Reporte eliminado exitosamente"}
