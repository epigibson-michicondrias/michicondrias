from sqlalchemy.orm import Session
from app.models.carnet import MedicalRecord, Vaccine
from app.schemas.carnet import MedicalRecordCreate, MedicalRecordUpdate, VaccineCreate, VaccineUpdate

# CRUD MEDICAL RECORDS
def get_medical_record(db: Session, record_id: str):
    return db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()

def get_medical_records_by_pet(db: Session, pet_id: str, skip: int = 0, limit: int = 100):
    return db.query(MedicalRecord).filter(MedicalRecord.pet_id == pet_id).offset(skip).limit(limit).all()

def create_medical_record(db: Session, record: MedicalRecordCreate, vet_id: str = None):
    db_record = MedicalRecord(**record.model_dump())
    db_record.veterinarian_id = vet_id
    db.add(db_record)
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
