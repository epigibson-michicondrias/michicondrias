# 🔗 Backend Integration Plan - Dashboard Veterinario

## 📋 **Estado Actual:**
- ✅ Supabase: Tablas creadas y listas
- ✅ Frontend: Dashboard conectado a APIs
- ✅ Backend: Endpoints creados pero necesitan ajustes
- 🔄 **Siguiente paso:** Integrar backend con Supabase

---

## 🎯 **Pasos a Seguir:**

### **1. 🔧 Actualizar Backend para Supabase**

#### **A. Configurar conexión a Supabase**
```python
# backend/app/db/session.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

# Configuración de Supabase
DATABASE_URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

#### **B. Actualizar modelos para que coincidan con Supabase**
```python
# backend/app/models/dashboard.py
from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

class MedicalRecordExtended(Base):
    __tablename__ = "medical_records_extended"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_record_id = Column(String, nullable=False)  # TEXT en Supabase
    clinic_id = Column(String, nullable=True)  # TEXT en Supabase
    
    # Dashboard-specific fields
    status = Column(String(20), nullable=False, default="stable")
    alert_level = Column(String(10), nullable=False, default="green")
    next_checkup_date = Column(DateTime(timezone=True))
    follow_up_required = Column(Boolean, default=False)
    is_critical = Column(Boolean, default=False)
    emergency_contact_notified = Column(Boolean, default=False)
    
    # ... otros campos

class ClinicMetrics(Base):
    __tablename__ = "clinic_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(String, nullable=False)  # TEXT en Supabase
    metric_date = Column(DateTime, nullable=False)
    
    # ... campos de métricas

class ClinicAlerts(Base):
    __tablename__ = "clinic_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(String, nullable=False)  # TEXT en Supabase
    
    # ... campos de alertas
```

#### **C. Actualizar CRUD operations**
```python
# backend/crud/dashboard_crud.py
from sqlalchemy.orm import Session
from app.models.dashboard import MedicalRecordExtended, ClinicMetrics, ClinicAlerts
from datetime import date, datetime

def get_critical_patients(db: Session, clinic_id: str):
    """Obtener pacientes críticos para el dashboard"""
    patients = db.query(MedicalRecordExtended).filter(
        MedicalRecordExtended.clinic_id == clinic_id,
        MedicalRecordExtended.is_critical == True,
        MedicalRecordExtended.alert_level.in_(["yellow", "red"])
    ).all()
    return patients

def get_daily_metrics(db: Session, clinic_id: str, metric_date: date):
    """Obtener métricas diarias de una clínica"""
    metrics = db.query(ClinicMetrics).filter(
        ClinicMetrics.clinic_id == clinic_id,
        ClinicMetrics.metric_date == metric_date
    ).first()
    
    if not metrics:
        # Crear métricas del día si no existen
        metrics = calculate_and_create_metrics(db, clinic_id, metric_date)
    
    return metrics

def get_clinic_alerts(db: Session, clinic_id: str):
    """Obtener alertas de una clínica"""
    alerts = db.query(ClinicAlerts).filter(
        ClinicAlerts.clinic_id == clinic_id,
        ClinicAlerts.is_read == False,
        ClinicAlerts.expires_at > datetime.now()
    ).order_by(ClinicAlerts.created_at.desc()).all()
    return alerts
```

#### **D. Actualizar endpoints para usar datos reales**
```python
# backend/app/api/routes/dashboard_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.crud import dashboard_crud

router = APIRouter()

@router.get("/clinics/{clinic_id}/metrics/daily")
def get_daily_metrics(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
):
    """Get daily clinical metrics for a clinic dashboard"""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener o crear métricas del día
    today = date.today()
    metrics = dashboard_crud.get_daily_metrics(db, clinic_id, today)
    
    if not metrics:
        # Calcular métricas en tiempo real
        metrics = calculate_real_time_metrics(db, clinic_id, today)
    
    return {
        "todayAppointments": metrics.today_appointments,
        "surgeriesToday": metrics.surgeries_today,
        "emergencyCases": metrics.emergency_cases,
        "vaccinationsToday": metrics.vaccinations_today,
        "checkupsToday": metrics.checkups_today,
        "labResultsPending": metrics.lab_results_pending,
        "prescriptionsActive": metrics.prescriptions_active,
        "inventoryAlerts": metrics.inventory_alerts,
        "dailyRevenue": float(metrics.daily_revenue),
        "occupancyRate": metrics.occupancy_rate,
        "newPatientsToday": metrics.new_patients_today,
        "criticalPatients": metrics.critical_patients
    }

