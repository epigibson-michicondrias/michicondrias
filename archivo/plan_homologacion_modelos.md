# 🏥 Plan de Homologación de Modelos - Dashboard Veterinario

## 📋 **Modelos Existentes en el Backend**

### **✅ Modelo de Mascotas (michicondrias_mascotas)**
```python
class Pet(Base):
    __tablename__ = "pets"
    
    # Campos básicos
    id = Column(String, primary_key=True)
    owner_id = Column(String, nullable=False)  # User from Core
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    age_months = Column(Integer, nullable=True)
    size = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Campos médicos importantes
    is_vaccinated = Column(Boolean, default=False)
    is_sterilized = Column(Boolean, default=False)
    is_dewormed = Column(Boolean, default=False)
    weight_kg = Column(Float, nullable=True)
    microchip_number = Column(String, nullable=True)
    gender = Column(String(20), nullable=True)
    
    # Campos de comportamiento
    temperament = Column(Text, nullable=True)
    energy_level = Column(String, nullable=True)
    social_cats = Column(Boolean, default=True)
    social_dogs = Column(Boolean, default=True)
    social_children = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### **✅ Modelo de Historial Médico (michicondrias_carnet)**
```python
class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    id = Column(String, primary_key=True)
    pet_id = Column(String, nullable=False)  # Ref to pets.id
    veterinarian_id = Column(String, nullable=True)  # Ref to veterinarians.id
    clinic_id = Column(String, nullable=True)  # Ref to clinics.id
    appointment_id = Column(String, nullable=True)  # Ref to appointments.id
    
    date = Column(DateTime(timezone=True), server_default=func.now())
    reason_for_visit = Column(String, nullable=False)
    diagnosis = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    weight_kg = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relación con recetas
    prescriptions = relationship("Prescription", back_populates="medical_record")

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(String, primary_key=True)
    medical_record_id = Column(String, ForeignKey("medical_records.id"), nullable=False)
    medication_name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency_hours = Column(Integer, nullable=False)
    duration_days = Column(Integer, nullable=False)
    instructions = Column(Text, nullable=True)

class Vaccine(Base):
    __tablename__ = "vaccines"
    
    id = Column(String, primary_key=True)
    pet_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    date_administered = Column(DateTime(timezone=True), server_default=func.now())
    next_due_date = Column(DateTime(timezone=True), nullable=True)
    administered_by_vet_id = Column(String, nullable=True)
    batch_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
```

---

## 🎯 **Plan de Homologación para Dashboard Veterinario**

### **📊 Mapeo de Campos Necesarios**

#### **Para Pacientes Críticos (usando Pet + MedicalRecord):**

**Campos del Dashboard → Modelos Existentes:**
```typescript
// Dashboard necesita:
{
  id: string,           // ✅ Pet.id
  name: string,         // ✅ Pet.name  
  owner: string,        // ❌ Necesario: User.name (via Pet.owner_id)
  condition: string,     // ✅ MedicalRecord.diagnosis
  status: string,       // ❌ Necesario: Agregar a MedicalRecord
  nextCheckup: string,  // ❌ Necesario: Agendar próxima cita
  treatment: string,    // ✅ MedicalRecord.treatment
  alertLevel: string,   // ❌ Necesario: Agregar a MedicalRecord
  vetId: string,        // ✅ MedicalRecord.veterinarian_id
  clinicId: string      // ✅ MedicalRecord.clinic_id
}
```

#### **Para Métricas Clínicas (usando tablas existentes):**

**Cálculos basados en datos existentes:**
```python
# Métricas que podemos calcular con modelos actuales:
todayAppointments = COUNT(Appointment WHERE date = today AND clinic_id = {clinic_id})
surgeriesToday = COUNT(Appointment JOIN ClinicService WHERE date = today AND category = 'surgery')
emergencyCases = COUNT(MedicalRecord WHERE date = today AND reason_for_visit LIKE '%emergencia%')
vaccinationsToday = COUNT(Vaccine WHERE date_administered = today AND clinic_id = {clinic_id})
checkupsToday = COUNT(Appointment JOIN ClinicService WHERE date = today AND category = 'checkup')
labResultsPending = COUNT(MedicalRecord WHERE diagnosis IS NULL AND date < today)
prescriptionsActive = COUNT(Prescription WHERE created_at >= today - 30_days)
newPatientsToday = COUNT(Pet WHERE created_at = today AND owner_id IN (users_clinic))
```

---

## 🔧 **Modificaciones Necesarias**

### **1. Extender MedicalRecord para Pacientes Críticos**

```python
# Agregar campos a MedicalRecord:
class MedicalRecord(Base):
    # ... campos existentes ...
    
    # Nuevos campos para dashboard
    status = Column(String, nullable=False, default="stable")  # stable, critical, emergency
    alert_level = Column(String, nullable=False, default="green")  # yellow, red, green
    next_checkup_date = Column(DateTime(timezone=True), nullable=True)
    follow_up_required = Column(Boolean, default=False)
    is_critical = Column(Boolean, default=False)
    emergency_contact_notified = Column(Boolean, default=False)
    
    # Índices para rendimiento
    __table_args__ = (
        Index('idx_medical_record_clinic_status', 'clinic_id', 'status'),
        Index('idx_medical_record_alert_level', 'alert_level'),
        Index('idx_medical_record_next_checkup', 'next_checkup_date'),
    )
