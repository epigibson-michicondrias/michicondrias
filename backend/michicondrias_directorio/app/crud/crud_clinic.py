from sqlalchemy.orm import Session
from app.models.clinic import Clinic, Veterinarian
from app.schemas.clinic import ClinicCreate, ClinicUpdate, VeterinarianCreate, VeterinarianUpdate

# CRUD CLINICS
def get_clinic(db: Session, clinic_id: str):
    return db.query(Clinic).filter(Clinic.id == clinic_id).first()

def get_clinics(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Clinic).offset(skip).limit(limit).all()

def create_clinic(db: Session, clinic: ClinicCreate, owner_user_id: str = None):
    db_clinic = Clinic(**clinic.model_dump())
    db_clinic.owner_user_id = owner_user_id
    db.add(db_clinic)
    db.commit()
    db.refresh(db_clinic)
    return db_clinic

def update_clinic(db: Session, db_clinic: Clinic, clinic_update: ClinicUpdate):
    update_data = clinic_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_clinic, key, value)
    
    db.add(db_clinic)
    db.commit()
    db.refresh(db_clinic)
    return db_clinic

def remove_clinic(db: Session, clinic_id: str):
    db_clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if db_clinic:
        db.delete(db_clinic)
        db.commit()
    return db_clinic

# CRUD VETERINARIANS
def get_veterinarian(db: Session, vet_id: str):
    return db.query(Veterinarian).filter(Veterinarian.id == vet_id).first()

def get_veterinarians(db: Session, skip: int = 0, limit: int = 100, clinic_id: str = None):
    query = db.query(Veterinarian)
    if clinic_id:
        query = query.filter(Veterinarian.clinic_id == clinic_id)
    return query.offset(skip).limit(limit).all()

def create_veterinarian(db: Session, vet: VeterinarianCreate, user_id: str = None):
    db_vet = Veterinarian(**vet.model_dump())
    db_vet.user_id = user_id
    db.add(db_vet)
    db.commit()
    db.refresh(db_vet)
    return db_vet

def update_veterinarian(db: Session, db_vet: Veterinarian, vet_update: VeterinarianUpdate):
    update_data = vet_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vet, key, value)
    
    db.add(db_vet)
    db.commit()
    db.refresh(db_vet)
    return db_vet

def remove_veterinarian(db: Session, vet_id: str):
    db_vet = db.query(Veterinarian).filter(Veterinarian.id == vet_id).first()
    if db_vet:
        db.delete(db_vet)
        db.commit()
    return db_vet
