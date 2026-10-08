from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text, bindparam
from sqlalchemy.orm import Session
from datetime import date, timedelta
import logging
import secrets
import uuid

import httpx

from app.api import deps
from app.db.session import get_db
from app.core.config import settings
from app import crud, models, schemas

logger = logging.getLogger(__name__)

router = APIRouter()


def _pet_owner_id(db: Session, pet_id: str):
    row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": pet_id}).first()
    return row[0] if row else None


_SPECIES_ALIASES = {
    "perro": "dog", "perra": "dog", "dog": "dog", "canino": "dog",
    "gato": "cat", "gata": "cat", "cat": "cat", "felino": "cat",
}


def _norm_species(value: str) -> str:
    """Las mascotas guardan la especie en español ('perro') y los planes en inglés ('dog'); se comparan normalizadas."""
    v = (value or "").strip().lower()
    return _SPECIES_ALIASES.get(v, v)


def _notify(db: Session, user_id: str, title: str, message: str, ntype: str = "seguros") -> None:
    """Notificación en la bandeja del usuario (misma BD que core). Nunca debe romper el flujo principal."""
    try:
        db.execute(text(
            "INSERT INTO notifications (id, user_id, title, message, type, is_read, link) "
            "VALUES (:id, :uid, :title, :msg, :type, false, :link)"
        ), {"id": str(uuid.uuid4()), "uid": user_id, "title": title, "msg": message, "type": ntype, "link": link})
        db.commit()
    except Exception:
        db.rollback()


def _claim_details(db: Session, claims: list) -> list:
    """Agrega número de póliza y nombre de mascota a cada reclamo."""
    if not claims:
        return []
    policies = {c.policy_id: c.policy for c in claims}
    pet_ids = list({p.pet_id for p in policies.values() if p})
    names = {}
    if pet_ids:
        try:
            rows = db.execute(text("SELECT id, name FROM pets WHERE id IN :ids").bindparams(bindparam("ids", expanding=True)), {"ids": pet_ids}).fetchall()
            names = {r[0]: r[1] for r in rows}
        except Exception:
            db.rollback()
    out = []
    for c in claims:
        pol = policies.get(c.policy_id)
        out.append({
            "id": c.id, "policy_id": c.policy_id, "amount_claimed": c.amount_claimed, "reason": c.reason,
            "medical_receipt_url": c.medical_receipt_url, "status": c.status,
            "policy_number": pol.policy_number if pol else None,
            "pet_id": pol.pet_id if pol else None,
            "pet_name": names.get(pol.pet_id) if pol else None,
        })
    return out


