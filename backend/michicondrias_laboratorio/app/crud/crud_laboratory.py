from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.laboratory import LabOrder, LabResult, LabTestCatalog, LabAppointment
from app.schemas.laboratory import (
    LabOrderCreate,
    LabResultsUpload,
    LabTestCatalogCreate,
    LabAppointmentCreate,
)

def create_order(db: Session, order_in: LabOrderCreate, requesting_vet_id: str) -> LabOrder:
    db_order = LabOrder(
        pet_id=order_in.pet_id,
        lab_id=order_in.lab_id,
        test_names=order_in.test_names,
        requesting_vet_id=requesting_vet_id,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_pending_orders_for_lab(db: Session, lab_id: str) -> List[LabOrder]:
    return db.query(LabOrder).filter(
        LabOrder.lab_id == lab_id,
        LabOrder.status == "pending"
    ).all()

def get_order_by_id(db: Session, order_id: str) -> Optional[LabOrder]:
    return db.query(LabOrder).filter(LabOrder.id == order_id).first()

def upload_results(db: Session, order_id: str, results_in: LabResultsUpload) -> Optional[LabOrder]:
    db_order = get_order_by_id(db, order_id)
    if not db_order:
        return None
    
    # Update status to completed
    db_order.status = "completed"
    
    # Create results
    for item in results_in.results:
        db_result = LabResult(
            order_id=order_id,
            parameter_name=item.parameter_name,
            measured_value=item.measured_value,
            reference_range=item.reference_range,
            unit=item.unit,
            is_anomaly=item.is_anomaly,
            pdf_report_url=results_in.pdf_report_url
        )
        db.add(db_result)
        
    db.commit()
    db.refresh(db_order)
    return db_order

def get_completed_results_by_pet(db: Session, pet_id: str) -> List[LabResult]:
    return db.query(LabResult).join(LabOrder).filter(
        LabOrder.pet_id == pet_id,
        LabOrder.status == "completed"
    ).all()

# LabTestCatalog CRUD
def create_lab_test(db: Session, test_in: LabTestCatalogCreate, lab_id: str) -> LabTestCatalog:
    db_test = LabTestCatalog(
        lab_id=lab_id,
        **test_in.model_dump()
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

def get_active_lab_tests(db: Session) -> List[LabTestCatalog]:
    return db.query(LabTestCatalog).filter(LabTestCatalog.is_active == True).all()

def get_lab_test_by_id(db: Session, test_id: str) -> Optional[LabTestCatalog]:
    return db.query(LabTestCatalog).filter(LabTestCatalog.id == test_id).first()

# LabAppointment CRUD
def create_lab_appointment(db: Session, app_in: LabAppointmentCreate, client_id: str) -> LabAppointment:
    db_app = LabAppointment(
        client_id=client_id,
        **app_in.model_dump()
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def get_appointments_for_client(db: Session, client_id: str) -> List[LabAppointment]:
    return db.query(LabAppointment).filter(LabAppointment.client_id == client_id).all()

def get_appointments_for_provider(db: Session, lab_id: str) -> List[LabAppointment]:
    return db.query(LabAppointment).filter(LabAppointment.lab_id == lab_id).all()
