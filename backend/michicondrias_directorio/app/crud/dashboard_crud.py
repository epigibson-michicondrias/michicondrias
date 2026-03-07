from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from datetime import date, datetime, timedelta

from app.models.dashboard import (
    MedicalRecordExtended, ClinicMetrics, ClinicAlerts, 
    InventoryItems, LabTests, Surgeries
)

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
        ClinicMetrics.metric_date == metric_date
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
            "metric_date": metric_date
        })
        db_metrics = ClinicMetrics(**metrics_data)
        db.add(db_metrics)
        db.commit()
        db.refresh(db_metrics)
        return db_metrics

def calculate_real_time_metrics(db: Session, clinic_id: str) -> dict:
    """Calcular métricas en tiempo real desde datos existentes"""
    today = date.today()
    
    # Importar modelos existentes para cálculos
    try:
        from app.models.appointment import Appointment
        from app.models.clinic_service import ClinicService
        from app.models.medical_record import MedicalRecord
        from app.models.prescription import Prescription
        from app.models.vaccine import Vaccine
        from app.models.pet import Pet
    except ImportError:
        # Si no existen los modelos, retornar valores por defecto
        return {
            "todayAppointments": 0,
            "pendingConfirmations": 0,
            "surgeriesToday": 0,
            "emergencyCases": 0,
            "vaccinationsToday": 0,
            "checkupsToday": 0,
            "labResultsPending": 0,
            "prescriptionsActive": 0,
            "inventoryAlerts": 0,
            "dailyRevenue": 0,
            "occupancyRate": 0,
            "newPatientsToday": 0,
            "criticalPatients": 0
        }
    
    # Calcular métricas basadas en datos existentes
    metrics = {}
    
    # Citas de hoy (simulado - necesitaría adaptarse a la estructura real)
    try:
        today_appointments = db.query(Appointment).filter(
            # Ajustar según la estructura real de appointments
            # Appointment.clinic_id == clinic_id,
            # Appointment.date == today
        ).count()
        metrics["todayAppointments"] = today_appointments
    except:
        metrics["todayAppointments"] = 0
    
    # Cirugías de hoy
    try:
        surgeries_today = db.query(Surgeries).filter(
            Surgeries.clinic_id == clinic_id,
            func.date(Surgeries.scheduled_date) == today,
            Surgeries.status == "scheduled"
        ).count()
        metrics["surgeriesToday"] = surgeries_today
    except:
        metrics["surgeriesToday"] = 0
    
    # Pacientes críticos
    try:
        critical_patients = db.query(MedicalRecordExtended).filter(
            MedicalRecordExtended.clinic_id == clinic_id,
            MedicalRecordExtended.is_critical == True,
            MedicalRecordExtended.alert_level.in_(["yellow", "red"])
        ).count()
        metrics["criticalPatients"] = critical_patients
    except:
        metrics["criticalPatients"] = 0
    
    # Resto de métricas con valores por defecto por ahora
    metrics.update({
        "pendingConfirmations": 0,
        "emergencyCases": 0,
        "vaccinationsToday": 0,
        "checkupsToday": 0,
        "labResultsPending": 0,
        "prescriptionsActive": 0,
        "inventoryAlerts": 0,
        "dailyRevenue": 0,
        "occupancyRate": 0,
        "newPatientsToday": 0
    })
    
    return metrics

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
    today = date.today()
    return db.query(Surgeries).filter(
        Surgeries.clinic_id == clinic_id,
        func.date(Surgeries.scheduled_date) == today,
        Surgeries.status.in_(["scheduled", "in_progress"])
    ).order_by(Surgeries.scheduled_date).all()

# Helper functions
def format_time_ago(dt: datetime) -> str:
    """Formatear fecha relativa (ej: "Hace 5 minutos")"""
    now = datetime.now()
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
