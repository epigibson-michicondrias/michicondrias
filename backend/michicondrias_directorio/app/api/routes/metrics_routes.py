from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import date, datetime, timedelta

from app.crud.crud_clinic import get_clinic
from app.crud.dashboard_crud import get_daily_metrics, create_or_update_daily_metrics, calculate_real_time_metrics
from app.api import deps
from app.db.session import get_db
from app.models.dashboard import ClinicMetrics

router = APIRouter()

@router.get("/clinics/{clinic_id}/metrics/daily")
def get_daily_metrics_endpoint(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Get daily clinical metrics for a clinic dashboard."""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    today = date.today()
    
    # Intentar obtener métricas existentes
    existing_metrics = get_daily_metrics(db, clinic_id, today)
    
    if existing_metrics:
        # Usar métricas existentes
        metrics = existing_metrics
    else:
        # Calcular métricas en tiempo real y guardarlas
        realtime_metrics = calculate_real_time_metrics(db, clinic_id)
        
        # Crear o actualizar métricas en la base de datos
        metrics = create_or_update_daily_metrics(db, clinic_id, today, realtime_metrics)
    
    return {
        "todayAppointments": metrics.today_appointments,
        "pendingConfirmations": metrics.pending_confirmations,
        "surgeriesToday": metrics.surgeries_today,
        "emergencyCases": metrics.emergency_cases,
        "vaccinationsToday": metrics.vaccinations_today,
        "checkupsToday": metrics.checkups_today,
        "labResultsPending": metrics.lab_results_pending,
        "prescriptionsActive": metrics.prescriptions_active,
        "inventoryAlerts": metrics.inventory_alerts,
        "dailyRevenue": float(metrics.daily_revenue) if metrics.daily_revenue else 0,
        "occupancyRate": metrics.occupancy_rate or 0,
        "newPatientsToday": metrics.new_patients_today,
        "criticalPatients": metrics.critical_patients
    }

@router.post("/clinics/{clinic_id}/metrics/daily")
def update_daily_metrics(
    clinic_id: str,
    metrics_data: dict,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Update daily metrics for a clinic."""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    today = date.today()
    
    # Crear o actualizar métricas
    updated_metrics = create_or_update_daily_metrics(db, clinic_id, today, metrics_data)
    
    return {
        "id": str(updated_metrics.id),
        "clinic_id": updated_metrics.clinic_id,
        "metric_date": updated_metrics.metric_date.isoformat(),
        "updated_at": updated_metrics.updated_at.isoformat() if updated_metrics.updated_at else None
    }

@router.get("/clinics/{clinic_id}/metrics/weekly")
def get_weekly_metrics(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Get weekly metrics for a clinic."""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener métricas de los últimos 7 días
    start_date = date.today() - timedelta(days=7)
    
    weekly_metrics = db.query(ClinicMetrics).filter(
        ClinicMetrics.clinic_id == clinic_id,
        ClinicMetrics.metric_date >= start_date
    ).order_by(ClinicMetrics.metric_date).all()
    
    # Calcular totales semanales
    weekly_totals = {
        "totalAppointments": sum(m.today_appointments for m in weekly_metrics),
        "totalSurgeries": sum(m.surgeries_today for m in weekly_metrics),
        "totalEmergencies": sum(m.emergency_cases for m in weekly_metrics),
        "totalVaccinations": sum(m.vaccinations_today for m in weekly_metrics),
        "totalRevenue": sum(float(m.daily_revenue or 0) for m in weekly_metrics),
        "averageOccupancy": sum(m.occupancy_rate or 0 for m in weekly_metrics) // len(weekly_metrics) if weekly_metrics else 0,
        "totalNewPatients": sum(m.new_patients_today for m in weekly_metrics),
        "days": [
            {
                "date": m.metric_date.isoformat(),
                "appointments": m.today_appointments,
                "surgeries": m.surgeries_today,
                "emergencies": m.emergency_cases,
                "revenue": float(m.daily_revenue) if m.daily_revenue else 0
            }
            for m in weekly_metrics
        ]
    }
    
    return weekly_totals
