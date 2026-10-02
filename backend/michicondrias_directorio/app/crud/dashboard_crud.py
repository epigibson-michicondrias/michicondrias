from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from app.core.config import settings

from app.models.dashboard import (
    MedicalRecordExtended, ClinicMetrics, ClinicAlerts, 
    InventoryItems, LabTests, Surgeries
)

def clinic_now() -> datetime:
    return datetime.now(ZoneInfo(settings.CLINIC_TIMEZONE))


def clinic_today() -> date:
    """\"Hoy\" en la zona horaria de la clínica (el servidor corre en UTC: desde las 18:00 de México ya sería mañana)."""
    return clinic_now().date()


def _day_bounds(day: date):
    tz = ZoneInfo(settings.CLINIC_TIMEZONE)
    start = datetime.combine(day, time.min, tzinfo=tz)
    return start, start + timedelta(days=1)


# Medical Records Extended CRUD
def get_critical_patients(db: Session, clinic_id: str) -> List[MedicalRecordExtended]:
    """Obtener pacientes críticos para el dashboard"""
    return db.query(MedicalRecordExtended).filter(
        MedicalRecordExtended.clinic_id == clinic_id,
        MedicalRecordExtended.is_critical == True,
        MedicalRecordExtended.alert_level.in_(["yellow", "red"])
    ).order_by(desc(MedicalRecordExtended.alert_level)).all()

def create_medical_record_extended(
    db: Session, 
    record_data: dict
) -> MedicalRecordExtended:
    """Crear un registro médico extendido"""
    db_record = MedicalRecordExtended(**record_data)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def update_medical_record_extended(
    db: Session,
    record_id: str,
    record_data: dict
) -> Optional[MedicalRecordExtended]:
    """Actualizar un registro médico extendido"""
    db_record = db.query(MedicalRecordExtended).filter(
        MedicalRecordExtended.id == record_id
    ).first()
    
    if db_record:
        for key, value in record_data.items():
            setattr(db_record, key, value)
        db.commit()
        db.refresh(db_record)
    
    return db_record

# Clinic Metrics CRUD
def get_daily_metrics(
    db: Session, 
    clinic_id: str, 
    metric_date: date
) -> Optional[ClinicMetrics]:
    """Obtener métricas diarias de una clínica"""
    return db.query(ClinicMetrics).filter(
        ClinicMetrics.clinic_id == clinic_id,
        ClinicMetrics.metric_date == datetime.combine(metric_date, time.min)
    ).first()

def create_or_update_daily_metrics(
    db: Session,
    clinic_id: str,
    metric_date: date,
    metrics_data: dict
) -> ClinicMetrics:
    """Crear o actualizar métricas diarias"""
    existing_metrics = get_daily_metrics(db, clinic_id, metric_date)
    
    if existing_metrics:
        # Actualizar métricas existentes
        for key, value in metrics_data.items():
            setattr(existing_metrics, key, value)
        db.commit()
        db.refresh(existing_metrics)
        return existing_metrics
    else:
        # Crear nuevas métricas
        metrics_data.update({
            "clinic_id": clinic_id,
            "metric_date": datetime.combine(metric_date, time.min)
        })
        db_metrics = ClinicMetrics(**metrics_data)
        db.add(db_metrics)
        db.commit()
        db.refresh(db_metrics)
        return db_metrics

