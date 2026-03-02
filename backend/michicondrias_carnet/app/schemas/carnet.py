from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MedicalRecordBase(BaseModel):
    pet_id: str
    veterinarian_id: Optional[str] = None
    clinic_id: Optional[str] = None
    reason_for_visit: str
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    reason_for_visit: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None

class MedicalRecordResponse(MedicalRecordBase):
    id: str
    date: datetime

    class Config:
        from_attributes = True

class VaccineBase(BaseModel):
    pet_id: str
    name: str
    next_due_date: Optional[datetime] = None
    administered_by_vet_id: Optional[str] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None

class VaccineCreate(VaccineBase):
    pass

class VaccineUpdate(BaseModel):
    name: Optional[str] = None
    next_due_date: Optional[datetime] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None

class VaccineResponse(VaccineBase):
    id: str
    date_administered: datetime

    class Config:
        from_attributes = True
