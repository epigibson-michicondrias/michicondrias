from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta

from app.crud.crud_clinic import get_clinic
from app.crud.dashboard_crud import get_clinic_alerts, create_clinic_alert, generate_automatic_alerts, format_time_ago
from app.api import deps
from app.db.session import get_db
from app.models.dashboard import ClinicAlerts

router = APIRouter()

@router.get("/clinics/{clinic_id}/alerts")
def get_clinic_alerts_endpoint(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Get clinical alerts for a clinic dashboard."""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener alertas desde Supabase
    alerts = get_clinic_alerts(db, clinic_id, unread_only=False)
    
    # Si no hay alertas, generar automáticas
    if not alerts:
        alerts = generate_automatic_alerts(db, clinic_id)
    
    # Formatear respuesta para el frontend
    result = []
    for alert in alerts:
        result.append({
            "id": str(alert.id),
            "type": alert.type,
            "title": alert.title,
            "message": alert.message,
            "priority": alert.priority,
            "time": format_time_ago(alert.created_at),
            "icon": alert.icon or "AlertTriangle",
            "color": alert.color or "#ef4444",
            "isRead": alert.is_read,
            "actionUrl": alert.action_url or "/dashboard"
        })
    
    return result

@router.post("/clinics/{clinic_id}/alerts")
def create_clinic_alert_endpoint(
    clinic_id: str,
    alert_data: dict,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Create a new clinic alert."""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Agregar clinic_id y valores por defecto
    alert_data["clinic_id"] = clinic_id
    alert_data.setdefault("expires_at", datetime.now() + timedelta(days=30))
    alert_data.setdefault("is_read", False)
    
    # Crear alerta
    new_alert = create_clinic_alert(db, alert_data)
    
    return {
        "id": str(new_alert.id),
        "type": new_alert.type,
        "title": new_alert.title,
        "message": new_alert.message,
        "priority": new_alert.priority,
        "created_at": new_alert.created_at.isoformat(),
        "is_read": new_alert.is_read
    }

@router.put("/alerts/{alert_id}/read")
def mark_alert_as_read(
    alert_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Mark an alert as read."""
    # Buscar alerta
    alert = db.query(ClinicAlerts).filter(ClinicAlerts.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    # Verificar permisos (el usuario debe pertenecer a la clínica de la alerta)
    clinic = get_clinic(db, alert.clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Marcar como leída
    alert.is_read = True
    alert.read_at = datetime.now()
    db.commit()
    
    return {
        "id": str(alert.id),
        "is_read": alert.is_read,
        "read_at": alert.read_at.isoformat() if alert.read_at else None
    }

@router.get("/clinics/{clinic_id}/alerts/unread")
def get_unread_alerts(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Get unread alerts for a clinic."""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener solo alertas no leídas
    unread_alerts = get_clinic_alerts(db, clinic_id, unread_only=True)
    
    # Contar alertas por tipo y prioridad
    alert_counts = {
        "total": len(unread_alerts),
        "by_type": {},
        "by_priority": {
            "high": 0,
            "medium": 0,
            "low": 0
        }
    }
    
    for alert in unread_alerts:
        # Contar por tipo
        alert_counts["by_type"][alert.type] = alert_counts["by_type"].get(alert.type, 0) + 1
        
        # Contar por prioridad
        if alert.priority in alert_counts["by_priority"]:
            alert_counts["by_priority"][alert.priority] += 1
    
    return alert_counts

@router.delete("/alerts/{alert_id}")
def delete_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Delete an alert."""
    # Buscar alerta
    alert = db.query(ClinicAlerts).filter(ClinicAlerts.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    # Verificar permisos
    clinic = get_clinic(db, alert.clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Eliminar alerta
    db.delete(alert)
    db.commit()
    
    return {"message": "Alerta eliminada exitosamente"}
