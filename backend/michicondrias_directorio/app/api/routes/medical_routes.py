from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime, timedelta

from app.db.session import get_db
from app.api.deps import get_current_user_id
from app.models.services import Appointment
from app.models.medical import MedicalRecord, Prescription, MedicationReminder
from app.schemas.medical import MedicalRecordCreate, MedicalRecordResponse

router = APIRouter()

@router.post("/{appointment_id}", response_model=MedicalRecordResponse)
def create_medical_record(
    appointment_id: str,
    data: MedicalRecordCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Creates a medical record for a specific appointment.
    Also creates any nested prescriptions and auto-generates medication reminders.
    """
    # 1. Verify Appointment exists and is accessible
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    
    # 2. Check if a record already exists for this appointment
    existing = db.query(MedicalRecord).filter(MedicalRecord.appointment_id == appointment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Esta cita ya tiene un expediente guardado")

    # 3. Create Medical Record
    record = MedicalRecord(
        appointment_id=appointment_id,
        pet_id=data.pet_id,
        clinic_id=appt.clinic_id,
        vet_id=appt.vet_id,
        diagnosis=data.diagnosis,
        weight_kg=data.weight_kg,
        temperature_c=data.temperature_c,
        clinical_notes=data.clinical_notes,
    )
    db.add(record)
    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad al guardar el expediente")
    
    db.refresh(record)

    # 4. Create Prescriptions & Reminders
    for p_data in data.prescriptions:
        prescription = Prescription(
            medical_record_id=record.id,
            medication_name=p_data.medication_name,
            dosage=p_data.dosage,
            frequency_hours=p_data.frequency_hours,
            duration_days=p_data.duration_days,
            instructions=p_data.instructions,
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        
        # 5. Auto-Generate Reminders (Magic math!)
        # Total dose count = (duration_days * 24 hours) / frequency_hours
        total_doses = int((p_data.duration_days * 24) / p_data.frequency_hours)
        
        # Start reminders from now (or you can offset it by the first frequency)
        # Assuming the first dose is taken now, the next reminder is in 'frequency_hours'
        current_time = datetime.utcnow()
        
        for i in range(1, total_doses + 1):
            remind_time = current_time + timedelta(hours=(p_data.frequency_hours * i))
            reminder = MedicationReminder(
                prescription_id=prescription.id,
                pet_id=data.pet_id,
                remind_at=remind_time.isoformat() + "Z", # UTC ISO format
            )
            db.add(reminder)
            
    db.commit()
    
    # Mark the appointment as completed if it wasn't already
    if appt.status in ["confirmed", "pending"]:
        appt.status = "completed"
        db.commit()

    # Re-fetch with relationships for Response (Assuming we add relationships, but doing manual query here is fine)
    record_obj = db.query(MedicalRecord).filter(MedicalRecord.id == record.id).first()
    record_obj.prescriptions = db.query(Prescription).filter(Prescription.medical_record_id == record.id).all()
    return record_obj


@router.get("/appointment/{appointment_id}", response_model=MedicalRecordResponse)
def get_medical_record_by_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Retrieve the Medical Record and its Prescriptions for a specific appointment."""
    record = db.query(MedicalRecord).filter(MedicalRecord.appointment_id == appointment_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No hay expediente para esta cita")
        
    record.prescriptions = db.query(Prescription).filter(Prescription.medical_record_id == record.id).all()
    return record


@router.get("/pet/{pet_id}", response_model=List[MedicalRecordResponse])
def get_medical_history_by_pet(
    pet_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Retrieve the full medical history for a specific pet."""
    records = db.query(MedicalRecord).filter(MedicalRecord.pet_id == pet_id).order_by(MedicalRecord.created_at.desc()).all()
    
    for r in records:
        r.prescriptions = db.query(Prescription).filter(Prescription.medical_record_id == r.id).all()
        
    return records
