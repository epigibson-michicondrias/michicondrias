from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime

from app.api import deps
from app.models.dashboard import LabTests
from app.models.clinic import Clinic
from sqlalchemy import text, bindparam
from app.crud.crud_services import notify_user

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_clinic_lab_tests(
    clinic_id: str,
    status: str = None,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    query = db.query(LabTests).filter(LabTests.clinic_id == clinic_id)
    if status:
        query = query.filter(LabTests.status == status)
        
    tests = query.order_by(LabTests.requested_date.desc()).all()

    pet_ids = list({t.patient_id for t in tests if t.patient_id})
    names = {}
    if pet_ids:
        try:
            rows = db.execute(text("SELECT id, name FROM pets WHERE id IN :ids").bindparams(bindparam("ids", expanding=True)), {"ids": pet_ids}).fetchall()
            names = {r[0]: r[1] for r in rows}
        except Exception:
            db.rollback()

    return [
        {
            "id": str(t.id),
            "patientId": t.patient_id,
            "patientName": names.get(t.patient_id),
            "results": t.results,
            "interpretation": t.interpretation,
            "testType": t.test_type,
            "testName": t.test_name,
            "status": t.status,
            "requestedDate": t.requested_date.isoformat() if t.requested_date else None,
            "completedDate": t.completed_date.isoformat() if t.completed_date else None,
            "requestingVetId": t.requesting_vet_id
        }
        for t in tests
    ]

@router.post("/")
def request_lab_test(
    clinic_id: str,
    test_data: dict,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    if not test_data.get("patientId") or not test_data.get("testName"):
        raise HTTPException(status_code=400, detail="Indica el paciente y el nombre del estudio")
    if not db.execute(text("SELECT 1 FROM pets WHERE id = :pid"), {"pid": test_data.get("patientId")}).first():
        raise HTTPException(status_code=404, detail="La mascota indicada no existe")

    new_test = LabTests(
        clinic_id=clinic_id,
        patient_id=test_data.get("patientId"),
        test_type=test_data.get("testType"),
        test_name=test_data.get("testName"),
        description=test_data.get("description", ""),
        requesting_vet_id=test_data.get("vetId"),
        status="pending"
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    
    return {"id": str(new_test.id), "message": "Lab test requested successfully"}

@router.put("/{test_id}")
def update_lab_test_results(
    clinic_id: str,
    test_id: str,
    result_data: dict,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    test = db.query(LabTests).filter(
        LabTests.id == test_id,
        LabTests.clinic_id == clinic_id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Lab test not found")
        
    was_completed = test.status == "completed"
    if "status" in result_data:
        if result_data["status"] not in ("pending", "processing", "in_progress", "completed", "cancelled"):
            raise HTTPException(status_code=400, detail="Estado de estudio no válido")
        test.status = result_data["status"]
        if test.status == "completed" and not test.completed_date:
            test.completed_date = datetime.utcnow()
            
    if "results" in result_data:
        test.results = result_data["results"]
    if "interpretation" in result_data:
        test.interpretation = result_data["interpretation"]
        
    db.commit()

    # Avisar al dueño de la mascota cuando los resultados quedan listos (solo la primera vez)
    if test.status == "completed" and not was_completed and test.patient_id:
        try:
            row = db.execute(text("SELECT owner_id, name FROM pets WHERE id = :pid"), {"pid": test.patient_id}).first()
        except Exception:
            db.rollback()
            row = None
        if row and row[0] and row[0] != user_id:
            notify_user(
                db, row[0], "Resultados de laboratorio listos",
                f"Ya están disponibles los resultados de {test.test_name or 'el estudio'} de {row[1] or 'tu mascota'} en {clinic.name}.",
                "laboratorio",
            )
    return {"message": "Lab test updated successfully"}
