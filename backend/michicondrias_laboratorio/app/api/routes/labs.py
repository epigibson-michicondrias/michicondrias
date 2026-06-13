from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.crud import crud_laboratory
from app.schemas.laboratory import LabOrderCreate, LabOrderOut, LabResultsUpload, LabResultOut

router = APIRouter()

@router.post("/orders", response_model=LabOrderOut, status_code=status.HTTP_201_CREATED)
def create_lab_order(
    *,
    db: Session = Depends(deps.get_db),
    order_in: LabOrderCreate,
    current_user_id: str = Depends(deps.require_veterinario)
):
    """
    Create a new lab order request. Requires 'veterinario' role.
    """
    return crud_laboratory.create_order(db=db, order_in=order_in, requesting_vet_id=current_user_id)


@router.get("/pending", response_model=List[LabOrderOut])
def get_pending_orders(
    *,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """
    List all pending orders assigned to the logged-in laboratory. Requires 'laboratorio' role.
    """
    return crud_laboratory.get_pending_orders_for_lab(db=db, lab_id=current_user_id)


@router.post("/orders/{order_id}/results", response_model=LabOrderOut)
def upload_lab_results(
    *,
    db: Session = Depends(deps.get_db),
    order_id: str,
    results_in: LabResultsUpload,
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """
    Upload test results and complete the order. Requires 'laboratorio' role.
    """
    order = crud_laboratory.get_order_by_id(db=db, order_id=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La orden de laboratorio no existe"
        )
    if order.lab_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para subir resultados a esta orden"
        )
    
    updated_order = crud_laboratory.upload_results(db=db, order_id=order_id, results_in=results_in)
    return updated_order


@router.get("/pet/{pet_id}/history", response_model=List[LabResultOut])
def get_pet_lab_history(
    *,
    db: Session = Depends(deps.get_db),
    pet_id: str,
    current_user_id: str = Depends(deps.get_current_user_id)
):
    """
    Retrieve all completed lab results for a specific pet. Requires a logged-in user.
    """
    return crud_laboratory.get_completed_results_by_pet(db=db, pet_id=pet_id)
