-- ══════════════════════════════════════════════════════
-- SEED COMPLETO - MICHIcondrias (Supabase)
-- Cubre todas las tablas del esquema real
-- Ejecutar en el SQL Editor de Supabase con permisos de service_role
-- ══════════════════════════════════════════════════════
-- REFERENCIA COMPLETA DE CHECK CONSTRAINTS (auditada de la DB real)
-- ══════════════════════════════════════════════════════
-- adoption_forms.status:               submitted | under_review | approved | rejected
-- claimed_coupons.status:              active | redeemed | expired
-- clinic_alerts.type:                  emergency | inventory | laboratory | vaccination | followup
-- clinic_alerts.priority:              high | medium | low
-- clinic_metrics.occupancy_rate:       0-100
-- funerary_bookings.status:            pending | confirmed | completed | cancelled
-- funerary_services.cremation_type:    individual | collective | no_cremation
-- insurance_claims.status:             pending | approved | rejected
-- lab_appointments.status:             pending | confirmed | completed | cancelled
-- lab_orders.status:                   pending | sample_collected | completed | cancelled
-- lab_tests.status:                    pending | in_progress | completed | cancelled
-- medical_records_extended.status:     stable | critical | emergency
-- medical_records_extended.prognosis:  good | fair | guarded | poor
-- medical_records_extended.alert_level:green | yellow | red
-- medical_records_extended.*_trend:    stable | rising | falling
-- medical_records_extended.treatment_response: improving | stable | worsening
-- medical_records_extended.medication_adherence: good | fair | poor
-- medical_records_extended.severity_score: 1-10
-- pet_deaths.cremation_type:           individual | collective | no_cremation
-- pet_rides.status:                    pending | assigned | in_transit | completed | cancelled
-- pet_training_goals.status:           not_started | in_progress | completed
-- surgeries.status:                    scheduled | in_progress | completed | cancelled | postponed
-- training_enrollments.status:         active | completed | cancelled
-- venue_reviews.rating:                1-5
-- ══════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════
-- 1. ROLES (ya existen; upsert seguro)
-- ══════════════════════════════════════════════════════
INSERT INTO roles (id, name) VALUES
('b7e20dc7-732e-4fa8-90d9-8553f21688a6', 'admin'),
('920fa098-bc65-461d-8ef9-dd0118e983ef', 'veterinario'),
('5c9a9102-2b9c-4389-9cb1-7f9ad31234eb', 'vendedor'),
('ef24d39d-50b6-44f4-8388-e72bf8a949a4', 'paseador'),
('4b9a9101-1b9c-4389-9cb1-7f9ad31234ea', 'cuidador'),
('1a9a9106-6b9c-4389-9cb1-7f9ad31234ef', 'refugio'),
('d981e55c-efb2-4495-b9d4-e0fd7821d937', 'consumidor'),
('8f9a9105-5b9c-4389-9cb1-7f9ad31234ee', 'clinica'),
('7e9a9104-4b9c-4389-9cb1-7f9ad31234ed', 'establecimiento'),
('6d9a9103-3b9c-4389-9cb1-7f9ad31234ec', 'patrocinador'),
('2b9a9107-7b9c-4389-9cb1-7f9ad31234f0', 'hogar_temporal'),
('3c9a9108-8b9c-4389-9cb1-7f9ad31234f1', 'funeraria')
ON CONFLICT (name) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 2. USUARIOS (contraseña: michicondrias123)
-- ══════════════════════════════════════════════════════
INSERT INTO users (id, email, full_name, hashed_password, is_active, verification_status, role_id) VALUES
('u001', 'admin@michicondrias.com',           'Admin General',        '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', 'b7e20dc7-732e-4fa8-90d9-8553f21688a6'),
('u002', 'vet@michicondrias.com',             'Dra. Ana López',       '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '920fa098-bc65-461d-8ef9-dd0118e983ef'),
('u003', 'vendedor@michicondrias.com',        'Carlos Vendedor',      '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '5c9a9102-2b9c-4389-9cb1-7f9ad31234eb'),
('u004', 'paseador@michicondrias.com',        'Juan Paseador',        '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', 'ef24d39d-50b6-44f4-8388-e72bf8a949a4'),
('u005', 'cuidador@michicondrias.com',        'María Cuidadora',      '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '4b9a9101-1b9c-4389-9cb1-7f9ad31234ea'),
('u006', 'refugio@michicondrias.com',         'Refugio Michis',       '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '1a9a9106-6b9c-4389-9cb1-7f9ad31234ef'),
('u007', 'usuario@michicondrias.com',         'Pedro Usuario',        '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', 'd981e55c-efb2-4495-b9d4-e0fd7821d937'),
('u008', 'clinica@michicondrias.com',         'Clínica Patitas',      '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '8f9a9105-5b9c-4389-9cb1-7f9ad31234ee'),
('u009', 'establecimiento@michicondrias.com', 'El Michi Café Owner',  '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '7e9a9104-4b9c-4389-9cb1-7f9ad31234ed'),
('u010', 'patrocinador@michicondrias.com',    'Patrocinador PETA',    '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '6d9a9103-3b9c-4389-9cb1-7f9ad31234ec'),
('u011', 'hogar@michicondrias.com',           'Hogar Temporal Test',  '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '2b9a9107-7b9c-4389-9cb1-7f9ad31234f0'),
('u012', 'funeraria@michicondrias.com',       'Funeraria Peluditos',  '$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW', true, 'VERIFIED', '3c9a9108-8b9c-4389-9cb1-7f9ad31234f1')
ON CONFLICT (email) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 3. CATEGORÍAS Y SUBCATEGORÍAS (e-commerce)
-- IDs reales de la DB:
--   Accesorios → 29c4a36c-cdf7-4e6d-9598-17c3d9e916aa
--   Alimentos  → 23c77f9c-596f-4d72-96a8-455c5fd5583a
--   Juguetes   → f60dfb90-93bd-404d-8d73-08a7a197fdee
--   Salud      → 36823d23-93b6-4926-a17c-59be83e091fa
-- ══════════════════════════════════════════════════════
INSERT INTO categories (id, name, description, is_active) VALUES
('23c77f9c-596f-4d72-96a8-455c5fd5583a', 'Alimentos',  'Alimentos y nutrición para mascotas',         true),
('29c4a36c-cdf7-4e6d-9598-17c3d9e916aa', 'Accesorios', 'Accesorios, juguetes y artículos de confort', true),
('36823d23-93b6-4926-a17c-59be83e091fa', 'Salud',      'Medicamentos, vitaminas y suplementos',        true),
('f60dfb90-93bd-404d-8d73-08a7a197fdee', 'Juguetes',   'Juguetes interactivos y de entretenimiento',   true)
ON CONFLICT (name) DO NOTHING;

-- Categorías nuevas (no existían en DB)
INSERT INTO categories (id, name, description, is_active) VALUES
('cat003', 'Higiene',     'Productos de limpieza e higiene para mascotas', true),
('cat005', 'Ropa y Moda','Ropa, disfraces y moda para mascotas',          true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO subcategories (id, name, description, category_id, is_active) VALUES
('sub001', 'Croquetas Perro',  'Alimento seco para perros',               '23c77f9c-596f-4d72-96a8-455c5fd5583a', true),
('sub002', 'Croquetas Gato',   'Alimento seco para gatos',                '23c77f9c-596f-4d72-96a8-455c5fd5583a', true),
('sub003', 'Alimento Húmedo',  'Latas y sobres para mascotas',            '23c77f9c-596f-4d72-96a8-455c5fd5583a', true),
('sub004', 'Juguetes',         'Juguetes interactivos y de mordida',      '29c4a36c-cdf7-4e6d-9598-17c3d9e916aa', true),
('sub005', 'Camas y Colchones','Camas, colchonetas y casitas',            '29c4a36c-cdf7-4e6d-9598-17c3d9e916aa', true),
('sub006', 'Shampoos',         'Shampoos y acondicionadores',             'cat003', true),
('sub007', 'Antiparasitarios', 'Antipulgas, garrapatas y desparasitantes','36823d23-93b6-4926-a17c-59be83e091fa', true),
('sub008', 'Vitaminas',        'Suplementos y vitaminas',                 '36823d23-93b6-4926-a17c-59be83e091fa', true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 4. CONFIGURACIÓN GLOBAL
-- ══════════════════════════════════════════════════════
INSERT INTO global_settings (id, key, value, description, is_public, type) VALUES
('gs001', 'app_name',         'MICHIcondrias',          'Nombre de la aplicación',         true,  'string'),
('gs002', 'contact_email',    'hola@michicondrias.com', 'Email de contacto público',        true,  'string'),
('gs003', 'donation_enabled', 'true',                   'Habilitar módulo de donaciones',   false, 'boolean'),
('gs004', 'max_upload_mb',    '10',                     'Tamaño máximo de upload en MB',    false, 'integer'),
('gs005', 'maintenance_mode', 'false',                  'Modo mantenimiento activo',        false, 'boolean')
ON CONFLICT (key) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 5. CLÍNICAS
-- ══════════════════════════════════════════════════════
INSERT INTO clinics (id, owner_user_id, name, address, city, state, phone, email, description, is_24_hours, has_emergency, is_approved) VALUES
('c001', 'u002', 'Hospital Veterinario Michicondrias', 'Av. Central 123',        'CDMX',        'CDMX', '555-1234', 'contacto@michicondrias.com', 'Clínica 24/7 con urgencias y cirugías',  true,  true,  true),
('c002', 'u008', 'Pet Care Center',                   'Calle Reforma 456',       'Guadalajara', 'JAL',  '555-5678', 'info@petcare.com',           'Atención integral para mascotas',        false, true,  true),
('c003', 'u002', 'Vet Express',                       'Blvd. Independencia 789', 'Monterrey',   'NL',   '555-9012', 'vet@express.com',            'Consultas generales y vacunación',       false, false, true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 6. SERVICIOS DE CLÍNICA
-- ══════════════════════════════════════════════════════
INSERT INTO clinic_services (id, clinic_id, name, description, price, duration_minutes, category, is_active) VALUES
('cs001', 'c001', 'Consulta General',       'Revisión médica general',                   350.00, 30,  'consulta',    true),
('cs002', 'c001', 'Vacunación',             'Aplicación de vacunas con cartilla',        250.00, 20,  'preventiva',  true),
('cs003', 'c001', 'Cirugía Ortopédica',     'Cirugía de huesos y articulaciones',       5000.00, 120, 'cirugia',     true),
('cs004', 'c001', 'Urgencias 24h',          'Atención de emergencias a cualquier hora', 800.00,  60,  'emergencia',  true),
('cs005', 'c002', 'Consulta General',       'Revisión médica general',                   300.00, 30,  'consulta',    true),
('cs006', 'c002', 'Ecografía',              'Ultrasonido abdominal y torácico',          600.00, 45,  'diagnostico', true),
('cs007', 'c003', 'Consulta Express',       'Consulta rápida sin cita previa',           200.00, 20,  'consulta',    true),
('cs008', 'c003', 'Desparasitación',        'Desparasitación interna y externa',         180.00, 15,  'preventiva',  true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 7. HORARIOS DE CLÍNICA (0=Lun … 6=Dom)
-- ══════════════════════════════════════════════════════
INSERT INTO clinic_schedules (id, clinic_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES
('sch001', 'c001', 1, '08:00', '20:00', 30, true),
('sch002', 'c001', 2, '08:00', '20:00', 30, true),
('sch003', 'c001', 3, '08:00', '20:00', 30, true),
('sch004', 'c001', 4, '08:00', '20:00', 30, true),
('sch005', 'c001', 5, '08:00', '20:00', 30, true),
('sch006', 'c001', 6, '09:00', '14:00', 30, true),
('sch007', 'c002', 1, '09:00', '18:00', 30, true),
('sch008', 'c002', 2, '09:00', '18:00', 30, true),
('sch009', 'c002', 3, '09:00', '18:00', 30, true),
('sch010', 'c002', 4, '09:00', '18:00', 30, true),
('sch011', 'c002', 5, '09:00', '18:00', 30, true),
('sch012', 'c003', 1, '10:00', '19:00', 20, true),
('sch013', 'c003', 2, '10:00', '19:00', 20, true),
('sch014', 'c003', 3, '10:00', '19:00', 20, true),
('sch015', 'c003', 4, '10:00', '19:00', 20, true),
('sch016', 'c003', 5, '10:00', '19:00', 20, true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 8. VETERINARIOS
-- ══════════════════════════════════════════════════════
-- NOTA: veterinarians.user_id → FK a users.id
-- v001 → u002 (rol veterinario), v002 → u003 (vendedor reutilizado como vet demo)
-- v003 → u004 (paseador reutilizado como vet demo - datos de prueba)
INSERT INTO veterinarians (id, user_id, clinic_id, first_name, last_name, specialty, license_number, phone, email, bio, is_approved) VALUES
('v001', 'u002', 'c001', 'Ana',    'López',    'Cirugía Ortopédica',  'MED-12345', '555-0001', 'ana@vet.com',    'Experta en ortopedia con 10 años de experiencia',  true),
('v002', 'u003', 'c002', 'Carlos', 'Ruiz',     'Medicina Interna',    'MED-67890', '555-0002', 'carlos@vet.com', 'Especialista en enfermedades internas',            true),
('v003', 'u004', 'c003', 'Sofía',  'Martínez', 'Dermatología Felina', 'MED-11111', '555-0003', 'sofia@vet.com',  'Especialista en piel y coat de gatos',             true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 9. MASCOTAS
-- ══════════════════════════════════════════════════════
INSERT INTO pets (id, owner_id, name, species, breed, age_months, size, is_active, gender, is_vaccinated, is_sterilized, is_dewormed, weight_kg, temperament, energy_level) VALUES
('p001', 'u007', 'Max',    'perro', 'Labrador',         36, 'grande',  true, 'macho',  true,  false, true,  28.5, 'Amigable y juguetón', 'alta'),
('p002', 'u007', 'Luna',   'gato',  'Siamés',           24, 'pequeño', true, 'hembra', true,  true,  true,  3.8,  'Independiente y cariñosa', 'media'),
('p003', 'u007', 'Rocky',  'perro', 'Bulldog Francés',  18, 'pequeño', true, 'macho',  false, false, false, 10.2, 'Terco pero noble', 'baja'),
('p004', 'u004', 'Bella',  'perro', 'Golden Retriever', 48, 'grande',  true, 'hembra', true,  true,  true,  30.1, 'Gentil y obediente', 'alta'),
('p005', 'u005', 'Mishi',  'gato',  'Mestizo',          12, 'pequeño', true, 'macho',  false, false, false, 2.9,  'Juguetón y curioso', 'alta'),
('p006', 'u006', 'Kira',   'perro', 'Husky Siberiano',  30, 'grande',  true, 'hembra', true,  false, true,  22.0, 'Enérgica y vocal', 'muy_alta'),
('p007', 'u011', 'Pinto',  'perro', 'Mestizo',          8,  'mediano', true, 'macho',  false, false, false, 8.5,  'Tímido pero cariñoso', 'media')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 10. PRODUCTOS (con categoría y subcategoría)
-- ══════════════════════════════════════════════════════
INSERT INTO products (id, seller_id, name, description, price, stock, category_id, subcategory_id, is_active, is_approved) VALUES
('pr001', 'u003', 'Alimento Premium Perro Adulto', 'Croquetas balanceadas para perros adultos 4kg',     899.00,  50,  '23c77f9c-596f-4d72-96a8-455c5fd5583a', 'sub001', true, true),
('pr002', 'u003', 'Alimento Gato Castrado',        'Croquetas especiales para gatos esterilizados 2kg', 549.00,  80,  '23c77f9c-596f-4d72-96a8-455c5fd5583a', 'sub002', true, true),
('pr003', 'u003', 'Juguete Pelota Resistente',     'Pelota de goma ultra resistente con sonido',        249.00,  100, '29c4a36c-cdf7-4e6d-9598-17c3d9e916aa', 'sub004', true, true),
('pr004', 'u003', 'Cama Ortopédica Grande',        'Cama con memory foam para perros grandes',          1599.00, 20,  '29c4a36c-cdf7-4e6d-9598-17c3d9e916aa', 'sub005', true, true),
('pr005', 'u003', 'Shampoo Neutro Gatos',          'Shampoo hipoalergénico pH neutro para gatos',       189.00,  75,  'cat003', 'sub006', true, true),
('pr006', 'u003', 'Collar Antipulgas 6 meses',     'Collar protección continua 6 meses',                349.00,  30,  '36823d23-93b6-4926-a17c-59be83e091fa', 'sub007', true, true),
('pr007', 'u003', 'Comedero Automático 5L',        'Comedero con temporizador programable 5 litros',    1299.00, 15,  '29c4a36c-cdf7-4e6d-9598-17c3d9e916aa', 'sub004', true, true),
('pr008', 'u003', 'Snacks Training Natural',       'Premios naturales de pollo liofilizado',            149.00,  200, '23c77f9c-596f-4d72-96a8-455c5fd5583a', 'sub001', true, true),
('pr009', 'u003', 'Correa Retráctil 5m',           'Correa extensible con freno automático y LED',      299.00,  40,  '29c4a36c-cdf7-4e6d-9598-17c3d9e916aa', 'sub004', true, true),
('pr010', 'u003', 'Vitaminas Articulares Perro',   'Suplemento glucosamina y condroitina 60 tabletas',  399.00,  60,  '36823d23-93b6-4926-a17c-59be83e091fa', 'sub008', true, true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 11. CITAS VETERINARIAS
-- ══════════════════════════════════════════════════════
INSERT INTO appointments (id, clinic_id, service_id, pet_id, user_id, vet_id, date, start_time, end_time, status, notes) VALUES
('ap001', 'c001', 'cs001', 'p001', 'u007', 'v001', CURRENT_DATE + 2,  '10:00', '10:30', 'confirmed',  'Revisión anual de Max'),
('ap002', 'c001', 'cs002', 'p002', 'u007', 'v001', CURRENT_DATE + 3,  '11:00', '11:20', 'confirmed',  'Vacuna antirrábica Luna'),
('ap003', 'c002', 'cs005', 'p003', 'u007', 'v002', CURRENT_DATE + 5,  '09:30', '10:00', 'pending',    'Consulta respiratoria Rocky'),
('ap004', 'c002', 'cs006', 'p004', 'u004', 'v002', CURRENT_DATE + 7,  '14:00', '14:45', 'confirmed',  'Ecografía abdominal Bella'),
('ap005', 'c001', 'cs001', 'p005', 'u005', 'v001', CURRENT_DATE - 5,  '16:00', '16:30', 'completed',  'Revisión general Mishi'),
('ap006', 'c003', 'cs007', 'p006', 'u006', 'v003', CURRENT_DATE - 2,  '10:00', '10:20', 'completed',  'Consulta express Kira'),
('ap007', 'c001', 'cs004', 'p001', 'u007', 'v001', CURRENT_DATE - 10, '03:00', '04:00', 'completed',  'Urgencia corte pata Max')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 12. RECORDATORIOS DE CITA
-- ══════════════════════════════════════════════════════
INSERT INTO appointment_reminders (id, appointment_id, remind_at, reminder_type, sent) VALUES
('ar001', 'ap001', '2026-06-18 09:00:00+00', 'push',  false),
('ar002', 'ap001', '2026-06-18 08:00:00+00', 'email', false),
('ar003', 'ap002', '2026-06-19 10:00:00+00', 'push',  false),
('ar004', 'ap004', '2026-06-21 13:00:00+00', 'push',  false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 13. EXPEDIENTES MÉDICOS
-- ══════════════════════════════════════════════════════
INSERT INTO medical_records (id, pet_id, clinic_id, veterinarian_id, appointment_id, reason_for_visit, diagnosis, treatment, weight_kg, temperature_c, notes) VALUES
('mr001', 'p001', 'c001', 'v001', 'ap007', 'Urgencia - herida en pata',   'Laceración profunda almohadilla izquierda', 'Sutura, antibiótico Amoxicilina 250mg x7 días', 28.5, 38.2, 'Evolución favorable'),
('mr002', 'p002', 'c001', 'v001', 'ap002', 'Vacunación anual',            'Mascota sana',                             'Antirrábica + Triple Felina',                  3.8,  38.6, 'Próxima cita en 1 año'),
('mr003', 'p005', 'c001', 'v001', 'ap005', 'Revisión general',            'Estado general bueno, bajo peso',          'Dieta hipercalórica recomendada',              2.9,  38.4, 'Revisar alimentación'),
('mr004', 'p006', 'c003', 'v003', 'ap006', 'Consulta piel y coat',        'Dermatitis leve por alérgenos',            'Shampoo medicado + antihistamínico',           22.0, 38.1, 'Evitar pasto húmedo')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 14. EXPEDIENTES MÉDICOS EXTENDIDOS (clínica avanzada)
-- ══════════════════════════════════════════════════════
-- CHECK constraints en medical_records_extended:
--   status:    stable | critical | emergency
--   prognosis: good   | fair     | guarded | poor
--   alert_level: green | yellow  | red
INSERT INTO medical_records_extended (original_record_id, clinic_id, status, alert_level, follow_up_required, is_critical, severity_score, prognosis, requires_hospitalization, treatment_cost_estimate, payment_status) VALUES
('mr001', 'c001', 'stable',   'yellow', true,  false, 4, 'guarded', false, 1800.00, 'paid'),
('mr002', 'c001', 'stable',   'green',  false, false, 1, 'good',    false,  500.00, 'paid'),
('mr003', 'c001', 'stable',   'green',  true,  false, 2, 'good',    false,  350.00, 'paid'),
('mr004', 'c003', 'stable',   'green',  false, false, 2, 'fair',    false,  420.00, 'paid')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 15. RESEÑAS DE CLÍNICA
-- ══════════════════════════════════════════════════════
INSERT INTO clinic_reviews (id, clinic_id, user_id, rating, comment) VALUES
('cr001', 'c001', 'u007', 5, 'Excelente atención, los doctores son muy profesionales y amables con los animales.'),
('cr002', 'c001', 'u004', 4, 'Muy buena clínica, aunque la espera puede ser larga en horas pico.'),
('cr003', 'c002', 'u007', 4, 'Buenas instalaciones y personal capacitado. Recomendada.'),
('cr004', 'c003', 'u006', 5, 'Perfecta para consultas rápidas, sin filas y buen precio.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 16. INVENTARIO DE CLÍNICA
-- ══════════════════════════════════════════════════════
INSERT INTO inventory_items (clinic_id, name, description, category, unit, current_stock, min_stock, max_stock, cost_per_unit, selling_price, is_medication, requires_prescription, is_active) VALUES
('c001', 'Amoxicilina 250mg',     'Antibiótico amplio espectro',           'medicamento',   'caja',   45, 10, 100, 120.00, 185.00, true,  true,  true),
('c001', 'Jeringa 5ml',           'Jeringa desechable estéril',            'material',      'paquete',200, 50, 500,   5.00,   8.00, false, false, true),
('c001', 'Suero fisiológico 1L',  'Solución salina para hidratación IV',  'material',      'bolsa',   30, 10,  80,  35.00,  60.00, false, false, true),
('c001', 'Ketamina 50mg/ml',      'Anestésico general veterinario',        'anestésico',    'frasco',  12,  5,  30, 280.00, 400.00, true,  true,  true),
('c002', 'Gel ultrasonido',        'Gel conductor para ecografías',         'material',      'tubo',    20,  5,  50,  45.00,  70.00, false, false, true),
('c002', 'Prednisolona 20mg',     'Corticosteroide antiinflamatorio',      'medicamento',   'caja',    30, 10,  80,  90.00, 140.00, true,  true,  true)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 17. ALERTAS DE CLÍNICA
-- ══════════════════════════════════════════════════════
-- CHECK constraints en clinic_alerts:
--   type:     emergency | inventory | laboratory | vaccination | followup
--   priority: high | medium | low
INSERT INTO clinic_alerts (clinic_id, type, title, message, priority, icon, color, is_read, patient_id) VALUES
('c001', 'inventory', 'Stock bajo: Amoxicilina',    'Quedan menos de 10 cajas de Amoxicilina 250mg',                  'high',   '⚠️', 'orange', false, null),
('c001', 'followup',  'Seguimiento urgente Max',    'Paciente Max tiene seguimiento post-cirugía mañana a las 10:00', 'medium', '🐾', 'blue',   false, 'p001'),
('c002', 'followup',  'Seguimiento pendiente',      'Un paciente tiene reseña de laboratorio sin revisar',            'low',    '🔬', 'green',  false, null)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 18. MÉTRICAS DE CLÍNICA (hoy)
-- ══════════════════════════════════════════════════════
INSERT INTO clinic_metrics (clinic_id, metric_date, today_appointments, pending_confirmations, surgeries_today, emergency_cases, vaccinations_today, checkups_today, lab_results_pending, prescriptions_active, critical_patients, inventory_alerts, daily_revenue, occupancy_rate, new_patients_today) VALUES
('c001', CURRENT_DATE, 8, 2, 1, 1, 3, 4, 2, 5, 0, 1, 12500.00, 75, 2),
('c002', CURRENT_DATE, 5, 1, 0, 0, 2, 3, 1, 3, 0, 0,  8200.00, 60, 1),
('c003', CURRENT_DATE, 3, 0, 0, 0, 1, 2, 0, 1, 0, 0,  3100.00, 40, 1)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 19. PRESCRIPCIONES
-- ══════════════════════════════════════════════════════
INSERT INTO prescriptions (id, medical_record_id, medication_name, dosage, frequency_hours, duration_days, instructions) VALUES
('px001', 'mr001', 'Amoxicilina',    '250mg', 12, 7,  'Dar con alimento. No suspender antes de terminar el tratamiento.'),
('px002', 'mr001', 'Meloxicam',      '1mg/kg',24, 5,  'Analgésico. Dar por la mañana con comida.'),
('px003', 'mr003', 'Royal Canin RC', '100g',  12, 30, 'Dieta especial hipercalórica. 100g cada 12h.'),
('px004', 'mr004', 'Cetirizina',     '5mg',   24, 14, 'Antihistamínico. Dar por la noche.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 20. RECORDATORIOS DE MEDICAMENTO
-- ══════════════════════════════════════════════════════
INSERT INTO medication_reminders (id, prescription_id, pet_id, remind_at, sent) VALUES
('med001', 'px001', 'p001', '2026-06-16 08:00:00', false),
('med002', 'px001', 'p001', '2026-06-16 20:00:00', false),
('med003', 'px002', 'p001', '2026-06-16 09:00:00', false),
('med004', 'px004', 'p006', '2026-06-16 21:00:00', false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 21. CONSULTAS VIRTUALES
-- ══════════════════════════════════════════════════════
INSERT INTO consultations (id, clinic_id, vet_id, user_id, pet_id, scheduled_at, status, notes) VALUES
('con001', 'c001', 'v001', 'u007', 'p001', NOW() + interval '1 day',   'scheduled', 'Seguimiento post-cirugía Max'),
('con002', 'c002', 'v002', 'u004', 'p004', NOW() + interval '3 days',  'scheduled', 'Revisión resultados ecografía Bella'),
('con003', 'c001', 'v001', 'u005', 'p005', NOW() - interval '2 days',  'completed', 'Consulta nutrición Mishi - concluida')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 22. LABORATORIO - CATÁLOGO Y ÓRDENES
-- ══════════════════════════════════════════════════════
-- NOTA: lab_id → FK a users.id (el usuario con rol clinica/laboratorio)
--       requesting_vet_id → FK a users.id (el usuario veterinario)
INSERT INTO lab_test_catalog (id, lab_id, name, description, price, reference_range, unit, is_active) VALUES
('ltc001', 'u008', 'Biometría Hemática Completa', 'Hemograma completo con diferencial',  380.00, null, null, true),
('ltc002', 'u008', 'Química Sanguínea 6 elem.',   'Glucosa, urea, creatinina + 3 más',  450.00, null, null, true),
('ltc003', 'u008', 'Urianálisis Completo',         'Análisis de orina con sedimento',    280.00, null, null, true),
('ltc004', 'u002', 'Perfil Hepático',              'ALT, AST, Fosfatasa alcalina',       520.00, null, null, true),
('ltc005', 'u002', 'Prueba de Parvo',              'Test rápido parvovirus',             320.00, null, null, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab_orders (id, pet_id, requesting_vet_id, lab_id, test_names, status) VALUES
('lo001', 'p001', 'u002', 'u008', ARRAY['Biometría Hemática Completa', 'Química Sanguínea 6 elem.'], 'completed'),
('lo002', 'p005', 'u002', 'u008', ARRAY['Urianálisis Completo'], 'pending'),
('lo003', 'p004', 'u002', 'u002', ARRAY['Perfil Hepático'], 'sample_collected')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab_results (id, order_id, parameter_name, measured_value, reference_range, unit, is_anomaly) VALUES
('lr001', 'lo001', 'Eritrocitos',   6.8,  '5.5-8.5',  'x10⁶/µL', false),
('lr002', 'lo001', 'Hemoglobina',   15.2, '12-18',    'g/dL',     false),
('lr003', 'lo001', 'Leucocitos',    12.4, '6-17',     'x10³/µL',  false),
('lr004', 'lo001', 'Glucosa',       110,  '70-120',   'mg/dL',    false),
('lr005', 'lo001', 'BUN',           38,   '10-30',    'mg/dL',    true)
ON CONFLICT (id) DO NOTHING;

-- Lab tests (tabla de la clínica extendida)
-- status CHECK: pending | in_progress | completed | cancelled
INSERT INTO lab_tests (clinic_id, patient_id, test_type, test_name, status, cost, is_paid, requesting_vet_id) VALUES
('c001', 'p001', 'hematologia', 'Biometría Hemática', 'completed',  380.00, true,  'u002'),
('c001', 'p005', 'urologia',    'Urianálisis',        'pending',    280.00, false, 'u002'),
('c002', 'p004', 'bioquimica',  'Perfil Hepático',    'in_progress',520.00, false, 'u002')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 23. CIRUGÍAS
-- ══════════════════════════════════════════════════════
INSERT INTO surgeries (clinic_id, patient_id, surgery_type, surgery_name, description, scheduled_date, estimated_duration, surgeon_id, operating_room, anesthesia_type, status, estimated_cost, is_paid) VALUES
('c001', 'p001', 'ortopedia', 'Reparación ligamento cruzado', 'Ligamentoplastia rodilla izquierda por ruptura parcial', NOW() + interval '14 days', 90, 'v001', 'Quirófano 1', 'general', 'scheduled', 8500.00, false),
('c001', 'p006', 'esterilizacion', 'Ovariohisterectomía', 'Esterilización Kira previa a temporada de calor', NOW() + interval '7 days', 45, 'v001', 'Quirófano 2', 'general', 'scheduled', 2800.00, false)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 24. VACUNAS
-- ══════════════════════════════════════════════════════
INSERT INTO vaccines (id, pet_id, name, date_administered, next_due_date, administered_by_vet_id, batch_number, notes) VALUES
('vc001', 'p001', 'Antirrábica',      now() - interval '30 days',  now() + interval '335 days', 'v001', 'VAC-2024-001', 'Aplicada sin reacción'),
('vc002', 'p001', 'Moquillo+Parvo',   now() - interval '60 days',  now() + interval '305 days', 'v001', 'VAC-2024-002', 'Refuerzo anual'),
('vc003', 'p002', 'Triple Felina',    now() - interval '45 days',  now() + interval '320 days', 'v001', 'VAC-2024-003', null),
('vc004', 'p002', 'Leucemia Felina',  now() - interval '90 days',  now() + interval '275 days', 'v001', 'VAC-2024-004', null),
('vc005', 'p003', 'Parvovirus',       now() - interval '15 days',  now() + interval '350 days', 'v002', 'VAC-2024-005', 'Primera vacuna cachorro'),
('vc006', 'p004', 'Antirrábica',      now() - interval '180 days', now() + interval '185 days', 'v002', 'VAC-2023-010', 'Vence pronto, agendar refuerzo'),
('vc007', 'p006', 'Moquillo+Parvo',   now() - interval '20 days',  now() + interval '345 days', 'v003', 'VAC-2024-006', null)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 25. PASEADORES
-- ══════════════════════════════════════════════════════
INSERT INTO walkers (id, user_id, display_name, bio, location, price_per_walk, price_per_hour, rating, total_walks, is_verified, is_active, experience_years, accepts_dogs, accepts_cats, max_pets_per_walk, service_radius_km) VALUES
('wk001', 'u004', 'Juan el Paseador', 'Apasionado de los perros con 5 años de experiencia. Conozco todos los parques de la CDMX.', 'CDMX - Condesa', 150.00, 120.00, 4.8, 47, true, true, 5, true, false, 3, 8.0),
('wk002', 'u005', 'María Walks',      'Me encantan todos los animales. Zona Polanco y Lomas.',                                       'CDMX - Polanco', 180.00, 150.00, 4.6, 23, true, true, 3, true, true,  2, 6.0)
ON CONFLICT (user_id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 26. SOLICITUDES Y RESEÑAS DE PASEOS
-- ══════════════════════════════════════════════════════
INSERT INTO walk_requests (id, walker_id, client_user_id, pet_id, status, requested_date, requested_time, duration_minutes, pickup_address, notes, total_price) VALUES
('wr001', 'wk001', 'u007', 'p001', 'completed', '2026-06-10', '08:00', 60,  'Av. Ámsterdam 50, Condesa', 'Max jala fuerte, usar arnés', 150.00),
('wr002', 'wk001', 'u007', 'p003', 'completed', '2026-06-12', '09:00', 45,  'Av. Ámsterdam 50, Condesa', 'Rocky necesita mucho descanso', 120.00),
('wr003', 'wk002', 'u004', 'p004', 'confirmed', '2026-06-18', '07:30', 60,  'Homero 123, Polanco', null, 180.00),
('wr004', 'wk001', 'u006', 'p006', 'pending',   '2026-06-20', '08:00', 60,  'Masaryk 456, Polanco', 'Kira es muy activa', 150.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO walk_reviews (id, walk_request_id, reviewer_user_id, walker_id, rating, comment) VALUES
('wrv001', 'wr001', 'u007', 'wk001', 5, 'Juan es increíble, Max llegó feliz y cansado. ¡Lo mejor!'),
('wrv002', 'wr002', 'u007', 'wk001', 4, 'Muy buen servicio, Rocky volvió muy contento.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 27. CUIDADORES (SITTERS)
-- ══════════════════════════════════════════════════════
INSERT INTO sitters (id, user_id, display_name, bio, location, price_per_day, price_per_visit, rating, total_sits, is_verified, is_active, service_type, max_pets, has_yard, home_type, accepts_dogs, accepts_cats, experience_years) VALUES
('st001', 'u005', 'María Cuidadora', 'Casa amplia con jardín en Coyoacán. Trato a las mascotas como familia.', 'CDMX - Coyoacán', 350.00, 120.00, 4.9, 31, true, true, 'both',    3, true, 'casa', true, true, 4),
('st002', 'u011', 'Hogar Temporal',  'Hogar temporal para mascotas en tránsito o emergencias.',                'CDMX - Tlalpan', 200.00, 80.00,  4.5, 12, true, true, 'hosting', 2, true, 'casa', true, true, 2)
ON CONFLICT (user_id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 28. SOLICITUDES Y RESEÑAS DE CUIDADO
-- ══════════════════════════════════════════════════════
INSERT INTO sit_requests (id, sitter_id, client_user_id, pet_id, status, service_type, start_date, end_date, address, notes, total_price) VALUES
('sr001', 'st001', 'u007', 'p002', 'completed', 'hosting', '2026-06-01', '2026-06-05', 'Casa de María, Coyoacán', 'Luna come 80g de croqueta 2x al día', 1400.00),
('sr002', 'st001', 'u004', 'p004', 'confirmed', 'hosting', '2026-06-20', '2026-06-25', 'Casa de María, Coyoacán', 'Bella necesita paseo diario', 1750.00),
('sr003', 'st002', 'u006', 'p007', 'pending',   'hosting', '2026-06-22', '2026-06-28', 'Hogar Temporal, Tlalpan', 'Pinto en proceso de adopción', 1200.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sit_reviews (id, sit_request_id, reviewer_user_id, sitter_id, rating, comment) VALUES
('srv001', 'sr001', 'u007', 'st001', 5, 'María trató a Luna como si fuera suya. Totalmente recomendada.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 29. GROOMING (ESTÉTICA)
-- ══════════════════════════════════════════════════════
INSERT INTO grooming_services (id, groomer_id, name, description, price, duration_minutes, is_active) VALUES
('grs001', 'u004', 'Baño y Corte Completo',   'Baño, secado, corte de pelo y uñas',           450.00, 90,  true),
('grs002', 'u004', 'Baño Express',             'Baño y secado sin corte',                      250.00, 45,  true),
('grs003', 'u004', 'Spa Relajante',            'Baño + masaje + aromaterapia canina',          680.00, 120, true),
('grs004', 'u005', 'Corte Felino Especializado','Corte y baño para gatos con sedación mínima', 550.00, 75,  true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO grooming_files (id, pet_id, hair_type, preferred_shampoo, behavior_notes, allergies_detected, last_service_date) VALUES
('grf001', 'p001', 'corto liso',   'Shampoo Neutro pH7', 'Tranquilo, coopera bien', null,                     CURRENT_DATE - 30),
('grf002', 'p002', 'corto denso',  'Shampoo para gatos',  'Se estresa un poco, requiere manipulación suave', 'Alergia a lavanda', CURRENT_DATE - 60),
('grf003', 'p006', 'largo doble',  'Shampoo Husky',       'Activa, disfruta el baño', null,                   CURRENT_DATE - 15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO grooming_appointments (id, groomer_id, pet_id, date, time, service_type, status) VALUES
('ga001', 'u004', 'p001', CURRENT_DATE + 4,  '10:00', 'Baño y Corte Completo',    'confirmed'),
('ga002', 'u004', 'p006', CURRENT_DATE + 6,  '11:30', 'Spa Relajante',            'pending'),
('ga003', 'u005', 'p002', CURRENT_DATE - 7,  '15:00', 'Corte Felino Especializado','completed')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 30. ENTRENAMIENTO
-- ══════════════════════════════════════════════════════
INSERT INTO training_programs (id, trainer_id, title, description, price, duration_weeks) VALUES
('tp001', 'u004', 'Obediencia Básica',         'Comandos básicos: sentado, quieto, ven, talón',  1500.00, 4),
('tp002', 'u004', 'Socialización Avanzada',    'Interacción con otros perros y personas',        2200.00, 6),
('tp003', 'u005', 'Agility para Principiantes','Introducción a circuitos de agilidad canina',    2800.00, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO training_enrollments (id, client_id, pet_id, program_id, start_date, status, total_paid) VALUES
('te001', 'u007', 'p001', 'tp001', CURRENT_DATE - 14, 'active',    1500.00),
('te002', 'u007', 'p003', 'tp001', CURRENT_DATE - 7,  'active',    1500.00),
('te003', 'u004', 'p004', 'tp002', CURRENT_DATE - 21, 'completed', 2200.00)
ON CONFLICT (id) DO NOTHING;

-- CHECK constraint: status = not_started | in_progress | completed  ('achieved' NO existe)
INSERT INTO pet_training_goals (id, pet_id, program_id, goal_name, status, progress_notes) VALUES
('tg001', 'p001', 'tp001', 'Sentado',         'completed',   'Logrado en semana 1'),
('tg002', 'p001', 'tp001', 'Quieto 30 seg',   'in_progress', 'Llega a 15 segundos'),
('tg003', 'p001', 'tp001', 'Ven al llamado',  'not_started', null),
('tg004', 'p003', 'tp001', 'Sentado',         'in_progress', 'Aprende lento pero progresa'),
('tg005', 'p004', 'tp002', 'Socializar perros','completed',  'Excelente desempeño')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 31. TRANSPORTE DE MASCOTAS
-- ══════════════════════════════════════════════════════
INSERT INTO driver_profiles (id, driver_id, vehicle_model, vehicle_plate, max_capacity, has_air_conditioning, has_carriers, is_available) VALUES
('dp001', 'u004', 'Nissan NV200 2022', 'ABC-1234', 4, true, true, true),
('dp002', 'u005', 'Renault Kangoo 2021','XYZ-5678', 3, true, true, false)
ON CONFLICT (id) DO NOTHING;

-- NOTA: pet_rides.driver_id → FK a users.id (no a driver_profiles.id)
INSERT INTO pet_rides (id, driver_id, pet_id, origin_address, destination_address, status, price, requires_carrier) VALUES
('pr_001', 'u004', 'p001', 'Av. Ámsterdam 50, Condesa', 'Hospital Veterinario Michicondrias, Av. Central 123', 'completed', 120.00, false),
('pr_002', 'u004', 'p002', 'Homero 123, Polanco',        'Pet Care Center, Calle Reforma 456',                  'pending',   95.00,  true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 32. ADOPCIONES
-- ══════════════════════════════════════════════════════
INSERT INTO adoption_listings (id, name, species, breed, age_months, size, description, published_by, is_approved, status, gender, weight_kg, is_vaccinated, is_sterilized, is_dewormed, temperament, energy_level, location) VALUES
('al001', 'Coco',    'perro', 'Mestizo',  6,  'pequeño', 'Cachorro adorable encontrado en la calle, muy sociable y juguetón.',   'u006', true, 'available', 'macho',  3.5,  false, false, true,  'Alegre y juguetón',  'alta',  'CDMX - Iztapalapa'),
('al002', 'Nala',    'gato',  'Mestizo',  18, 'pequeño', 'Gata adulta muy cariñosa, ideal para departamento. Esterilizada.',     'u006', true, 'available', 'hembra', 3.2,  true,  true,  true,  'Tranquila y amorosa','baja',  'CDMX - Tlalpan'),
('al003', 'Tito',    'perro', 'Poodle',   36, 'pequeño', 'Poodle rescatado de maltrato, ya rehabilitado. Muy cariñoso.',         'u006', true, 'available', 'macho',  5.1,  true,  false, true,  'Dulce y confiado',   'media', 'CDMX - Coyoacán'),
('al004', 'Bolita',  'gato',  'Persa',    24, 'mediano', 'Gato persa de color blanco, temperamento sereno. Dueño falleció.',     'u006', true, 'available', 'macho',  5.8,  true,  true,  true,  'Sereno y elegante',  'baja',  'CDMX - Polanco')
ON CONFLICT (id) DO NOTHING;

INSERT INTO adoption_requests (id, listing_id, user_id, status, applicant_name, house_type, has_yard, own_or_rent, other_pets, has_children, hours_alone, financial_commitment, reason) VALUES
('areq001', 'al001', 'u007', 'pending',  'Pedro Usuario',  'departamento', false, 'renta',    null,          false, 6, true, 'Siempre quise tener un perro y estoy listo para la responsabilidad'),
('areq002', 'al002', 'u011', 'approved', 'Hogar Temporal', 'casa',         true,  'propia',   'un perro',    true,  4, true, 'Queremos darle un hogar permanente a Nala')
ON CONFLICT (id) DO NOTHING;

-- NOTA: adoption_forms.pet_id → FK a pets.id (no a adoption_listings.id)
-- adoption_forms.status CHECK: submitted | under_review | approved | rejected
INSERT INTO adoption_forms (id, pet_id, applicant_id, has_other_pets, has_yard, hours_left_alone, experience_level, compatibility_score, status) VALUES
('af001', 'p007', 'u007', false, false, 6, 'principiante', 68, 'submitted'),
('af002', 'p007', 'u011', true,  true,  4, 'intermedio',   85, 'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO adoption_contracts (id, form_id, refuge_id, terms) VALUES
('ac001', 'af002', 'u006', 'El adoptante se compromete a: 1) Proveer alimentación y agua diaria. 2) Llevar a citas veterinarias. 3) No ceder ni vender al animal. 4) Permitir visitas de seguimiento.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 33. MASCOTAS PERDIDAS / ENCONTRADAS
-- ══════════════════════════════════════════════════════
INSERT INTO lost_pet_reports (id, reporter_id, pet_name, species, breed, color, size, age_approx, description, report_type, last_seen_location, latitude, longitude, contact_phone, contact_email, status, is_resolved) VALUES
('lp001', 'u007', 'Canelo', 'perro', 'Chihuahua',  'Café',      'pequeño', '3 años', 'Se escapó del jardín cercano al parque. Usa collar rojo.',           'lost',  'Parque México, CDMX',   19.4194, -99.1904, '555-1111', 'usuario@michicondrias.com',  'active', false),
('lp002', 'u004', 'Simba',  'gato',  'Naranja',    'Naranja',   'pequeño', '2 años', 'Gato naranja encontrado en la calle, muy amigable.',                 'found', 'Col. Roma, CDMX',       19.4126, -99.1660, '555-2222', 'paseador@michicondrias.com', 'active', false),
('lp003', 'u007', 'Toby',   'perro', 'Beagle',     'Tricolor',  'mediano', '5 años', 'Perro con collar azul, responde a su nombre. Muy amigable.',         'lost',  'Condesa, CDMX',         19.4115, -99.1734, '555-3333', 'usuario@michicondrias.com',  'active', true),
('lp004', 'u006', 'Flores', 'gato',  'Mestizo',    'Atigrada',  'pequeño', '1 año',  'Gatita atigrada rescatada de caja de cartón. Necesita hogar.',       'found', 'Narvarte, CDMX',        19.4000, -99.1600, '555-4444', 'refugio@michicondrias.com',  'active', false),
('lp005', 'u005', 'Duque',  'perro', 'Dobermann',  'Negro/Café','grande',  '4 años', 'Dobermann extraviado tras sismo, tiene microchip. Muy dócil.',       'lost',  'Iztapalapa, CDMX',      19.3650, -99.0850, '555-5555', 'cuidador@michicondrias.com', 'active', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO boosted_alerts (id, lost_pet_report_id, extra_radius_meters, amount_paid) VALUES
('ba001', 'lp001', 5000,  299.00),
('ba002', 'lp005', 10000, 499.00)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 34. LUGARES PET-FRIENDLY
-- ══════════════════════════════════════════════════════
INSERT INTO petfriendly_places (id, added_by, name, category, address, city, description, latitude, longitude, phone, rating, pet_sizes_allowed, has_water_bowls, has_pet_menu) VALUES
('pf001', 'u009', 'El Michi Café',       'Cafetería', 'Calle Durango 200, Roma Norte',   'CDMX', 'Cafetería pet-friendly con menú para mascotas. Terraza amplia.',   19.4195, -99.1620, '555-4444', 5, 'todos', 'sí', 'sí'),
('pf002', 'u007', 'Parque Hundido',      'Parque',    'Av. México-Xochimilco',           'CDMX', 'Parque amplio ideal para pasear mascotas. Zona canina exclusiva.',  19.3629, -99.1554, null,       4, 'todos', 'sí', 'no'),
('pf003', 'u009', 'Woof Bar & Grill',    'Restaurante','Presidente Masaryk 190, Polanco', 'CDMX', 'Restaurante de cocina mexicana con área canina y bebederos.',        19.4310, -99.1930, '555-6666', 4, 'todos', 'sí', 'sí'),
('pf004', 'u007', 'Parque de los Venados','Parque',   'Av. Insurgentes Sur',             'CDMX', 'Gran parque con zonas verdes y áreas para correr sin correa.',      19.3750, -99.1700, null,       5, 'todos', 'sí', 'no'),
('pf005', 'u009', 'Pet Hotel Boutique',  'Hotel',     'Insurgentes Sur 1456, Del Valle', 'CDMX', 'Hotel de lujo para mascotas con spa incluido.',                     19.3890, -99.1750, '555-7777', 5, 'todos', 'sí', 'sí')
ON CONFLICT (id) DO NOTHING;

-- Pet-friendly venues (tabla diferente, más avanzada)
INSERT INTO pet_friendly_venues (id, owner_id, name, address, amenities, discount_coupon, discount_description) VALUES
('pfv001', 'u009', 'El Michi Café', 'Calle Durango 200, Roma Norte', '{"terraza": true, "bebederos": true, "menu_mascotas": true}', 'MICHI10', '10% de descuento en consumo mínimo de $200'),
('pfv002', 'u009', 'Woof Bar',      'Masaryk 190, Polanco',          '{"bebederos": true, "zona_canina": true}',                    'WOOF15', '15% en la cuenta presentando este cupón')
ON CONFLICT (id) DO NOTHING;

INSERT INTO venue_reviews (id, client_id, venue_id, rating, review_text) VALUES
('vr001', 'u007', 'pfv001', 5, 'Ambiente increíble, Max se sintió muy bienvenido. El menú para perros es original.'),
('vr002', 'u004', 'pfv002', 4, 'Muy buena vibra, aunque estuvo algo lleno el fin de semana.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO claimed_coupons (id, client_id, venue_id, coupon_code, status) VALUES
('cc001', 'u007', 'pfv001', 'MICHI10', 'redeemed'),
('cc002', 'u004', 'pfv002', 'WOOF15',  'active')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 35. CAMPAÑAS DE PATROCINADORES
-- ══════════════════════════════════════════════════════
INSERT INTO sponsor_campaigns (id, sponsor_id, title, banner_url, target_link, budget_limit, spent, active) VALUES
('sc001', 'u010', 'Campaña Adopción Responsable', 'https://cdn.michicondrias.com/banners/adopcion.jpg', 'https://michicondrias.com/adopcion', 5000.00, 1250.00, true),
('sc002', 'u010', 'Vacunación Gratuita PETA',      'https://cdn.michicondrias.com/banners/vacuna.jpg',   'https://michicondrias.com/veterinario',2500.00,  800.00, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO campaign_stats (id, campaign_id, views_count, clicks_count) VALUES
('cst001', 'sc001', 3450, 187),
('cst002', 'sc002', 1890,  94)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 36. SEGUROS DE MASCOTAS
-- ══════════════════════════════════════════════════════
INSERT INTO insurance_plans (id, insurer_id, name, description, coverage_limit, base_premium, min_age, max_age, allowed_species, is_active) VALUES
('ip001', 'u010', 'Plan Básico Perro',   'Cobertura accidentes y urgencias',                  20000.00, 299.00, 2,  10, ARRAY['perro'],         true),
('ip002', 'u010', 'Plan Plus Gato',      'Cobertura médica completa + cirugías',               35000.00, 399.00, 2,  12, ARRAY['gato'],          true),
('ip003', 'u010', 'Plan Familiar',       'Hasta 3 mascotas, perro o gato',                    60000.00, 599.00, 2,  10, ARRAY['perro', 'gato'], true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pet_insurance_policies (id, pet_id, insurer_id, policy_number, coverage_details, start_date, end_date, monthly_premium, status) VALUES
('pip001', 'p001', 'u010', 'POL-2024-001', 'Accidentes, urgencias, cirugías hasta $20,000 MXN', '2024-01-01', '2025-01-01', 299.00, 'active'),
('pip002', 'p002', 'u010', 'POL-2024-002', 'Cobertura médica completa, cirugías + hospitalización', '2024-03-01', '2025-03-01', 399.00, 'active'),
('pip003', 'p004', 'u010', 'POL-2024-003', 'Plan familiar: Bella + futura mascota', '2024-06-01', '2025-06-01', 599.00, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO insurance_claims (id, policy_id, amount_claimed, reason, status) VALUES
('ic001', 'pip001', 1800.00, 'Urgencia veterinaria: laceración pata - sutura y antibióticos', 'approved'),
('ic002', 'pip002',  850.00, 'Consulta especialista + exámenes de laboratorio',               'pending')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 37. SERVICIOS FUNERARIOS
-- ══════════════════════════════════════════════════════
INSERT INTO funerary_services (id, funerary_id, name, description, price, cremation_type, urn_included, is_active) VALUES
('fs001', 'u012', 'Cremación Individual',  'Cremación privada con entrega de cenizas en urna',             3500.00, 'individual',  true,  true),
('fs002', 'u012', 'Cremación Colectiva',   'Cremación compartida, cenizas dispersadas en jardín de paz',  1200.00, 'collective',  false, true),
('fs003', 'u012', 'Servicio de Velación',  'Sala de velación con flores y música 4 horas',                 2500.00, 'no_cremation',false, true),
('fs004', 'u012', 'Huella de Arcilla',      'Impresión de la huella de tu mascota en arcilla fina',         450.00, 'no_cremation',false, true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 38. ÓRDENES Y E-COMMERCE
-- ══════════════════════════════════════════════════════
INSERT INTO orders (id, user_id, total_amount, status, shipping_address) VALUES
('ord001', 'u007', 1148.00, 'delivered', 'Av. Ámsterdam 50, Col. Condesa, CDMX'),
('ord002', 'u004', 1780.00, 'shipped',   'Homero 123, Polanco, CDMX'),
('ord003', 'u005',  538.00, 'pending',   'Miguel Ángel de Quevedo 100, Coyoacán, CDMX'),
('ord004', 'u006',  298.00, 'processing','Calzada de Tlalpan 500, Tlalpan, CDMX')
ON CONFLICT (id) DO NOTHING;

-- NOTA: quantity=0 es inválido semánticamente; se corrigió a cantidades reales
INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase) VALUES
('oi001', 'ord001', 'pr001', 1,  899.00),
('oi002', 'ord001', 'pr008', 1,  149.00),
('oi003', 'ord001', 'pr005', 1,  189.00),
('oi004', 'ord002', 'pr004', 1, 1599.00),
('oi005', 'ord002', 'pr003', 1,  249.00),
('oi006', 'ord003', 'pr002', 1,  549.00),
('oi007', 'ord003', 'pr006', 1,  349.00),
('oi008', 'ord004', 'pr009', 1,  299.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_reviews (id, product_id, user_id, rating, comment) VALUES
('pvr001', 'pr001', 'u007', 5, 'Max lo ama, llegó rápido y bien sellado. Muy buena calidad.'),
('pvr002', 'pr003', 'u007', 4, 'Pelota muy resistente, ya aguantó 2 semanas con Rocky.'),
('pvr003', 'pr004', 'u004', 5, 'Bella duerme increíble desde que llegó la cama. Vale cada peso.'),
('pvr004', 'pr002', 'u005', 4, 'Buena calidad, pero el empaque llegó un poco golpeado.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 39. DONACIONES
-- ══════════════════════════════════════════════════════
INSERT INTO donations (id, user_id, amount, currency, message, status) VALUES
('d001', 'u007', 100.00, 'MXN', 'Para los michis del refugio, ¡ánimo!', 'completed'),
('d002', 'u004', 250.00, 'MXN', 'Gran causa, sigan adelante.',          'completed'),
('d003', 'u006', 500.00, 'MXN', 'Donación mensual del refugio.',        'completed'),
('d004', 'u010', 1000.00,'MXN', 'Aportación de patrocinador PETA.',     'completed'),
('d005', 'u011', 150.00, 'MXN', 'Para ayudar a más hogares temporales.','completed')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════
-- 40. NOTIFICACIONES
-- ══════════════════════════════════════════════════════
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
('not001', 'u007', 'Cita confirmada',       'Tu cita para Max el día 18 Jun a las 10:00 está confirmada.', 'appointment', false),
('not002', 'u007', 'Vacuna próxima a vencer','La vacuna antirrábica de Bella vence en 2 meses.',           'health',      false),
('not003', 'u007', 'Pedido enviado',         'Tu orden #ord002 ha sido enviada y llega en 2-3 días.',       'order',       true),
('not004', 'u004', 'Paseo confirmado',       'Juan el Paseador confirmó el paseo del 18 Jun a las 07:30.', 'service',     false),
('not005', 'u006', 'Nueva solicitud adopción','Un interesado quiere adoptar a Nala. Revisa tu bandeja.',    'adoption',    false),
('not006', 'u002', 'Nueva reseña',           'Recibiste una reseña de 5 estrellas en el Hospital.',         'review',      false)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- RESUMEN FINAL DEL SEED
-- ═══════════════════════════════════════════════════════════════════
-- roles:                 12  (UUIDs reales de DB)
-- users:                 12
-- categories:             5
-- subcategories:          8
-- global_settings:        5
-- clinics:                3
-- clinic_services:        8
-- clinic_schedules:      16
-- veterinarians:          3
-- pets:                   7
-- products:              10
-- appointments:           7
-- appointment_reminders:  4
-- medical_records:        4
-- medical_records_extended:4
-- clinic_reviews:         4
-- inventory_items:        6
-- clinic_alerts:          3
-- clinic_metrics:         3
-- prescriptions:          4
-- medication_reminders:   4
-- consultations:          3
-- lab_test_catalog:       5
-- lab_orders:             3
-- lab_results:            5
-- lab_tests:              3
-- surgeries:              2
-- vaccines:               7
-- walkers:                2
-- walk_requests:          4
-- walk_reviews:           2
-- sitters:                2
-- sit_requests:           3
-- sit_reviews:            1
-- grooming_services:      4
-- grooming_files:         3
-- grooming_appointments:  3
-- training_programs:      3
-- training_enrollments:   3
-- pet_training_goals:     5
-- driver_profiles:        2
-- pet_rides:              2
-- adoption_listings:      4
-- adoption_requests:      2
-- adoption_forms:         2
-- adoption_contracts:     1
-- lost_pet_reports:       5
-- boosted_alerts:         2
-- petfriendly_places:     5
-- pet_friendly_venues:    2
-- venue_reviews:          2
-- claimed_coupons:        2
-- sponsor_campaigns:      2
-- campaign_stats:         2
-- insurance_plans:        3
-- pet_insurance_policies: 3
-- insurance_claims:       2
-- funerary_services:      4
-- orders:                 4
-- order_items:            8
-- product_reviews:        4
-- donations:              5
-- notifications:          6
-- ═══════════════════════════════════════════════════════════════════
-- TABLAS VACÍAS INTENCIONALMENTE (no requieren seed o dependen de
-- flujos en vivo): alembic_version_*, schedule_exceptions, lost_pets,
-- pet_deaths, pet_memorial_posts, funerary_bookings, lab_appointments,
-- pet_insurance_policies (ya con datos), adoption_contracts (con datos)
-- ═══════════════════════════════════════════════════════════════════
-- CREDENCIALES (todas: michicondrias123):
--   admin@michicondrias.com          → admin
--   vet@michicondrias.com            → veterinario
--   vendedor@michicondrias.com       → vendedor
--   paseador@michicondrias.com       → paseador
--   cuidador@michicondrias.com       → cuidador
--   refugio@michicondrias.com        → refugio
--   usuario@michicondrias.com        → consumidor
--   clinica@michicondrias.com        → clinica
--   establecimiento@michicondrias.com→ establecimiento
--   patrocinador@michicondrias.com   → patrocinador
--   hogar@michicondrias.com          → hogar_temporal
--   funeraria@michicondrias.com      → funeraria
-- ═══════════════════════════════════════════════════════════════════
