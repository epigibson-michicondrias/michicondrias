# 🗄️ Plan de Tablas Supabase - Dashboard Veterinario

## 📋 **Verificación Necesaria**

### **🔍 Información Requerida:**
```
URL de conexión Supabase: [PENDIENTE - Usuario debe proporcionar]
```

### **🎯 Objetivo:**
1. **Verificar tablas existentes** en Supabase
2. **Identificar tablas faltantes** para el dashboard
3. **Crear tablas necesarias** con estructura correcta
4. **Asegurar integración** con el backend

---

## 📊 **Tablas que Necesitamos Verificar**

### **✅ Tablas que DEBERÍAN existir (sistema base):**
```sql
-- Usuarios y Autenticación
users                     -- Usuarios del sistema
user_profiles             -- Perfiles de usuario

-- Mascotas y Adopciones
pets                      -- Mascotas registradas
lost_pets                 -- Mascotas perdidas
petfriendly_places        -- Lugares petfriendly

-- Clínicas y Directorio
clinics                   -- Clínicas veterinarias
veterinarians             -- Veterinarios
clinic_services           -- Servicios de clínicas
clinic_schedule           -- Horarios de clínicas
clinic_reviews            -- Reseñas de clínicas

-- Citas y Servicios
appointments              -- Citas médicas
available_slots           -- Slots disponibles

-- Carnet Médico
medical_records           -- Historial médico
prescriptions             -- Recetas médicas
vaccines                  -- Vacunas
medication_reminders      -- Recordatorios de medicación

-- Ecommerce y Pagos
orders                    -- Pedidos
order_items               -- Items de pedidos
payments                  -- Pagos
products                  -- Productos
```

### **🆕 Tablas NUEVAS que necesitamos crear:**
```sql
-- Dashboard Veterinario
medical_records_extended   -- Extensión de medical_records
clinic_metrics            -- Métricas de clínicas
clinic_alerts             -- Alertas clínicas
inventory_items           -- Inventario médico
lab_tests                 -- Pruebas de laboratorio
surgeries                 -- Cirugías programadas
```

---

## 🔍 **Verificación de Tablas Existentes**

### **📝 Queries para Verificar:**
```sql
-- 1. Ver todas las tablas
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Ver estructura de tablas específicas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'medical_records' 
ORDER BY ordinal_position;

-- 3. Ver relaciones y foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## 🆕 **Tablas a Crear - SQL**

### **1. medical_records_extended**
```sql
CREATE TABLE medical_records_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    
    -- Dashboard-specific fields
    status VARCHAR(20) NOT NULL DEFAULT 'stable' CHECK (status IN ('stable', 'critical', 'emergency')),
    alert_level VARCHAR(10) NOT NULL DEFAULT 'green' CHECK (alert_level IN ('yellow', 'red', 'green')),
    next_checkup_date TIMESTAMP WITH TIME ZONE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    is_critical BOOLEAN DEFAULT FALSE,
    emergency_contact_notified BOOLEAN DEFAULT FALSE,
    
    -- Additional clinical fields
    severity_score INTEGER CHECK (severity_score >= 1 AND severity_score <= 10),
    prognosis VARCHAR(50) CHECK (prognosis IN ('good', 'fair', 'guarded', 'poor')),
    requires_hospitalization BOOLEAN DEFAULT FALSE,
    estimated_recovery_days INTEGER,
    
    -- Monitoring fields
    last_vitals_check TIMESTAMP WITH TIME ZONE,
    temperature_trend VARCHAR(10) CHECK (temperature_trend IN ('stable', 'rising', 'falling')),
    heart_rate_trend VARCHAR(10) CHECK (heart_rate_trend IN ('stable', 'rising', 'falling')),
    respiratory_rate_trend VARCHAR(10) CHECK (respiratory_rate_trend IN ('stable', 'rising', 'falling')),
    
    -- Treatment response
    treatment_response VARCHAR(20) CHECK (treatment_response IN ('improving', 'stable', 'worsening')),
    side_effects_observed TEXT,
    medication_adherence VARCHAR(10) CHECK (medication_adherence IN ('good', 'fair', 'poor')),
    
    -- Financial and administrative
    treatment_cost_estimate DECIMAL(10,2),
    insurance_claim_status VARCHAR(20),
    payment_status VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para rendimiento
CREATE INDEX idx_medical_extended_clinic_status ON medical_records_extended(status, created_at);
CREATE INDEX idx_medical_extended_alert_level ON medical_records_extended(alert_level);
CREATE INDEX idx_medical_extended_next_checkup ON medical_records_extended(next_checkup_date);
CREATE INDEX idx_medical_extended_critical ON medical_records_extended(is_critical, alert_level);
CREATE INDEX idx_medical_extended_clinic_critical ON medical_records_extended(is_critical, status, created_at);
```

### **2. clinic_metrics**
```sql
CREATE TABLE clinic_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    
    -- Appointment metrics
    today_appointments INTEGER DEFAULT 0,
    pending_confirmations INTEGER DEFAULT 0,
    surgeries_today INTEGER DEFAULT 0,
    emergency_cases INTEGER DEFAULT 0,
    vaccinations_today INTEGER DEFAULT 0,
    checkups_today INTEGER DEFAULT 0,
    
    -- Clinical metrics
    lab_results_pending INTEGER DEFAULT 0,
    prescriptions_active INTEGER DEFAULT 0,
    critical_patients INTEGER DEFAULT 0,
    
    -- Business metrics
    inventory_alerts INTEGER DEFAULT 0,
    daily_revenue DECIMAL(10,2) DEFAULT 0,
    occupancy_rate INTEGER DEFAULT 0 CHECK (occupancy_rate >= 0 AND occupancy_rate <= 100),
    new_patients_today INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(clinic_id, metric_date)
);

