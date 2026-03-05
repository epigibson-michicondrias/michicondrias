import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text, Float, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    pet_id = Column(String, index=True, nullable=False) # Refers to pets.id from adopciones app
    veterinarian_id = Column(String, index=True, nullable=True) # Refers to veterinarians.id from directorio app
    clinic_id = Column(String, index=True, nullable=True) # Refers to clinics.id
    appointment_id = Column(String(36), nullable=True, index=True) # Refers to appointments.id from directorio app
    
    date = Column(DateTime(timezone=True), server_default=func.now())
    reason_for_visit = Column(String, nullable=False)
    diagnosis = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    weight_kg = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    prescriptions = relationship("Prescription", back_populates="medical_record")
class Prescription(Base):
    """A single prescribed medication linked to a medical record."""
    __tablename__ = "prescriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    medical_record_id = Column(String, ForeignKey("medical_records.id"), nullable=False, index=True)
    medication_name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)  # e.g., "1 tableta", "5 ml"
    frequency_hours = Column(Integer, nullable=False)  # e.g., 8 (every 8 hours)
    duration_days = Column(Integer, nullable=False)    # e.g., 5 (for 5 days)
    instructions = Column(Text, nullable=True)         # Extra notes like "con alimento"

    medical_record = relationship("MedicalRecord", back_populates="prescriptions")

class MedicationReminder(Base):
    """Auto-generated reminders for the pet owner to administer the medication."""
    __tablename__ = "medication_reminders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    prescription_id = Column(String, ForeignKey("prescriptions.id"), nullable=False, index=True)
    pet_id = Column(String(36), nullable=False, index=True)
    remind_at = Column(String(50), nullable=False, index=True)  # ISO datetime string (UTC)
    sent = Column(Boolean, default=False, index=True)

class Vaccine(Base):
    __tablename__ = "vaccines"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    pet_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    date_administered = Column(DateTime(timezone=True), server_default=func.now())
    next_due_date = Column(DateTime(timezone=True), nullable=True)
    administered_by_vet_id = Column(String, nullable=True)
    batch_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
