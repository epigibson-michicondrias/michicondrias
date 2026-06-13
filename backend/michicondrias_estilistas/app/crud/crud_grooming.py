from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.grooming import GroomingFile, GroomingAppointment
from app.schemas.grooming import GroomingAppointmentCreate, GroomingAppointmentUpdatePhotos

def create_appointment(db: Session, appointment_in: GroomingAppointmentCreate) -> GroomingAppointment:
    db_appt = GroomingAppointment(**appointment_in.model_dump())
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt

def get_appointment(db: Session, appointment_id: str) -> Optional[GroomingAppointment]:
    return db.query(GroomingAppointment).filter(GroomingAppointment.id == appointment_id).first()

def update_appointment_photos(
    db: Session, 
    db_appt: GroomingAppointment, 
    update_in: GroomingAppointmentUpdatePhotos
) -> GroomingAppointment:
    update_data = update_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_appt, key, value)
    
    # If status is updated to completed, update GroomingFile's last_service_date
    if db_appt.status in ["completed", "completada"]:
        grooming_file = get_or_create_grooming_file(db, db_appt.pet_id)
        grooming_file.last_service_date = db_appt.date
        db.add(grooming_file)
        
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt

def get_grooming_file(db: Session, pet_id: str) -> Optional[GroomingFile]:
    return db.query(GroomingFile).filter(GroomingFile.pet_id == pet_id).first()

def get_or_create_grooming_file(db: Session, pet_id: str) -> GroomingFile:
    db_file = db.query(GroomingFile).filter(GroomingFile.pet_id == pet_id).first()
    if not db_file:
        db_file = GroomingFile(
            pet_id=pet_id,
            hair_type=None,
            preferred_shampoo=None,
            behavior_notes=None,
            allergies_detected=None,
            last_service_date=None
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
    return db_file

def get_appointments_by_pet(db: Session, pet_id: str) -> List[GroomingAppointment]:
    return db.query(GroomingAppointment).filter(GroomingAppointment.pet_id == pet_id).order_by(GroomingAppointment.date.desc(), GroomingAppointment.time.desc()).all()
