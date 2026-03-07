from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import date, datetime, timedelta

from app.crud.crud_clinic import get_clinic
from app.crud.dashboard_crud import get_critical_patients, create_medical_record_extended
from app.api import deps
from app.db.session import get_db
from app.models.dashboard import MedicalRecordExtended

router = APIRouter()

@router.get("/clinics/{clinic_id}/patients/critical")
def get_critical_patients_endpoint(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Get critical patients for a clinic dashboard."""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener pacientes críticos desde Supabase
    critical_patients = get_critical_patients(db, clinic_id)
    
    # Formatear respuesta para el frontend
    result = []
    for patient in critical_patients:
        # Obtener información adicional si es necesario
        # Por ahora, usamos los datos del registro extendido
        
        result.append({
            "id": patient.original_record_id,
            "name": "Paciente",  # Se obtendría de la tabla pets
            "owner": "Dueño",     # Se obtendría de la tabla users
            "condition": patient.status,
            "status": "Estable" if patient.alert_level == "green" else "Crítico",
            "nextCheckup": patient.next_checkup_date.isoformat() if patient.next_checkup_date else None,
            "treatment": "Monitoreo activo",
            "alertLevel": patient.alert_level,
            "vetId": None,  # Se obtendría del medical record original
            "clinicId": clinic_id
        })
    
    return result

@router.post("/clinics/{clinic_id}/patients/critical")
def create_critical_patient(
    clinic_id: str,
    patient_data: dict,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Create a new critical patient record."""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Agregar clinic_id al registro
    patient_data["clinic_id"] = clinic_id
    
    # Crear registro extendido
    new_patient = create_medical_record_extended(db, patient_data)
    
    return {
        "id": str(new_patient.id),
        "original_record_id": new_patient.original_record_id,
        "status": new_patient.status,
        "alert_level": new_patient.alert_level,
        "is_critical": new_patient.is_critical,
        "created_at": new_patient.created_at.isoformat()
    }
