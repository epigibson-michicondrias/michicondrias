from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Prescriptions
class PrescriptionBase(BaseModel):
    medication_name: str
    dosage: str
    frequency_hours: int = Field(..., ge=1)
    duration_days: int = Field(..., ge=1)
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionResponse(PrescriptionBase):
    id: str
    medical_record_id: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# Medical Records
class MedicalRecordBase(BaseModel):
    diagnosis: str
    weight_kg: Optional[float] = None
    temperature_c: Optional[float] = None
    clinical_notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pet_id: str
    prescriptions: List[PrescriptionCreate] = []

class MedicalRecordResponse(MedicalRecordBase):
    id: str
    appointment_id: str
    pet_id: str
    clinic_id: str
    vet_id: Optional[str] = None
    prescriptions: List[PrescriptionResponse] = []
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# Reminders
class MedicationReminderResponse(BaseModel):
    id: str
    prescription_id: str
    pet_id: str
    remind_at: str
    sent: bool
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