@router.get("/clinics/{clinic_id}/patients/critical")
def get_critical_patients(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
):
    """Get critical patients for a clinic dashboard"""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener pacientes críticos
    critical_patients = dashboard_crud.get_critical_patients(db, clinic_id)
    
    # Formatear respuesta
    result = []
    for patient in critical_patients:
        # Obtener información de la mascota y dueño
        pet_info = get_pet_info(db, patient.original_record_id)
        
        result.append({
            "id": patient.original_record_id,
            "name": pet_info.name if pet_info else "Paciente desconocido",
            "owner": pet_info.owner_name if pet_info else "Dueño desconocido",
            "condition": patient.status,
            "status": "Estable" if patient.alert_level == "green" else "Crítico",
            "nextCheckup": patient.next_checkup_date.isoformat() if patient.next_checkup_date else None,
            "treatment": "Monitoreo activo",
            "alertLevel": patient.alert_level,
            "vetId": None, # Obtener de medical record original
            "clinicId": clinic_id
        })
    
    return result

@router.get("/clinics/{clinic_id}/alerts")
def get_clinic_alerts(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
):
    """Get clinical alerts for a clinic dashboard"""
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener alertas
    alerts = dashboard_crud.get_clinic_alerts(db, clinic_id)
    
    # Generar alertas automáticas si no hay
    if not alerts:
        alerts = generate_automatic_alerts(db, clinic_id)
    
    # Formatear respuesta
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
```

---

### **2. 🧪 Testing y Validación**

#### **A. Probar conexión a Supabase**
```python
# test_supabase_connection.py
from sqlalchemy import create_engine, text

# Conexión a Supabase
DATABASE_URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # Verificar tablas
        result = connection.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('medical_records_extended', 'clinic_metrics', 'clinic_alerts')
            ORDER BY table_name
        """))
        
        tables = [row[0] for row in result]
        print(f"✅ Tablas encontradas: {tables}")
        
        # Verificar datos de prueba
        if 'clinic_metrics' in tables:
            result = connection.execute(text("SELECT COUNT(*) FROM clinic_metrics"))
            count = result.scalar()
            print(f"📊 Métricas existentes: {count}")
            
except Exception as e:
    print(f"❌ Error de conexión: {e}")
```

#### **B. Probar endpoints**
```bash
# Testear endpoints con curl
curl -X GET "http://localhost:8000/api/v1/clinics/{clinic_id}/metrics/daily" \
  -H "Authorization: Bearer {token}"

curl -X GET "http://localhost:8000/api/v1/clinics/{clinic_id}/patients/critical" \
  -H "Authorization: Bearer {token}"

curl -X GET "http://localhost:8000/api/v1/clinics/{clinic_id}/alerts" \
  -H "Authorization: Bearer {token}"
```

---

### **3. 🚀 Deploy y Producción**

#### **A. Variables de entorno**
```bash
# .env
DATABASE_URL=postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres
SUPABASE_URL=https://zaegmfufrzjmjiemrvvp.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

#### **B. Configurar CORS**
```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tu-app-expo.com", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📋 **Checklist de Implementación**

### **🔧 Backend Setup:**
- [ ] Configurar conexión a Supabase
- [ ] Actualizar modelos para coincidir con Supabase
- [ ] Implementar CRUD operations
- [ ] Actualizar endpoints con datos reales
- [ ] Agregar manejo de errores
- [ ] Configurar variables de entorno

### **🧪 Testing:**
- [ ] Probar conexión a base de datos
- [ ] Testear endpoints individualmente
- [ ] Verificar integración con frontend
- [ ] Testear refresco automático
- [ ] Validar datos en tiempo real

### **🚀 Deploy:**
- [ ] Configurar variables de producción
- [ ] Setup CORS para producción
- [ ] Deploy backend a producción
- [ ] Verificar endpoints en producción
- [ ] Monitorear performance

---

## 🎯 **Resultado Final Esperado**

### **🏥 Dashboard 100% Funcional:**
- ✅ **Backend conectado** a Supabase
- ✅ **Endpoints funcionando** con datos reales
- ✅ **Frontend consumiendo** APIs reales
- ✅ **Métricas en tiempo real**
- ✅ **Pacientes críticos monitoreados**
- ✅ **Alertas inteligentes activas**

### **📊 Flujo Completo:**
```
Supabase (Datos) → Backend (APIs) → Frontend (Dashboard) → Usuario
```

---

## 🚀 **¡Manos a la obra!**

### **🎯 Próximos pasos inmediatos:**
1. **Configurar conexión** a Supabase en el backend
2. **Actualizar modelos** para que coincidan
3. **Testear endpoints** con datos reales
4. **Verificar dashboard** funcionando
5. **Deploy a producción**

**¡Vamos a integrar todo el sistema, compadre!** 🔗🚀✨
