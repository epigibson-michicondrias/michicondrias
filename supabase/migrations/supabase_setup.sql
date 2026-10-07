-- 🗄️ Supabase Setup - Dashboard Veterinario
-- Ejecutar este script en el SQL Editor de Supabase

-- =====================================================
-- 🔍 PASO 1: VERIFICAR TABLAS EXISTENTES
-- =====================================================

-- Ver todas las tablas existentes
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver estructura de tablas importantes (descomentar para verificar)
/*
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'medical_records' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pets' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clinics' 
ORDER BY ordinal_position;
*/

-- =====================================================
-- 🆕 PASO 2: CREAR TABLAS NUEVAS (si no existen)
-- =====================================================

-- Tabla 1: medical_records_extended
CREATE TABLE IF NOT EXISTS medical_records_extended (
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

-- Indexes para medical_records_extended
CREATE INDEX IF NOT EXISTS idx_medical_extended_clinic_status ON medical_records_extended(status, created_at);
CREATE INDEX IF NOT EXISTS idx_medical_extended_alert_level ON medical_records_extended(alert_level);
CREATE INDEX IF NOT EXISTS idx_medical_extended_next_checkup ON medical_records_extended(next_checkup_date);
CREATE INDEX IF NOT EXISTS idx_medical_extended_critical ON medical_records_extended(is_critical, alert_level);
CREATE INDEX IF NOT EXISTS idx_medical_extended_clinic_critical ON medical_records_extended(is_critical, status, created_at);

-- Tabla 2: clinic_metrics
CREATE TABLE IF NOT EXISTS clinic_metrics (
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

-- Indexes para clinic_metrics
CREATE INDEX IF NOT EXISTS idx_clinic_metrics_clinic_date ON clinic_metrics(clinic_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_clinic_metrics_date ON clinic_metrics(metric_date);

-- Tabla 3: clinic_alerts
CREATE TABLE IF NOT EXISTS clinic_alerts (
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

-- Indexes para clinic_alerts
CREATE INDEX IF NOT EXISTS idx_clinic_alerts_clinic_unread ON clinic_alerts(clinic_id, is_read);
CREATE INDEX IF NOT EXISTS idx_clinic_alerts_type_priority ON clinic_alerts(type, priority);
CREATE INDEX IF NOT EXISTS idx_clinic_alerts_created_at ON clinic_alerts(created_at);

-- Tabla 4: inventory_items
CREATE TABLE IF NOT EXISTS inventory_items (
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

-- Indexes para inventory_items
CREATE INDEX IF NOT EXISTS idx_inventory_clinic_active ON inventory_items(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_critical ON inventory_items(is_critical, current_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory_items(expiry_date);

-- Tabla 5: lab_tests
CREATE TABLE IF NOT EXISTS lab_tests (
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

-- Indexes para lab_tests
CREATE INDEX IF NOT EXISTS idx_lab_tests_clinic_patient ON lab_tests(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_status ON lab_tests(status);
CREATE INDEX IF NOT EXISTS idx_lab_tests_date ON lab_tests(requested_date);

-- Tabla 6: surgeries
CREATE TABLE IF NOT EXISTS surgeries (
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

-- Indexes para surgeries
CREATE INDEX IF NOT EXISTS idx_surgeries_clinic_date ON surgeries(clinic_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_surgeries_status ON surgeries(status);
CREATE INDEX IF NOT EXISTS idx_surgeries_patient ON surgeries(patient_id);

-- =====================================================
-- 🧪 PASO 3: VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas fueron creadas
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'medical_records_extended', 
    'clinic_metrics', 
    'clinic_alerts', 
    'inventory_items', 
    'lab_tests', 
    'surgeries'
)
ORDER BY table_name;

-- Verificar relaciones (foreign keys)
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
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN (
    'medical_records_extended', 
    'clinic_metrics', 
    'clinic_alerts', 
    'inventory_items', 
    'lab_tests', 
    'surgeries'
)
ORDER BY tc.table_name;

-- =====================================================
-- 📊 PASO 4: DATOS DE PRUEBA (Opcional)
-- =====================================================

-- Insertar datos de prueba para pruebas del dashboard (descomentar si necesitas)
/*
-- Insertar métricas de prueba
INSERT INTO clinic_metrics (clinic_id, metric_date, today_appointments, surgeries_today, emergency_cases, vaccinations_today, daily_revenue, occupancy_rate)
SELECT 
    id as clinic_id,
    CURRENT_DATE as metric_date,
    floor(random() * 10 + 5)::integer as today_appointments,
    floor(random() * 3 + 1)::integer as surgeries_today,
    floor(random() * 2)::integer as emergency_cases,
    floor(random() * 6 + 2)::integer as vaccinations_today,
    (random() * 20000 + 5000)::decimal(10,2) as daily_revenue,
    floor(random() * 30 + 60)::integer as occupancy_rate
FROM clinics
LIMIT 1;

-- Insertar alertas de prueba
INSERT INTO clinic_alerts (clinic_id, type, title, message, priority, icon, color)
SELECT 
    id as clinic_id,
    'emergency' as type,
    'Caso de Emergencia' as title,
    'Max - Trauma automovilístico en camino' as message,
    'high' as priority,
    'AlertTriangle' as icon,
    '#ef4444' as color
FROM clinics
LIMIT 1;

-- Insertar items de inventario de prueba
INSERT INTO inventory_items (clinic_id, name, category, unit, current_stock, min_stock, max_stock, is_medication, is_critical)
SELECT 
    id as clinic_id,
    'Anestesia General' as name,
    'Anestésicos' as category,
    'ml' as unit,
    5.0 as current_stock,
    10.0 as min_stock,
    50.0 as max_stock,
    true as is_medication,
    true as is_critical
FROM clinics
LIMIT 1;
*/

-- =====================================================
-- ✅ RESULTADO ESPERADO
-- =====================================================

-- Después de ejecutar este script, deberías ver:
-- 1. Lista de tablas existentes (antes)
-- 2. Mensajes de confirmación de creación de tablas
-- 3. Lista final de tablas creadas
-- 4. Relaciones verificadas

-- El dashboard veterinario estará listo para funcionar con:
-- ✅ medical_records_extended - Datos clínicos avanzados
-- ✅ clinic_metrics - Métricas en tiempo real
-- ✅ clinic_alerts - Sistema de alertas
-- ✅ inventory_items - Gestión de inventario
-- ✅ lab_tests - Análisis de laboratorio
-- ✅ surgeries - Cirugías programadas
