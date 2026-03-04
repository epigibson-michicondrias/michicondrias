from sqlalchemy import Column, String, Integer, Text, ForeignKey, Boolean, Date, Time, Float
from app.models.base import BaseModel

class MedicalRecord(BaseModel):
    """A medical record or consultation note linked to a specific appointment."""
    __tablename__ = "medical_records"

    appointment_id = Column(String(36), ForeignKey("appointments.id"), nullable=False, index=True, unique=True)
    pet_id = Column(String(36), nullable=False, index=True)
    clinic_id = Column(String(36), ForeignKey("clinics.id"), nullable=False, index=True)
    vet_id = Column(String(36), ForeignKey("veterinarians.id"), nullable=True)

    diagnosis = Column(String(255), nullable=False)
    weight_kg = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    clinical_notes = Column(Text, nullable=True)


class Prescription(BaseModel):
    """A single prescribed medication linked to a medical record."""
    __tablename__ = "prescriptions"

    medical_record_id = Column(String(36), ForeignKey("medical_records.id"), nullable=False, index=True)
    medication_name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)  # e.g., "1 tableta", "5 ml"
    frequency_hours = Column(Integer, nullable=False)  # e.g., 8 (every 8 hours)
    duration_days = Column(Integer, nullable=False)    # e.g., 5 (for 5 days)
    instructions = Column(Text, nullable=True)         # Extra notes like "con alimento"


class MedicationReminder(BaseModel):
    """Auto-generated reminders for the pet owner to administer the medication."""
    __tablename__ = "medication_reminders"

    prescription_id = Column(String(36), ForeignKey("prescriptions.id"), nullable=False, index=True)
    pet_id = Column(String(36), nullable=False, index=True)
    remind_at = Column(String(50), nullable=False, index=True)  # ISO datetime string (UTC)
    sent = Column(Boolean, default=False, index=True)
