from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime

from app.api import deps
from app.core.config import settings
from app.models.dashboard import Prescriptions
from app.models.clinic import Clinic
from sqlalchemy import text, bindparam
from app.crud.crud_services import notify_user

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
        
    prescriptions = query.order_by(Prescriptions.issued_date.desc()).all()

    pet_ids = list({p.patient_id for p in prescriptions if p.patient_id})
    names = {}
    if pet_ids:
        try:
            rows = db.execute(text("SELECT id, name FROM pets WHERE id IN :ids").bindparams(bindparam("ids", expanding=True)), {"ids": pet_ids}).fetchall()
            names = {r[0]: r[1] for r in rows}
        except Exception:
            db.rollback()

    return [
        {
            "id": str(p.id),
            "patientId": p.patient_id,
            "patientName": names.get(p.patient_id),
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
        
    generate_link = prescription_data.get("generatePurchaseLink", False)

    patient_id = prescription_data.get("patientId")
    if not patient_id:
        raise HTTPException(status_code=400, detail="Indica el paciente de la receta")
    if not prescription_data.get("medications"):
        raise HTTPException(status_code=400, detail="La receta necesita al menos un medicamento")
    pet_row = db.execute(text("SELECT owner_id, name FROM pets WHERE id = :pid"), {"pid": patient_id}).first()
    if not pet_row:
        raise HTTPException(status_code=404, detail="La mascota indicada no existe")
    
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
    
    if pet_row[0] and pet_row[0] != user_id:
        notify_user(db, pet_row[0], "Nueva receta médica", f"{clinic.name} emitió una receta para {pet_row[1] or 'tu mascota'}.", "recetas", link=f"/mascotas/{patient_id}?tab=historial")

    response_data = {
        "id": str(new_prescription.id), 
        "message": "Prescription created successfully"
    }
    
    if generate_link:
        # Generate the unified checkout/purchase link targeting the ecommerce platform
        purchase_url = f"{settings.API_GATEWAY_URL}/ecommerce/checkout?prescription_id={new_prescription.id}"
        response_data["purchase_link"] = purchase_url
        response_data["message"] += " and purchase link generated"
        
    return response_data


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
        if status_data["status"] not in ("active", "filled", "cancelled", "expired"):
            raise HTTPException(status_code=400, detail="Estado de receta no válido")
        prescription.status = status_data["status"]
        if prescription.status == "filled" and not prescription.filled_date:
            prescription.filled_date = datetime.utcnow()
            
    db.commit()
    return {"message": "Prescription updated successfully"}
