from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from datetime import datetime, timedelta, timezone

class PrescriptionBase(BaseModel):
    medication_name: str
    dosage: str
    frequency_hours: int
    duration_days: int
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionResponse(PrescriptionBase):
    id: str
    medical_record_id: str

    class Config:
        from_attributes = True

class MedicationReminderBase(BaseModel):
    prescription_id: str
    pet_id: str
    remind_at: str
    sent: bool = False

class MedicationReminderResponse(MedicationReminderBase):
    id: str

    class Config:
        from_attributes = True

class MedicalRecordBase(BaseModel):
    pet_id: str
    veterinarian_id: Optional[str] = None
    clinic_id: Optional[str] = None
    appointment_id: Optional[str] = None
    reason_for_visit: str
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    weight_kg: Optional[float] = None
    temperature_c: Optional[float] = None
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    prescriptions: Optional[list[PrescriptionCreate]] = []

class MedicalRecordUpdate(BaseModel):
    reason_for_visit: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None

class MedicalRecordResponse(MedicalRecordBase):
    id: str
    date: datetime
    prescriptions: list[PrescriptionResponse] = []

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
    # Fecha real de aplicación: permite registrar vacunas pasadas. Si no viene, se usa la fecha de hoy (server default).
    date_administered: Optional[datetime] = None

    @field_validator("date_administered")
    @classmethod
    def not_in_future(cls, value: Optional[datetime]) -> Optional[datetime]:
        if value is None:
            return value
        aware = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        # Un día de holgura por zonas horarias del teléfono
        if aware > datetime.now(timezone.utc) + timedelta(days=1):
            raise ValueError("La fecha de aplicación no puede ser futura")
        return value

    @model_validator(mode="after")
    def due_after_applied(self):
        if self.date_administered and self.next_due_date:
            applied = self.date_administered if self.date_administered.tzinfo else self.date_administered.replace(tzinfo=timezone.utc)
            due = self.next_due_date if self.next_due_date.tzinfo else self.next_due_date.replace(tzinfo=timezone.utc)
            if due < applied:
                raise ValueError("El próximo refuerzo debe ser posterior a la fecha de aplicación")
        return self

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