def calculate_real_time_metrics(db: Session, clinic_id: str) -> dict:
    """Métricas del día calculadas desde los datos reales de la clínica.

    Devuelve claves con los nombres de las columnas de ClinicMetrics (snake_case)."""
    from app.models.services import Appointment, ClinicService, ClinicSchedule
    from app.models.dashboard import Prescriptions, LabTests, InventoryItems

    today = clinic_today()
    day_start, day_end = _day_bounds(today)
    not_cancelled = Appointment.status != "cancelled"

    todays = db.query(Appointment).filter(Appointment.clinic_id == clinic_id, Appointment.date == today, not_cancelled)
    today_appointments = todays.count()

    pending_confirmations = db.query(Appointment).filter(
        Appointment.clinic_id == clinic_id, Appointment.status == "pending", Appointment.date >= today
    ).count()

    # Citas de hoy según el tipo de servicio
    def todays_by_service(*keywords):
        conds = []
        for k in keywords:
            conds += [ClinicService.category.ilike(f"%{k}%"), ClinicService.name.ilike(f"%{k}%")]
        return todays.join(ClinicService, ClinicService.id == Appointment.service_id).filter(or_(*conds)).count()

    vaccinations_today = todays_by_service("vacun")
    checkups_today = todays_by_service("consulta", "revisi", "chequeo")

    # Ingresos del día: precio de los servicios de las citas completadas hoy
    daily_revenue = db.query(func.coalesce(func.sum(ClinicService.price), 0.0)).join(
        Appointment, Appointment.service_id == ClinicService.id
    ).filter(Appointment.clinic_id == clinic_id, Appointment.date == today, Appointment.status == "completed").scalar() or 0.0

    # Ocupación: citas de hoy / turnos que ofrece el horario de la clínica en este día de la semana
    capacity = 0
    for sched in db.query(ClinicSchedule).filter(
        ClinicSchedule.clinic_id == clinic_id, ClinicSchedule.day_of_week == today.weekday(), ClinicSchedule.is_active == True
    ).all():
        minutes = (sched.end_time.hour * 60 + sched.end_time.minute) - (sched.start_time.hour * 60 + sched.start_time.minute)
        capacity += max(minutes, 0) // max(sched.slot_duration_minutes or 30, 1)
    occupancy_rate = min(100, round(100 * today_appointments / capacity)) if capacity else 0

    # Pacientes nuevos: mascotas con cita hoy y sin ninguna cita anterior en esta clínica
    new_patients_today = 0
    for (pet_id,) in todays.with_entities(Appointment.pet_id).distinct().all():
        earlier = db.query(Appointment).filter(
            Appointment.clinic_id == clinic_id, Appointment.pet_id == pet_id, Appointment.date < today
        ).count()
        if earlier == 0:
            new_patients_today += 1

    critical_filter = and_(
        MedicalRecordExtended.clinic_id == clinic_id,
        MedicalRecordExtended.is_critical == True,
    )
    critical_patients = db.query(MedicalRecordExtended).filter(
        critical_filter, MedicalRecordExtended.alert_level.in_(["yellow", "red"])
    ).count()
    emergency_cases = db.query(MedicalRecordExtended).filter(critical_filter, MedicalRecordExtended.alert_level == "red").count()

    surgeries_today = db.query(Surgeries).filter(
        Surgeries.clinic_id == clinic_id,
        Surgeries.scheduled_date >= day_start,
        Surgeries.scheduled_date < day_end,
        Surgeries.status.in_(["scheduled", "in-progress", "in_progress"]),
    ).count()

    lab_results_pending = db.query(LabTests).filter(LabTests.clinic_id == clinic_id, LabTests.status == "pending").count()
    prescriptions_active = db.query(Prescriptions).filter(Prescriptions.clinic_id == clinic_id, Prescriptions.status == "active").count()
    inventory_alerts = db.query(InventoryItems).filter(
        InventoryItems.clinic_id == clinic_id, InventoryItems.current_stock <= InventoryItems.min_stock
    ).count()

    return {
        "today_appointments": today_appointments,
        "pending_confirmations": pending_confirmations,
        "surgeries_today": surgeries_today,
        "emergency_cases": emergency_cases,
        "vaccinations_today": vaccinations_today,
        "checkups_today": checkups_today,
        "lab_results_pending": lab_results_pending,
        "prescriptions_active": prescriptions_active,
        "critical_patients": critical_patients,
        "inventory_alerts": inventory_alerts,
        "daily_revenue": float(daily_revenue),
        "occupancy_rate": occupancy_rate,
        "new_patients_today": new_patients_today,
    }

# Clinic Alerts CRUD
def get_clinic_alerts(
    db: Session, 
    clinic_id: str,
    unread_only: bool = True
) -> List[ClinicAlerts]:
    """Obtener alertas de una clínica"""
    query = db.query(ClinicAlerts).filter(
        ClinicAlerts.clinic_id == clinic_id,
        ClinicAlerts.expires_at > datetime.now()
    )
    
    if unread_only:
        query = query.filter(ClinicAlerts.is_read == False)
    
    return query.order_by(desc(ClinicAlerts.created_at)).all()

def create_clinic_alert(
    db: Session,
    alert_data: dict
) -> ClinicAlerts:
    """Crear una nueva alerta de clínica"""
    # Establecer valores por defecto
    alert_data.setdefault("expires_at", datetime.now() + timedelta(days=30))
    alert_data.setdefault("is_read", False)
    
    db_alert = ClinicAlerts(**alert_data)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def generate_automatic_alerts(db: Session, clinic_id: str) -> List[ClinicAlerts]:
    """Generar alertas automáticas basadas en datos de la clínica"""
    alerts = []
    
    # Alerta de pacientes críticos
    critical_count = db.query(MedicalRecordExtended).filter(
        MedicalRecordExtended.clinic_id == clinic_id,
        MedicalRecordExtended.is_critical == True,
        MedicalRecordExtended.alert_level == "red"
    ).count()
    
    if critical_count > 0:
        alert = create_clinic_alert(db, {
            "clinic_id": clinic_id,
            "type": "emergency",
            "title": "Pacientes Críticos",
            "message": f"{critical_count} pacientes en estado crítico requieren atención inmediata",
            "priority": "high",
            "icon": "AlertTriangle",
            "color": "#ef4444"
        })
        alerts.append(alert)
    
    # Alerta de inventario bajo
    low_stock_items = db.query(InventoryItems).filter(
        InventoryItems.clinic_id == clinic_id,
        InventoryItems.is_active == True,
        InventoryItems.current_stock <= InventoryItems.min_stock
    ).count()
    
    if low_stock_items > 0:
        alert = create_clinic_alert(db, {
            "clinic_id": clinic_id,
            "type": "inventory",
            "title": "Inventario Crítico",
            "message": f"{low_stock_items} items con stock bajo necesitan reabastecimiento",
            "priority": "medium",
            "icon": "Package",
            "color": "#f59e0b"
        })
        alerts.append(alert)
    
    return alerts