def _assert_pet_belongs_to_user(db: Session, pet_id: str, user_id: str) -> None:
    """Solo el dueño puede contratar el seguro de una mascota."""
    owner = _pet_owner_id(db, pet_id)
    if owner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota no existe")
    if owner != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el dueño de la mascota puede contratar su seguro")

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
    db: Session = Depends(get_db),
    token: str = Depends(deps.oauth2_scheme),
) -> Any:
    """
    Póliza activa de una mascota. Solo su dueño, la aseguradora de la póliza o un admin.
    """
    payload = deps._decode_token(token)
    user_id, role = payload["sub"], payload.get("role", "consumidor")
    policy = crud.get_active_policy_by_pet_id(db, pet_id=pet_id)
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró una póliza activa para esta mascota"
        )
    if role != "admin" and policy.insurer_id != user_id and _pet_owner_id(db, pet_id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a la póliza de esta mascota")
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
    
    user_id, role = current_user["sub"], current_user.get("role", "consumidor")
    if role == "aseguradora":
        if policy.insurer_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La póliza no pertenece a esta aseguradora")
    elif _pet_owner_id(db, policy.pet_id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el dueño de la mascota puede reclamar sobre esta póliza")

    if claim_in.amount_claimed <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El monto reclamado debe ser mayor a cero")

    claim_in.status = "pending"
    claim = crud.create_claim(db, claim_in=claim_in)
    if role != "aseguradora":
        _notify(db, policy.insurer_id, "Nuevo reclamo recibido", f"Reclamo por ${claim_in.amount_claimed:,.2f} sobre la póliza {policy.policy_number}.", link="/aseguradoras/reclamos")
    return claim


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
        
    if (claim.status or "pending") != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este reclamo ya fue resuelto")

    updated = crud.update_claim_status(db, claim_id=claim_id, status=claim_update.status)
    owner_id = _pet_owner_id(db, claim.policy.pet_id)
    if owner_id:
        label = "aprobado" if claim_update.status == "approved" else "rechazado"
        _notify(db, owner_id, f"Reclamo {label}", f"Tu reclamo sobre la póliza {claim.policy.policy_number} fue {label}.", link="/aseguradoras/mis-polizas")
    return updated


@router.get("/claims/provider", response_model=List[schemas.InsuranceClaimDetail])
def read_provider_claims(
    db: Session = Depends(get_db),
    current_insurer_id: str = Depends(deps.require_aseguradora),
) -> Any:
    """Reclamos sobre las pólizas de la aseguradora autenticada (pendientes primero)."""
    claims = (
        db.query(models.InsuranceClaim)
        .join(models.PetInsurancePolicy, models.PetInsurancePolicy.id == models.InsuranceClaim.policy_id)
        .filter(models.PetInsurancePolicy.insurer_id == current_insurer_id)
        .all()
    )
    claims.sort(key=lambda c: 0 if (c.status or "pending") == "pending" else 1)
    return _claim_details(db, claims)


@router.get("/claims/mine", response_model=List[schemas.InsuranceClaimDetail])
def read_my_claims(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Reclamos de las mascotas del usuario autenticado."""
    rows = db.execute(text("SELECT id FROM pets WHERE owner_id = :uid"), {"uid": user_id}).fetchall()
    pet_ids = [r[0] for r in rows]
    if not pet_ids:
        return []
    claims = (
        db.query(models.InsuranceClaim)
        .join(models.PetInsurancePolicy, models.PetInsurancePolicy.id == models.InsuranceClaim.policy_id)
        .filter(models.PetInsurancePolicy.pet_id.in_(pet_ids))
        .all()
    )
    return _claim_details(db, claims)


@router.get("/policies/provider", response_model=List[schemas.PetInsurancePolicy])
def read_provider_policies(
    db: Session = Depends(get_db),
    current_insurer_id: str = Depends(deps.require_aseguradora),
) -> Any:
    """Pólizas emitidas por la aseguradora autenticada."""
    return db.query(models.PetInsurancePolicy).filter(models.PetInsurancePolicy.insurer_id == current_insurer_id).order_by(models.PetInsurancePolicy.start_date.desc()).all()


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


@router.get("/plans/mine", response_model=List[schemas.InsurancePlanOut])
def read_my_plans(
    db: Session = Depends(get_db),
    current_insurer_id: str = Depends(deps.require_aseguradora),
) -> Any:
    """Todos los planes (activos o no) de la aseguradora autenticada."""
    return db.query(models.InsurancePlan).filter(models.InsurancePlan.insurer_id == current_insurer_id).order_by(models.InsurancePlan.created_at.desc()).all()


@router.patch("/plans/{plan_id}/active", response_model=schemas.InsurancePlanOut)
def set_plan_active(
    plan_id: str,
    body: schemas.InsurancePlanActiveUpdate,
    db: Session = Depends(get_db),
    current_insurer_id: str = Depends(deps.require_aseguradora),
) -> Any:
    """Publica u oculta un plan propio. Las pólizas ya emitidas no se ven afectadas."""
    plan = crud.get_plan_by_id(db, plan_id=plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El plan de seguro no existe")
    if plan.insurer_id != current_insurer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Este plan no es tuyo")
    plan.is_active = body.is_active
    db.commit()
    db.refresh(plan)
    return plan


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
        
    if _norm_species(quote_req.pet_species) not in [_norm_species(s) for s in plan.allowed_species]:
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
    if _norm_species(quote_req.pet_species) == "dog":
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
    _assert_pet_belongs_to_user(db, sub_req.pet_id, current_user_id)
    plan = crud.get_plan_by_id(db, plan_id=sub_req.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El plan de seguro no existe"
        )
    
    if not plan.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Este plan ya no está disponible")

    # Check if pet already has active policy
    existing_active = crud.get_active_policy_by_pet_id(db, pet_id=sub_req.pet_id)
    if existing_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta mascota ya cuenta con una póliza de seguro activa"
        )

    # Edad y especie salen de la mascota en BD, nunca de lo que mande el cliente
    try:
        pet_row = db.execute(text("SELECT species, age_months FROM pets WHERE id = :pid"), {"pid": sub_req.pet_id}).first()
    except Exception:
        db.rollback()
        pet_row = None
    if not pet_row or not pet_row[0]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se pudo verificar la especie de la mascota")
    real_species = pet_row[0]
    real_age = int((pet_row[1] or 0) // 12)

    # Calculate quote
    quote_res = calculate_quote(db=db, quote_req=schemas.InsuranceQuoteRequest(
        plan_id=sub_req.plan_id,
        pet_age=real_age,
        pet_species=real_species,
        has_preexisting_conditions=sub_req.has_preexisting_conditions
    ))

    policy_number = f"POL-{date.today():%Y%m%d}-{secrets.token_hex(4).upper()}"  # unico: el numero antiguo (6 digitos al azar) podia chocar
    start_date = date.today()
    end_date = start_date + timedelta(days=365) # 1 year validity

    policy_create = schemas.PetInsurancePolicyCreate(
        pet_id=sub_req.pet_id,
        insurer_id=plan.insurer_id,
        policy_number=policy_number,
        coverage_details=f"Plan contratado: {plan.name}. Límite de cobertura: {plan.coverage_limit}. Especie: {real_species}. Edad al momento de contratación: {real_age}.",
        start_date=start_date,
        end_date=end_date,
        monthly_premium=quote_res.calculated_premium,
        status="active"
    )

    policy = crud.create_policy(db, policy_in=policy_create)
    _notify(db, plan.insurer_id, "Nueva póliza contratada", f"Se contrató el plan {plan.name} (póliza {policy_number}).", link="/aseguradoras/gestion")
    return policy


@router.post("/claims/{claim_id}/verify-receipt", response_model=dict)
def verify_claim_receipt(
    claim_id: str,
    db: Session = Depends(get_db),
    current_insurer_id: str = Depends(deps.require_aseguradora)
):
    """
    Revisa que el reclamo incluya un comprobante. NO lo compara contra los registros de la clínica:
    la aprobación sigue siendo una revisión manual de la aseguradora.
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
        
    has_receipt = bool(claim.medical_receipt_url)

    return {
        "claim_id": claim_id,
        "is_valid": has_receipt,
        "receipt_url": claim.medical_receipt_url,
        "amount_claimed": claim.amount_claimed,
        "status": "receipt_attached" if has_receipt else "missing_receipt",
        "message": (
            "El reclamo incluye un comprobante. Revísalo antes de aprobar: aún no se compara con los registros de la clínica."
            if has_receipt else "Falta el recibo médico"
        ),
    }
