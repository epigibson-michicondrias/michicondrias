from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date

from app.models.insurance import PetInsurancePolicy, InsuranceClaim
from app.schemas.insurance import PetInsurancePolicyCreate, InsuranceClaimCreate

# --- Policy CRUD Operations ---

def create_policy(db: Session, policy_in: PetInsurancePolicyCreate) -> PetInsurancePolicy:
    db_policy = PetInsurancePolicy(**policy_in.model_dump())
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

def get_policy_by_id(db: Session, policy_id: str) -> Optional[PetInsurancePolicy]:
    return db.query(PetInsurancePolicy).filter(PetInsurancePolicy.id == policy_id).first()

def get_active_policy_by_pet_id(db: Session, pet_id: str) -> Optional[PetInsurancePolicy]:
    today = date.today()
    return db.query(PetInsurancePolicy).filter(
        PetInsurancePolicy.pet_id == pet_id,
        PetInsurancePolicy.status == "active",
        PetInsurancePolicy.start_date <= today,
        PetInsurancePolicy.end_date >= today
    ).first()

def get_policies(db: Session, skip: int = 0, limit: int = 100) -> List[PetInsurancePolicy]:
    return db.query(PetInsurancePolicy).offset(skip).limit(limit).all()


# --- Claim CRUD Operations ---

def create_claim(db: Session, claim_in: InsuranceClaimCreate) -> InsuranceClaim:
    db_claim = InsuranceClaim(**claim_in.model_dump())
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

def get_claim_by_id(db: Session, claim_id: str) -> Optional[InsuranceClaim]:
    return db.query(InsuranceClaim).filter(InsuranceClaim.id == claim_id).first()

def get_claims(db: Session, skip: int = 0, limit: int = 100) -> List[InsuranceClaim]:
    return db.query(InsuranceClaim).offset(skip).limit(limit).all()

def update_claim_status(db: Session, claim_id: str, status: str) -> Optional[InsuranceClaim]:
    db_claim = get_claim_by_id(db, claim_id)
    if not db_claim:
        return None
    db_claim.status = status
    db.commit()
    db.refresh(db_claim)
    return db_claim