# Inventory Items CRUD
def get_inventory_items(
    db: Session,
    clinic_id: str,
    active_only: bool = True
) -> List[InventoryItems]:
    """Obtener items de inventario de una clínica"""
    query = db.query(InventoryItems).filter(InventoryItems.clinic_id == clinic_id)
    
    if active_only:
        query = query.filter(InventoryItems.is_active == True)
    
    return query.order_by(InventoryItems.name).all()

def get_critical_inventory_items(db: Session, clinic_id: str) -> List[InventoryItems]:
    """Obtener items de inventario críticos (stock bajo)"""
    return db.query(InventoryItems).filter(
        InventoryItems.clinic_id == clinic_id,
        InventoryItems.is_active == True,
        InventoryItems.is_critical == True,
        InventoryItems.current_stock <= InventoryItems.min_stock
    ).order_by(InventoryItems.current_stock).all()

def create_inventory_item(
    db: Session,
    item_data: dict
) -> InventoryItems:
    """Crear un nuevo item de inventario"""
    db_item = InventoryItems(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# Lab Tests CRUD
def get_lab_tests(
    db: Session,
    clinic_id: str,
    status_filter: Optional[str] = None
) -> List[LabTests]:
    """Obtener pruebas de laboratorio de una clínica"""
    query = db.query(LabTests).filter(LabTests.clinic_id == clinic_id)
    
    if status_filter:
        query = query.filter(LabTests.status == status_filter)
    
    return query.order_by(desc(LabTests.requested_date)).all()

def get_pending_lab_results(db: Session, clinic_id: str) -> List[LabTests]:
    """Obtener resultados de laboratorio pendientes"""
    return db.query(LabTests).filter(
        LabTests.clinic_id == clinic_id,
        LabTests.status == "completed",
        LabTests.results.isnot(None)
    ).order_by(desc(LabTests.completed_date)).all()

# Surgeries CRUD
def get_surgeries(
    db: Session,
    clinic_id: str,
    status_filter: Optional[str] = None
) -> List[Surgeries]:
    """Obtener cirugías de una clínica"""
    query = db.query(Surgeries).filter(Surgeries.clinic_id == clinic_id)
    
    if status_filter:
        query = query.filter(Surgeries.status == status_filter)
    
    return query.order_by(Surgeries.scheduled_date).all()

def get_today_surgeries(db: Session, clinic_id: str) -> List[Surgeries]:
    """Obtener cirugías de hoy"""
    today = clinic_today()
    return db.query(Surgeries).filter(
        Surgeries.clinic_id == clinic_id,
        func.date(Surgeries.scheduled_date) == today,
        Surgeries.status.in_(["scheduled", "in_progress"])
    ).order_by(Surgeries.scheduled_date).all()

# Helper functions
def format_time_ago(dt: datetime) -> str:
    """Formatear fecha relativa (ej: "Hace 5 minutos")"""
    if dt is None:
        return "Desconocido"
    
    # Asegurar que ambas fechas tengan timezone
    now = datetime.now()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=now.tzinfo)
    elif now.tzinfo is None:
        now = now.replace(tzinfo=dt.tzinfo)
    
    diff = now - dt
    
    if diff < timedelta(minutes=1):
        return "Ahora mismo"
    elif diff < timedelta(hours=1):
        minutes = diff.seconds // 60
        return f"Hace {minutes} minuto{'s' if minutes != 1 else ''}"
    elif diff < timedelta(days=1):
        hours = diff.seconds // 3600
        return f"Hace {hours} hora{'s' if hours != 1 else ''}"
    else:
        days = diff.days
        return f"Hace {days} día{'s' if days != 1 else ''}"

def mark_alert_as_read(
    db: Session,
    alert_id: str
) -> Optional[ClinicAlerts]:
    """Marcar una alerta como leída"""
    alert = db.query(ClinicAlerts).filter(ClinicAlerts.id == alert_id).first()
    
    if alert:
        alert.is_read = True
        alert.read_at = datetime.now()
        db.commit()
        db.refresh(alert)
    
    return alert

def delete_alert(
    db: Session,
    alert_id: str
) -> bool:
    """Eliminar una alerta"""
    alert = db.query(ClinicAlerts).filter(ClinicAlerts.id == alert_id).first()
    
    if alert:
        db.delete(alert)
        db.commit()
        return True
    
    return False