-- Indexes
CREATE INDEX idx_clinic_metrics_clinic_date ON clinic_metrics(clinic_id, metric_date);
CREATE INDEX idx_clinic_metrics_date ON clinic_metrics(metric_date);
```

### **3. clinic_alerts**
```sql
CREATE TABLE clinic_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Alert information
    type VARCHAR(20) NOT NULL CHECK (type IN ('emergency', 'inventory', 'laboratory', 'vaccination', 'followup')),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    
    -- Metadata
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    
    -- Relationships
    patient_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Auto-expire old alerts (30 days)
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes
CREATE INDEX idx_clinic_alerts_clinic_unread ON clinic_alerts(clinic_id, is_read);
CREATE INDEX idx_clinic_alerts_type_priority ON clinic_alerts(type, priority);
CREATE INDEX idx_clinic_alerts_created_at ON clinic_alerts(created_at);
```

### **4. inventory_items**
```sql
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Item information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    unit VARCHAR(20) NOT NULL, -- ml, mg, tablets, etc.
    
    -- Stock management
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    reorder_point DECIMAL(10,2),
    
    -- Supplier information
    supplier VARCHAR(100),
    supplier_contact VARCHAR(100),
    cost_per_unit DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    
    -- Medical specifics
    is_medication BOOLEAN DEFAULT FALSE,
    requires_prescription BOOLEAN DEFAULT FALSE,
    storage_requirements TEXT,
    expiry_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_critical BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_restocked_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_inventory_clinic_active ON inventory_items(clinic_id, is_active);
CREATE INDEX idx_inventory_critical ON inventory_items(is_critical, current_stock);
CREATE INDEX idx_inventory_expiry ON inventory_items(expiry_date);
```

### **5. lab_tests**
```sql
CREATE TABLE lab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    
    -- Test information
    test_type VARCHAR(50) NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    
    -- Dates
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sample_collection_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    
    -- Results
    results JSONB, -- Flexible structure for different test types
    interpretation TEXT,
    recommendations TEXT,
    
    -- Staff
    requesting_vet_id UUID REFERENCES veterinarians(id),
    processing_tech_id UUID REFERENCES veterinarians(id),
    
    -- Financial
    cost DECIMAL(10,2),
    is_paid BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lab_tests_clinic_patient ON lab_tests(clinic_id, patient_id);
CREATE INDEX idx_lab_tests_status ON lab_tests(status);
CREATE INDEX idx_lab_tests_date ON lab_tests(requested_date);
```

### **6. surgeries**
```sql
CREATE TABLE surgeries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    
    -- Surgery information
    surgery_type VARCHAR(50) NOT NULL,
    surgery_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    
    -- Staff
    surgeon_id UUID REFERENCES veterinarians(id),
    assistant_ids UUID[], -- Array of assistant vet IDs
    
    -- Operating room
    operating_room VARCHAR(20),
    equipment_needed TEXT[],
    
    -- Anesthesia
    anesthesia_type VARCHAR(50),
    anesthesiologist_id UUID REFERENCES veterinarians(id),
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
    
    -- Medical information
    pre_op_notes TEXT,
    post_op_notes TEXT,
    complications TEXT,
    
    -- Financial
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    is_paid BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_surgeries_clinic_date ON surgeries(clinic_id, scheduled_date);
CREATE INDEX idx_surgeries_status ON surgeries(status);
CREATE INDEX idx_surgeries_patient ON surgeries(patient_id);
```

---

## 🔗 **Relaciones entre Tablas**

### **📊 Diagrama de Relaciones:**
```
clinics
├── clinic_metrics (1:N)
├── clinic_alerts (1:N)
├── inventory_items (1:N)
├── lab_tests (1:N)
├── surgeries (1:N)
└── medical_records (1:N)
    └── medical_records_extended (1:1)

pets
├── lab_tests (1:N)
├── surgeries (1:N)
└── medical_records (1:N)
    └── medical_records_extended (1:1)

veterinarians
├── lab_tests (N:1)
├── surgeries (N:1)
└── medical_records (N:1)
```

---

## 🚀 **Pasos a Seguir**

### **1. 🔍 Verificación Inicial:**
- Conectar a Supabase con la URL proporcionada
- Ejecutar queries para ver tablas existentes
- Documentar estructura actual

### **2. 📝 Creación de Tablas:**
- Crear tablas faltantes en orden correcto
- Verificar relaciones y constraints
- Agregar indexes para rendimiento

### **3. 🧪 Testing:**
- Probar inserción de datos
- Verificar relaciones
- Testear queries del backend

### **4. 🔄 Integración:**
- Actualizar backend si es necesario
- Probar endpoints con datos reales
- Validar dashboard completo

---

## 📋 **Checklist de Implementación**

### **🔍 Verificación:**
- [ ] Obtener URL de conexión Supabase
- [ ] Conectar y verificar tablas existentes
- [ ] Documentar estructura actual

### **🆕 Creación:**
- [ ] Crear medical_records_extended
- [ ] Crear clinic_metrics
- [ ] Crear clinic_alerts
- [ ] Crear inventory_items
- [ ] Crear lab_tests
- [ ] Crear surgeries

### **🧪 Validación:**
- [ ] Testear inserción de datos
- [ ] Verificar relaciones
- [ ] Probar queries del backend
- [ ] Validar dashboard

---

**📅 Estado actual:** Esperando URL de conexión Supabase  
**🎯 Próximo paso:** Conectar y verificar estructura existente  
**🚀 Objetivo:** Dashboard veterinario 100% funcional con base de datos completa
