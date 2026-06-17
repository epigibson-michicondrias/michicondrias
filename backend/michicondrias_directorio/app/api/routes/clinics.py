from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.crud import crud_services
from app.api import deps
from app.db.session import get_db
from app.schemas.clinic import ClinicCreate, ClinicUpdate, ClinicResponse, VeterinarianResponse

router = APIRouter()

@router.get("/", response_model=List[ClinicResponse])
def read_clinics(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve approved clinics. (Public endpoint)
    """
    clinics = crud.crud_clinic.get_clinics(db, skip=skip, limit=limit)
    for clinic in clinics:
        clinic.average_rating = crud.crud_clinic.get_clinic_average_rating(db, clinic.id)
        clinic.total_reviews = len(crud.crud_clinic.get_clinic_reviews(db, clinic.id))
        clinic.services = [s.name for s in crud_services.get_clinic_services(db, clinic.id)[:3]]
    return clinics

@router.get("/me", response_model=List[ClinicResponse])
def read_my_clinics(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Retrieve clinics owned by the current user."""
    clinics = crud.crud_clinic.get_clinics_by_owner(db, owner_user_id=user_id)
    for clinic in clinics:
        clinic.average_rating = crud.crud_clinic.get_clinic_average_rating(db, clinic.id)
        clinic.total_reviews = len(crud.crud_clinic.get_clinic_reviews(db, clinic.id))
        clinic.services = [s.name for s in crud_services.get_clinic_services(db, clinic.id)[:3]]
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
    clinic.average_rating = crud.crud_clinic.get_clinic_average_rating(db, clinic.id)
    clinic.total_reviews = len(crud.crud_clinic.get_clinic_reviews(db, clinic.id))
    clinic.services = [s.name for s in crud_services.get_clinic_services(db, clinic.id)[:3]]
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

@router.put("/{clinic_id}", response_model=ClinicResponse)
def update_my_clinic(
    clinic_id: str,
    *,
    db: Session = Depends(get_db),
    clinic_in: ClinicUpdate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Update a clinic. Only the owner or admin can edit."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar esta clínica")
    return crud.crud_clinic.update_clinic(db, clinic, clinic_in)

@router.delete("/{clinic_id}")
def delete_my_clinic(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Delete a clinic. Only the owner can delete."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta clínica")
    crud.crud_clinic.remove_clinic(db, clinic_id)
    return {"message": "Clínica eliminada exitosamente"}

# --- CLINIC VETERINARIAN MANAGEMENT ---

@router.get("/{clinic_id}/veterinarians", response_model=List[VeterinarianResponse])
def read_clinic_veterinarians(
    clinic_id: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve approved veterinarians belonging to a specific clinic."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    return crud.crud_clinic.get_veterinarians(db, skip=skip, limit=limit, clinic_id=clinic_id)

@router.post("/{clinic_id}/veterinarians/{vet_id}", response_model=VeterinarianResponse)
def associate_veterinarian(
    clinic_id: str,
    vet_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Associate a veterinarian to the clinic. Only the clinic owner can perform this."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para gestionar este hospital")
    
    vet = crud.crud_clinic.get_veterinarian(db, vet_id)
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinario no encontrado")
        
    vet.clinic_id = clinic_id
    db.add(vet)
    db.commit()
    db.refresh(vet)
    return vet

@router.delete("/{clinic_id}/veterinarians/{vet_id}", response_model=dict)
def dissociate_veterinarian(
    clinic_id: str,
    vet_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Dissociate/remove a veterinarian from the clinic. Only the clinic owner can perform this."""
    clinic = crud.crud_clinic.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clínica no encontrada")
    if clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para gestionar este hospital")
    
    vet = crud.crud_clinic.get_veterinarian(db, vet_id)
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinario no encontrado")
    if vet.clinic_id != clinic_id:
        raise HTTPException(status_code=400, detail="El veterinario no pertenece a esta clínica")
        
    vet.clinic_id = None
    db.add(vet)
    db.commit()
    return {"message": "Veterinario desasociado del hospital exitosamente"}

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


# --- HOSPITAL DIGITAL MANAGEMENT ---

@router.get("/hospitals/clinics", response_model=List[ClinicResponse])
def read_hospital_clinics(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """List all clinics/hospitals owned by the current hospital/admin user."""
    if role not in ["hospital", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios con rol hospital o administrador pueden listar sus clínicas.",
        )
    return crud.crud_clinic.get_clinics_by_owner(db, owner_user_id=user_id)


@router.get("/hospitals/veterinarians", response_model=List[VeterinarianResponse])
def read_hospital_veterinarians(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    role: str = Depends(deps.get_current_user_role),
) -> Any:
    """List all veterinarians associated with any clinic owned by the hospital."""
    if role not in ["hospital", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios con rol hospital o administrador pueden listar sus veterinarios.",
        )
    # Find all clinics owned by the hospital
    my_clinics = crud.crud_clinic.get_clinics_by_owner(db, owner_user_id=user_id)
    clinic_ids = [c.id for c in my_clinics]
    
    from app.models.clinic import Veterinarian
    if not clinic_ids:
        return []
    vets = db.query(Veterinarian).filter(Veterinarian.clinic_id.in_(clinic_ids)).all()
    return vets


