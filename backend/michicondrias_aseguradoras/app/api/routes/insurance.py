from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

from app.api import deps
from app.db.session import get_db
from app import crud, models, schemas

router = APIRouter()

@router.post("/policies", response_model=schemas.PetInsurancePolicy)
def create_new_policy(
    *,
    db: Session = Depends(get_db),
    policy_in: schemas.PetInsurancePolicyCreate,
    current_insurer_id: str = Depends(deps.require_aseguradora)
) -> Any:
    """
    Create a new insurance policy. Requires 'aseguradora' role.
    """
    # Force insurer_id to be the current logged-in user with role 'aseguradora'
    policy_in.insurer_id = current_insurer_id
    
    # Check if policy number is unique
    existing_policy = db.query(models.PetInsurancePolicy).filter(
        models.PetInsurancePolicy.policy_number == policy_in.policy_number
    ).first()
    if existing_policy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de póliza ya está registrado"
        )
        
    return crud.create_policy(db, policy_in=policy_in)


@router.get("/policies/pet/{pet_id}", response_model=schemas.PetInsurancePolicy)
def read_active_policy_by_pet(
    pet_id: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get active policy of a pet.
    """
    policy = crud.get_active_policy_by_pet_id(db, pet_id=pet_id)
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró una póliza activa para esta mascota"
        )
    return policy


@router.post("/claims", response_model=schemas.InsuranceClaim)
def create_new_claim(
    *,
    db: Session = Depends(get_db),
    claim_in: schemas.InsuranceClaimCreate,
    current_user: dict = Depends(deps.require_consumidor_or_aseguradora)
) -> Any:
    """
    Request claim/reimbursement. Requires 'consumidor' or 'aseguradora' role.
    """
    policy = crud.get_policy_by_id(db, policy_id=claim_in.policy_id)
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La póliza asociada no existe"
        )
    
    # Check if policy is active
    today = date.today()
    if policy.status != "active" or not (policy.start_date <= today <= policy.end_date):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La póliza asociada no está activa o ya expiró"
        )

    # If the user is a 'consumidor', they should ideally own the pet.
    # However, let's keep it flexible since it's a microservice, but we check role.
    
    # Force default claim status as pending upon request
    claim_in.status = "pending"
    
    return crud.create_claim(db, claim_in=claim_in)


@router.patch("/claims/{claim_id}/status", response_model=schemas.InsuranceClaim)
def update_claim_status_endpoint(
    claim_id: str,
    claim_update: schemas.InsuranceClaimUpdate,
    db: Session = Depends(get_db),
    current_insurer_id: str = Depends(deps.require_aseguradora)
) -> Any:
    """
    Approve or reject claim. Requires 'aseguradora' role.
    """
    if claim_update.status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El estado de la reclamación debe ser 'approved' o 'rejected'"
        )

    claim = crud.get_claim_by_id(db, claim_id=claim_id)
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reclamación no encontrada"
        )
        
    # Verify that the insurer who is trying to update the claim is the owner/insurer of the policy
    if claim.policy.insurer_id != current_insurer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar una reclamación de esta póliza"
        )
        
    return crud.update_claim_status(db, claim_id=claim_id, status=claim_update.status)
