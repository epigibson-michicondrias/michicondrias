from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime

from app.api import deps
from app.models.dashboard import Prescriptions
from app.models.clinic import Clinic

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_clinic_prescriptions(
    clinic_id: str,
    status: str = None,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    query = db.query(Prescriptions).filter(Prescriptions.clinic_id == clinic_id)
    if status:
        query = query.filter(Prescriptions.status == status)
        
    prescriptions = query.all()
    
    return [
        {
            "id": str(p.id),
            "patientId": p.patient_id,
            "veterinarianId": p.veterinarian_id,
            "medications": p.medications,
            "status": p.status,
            "notes": p.notes,
            "issuedDate": p.issued_date.isoformat() if p.issued_date else None,
            "expiryDate": p.expiry_date.isoformat() if p.expiry_date else None,
            "filledDate": p.filled_date.isoformat() if p.filled_date else None
        }
        for p in prescriptions
    ]

@router.post("/")
def create_prescription(
    clinic_id: str,
    prescription_data: dict,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    # Assume expiry date is 7 days from now if not provided
    
    new_prescription = Prescriptions(
        clinic_id=clinic_id,
        patient_id=prescription_data.get("patientId"),
        veterinarian_id=prescription_data.get("veterinarianId"),
        medications=prescription_data.get("medications", []),
        notes=prescription_data.get("notes", ""),
        status="active"
    )
    db.add(new_prescription)
    db.commit()
    db.refresh(new_prescription)
    
    return {"id": str(new_prescription.id), "message": "Prescription created successfully"}

@router.put("/{presc_id}")
def update_prescription_status(
    clinic_id: str,
    presc_id: str,
    status_data: dict,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    prescription = db.query(Prescriptions).filter(
        Prescriptions.id == presc_id,
        Prescriptions.clinic_id == clinic_id
    ).first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    if "status" in status_data:
        prescription.status = status_data["status"]
        if prescription.status == "filled" and not prescription.filled_date:
            prescription.filled_date = datetime.utcnow()
            
    db.commit()
    return {"message": "Prescription updated successfully"}
