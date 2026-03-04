from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.clinic import VeterinarianCreate, VeterinarianUpdate, VeterinarianResponse

router = APIRouter()

@router.get("/", response_model=List[VeterinarianResponse])
def read_veterinarians(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    clinic_id: Optional[str] = None
) -> Any:
    """
    Retrieve veterinarians. (Public endpoint)
    """
    vets = crud.crud_clinic.get_veterinarians(db, skip=skip, limit=limit, clinic_id=clinic_id)
    return vets

@router.post("/", response_model=VeterinarianResponse)
def create_veterinarian(
    *,
    db: Session = Depends(get_db),
    vet_in: VeterinarianCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create new veterinarian. (Requires auth)
    """
    vet = crud.crud_clinic.create_veterinarian(db=db, vet=vet_in, user_id=user_id)
    return vet

@router.put("/{vet_id}", response_model=VeterinarianResponse)
def update_my_vet_profile(
    vet_id: str,
    *,
    db: Session = Depends(get_db),
    vet_in: VeterinarianUpdate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Update a vet profile. Only the linked user can edit."""
    vet = crud.crud_clinic.get_veterinarian(db, vet_id)
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinario no encontrado")
    if vet.user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar este perfil")
    return crud.crud_clinic.update_veterinarian(db, vet, vet_in)

# --- ADMIN ENDPOINTS FOR MODERATION ---

@router.get("/admin/pending", response_model=List[VeterinarianResponse])
def get_pending_veterinarians(
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Retrieve veterinarians pending approval (Admin only)."""
    return crud.crud_clinic.get_pending_veterinarians(db)

@router.post("/admin/{vet_id}/approve", response_model=VeterinarianResponse)
def approve_veterinarian(
    vet_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Approve a veterinarian (Admin only)."""
    vet = crud.crud_clinic.approve_veterinarian(db, vet_id)
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinario no encontrado")
    return vet

@router.delete("/admin/{vet_id}/reject")
def reject_veterinarian(
    vet_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Reject and delete a veterinarian (Admin only)."""
    vet = crud.crud_clinic.remove_veterinarian(db, vet_id)
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinario no encontrado")
    return {"message": "Veterinario eliminado exitosamente"}

