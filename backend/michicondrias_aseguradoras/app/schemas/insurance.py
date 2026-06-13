from pydantic import BaseModel, ConfigDict
from datetime import date
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
