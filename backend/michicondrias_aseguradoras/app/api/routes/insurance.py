from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, timedelta
import random

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
    policy_in.insurer_id = current_insurer_id
    
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
    
    today = date.today()
    if policy.status != "active" or not (policy.start_date <= today <= policy.end_date):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La póliza asociada no está activa o ya expiró"
        )
    
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
        
    if claim.policy.insurer_id != current_insurer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar una reclamación de esta póliza"
        )
        
    return crud.update_claim_status(db, claim_id=claim_id, status=claim_update.status)


# --- Plan Endpoints ---

@router.post("/plans", response_model=schemas.InsurancePlanOut, status_code=status.HTTP_201_CREATED)
def add_insurance_plan(
    *,
    db: Session = Depends(get_db),
    plan_in: schemas.InsurancePlanCreate,
    current_insurer_id: str = Depends(deps.require_aseguradora)
) -> Any:
    """
    Create a new insurance plan/template. Requires 'aseguradora' role.
    """
    return crud.create_plan(db, plan_in=plan_in, insurer_id=current_insurer_id)


@router.get("/plans", response_model=List[schemas.InsurancePlanOut])
def read_active_plans(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all active insurance plans. Public endpoint.
    """
    return crud.get_active_plans(db)


@router.post("/quote", response_model=schemas.InsuranceQuoteOut)
def calculate_quote(
    *,
    db: Session = Depends(get_db),
    quote_req: schemas.InsuranceQuoteRequest
) -> Any:
    """
    Calculate dynamic monthly premium based on pet details.
    """
    plan = crud.get_plan_by_id(db, plan_id=quote_req.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El plan de seguro no existe"
        )
    
    if not (plan.min_age <= quote_req.pet_age <= plan.max_age):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La edad de la mascota ({quote_req.pet_age}) está fuera del rango permitido para este plan ({plan.min_age} - {plan.max_age})"
        )
        
    if quote_req.pet_species.lower() not in [s.lower() for s in plan.allowed_species]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La especie de mascota ({quote_req.pet_species}) no está permitida en este plan"
        )

    # Dynamic calculation
    premium = plan.base_premium
    # Senior pets adjustment
    if quote_req.pet_age > 5:
        premium *= (1 + (quote_req.pet_age - 5) * 0.08)
    
    # Dog risk adjustment
    if quote_req.pet_species.lower() == "dog":
        premium *= 1.12
        
    # Pre-existing condition adjustment
    if quote_req.has_preexisting_conditions:
        premium *= 1.4

    return schemas.InsuranceQuoteOut(
        plan_id=plan.id,
        base_premium=plan.base_premium,
        calculated_premium=round(premium, 2),
        coverage_limit=plan.coverage_limit,
        pet_age=quote_req.pet_age,
        pet_species=quote_req.pet_species
    )


@router.post("/subscribe", response_model=schemas.PetInsurancePolicy)
def subscribe_to_plan(
    *,
    db: Session = Depends(get_db),
    sub_req: schemas.InsuranceSubscribeRequest,
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Subscribe a pet to an insurance plan. Creates a PetInsurancePolicy.
    """
    plan = crud.get_plan_by_id(db, plan_id=sub_req.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El plan de seguro no existe"
        )
    
    # Check if pet already has active policy
    existing_active = crud.get_active_policy_by_pet_id(db, pet_id=sub_req.pet_id)
    if existing_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta mascota ya cuenta con una póliza de seguro activa"
        )

    # Calculate quote
    quote_res = calculate_quote(db=db, quote_req=schemas.InsuranceQuoteRequest(
        plan_id=sub_req.plan_id,
        pet_age=sub_req.pet_age,
        pet_species=sub_req.pet_species,
        has_preexisting_conditions=sub_req.has_preexisting_conditions
    ))

    policy_number = f"POL-{random.randint(100000, 999999)}-{sub_req.pet_id[:4].upper()}"
    start_date = date.today()
    end_date = start_date + timedelta(days=365) # 1 year validity

    policy_create = schemas.PetInsurancePolicyCreate(
        pet_id=sub_req.pet_id,
        insurer_id=plan.insurer_id,
        policy_number=policy_number,
        coverage_details=f"Plan contratado: {plan.name}. Límite de cobertura: {plan.coverage_limit}. Especie: {sub_req.pet_species}. Edad al momento de contratación: {sub_req.pet_age}.",
        start_date=start_date,
        end_date=end_date,
        monthly_premium=quote_res.calculated_premium,
        status="active"
    )

    return crud.create_policy(db, policy_in=policy_create)


@router.post("/claims/{claim_id}/verify-receipt", response_model=dict)
def verify_claim_receipt(
    claim_id: str,
    db: Session = Depends(get_db),
    current_insurer_id: str = Depends(deps.require_aseguradora)
):
    """
    Verify claim receipts against clinic records. Mock validation.
    """
    claim = crud.get_claim_by_id(db, claim_id=claim_id)
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reclamación no encontrada"
        )
        
    if claim.policy.insurer_id != current_insurer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar una reclamación de esta póliza"
        )
        
    # Perform mock validation: check if medical_receipt_url is present
    is_valid = True if claim.medical_receipt_url else False
    
    return {
        "claim_id": claim_id,
        "is_valid": is_valid,
        "receipt_url": claim.medical_receipt_url,
        "amount_claimed": claim.amount_claimed,
        "status": "verified" if is_valid else "invalid_receipt",
        "message": "Recibo verificado exitosamente" if is_valid else "Falta el recibo médico"
    }
