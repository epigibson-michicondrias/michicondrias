import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text, Float
from sqlalchemy.sql import func
from app.db.session import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    pet_id = Column(String, index=True, nullable=False) # Refers to pets.id from adopciones app
    veterinarian_id = Column(String, index=True, nullable=True) # Refers to veterinarians.id from directorio app
    clinic_id = Column(String, index=True, nullable=True) # Refers to clinics.id
    
    date = Column(DateTime(timezone=True), server_default=func.now())
    reason_for_visit = Column(String, nullable=False)
    diagnosis = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    weight_kg = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

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
