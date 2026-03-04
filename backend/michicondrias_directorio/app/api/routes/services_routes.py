from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud import crud_services
from app.api import deps
from app.db.session import get_db
from app.schemas.services import ClinicServiceCreate, ClinicServiceUpdate, ClinicServiceResponse
from app.crud.crud_clinic import get_clinic

router = APIRouter()


@router.get("/clinics/{clinic_id}/services", response_model=List[ClinicServiceResponse])
def read_clinic_services(
    clinic_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """Get all active services for a clinic (Public)."""
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    return crud_services.get_clinic_services(db, clinic_id)


@router.post("/clinics/{clinic_id}/services", response_model=ClinicServiceResponse)
def create_service(
    clinic_id: str,
    *,
    db: Session = Depends(get_db),
    service_in: ClinicServiceCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Add a service to a clinic (Owner only)."""
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede agregar servicios")
    return crud_services.create_clinic_service(db, clinic_id, service_in)


@router.put("/services/{service_id}", response_model=ClinicServiceResponse)
def update_service(
    service_id: str,
    *,
    db: Session = Depends(get_db),
    service_in: ClinicServiceUpdate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Update a service (Owner only)."""
    svc = crud_services.get_service(db, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    clinic = get_clinic(db, svc.clinic_id)
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede editar servicios")
    return crud_services.update_clinic_service(db, svc, service_in)


@router.delete("/services/{service_id}")
def delete_service(
    service_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Delete (deactivate) a service (Owner only)."""
    svc = crud_services.get_service(db, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    clinic = get_clinic(db, svc.clinic_id)
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede eliminar servicios")
    crud_services.delete_clinic_service(db, service_id)
    return {"message": "Servicio eliminado exitosamente"}
