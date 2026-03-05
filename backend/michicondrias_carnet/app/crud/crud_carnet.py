from sqlalchemy.orm import Session
from app.models.carnet import MedicalRecord, Vaccine, Prescription, MedicationReminder
from app.schemas.carnet import MedicalRecordCreate, MedicalRecordUpdate, VaccineCreate, VaccineUpdate

# CRUD MEDICAL RECORDS
from datetime import datetime, timedelta, timezone

def get_medical_record(db: Session, record_id: str):
    return db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()

def get_medical_records_by_pet(db: Session, pet_id: str, skip: int = 0, limit: int = 100):
    # joinedload prescriptions to avoid n+1
    from sqlalchemy.orm import joinedload
    return db.query(MedicalRecord).options(joinedload(MedicalRecord.prescriptions)).filter(MedicalRecord.pet_id == pet_id).order_by(MedicalRecord.date.desc()).offset(skip).limit(limit).all()

def create_medical_record(db: Session, record: MedicalRecordCreate, vet_id: str = None):
    # Extract prescriptions from the payload
    prescriptions_data = record.prescriptions
    
    # Create the MedicalRecord
    record_data = record.model_dump(exclude={"prescriptions"})
    db_record = MedicalRecord(**record_data)
    db_record.veterinarian_id = vet_id
    db.add(db_record)
    db.flush() # flush to get the record ID
    
    # Process Prescriptions
    if prescriptions_data:
        for p_data in prescriptions_data:
            db_prescription = Prescription(**p_data.model_dump())
            db_prescription.medical_record_id = db_record.id
            db.add(db_prescription)
            db.flush() # flush to get the prescription ID
            
            # Generate automated MedicationReminders
            if db_prescription.frequency_hours > 0 and db_prescription.duration_days > 0:
                total_hours = db_prescription.duration_days * 24
                # Calculate how many doses are needed
                doses_count = total_hours // db_prescription.frequency_hours
                
                # Start remind time from *now* (or next interval)
                start_time = datetime.now(timezone.utc)
                for i in range(1, doses_count + 1):
                    # For example, every 8 hours
                    remind_time = start_time + timedelta(hours=db_prescription.frequency_hours * i)
                    db_reminder = MedicationReminder(
                        prescription_id=db_prescription.id,
                        pet_id=db_record.pet_id,
                        remind_at=remind_time.isoformat(),
                        sent=False
                    )
                    db.add(db_reminder)
                
    db.commit()
    db.refresh(db_record)
    return db_record

def update_medical_record(db: Session, db_record: MedicalRecord, record_update: MedicalRecordUpdate):
    update_data = record_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

# CRUD VACCINES
def get_vaccine(db: Session, vaccine_id: str):
    return db.query(Vaccine).filter(Vaccine.id == vaccine_id).first()

def get_vaccines_by_pet(db: Session, pet_id: str, skip: int = 0, limit: int = 100):
    return db.query(Vaccine).filter(Vaccine.pet_id == pet_id).order_by(Vaccine.date_administered.desc()).offset(skip).limit(limit).all()

def create_vaccine(db: Session, vaccine: VaccineCreate, vet_id: str = None):
    db_vaccine = Vaccine(**vaccine.model_dump())
    db_vaccine.administered_by_vet_id = vet_id
    db.add(db_vaccine)
    db.commit()
    db.refresh(db_vaccine)
    return db_vaccine

def update_vaccine(db: Session, db_vaccine: Vaccine, vaccine_update: VaccineUpdate):
    update_data = vaccine_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vaccine, key, value)
    db.add(db_vaccine)
    db.commit()
    db.refresh(db_vaccine)
    return db_vaccine
