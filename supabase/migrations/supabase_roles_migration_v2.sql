-- 📝 Migración de Tablas para Roles y Servicios de Michicondrias v2
-- Ajustado para usar VARCHAR(36) para claves primarias y foráneas compatibles con el esquema actual.

-- A. Funeraria (`funeraria`)
CREATE TABLE IF NOT EXISTS public.pet_deaths (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    funerary_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    date_of_death DATE NOT NULL,
    cause_of_death VARCHAR(255),
    cremation_type VARCHAR(50) CHECK (cremation_type IN ('individual', 'collective', 'no_cremation')),
    urn_model VARCHAR(100),
    certificate_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.pet_memorial_posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    message TEXT NOT NULL,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- B. Laboratorios (`laboratorio`)
CREATE TABLE IF NOT EXISTS public.lab_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    requesting_vet_id VARCHAR(36) REFERENCES public.users(id),
    lab_id VARCHAR(36) REFERENCES public.users(id),
    test_names VARCHAR(255)[] NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'sample_collected', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.lab_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    order_id VARCHAR(36) NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL,
    measured_value FLOAT NOT NULL,
    reference_range VARCHAR(50),
    unit VARCHAR(20),
    is_anomaly BOOLEAN DEFAULT FALSE,
    pdf_report_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- C. Estilistas / Groomers (`estilista`)
CREATE TABLE IF NOT EXISTS public.grooming_files (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    hair_type VARCHAR(100),
    preferred_shampoo VARCHAR(100),
    behavior_notes TEXT,
    allergies_detected TEXT,
    last_service_date DATE
);

CREATE TABLE IF NOT EXISTS public.grooming_appointments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    groomer_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    before_photo_url VARCHAR(500),
    after_photo_url VARCHAR(500),
    skin_report TEXT
);

-- D. Entrenadores / Etólogos (`entrenador`)
CREATE TABLE IF NOT EXISTS public.training_programs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    trainer_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    duration_weeks INT DEFAULT 4
);

CREATE TABLE IF NOT EXISTS public.pet_training_goals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    program_id VARCHAR(36) REFERENCES public.training_programs(id),
    goal_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_notes TEXT,
    video_proof_url VARCHAR(500)
);

-- E. Transportistas (`transportista`)
CREATE TABLE IF NOT EXISTS public.pet_rides (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    driver_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    origin_address VARCHAR(255) NOT NULL,
    destination_address VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'completed', 'cancelled')),
    price FLOAT,
    requires_carrier BOOLEAN DEFAULT TRUE,
    current_lat FLOAT,
    current_lng FLOAT
);

-- F. Refugios y Casas Hogares (Adopciones)
CREATE TABLE IF NOT EXISTS public.adoption_forms (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    applicant_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    has_other_pets BOOLEAN,
    has_yard BOOLEAN,
    hours_left_alone INT,
    experience_level VARCHAR(50),
    compatibility_score INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.adoption_contracts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    form_id VARCHAR(36) NOT NULL REFERENCES public.adoption_forms(id) ON DELETE CASCADE,
    refuge_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    terms TEXT NOT NULL,
    signed_contract_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- G. Patrocinadores (`patrocinador`)
CREATE TABLE IF NOT EXISTS public.sponsor_campaigns (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    sponsor_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    title VARCHAR(150) NOT NULL,
    banner_url VARCHAR(500) NOT NULL,
    target_link VARCHAR(255),
    budget_limit FLOAT NOT NULL,
    spent FLOAT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.boosted_alerts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    campaign_id VARCHAR(36) REFERENCES public.sponsor_campaigns(id) ON DELETE SET NULL,
    lost_pet_report_id VARCHAR(36) NOT NULL REFERENCES public.lost_pet_reports(id) ON DELETE CASCADE,
    extra_radius_meters INT NOT NULL DEFAULT 5000,
    amount_paid FLOAT NOT NULL
);

-- H. Establecimientos Pet-Friendly (`establecimiento`)
CREATE TABLE IF NOT EXISTS public.pet_friendly_venues (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    owner_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    amenities JSONB,
    discount_coupon VARCHAR(50),
    discount_description TEXT
);

-- I. Aseguradoras (`aseguradora`)
CREATE TABLE IF NOT EXISTS public.pet_insurance_policies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    pet_id VARCHAR(36) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    insurer_id VARCHAR(36) NOT NULL REFERENCES public.users(id),
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    coverage_details TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_premium FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    policy_id VARCHAR(36) NOT NULL REFERENCES public.pet_insurance_policies(id) ON DELETE CASCADE,
    amount_claimed FLOAT NOT NULL,
    reason TEXT NOT NULL,
    medical_receipt_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);
