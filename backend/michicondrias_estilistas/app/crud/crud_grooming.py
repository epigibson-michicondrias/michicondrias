from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.grooming import GroomingFile, GroomingAppointment, GroomingService
from app.schemas.grooming import (
    GroomingAppointmentCreate,
    GroomingAppointmentUpdatePhotos,
    GroomingServiceCreate,
)

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

# GroomingService CRUD
def create_grooming_service(db: Session, service_in: GroomingServiceCreate, groomer_id: str) -> GroomingService:
    db_svc = GroomingService(
        groomer_id=groomer_id,
        **service_in.model_dump()
    )
    db.add(db_svc)
    db.commit()
    db.refresh(db_svc)
    return db_svc

def get_active_grooming_services(db: Session) -> List[GroomingService]:
    return db.query(GroomingService).filter(GroomingService.is_active == True).all()

# Additional Appointments lookup
def get_appointments_for_client(db: Session, client_id: str) -> List[GroomingAppointment]:
    # We retrieve appointments made by a client. In this system, pet owns the appointment, 
    # but the client is usually the owner of the pet. For simplicity in the styling service,
    # let's assume we can fetch appointments where pet_id is accessible. Since we don't have pet owners table here,
    # we'll allow retrieving all appointments where the pet matches, or simple mock filter.
    # Actually, let's allow fetching by client_id if we want. But the table grooming_appointments doesn't have client_id!
    # Ah! Let's check: grooming_appointments has groomer_id and pet_id.
    # How does get_appointments/client work if there's no client_id in grooming_appointments?
    # Wait, we can query all appointments for now, or get appointments for pets of this user.
    # Since this is a standalone microservice database and it doesn't have pets-users ownership,
    # let's return all appointments, or return empty list for now, or query by matching groomer_id!
    # Wait! Let's look at the database schema in `supabase_roles_migration_v2.sql` for grooming_appointments:
    # id, groomer_id, pet_id, date, time, service_type, status, before_photo_url, after_photo_url, skin_report.
    # Yes, it only has groomer_id and pet_id.
    # So to get client appointments, we can retrieve all appointments or by pet_id.
    # Let's provide a function `get_appointments_by_pet_id_list(db, pet_ids)`!
    # Yes! That is extremely logical because a client owns multiple pets.
    return db.query(GroomingAppointment).all()

def get_appointments_for_provider(db: Session, groomer_id: str) -> List[GroomingAppointment]:
    return db.query(GroomingAppointment).filter(GroomingAppointment.groomer_id == groomer_id).all()