```

### **2. Crear Vista o Query para Pacientes Críticos**

```python
# Query para obtener pacientes críticos
def get_critical_patients(db: Session, clinic_id: str):
    query = db.query(
        Pet.id,
        Pet.name,
        Pet.owner_id,
        MedicalRecord.diagnosis,
        MedicalRecord.status,
        MedicalRecord.next_checkup_date,
        MedicalRecord.treatment,
        MedicalRecord.alert_level,
        MedicalRecord.veterinarian_id,
        MedicalRecord.clinic_id
    ).join(
        MedicalRecord, Pet.id == MedicalRecord.pet_id
    ).filter(
        MedicalRecord.clinic_id == clinic_id,
        MedicalRecord.alert_level.in_(["yellow", "red"]),
        MedicalRecord.is_critical == True,
        Pet.is_active == True
    ).order_by(
        MedicalRecord.alert_level.desc(),
        MedicalRecord.next_checkup_date.asc()
    )
    
    return query.all()
```

### **3. Crear Endpoint de Pacientes Críticos**

```python
# app/api/routes/patients_routes.py
@router.get("/clinics/{clinic_id}/patients/critical")
def get_critical_patients_endpoint(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener pacientes críticos
    critical_patients = get_critical_patients(db, clinic_id)
    
    # Formatear respuesta
    result = []
    for patient in critical_patients:
        # Obtener nombre del dueño
        owner = get_user_by_id(db, patient.owner_id)
        
        result.append({
            "id": patient.id,
            "name": patient.name,
            "owner": f"{owner.first_name} {owner.last_name}" if owner else "Dueño desconocido",
            "condition": patient.diagnosis or "En observación",
            "status": patient.status,
            "nextCheckup": patient.next_checkup_date.isoformat() if patient.next_checkup_date else None,
            "treatment": patient.treatment or "Sin tratamiento específico",
            "alertLevel": patient.alert_level,
            "vetId": patient.veterinarian_id,
            "clinicId": patient.clinic_id
        })
    
    return result
```

### **4. Crear Endpoint de Métricas Diarias**

```python
# app/api/routes/metrics_routes.py
@router.get("/clinics/{clinic_id}/metrics/daily")
def get_daily_metrics(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    today = date.today()
    
    # Calcular métricas usando datos existentes
    today_appointments = db.query(Appointment).filter(
        Appointment.clinic_id == clinic_id,
        Appointment.date == today.isoformat()
    ).count()
    
    surgeries_today = db.query(Appointment).join(ClinicService).filter(
        Appointment.clinic_id == clinic_id,
        Appointment.date == today.isoformat(),
        ClinicService.category == "surgery"
    ).count()
    
    emergency_cases = db.query(MedicalRecord).filter(
        MedicalRecord.clinic_id == clinic_id,
        func.date(MedicalRecord.date) == today,
        MedicalRecord.reason_for_visit.ilike('%emergencia%')
    ).count()
    
    vaccinations_today = db.query(Vaccine).filter(
        Vaccine.clinic_id == clinic_id,
        func.date(Vaccine.date_administered) == today
    ).count()
    
    checkups_today = db.query(Appointment).join(ClinicService).filter(
        Appointment.clinic_id == clinic_id,
        Appointment.date == today.isoformat(),
        ClinicService.category == "checkup"
    ).count()
    
    lab_results_pending = db.query(MedicalRecord).filter(
        MedicalRecord.clinic_id == clinic_id,
        MedicalRecord.diagnosis.is_(None),
        MedicalRecord.date < today
    ).count()
    
    prescriptions_active = db.query(Prescription).join(MedicalRecord).filter(
        MedicalRecord.clinic_id == clinic_id,
        Prescription.created_at >= today - timedelta(days=30)
    ).count()
    
    critical_patients = db.query(MedicalRecord).filter(
        MedicalRecord.clinic_id == clinic_id,
        MedicalRecord.is_critical == True,
        MedicalRecord.alert_level.in_(["yellow", "red"])
    ).count()
    
    # Calcular ingresos del día
    daily_revenue = db.query(Appointment).join(ClinicService).filter(
        Appointment.clinic_id == clinic_id,
        Appointment.date == today.isoformat(),
        Appointment.status == "completed"
    ).with_entities(
        func.sum(ClinicService.price)
    ).scalar() or 0
    
    # Calcular tasa de ocupación
    total_slots = db.query(ClinicSchedule).filter(
        ClinicSchedule.clinic_id == clinic_id,
        ClinicSchedule.is_active == True
    ).count()
    
    occupied_slots = db.query(Appointment).filter(
        Appointment.clinic_id == clinic_id,
        Appointment.date == today.isoformat(),
        Appointment.status.in_(["confirmed", "completed"])
    ).count()
    
    occupancy_rate = int((occupied_slots / total_slots * 100)) if total_slots > 0 else 0
    
    # Nuevos pacientes hoy
    new_patients_today = db.query(Pet).filter(
        Pet.created_at >= today,
        Pet.is_active == True
    ).count()
    
    return {
        "todayAppointments": today_appointments,
        "surgeriesToday": surgeries_today,
        "emergencyCases": emergency_cases,
        "vaccinationsToday": vaccinations_today,
        "checkupsToday": checkups_today,
        "labResultsPending": lab_results_pending,
        "prescriptionsActive": prescriptions_active,
        "inventoryAlerts": 0,  # TODO: Implementar cuando tengamos inventario
        "dailyRevenue": float(daily_revenue),
        "occupancyRate": occupancy_rate,
        "newPatientsToday": new_patients_today,
        "criticalPatients": critical_patients
    }
```

### **5. Crear Endpoint de Alertas Clínicas**

```python
@router.get("/clinics/{clinic_id}/alerts")
def get_clinic_alerts(
    clinic_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    # Verificar permisos
    clinic = get_clinic(db, clinic_id)
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    alerts = []
    
    # Alertas de emergencia (pacientes críticos)
    critical_patients = db.query(MedicalRecord).join(Pet).filter(
        MedicalRecord.clinic_id == clinic_id,
        MedicalRecord.is_critical == True,
        MedicalRecord.alert_level == "red",
        MedicalRecord.emergency_contact_notified == False
    ).all()
    
    for patient in critical_patients:
        alerts.append({
            "id": f"emergency_{patient.id}",
            "type": "emergency",
            "title": "Caso de Emergencia",
            "message": f"{patient.pet.name} - {patient.diagnosis or 'Condición crítica'}",
            "priority": "high",
            "time": "Hace 5 min",
            "icon": "AlertTriangle",
            "color": "#ef4444",
            "isRead": False,
            "actionUrl": f"/patients/{patient.pet_id}"
        })
    
    # Alertas de laboratorio (resultados pendientes)
    pending_lab = db.query(MedicalRecord).join(Pet).filter(
        MedicalRecord.clinic_id == clinic_id,
        MedicalRecord.diagnosis.is_(None),
        MedicalRecord.date < datetime.now() - timedelta(hours=24)
    ).limit(5).all()
    
    if pending_lab:
        alerts.append({
            "id": "lab_pending",
            "type": "laboratory",
            "title": "Resultados Listos",
            "message": f"{len(pending_lab)} análisis de laboratorio disponibles",
            "priority": "normal",
            "time": "Hace 30 min",
            "icon": "TestTube",
            "color": "#10b981",
            "isRead": False,
            "actionUrl": "/laboratory/results"
        })
    
    # Alertas de inventario (simuladas por ahora)
    alerts.append({
        "id": "inventory_low",
        "type": "inventory",
        "title": "Inventario Crítico",
        "message": "Anestesia General - Stock bajo (5 unidades)",
        "priority": "medium",
        "time": "Hace 15 min",
        "icon": "Pill",
        "color": "#f59e0b",
        "isRead": False,
        "actionUrl": "/inventory/critical"
    })
    
    return alerts
```

---

## 📋 **Migraciones Necesarias**

### **1. Agregar campos a MedicalRecord**
```sql
-- Alembic migration
ALTER TABLE medical_records ADD COLUMN status VARCHAR(20) DEFAULT 'stable';
ALTER TABLE medical_records ADD COLUMN alert_level VARCHAR(10) DEFAULT 'green';
ALTER TABLE medical_records ADD COLUMN next_checkup_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE medical_records ADD COLUMN follow_up_required BOOLEAN DEFAULT FALSE;
ALTER TABLE medical_records ADD COLUMN is_critical BOOLEAN DEFAULT FALSE;
ALTER TABLE medical_records ADD COLUMN emergency_contact_notified BOOLEAN DEFAULT FALSE;

-- Crear índices
CREATE INDEX idx_medical_record_clinic_status ON medical_records(clinic_id, status);
CREATE INDEX idx_medical_record_alert_level ON medical_records(alert_level);
CREATE INDEX idx_medical_record_next_checkup ON medical_records(next_checkup_date);
```

### **2. Agregar clinic_id a Vaccine (si no existe)**
```sql
ALTER TABLE vaccines ADD COLUMN clinic_id VARCHAR REFERENCES clinics(id);
CREATE INDEX idx_vaccine_clinic_date ON vaccines(clinic_id, date_administered);
```

---

## 🎯 **Frontend - Conexión a Modelos Reales**

### **Actualizar Servicios API**
```typescript
// src/services/patients.ts
export async function getCriticalPatients(clinicId: string): Promise<Patient[]> {
    return apiFetch<Patient[]>("directorio", `/clinics/${clinicId}/patients/critical`);
}

// src/services/metrics.ts
export async function getClinicMetrics(clinicId: string): Promise<ClinicMetrics> {
    return apiFetch<ClinicMetrics>("directorio", `/clinics/${clinicId}/metrics/daily`);
}

// src/services/alerts.ts
export async function getClinicAlerts(clinicId: string): Promise<Alert[]> {
    return apiFetch<Alert[]>("directorio", `/clinics/${clinicId}/alerts`);
}
```

### **Actualizar Dashboard para usar APIs Reales**
```typescript
// Reemplazar mock data:
const { data: metrics } = useQuery({
    queryKey: ['clinic-metrics', clinic?.id],
    queryFn: () => getClinicMetrics(clinic!.id),
    enabled: !!clinic?.id,
    refetchInterval: 60000, // Cada minuto
});

const { data: criticalPatients } = useQuery({
    queryKey: ['critical-patients', clinic?.id],
    queryFn: () => getCriticalPatients(clinic!.id),
    enabled: !!clinic?.id,
    refetchInterval: 30000, // Cada 30 segundos
});

const { data: alerts } = useQuery({
    queryKey: ['clinic-alerts', clinic?.id],
    queryFn: () => getClinicAlerts(clinic!.id),
    enabled: !!clinic?.id,
    refetchInterval: 15000, // Cada 15 segundos
});
```

---

## 🚀 **Ventajas de este Enfoque**

### **✅ Aprovecha Infraestructura Existente:**
- **Modelo Pet** ya tiene todos los datos básicos de mascotas
- **MedicalRecord** ya tiene historial médico completo
- **Prescription** ya maneja recetas médicas
- **Vaccine** ya maneja vacunaciones

### **✅ Mínimas Modificaciones:**
- Solo agregar **6 campos** a MedicalRecord
- Crear **3 endpoints** nuevos
- No necesita crear tablas completamente nuevas

### **✅ Integración Natural:**
- Pacientes = **Mascotas** con historial médico
- Métricas = **Cálculos** sobre datos existentes
- Alertas = **Consultas** inteligentes a datos existentes

---

## 📊 **Resumen de Implementación**

### **Backend Tasks (Reducidas):**
- [ ] **Extender MedicalRecord** con 6 campos nuevos
- [ ] **Crear migración** de base de datos
- [ ] **Crear endpoint** de pacientes críticos
- [ ] **Crear endpoint** de métricas diarias  
- [ ] **Crear endpoint** de alertas clínicas
- [ ] **Agregar índices** para rendimiento

### **Frontend Tasks (Iguales):**
- [ ] **Conectar dashboard** a APIs reales
- [ ] **Implementar refresco** automático
- [ ] **Agregar loading states**
- [ ] **Testing y validación**

---

## 🎉 **Resultado Final**

### **Dashboard 100% Real:**
- 🟢 **Pacientes críticos** = Mascotas con historial médico crítico
- 🟢 **Métricas reales** = Cálculos sobre citas, vacunas, recetas existentes
- 🟢 **Alertas inteligentes** = Basadas en datos médicos reales
- 🟢 **Integración completa** = Sin duplicación de modelos

### **Ventaja Competitiva:**
- **Aprovecha toda** la infraestructura existente
- **Implementación rápida** (1-2 semanas vs 1-2 meses)
- **Datos consistentes** entre todos los módulos
- **Escalabilidad** garantizada

---

**📅 Plan actualizado:** 6 de marzo de 2026  
**🎯 Estrategia:** Homologar modelos existentes vs crear nuevos  
**🚀 Resultado:** Dashboard profesional con infraestructura real existente

**¡Mucho más eficiente y rápido, compadre!** 🏥✨
