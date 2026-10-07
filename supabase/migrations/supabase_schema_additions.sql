-- 🐾 Michicondrias - Schema Additions for 2FA & Medication Reminders
-- Ejecutar este script en el SQL Editor de Supabase (https://supabase.com)

-- =====================================================
-- 🔒 1. ACTUALIZAR TABLA DE USUARIOS PARA SOPORTAR 2FA
-- =====================================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(100);

-- =====================================================
-- 🏥 2. CREAR TABLA DE RECETAS (PRESCRIPTIONS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id character varying(36) NOT NULL,
    medical_record_id character varying NOT NULL,
    medication_name character varying(200) NOT NULL,
    dosage character varying(100) NOT NULL,
    frequency_hours integer NOT NULL,
    duration_days integer NOT NULL,
    instructions text,
    CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
    CONSTRAINT prescriptions_medical_record_id_fkey FOREIGN KEY (medical_record_id)
        REFERENCES public.medical_records (id) ON DELETE CASCADE
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS ix_prescriptions_id ON public.prescriptions USING btree (id);
CREATE INDEX IF NOT EXISTS ix_prescriptions_medical_record_id ON public.prescriptions USING btree (medical_record_id);

-- =====================================================
-- ⏰ 3. CREAR TABLA DE RECORDATORIOS DE MEDICAMENTO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.medication_reminders (
    id character varying(36) NOT NULL,
    prescription_id character varying(36) NOT NULL,
    pet_id character varying(36) NOT NULL,
    remind_at character varying(50) NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    CONSTRAINT medication_reminders_pkey PRIMARY KEY (id),
    CONSTRAINT medication_reminders_prescription_id_fkey FOREIGN KEY (prescription_id)
        REFERENCES public.prescriptions (id) ON DELETE CASCADE,
    CONSTRAINT medication_reminders_pet_id_fkey FOREIGN KEY (pet_id)
        REFERENCES public.pets (id) ON DELETE CASCADE
);

-- Índices para optimizar búsquedas y alertas en tiempo real
CREATE INDEX IF NOT EXISTS ix_medication_reminders_id ON public.medication_reminders USING btree (id);
CREATE INDEX IF NOT EXISTS ix_medication_reminders_prescription_id ON public.medication_reminders USING btree (prescription_id);
CREATE INDEX IF NOT EXISTS ix_medication_reminders_pet_id ON public.medication_reminders USING btree (pet_id);
CREATE INDEX IF NOT EXISTS ix_medication_reminders_remind_at ON public.medication_reminders USING btree (remind_at);
CREATE INDEX IF NOT EXISTS ix_medication_reminders_sent ON public.medication_reminders USING btree (sent);
