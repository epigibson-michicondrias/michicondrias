from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List

# --- Claims Schemas ---

class InsuranceClaimBase(BaseModel):
    policy_id: str
    amount_claimed: float
    reason: Optional[str] = None
    medical_receipt_url: Optional[str] = None
    status: Optional[str] = "pending"

class InsuranceClaimCreate(InsuranceClaimBase):
    pass

class InsuranceClaimUpdate(BaseModel):
    status: str

class InsuranceClaimInDBBase(InsuranceClaimBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class InsuranceClaim(InsuranceClaimInDBBase):
    pass


# --- Policies Schemas ---

class PetInsurancePolicyBase(BaseModel):
    pet_id: str
    insurer_id: str
    policy_number: str
    coverage_details: Optional[str] = None
    start_date: date
    end_date: date
    monthly_premium: float
    status: Optional[str] = "active"

class PetInsurancePolicyCreate(PetInsurancePolicyBase):
    pass

class PetInsurancePolicyUpdate(BaseModel):
    status: Optional[str] = None
    coverage_details: Optional[str] = None
    end_date: Optional[date] = None
    monthly_premium: Optional[float] = None

class PetInsurancePolicyInDBBase(PetInsurancePolicyBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class PetInsurancePolicy(PetInsurancePolicyInDBBase):
    claims: List[InsuranceClaim] = []


# --- Plans Schemas ---

class InsurancePlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    coverage_limit: float
    base_premium: float
    min_age: Optional[int] = 0
    max_age: Optional[int] = 15
    allowed_species: List[str]

class InsurancePlanOut(BaseModel):
    id: str
    insurer_id: str
    name: str
    description: Optional[str] = None
    coverage_limit: float
    base_premium: float
    min_age: int
    max_age: int
    allowed_species: List[str]
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Quote and Subscription Schemas ---

class InsuranceQuoteRequest(BaseModel):
    plan_id: str
    pet_age: int
    pet_species: str  # 'dog', 'cat', etc.
    has_preexisting_conditions: Optional[bool] = False

class InsuranceQuoteOut(BaseModel):
    plan_id: str
    base_premium: float
    calculated_premium: float
    coverage_limit: float
    pet_age: int
    pet_species: str

class InsuranceSubscribeRequest(BaseModel):
    pet_id: str
    plan_id: str
    pet_age: int
    pet_species: str
    has_preexisting_conditions: Optional[bool] = False
