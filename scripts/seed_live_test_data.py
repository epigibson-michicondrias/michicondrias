#!/usr/bin/env python3
"""
Seed Live Test Data for Developer Accounts in MICHIcondrias
Cleans transactional tables and seeds all tables with coherent relationships.
"""
from sqlalchemy import create_engine, text
from datetime import datetime, date, time, timedelta
import uuid
import json

DATABASE_URL = "postgresql://postgres.zaegmfufrzjmjiemrvvp:Michicondrias201094*@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
engine = create_engine(DATABASE_URL)

# 1. Accounts & Pets Mapping
DEVELOPERS = [
    {
        "id": "a9105cb4-06d0-4628-81b2-9b6e6a863283",
        "email": "hackminor@live.com.mx",
        "name": "Ricardo Minor",
        "pets": [
            {"id": "cd854a88-7fab-44d5-85b2-bf52cb4b8dd0", "name": "Milanesillo", "species": "perro", "breed": "Mestizo", "age_months": 24, "size": "mediano", "gender": "macho"},
            {"id": "69056be7-e04a-47d7-9254-996ccaa1c32e", "name": "Pyke", "species": "perro", "breed": "Border Collie", "age_months": 18, "size": "grande", "gender": "macho"},
            {"id": "7d8f458b-72e8-43e5-b377-c6fe260937fc", "name": "Bdbej", "species": "gato", "breed": "Mestizo", "age_months": 12, "size": "pequeño", "gender": "hembra"}
        ]
    },
    {
        "id": "bc4cdc0f-48d5-4da5-a33a-ac687b8fa411",
        "email": "michicondriasapp@gmail.com",
        "name": "Ricky Minor",
        "pets": [
            {"id": "7f4c3709-be71-408a-9483-2224c5cb66bc", "name": "Yuki", "species": "gato", "breed": "Angora", "age_months": 36, "size": "pequeño", "gender": "hembra"}
        ]
    },
    {
        "id": "704f96f6-2811-4b00-b351-8e33167a35f8",
        "email": "yurygarcia1897@gmail.com",
        "name": "Yuri Solis",
        "pets": [
            {"id": "523e1d67-25d8-476e-82ef-e75f6f444529", "name": "Nala", "species": "gato", "breed": "Persa", "age_months": 30, "size": "pequeño", "gender": "hembra"}
        ]
    }
]

def run_seed():
    print("Connecting to Supabase...")
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # 1. Truncate all transactional tables in cascade
            print("Cleaning transactional tables (Cascading TRUNCATE)...")
            conn.execute(text("""
                TRUNCATE TABLE 
                  adoption_contracts,
                  adoption_requests,
                  adoption_forms,
                  adoption_listings,
                  appointment_reminders,
                  appointments,
                  boosted_alerts,
                  campaign_stats,
                  claimed_coupons,
                  clinic_alerts,
                  clinic_metrics,
                  clinic_reviews,
                  consultations,
                  donations,
                  funerary_bookings,
                  grooming_appointments,
                  grooming_files,
                  insurance_claims,
                  lab_appointments,
                  lab_orders,
                  lab_results,
                  lab_tests,
                  lost_pet_reports,
                  lost_pets,
                  medical_records,
                  medical_records_extended,
                  medication_reminders,
                  notifications,
                  order_items,
                  orders,
                  pet_deaths,
                  pet_insurance_policies,
                  pet_memorial_posts,
                  pet_rides,
                  pet_training_goals,
                  product_reviews,
                  sit_requests,
                  sit_reviews,
                  sponsor_campaigns,
                  surgeries,
                  training_enrollments,
                  venue_reviews,
                  walk_requests,
                  walk_reviews
                CASCADE;
            """))

            # 2. Ensure developer users are present and roles are correct
            print("Ensuring developer user profiles exist and roles are set to 'consumidor'...")
            role_consumidor = "d981e55c-efb2-4495-b9d4-e0fd7821d937"
            for dev in DEVELOPERS:
                conn.execute(
                    text("""
                        UPDATE users 
                        SET role_id = :role_id, full_name = :name
                        WHERE id = :uid
                    """),
                    {"uid": dev["id"], "name": dev["name"], "role_id": role_consumidor}
                )


            # 3. Ensure developer pets exist in the 'pets' table
            print("Ensuring developer pets exist...")
            for dev in DEVELOPERS:
                for pet in dev["pets"]:
                    conn.execute(text("""
                        INSERT INTO pets (id, owner_id, name, species, breed, age_months, size, is_active, gender, is_vaccinated, is_sterilized, is_dewormed, weight_kg, temperament, energy_level)
                        VALUES (:id, :owner_id, :name, :species, :breed, :age_months, :size, true, :gender, true, true, true, :weight, 'Cariñoso y sociable', 'media')
                        ON CONFLICT (id) DO UPDATE SET owner_id = :owner_id, name = :name, species = :species, breed = :breed
                    """), {
                        "id": pet["id"],
                        "owner_id": dev["id"],
                        "name": pet["name"],
                        "species": pet["species"],
                        "breed": pet["breed"],
                        "age_months": pet["age_months"],
                        "size": pet["size"],
                        "gender": pet["gender"],
                        "weight": 12.0 if pet["species"] == "perro" else 4.5
                    })

            # 4. Insert clinical, carnet, lab, training, ride, insurance, and funerary data per pet
            for dev in DEVELOPERS:
                user_id = dev["id"]
                for pet in dev["pets"]:
                    pet_id = pet["id"]
                    pet_name = pet["name"]
                    print(f"Seeding relational data for pet: {pet_name}...")

                    # Appointments & Consultations
                    conn.execute(text("""
                        INSERT INTO appointments (id, clinic_id, service_id, pet_id, user_id, vet_id, date, start_time, end_time, status, notes)
                        VALUES (:apt_id, 'c001', 'cs001', :pet_id, :user_id, 'v001', :date, '10:00:00', '10:30:00', 'completed', 'Chequeo general preventivo')
                        ON CONFLICT (id) DO NOTHING
                    """), {"apt_id": f"apt-{pet_name}-past", "pet_id": pet_id, "user_id": user_id, "date": date.today() - timedelta(days=10)})

                    conn.execute(text("""
                        INSERT INTO appointments (id, clinic_id, service_id, pet_id, user_id, vet_id, date, start_time, end_time, status, notes)
                        VALUES (:apt_id, 'c001', 'cs002', :pet_id, :user_id, 'v001', :date, '16:00:00', '16:30:00', 'confirmed', 'Refuerzo de vacuna anual')
                        ON CONFLICT (id) DO NOTHING
                    """), {"apt_id": f"apt-{pet_name}-future", "pet_id": pet_id, "user_id": user_id, "date": date.today() + timedelta(days=5)})

                    # Video Consultations
                    conn.execute(text("""
                        INSERT INTO consultations (id, clinic_id, vet_id, user_id, pet_id, scheduled_at, status, room_url, notes)
                        VALUES (:con_id, 'c001', 'v001', :user_id, :pet_id, :sch_at, 'completed', 'https://meet.michicondrias.com/room-dev-1', 'Teleconsulta para seguimiento de alergias alimentarias.')
                        ON CONFLICT (id) DO NOTHING
                    """), {
                        "con_id": f"con-{pet_name}-1",
                        "user_id": user_id,
                        "pet_id": pet_id,
                        "sch_at": datetime.now() - timedelta(days=5)
                    })

                    # Medical Records
                    conn.execute(text("""
                        INSERT INTO medical_records (id, pet_id, clinic_id, veterinarian_id, appointment_id, reason_for_visit, diagnosis, treatment, weight_kg, temperature_c, notes)
                        VALUES (:mr_id, :pet_id, 'c001', 'v001', :apt_id, 'Chequeo preventivo', 'Estado físico excelente, hidratado y activo.', 'Ninguno requerido', 11.5, 38.6, 'Mantener alimentación actual')
                        ON CONFLICT (id) DO NOTHING
                    """), {"mr_id": f"mr-{pet_name}-1", "pet_id": pet_id, "apt_id": f"apt-{pet_name}-past"})

                    conn.execute(text("""
                        INSERT INTO medical_records_extended (original_record_id, clinic_id, status, alert_level, follow_up_required, is_critical, severity_score, prognosis, requires_hospitalization, treatment_cost_estimate, payment_status)
                        VALUES (:mr_id, 'c001', 'stable', 'green', false, false, 1, 'good', false, 450.00, 'paid')
                    """), {"mr_id": f"mr-{pet_name}-1"})



                    # Vaccines
                    conn.execute(text("""
                        INSERT INTO vaccines (id, pet_id, name, date_administered, next_due_date, administered_by_vet_id, batch_number, notes)
                        VALUES (:vac_id, :pet_id, 'Antirrábica', :date_adm, :date_next, 'v001', 'BATCH-8823', 'Sin efectos secundarios inmediatos')
                        ON CONFLICT (id) DO NOTHING
                    """), {"vac_id": f"vac-{pet_name}-1", "pet_id": pet_id, "date_adm": date.today() - timedelta(days=120), "date_next": date.today() + timedelta(days=245)})

                    conn.execute(text("""
                        INSERT INTO vaccines (id, pet_id, name, date_administered, next_due_date, administered_by_vet_id, batch_number, notes)
                        VALUES (:vac_id, :pet_id, 'Quíntuple / Triple Felina', :date_adm, :date_next, 'v001', 'BATCH-9912', 'Refuerzo regular')
                        ON CONFLICT (id) DO NOTHING
                    """), {"vac_id": f"vac-{pet_name}-2", "pet_id": pet_id, "date_adm": date.today() - timedelta(days=60), "date_next": date.today() + timedelta(days=305)})

                    # Prescriptions & Reminders
                    conn.execute(text("""
                        INSERT INTO prescriptions (id, medical_record_id, medication_name, dosage, frequency_hours, duration_days, instructions)
                        VALUES (:pr_id, :mr_id, 'Antiparasitario Simparica / Revolution', '1 tableta / pipeta', 720, 1, 'Administrar vía oral / tópica por la mañana con comida')
                        ON CONFLICT (id) DO NOTHING
                    """), {"pr_id": f"pr-{pet_name}-1", "mr_id": f"mr-{pet_name}-1"})

                    conn.execute(text("""
                        INSERT INTO medication_reminders (id, prescription_id, pet_id, remind_at, sent)
                        VALUES (:rem_id, :pr_id, :pet_id, :rem_at, false)
                        ON CONFLICT (id) DO NOTHING
                    """), {"rem_id": f"rem-{pet_name}-1", "pr_id": f"pr-{pet_name}-1", "pet_id": pet_id, "rem_at": datetime.now() + timedelta(days=1)})

                    # Clinic Alerts
                    conn.execute(text("""
                        INSERT INTO clinic_alerts (clinic_id, type, title, message, priority, icon, color, is_read, patient_id)
                        VALUES ('c001', 'followup', :title, :msg, 'medium', 'bell', '#4f46e5', false, :pet_id)
                    """), {
                        "title": f"Chequeo Post-Consulta: {pet_name}",
                        "msg": f"Favor de reportar si {pet_name} muestra mejoría con la dosis administrada.",
                        "pet_id": pet_id
                    })


                    # Lab Orders & Results
                    conn.execute(text("""
                        INSERT INTO lab_orders (id, pet_id, requesting_vet_id, lab_id, test_names, status)
                        VALUES (:order_id, :pet_id, 'u002', 'u008', ARRAY['Biometría Hemática'], 'completed')
                        ON CONFLICT (id) DO NOTHING
                    """), {"order_id": f"lab-ord-{pet_name}", "pet_id": pet_id})

                    conn.execute(text("""
                        INSERT INTO lab_results (id, order_id, parameter_name, measured_value, reference_range, unit, is_anomaly)
                        VALUES (:res_id, :order_id, 'Glóbulos Blancos (WBC)', 7.8, '6.0 - 17.0', '10^3/uL', false)
                        ON CONFLICT (id) DO NOTHING
                    """), {"res_id": f"lab-res-{pet_name}-wbc", "order_id": f"lab-ord-{pet_name}"})

                    conn.execute(text("""
                        INSERT INTO lab_results (id, order_id, parameter_name, measured_value, reference_range, unit, is_anomaly)
                        VALUES (:res_id, :order_id, 'Plaquetas (PLT)', 190.0, '200 - 500', 'K/uL', true)
                        ON CONFLICT (id) DO NOTHING
                    """), {"res_id": f"lab-res-{pet_name}-plt", "order_id": f"lab-ord-{pet_name}"})

                    conn.execute(text("""
                        INSERT INTO lab_appointments (id, client_id, pet_id, lab_id, test_id, scheduled_date, scheduled_time, status, notes)
                        VALUES (:app_id, :user_id, :pet_id, 'u008', 'ltc001', :date, '08:30:00', 'confirmed', 'Requiere 8 horas de ayuno para el estudio')
                        ON CONFLICT (id) DO NOTHING
                    """), {"app_id": f"lab-apt-{pet_name}", "user_id": user_id, "pet_id": pet_id, "date": date.today() + timedelta(days=3)})

                    # Surgeries
                    surg_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"surgery-{pet_id}"))
                    conn.execute(text("""
                        INSERT INTO surgeries (id, clinic_id, patient_id, surgery_type, surgery_name, description, scheduled_date, estimated_duration, surgeon_id, operating_room, anesthesia_type, status, estimated_cost, is_paid)
                        VALUES (:id, 'c001', :pet_id, 'Profilaxis Dental', 'Limpieza dental ultrasónica', 'Limpieza profunda y remoción de sarro con ultrasonido', :date, 45, 'v001', 'Sala Dental B', 'General Inhalada', 'completed', 1800.00, true)
                        ON CONFLICT (id) DO NOTHING
                    """), {"id": surg_id, "pet_id": pet_id, "date": datetime.now() - timedelta(days=90)})


                    # Grooming (Estética)
                    conn.execute(text("""
                        INSERT INTO grooming_appointments (id, groomer_id, pet_id, date, time, service_type, status)
                        VALUES (:app_id, 'u005', :pet_id, :date, '11:00', 'Baño y Cepillado', 'completed')
                        ON CONFLICT (id) DO NOTHING
                    """), {"app_id": f"gr-apt-{pet_name}-past", "pet_id": pet_id, "date": date.today() - timedelta(days=8)})

                    conn.execute(text("""
                        INSERT INTO grooming_appointments (id, groomer_id, pet_id, date, time, service_type, status)
                        VALUES (:app_id, 'u005', :pet_id, :date, '13:00', 'Corte de Pelo', 'scheduled')
                        ON CONFLICT (id) DO NOTHING
                    """), {"app_id": f"gr-apt-{pet_name}-future", "pet_id": pet_id, "date": date.today() + timedelta(days=4)})

                    conn.execute(text("""
                        INSERT INTO grooming_files (id, pet_id, hair_type, preferred_shampoo, behavior_notes, allergies_detected, last_service_date)
                        VALUES (:file_id, :pet_id, 'Pelo normal', 'Shampoo hipoalergénico de avena', 'Tranquilo, le desagrada un poco la secadora en las orejas.', 'Sensibilidad a fragancias cítricas', :last_date)
                        ON CONFLICT (id) DO NOTHING
                    """), {"file_id": f"gr-file-{pet_name}", "pet_id": pet_id, "last_date": date.today() - timedelta(days=8)})

                    # Training (Adiestramiento)
                    conn.execute(text("""
                        INSERT INTO training_enrollments (id, client_id, pet_id, program_id, start_date, status, total_paid)
                        VALUES (:enr_id, :user_id, :pet_id, 'tp001', :start_date, 'active', 1500.00)
                        ON CONFLICT (id) DO NOTHING
                    """), {"enr_id": f"tr-enr-{pet_name}", "user_id": user_id, "pet_id": pet_id, "start_date": date.today() - timedelta(days=15)})

                    conn.execute(text("""
                        INSERT INTO pet_training_goals (id, pet_id, program_id, goal_name, status, progress_notes)
                        VALUES (:g_id, :pet_id, 'tp001', 'Sentarse (Sit)', 'completed', 'Obedece en menos de 2 segundos. Buen progreso.')
                        ON CONFLICT (id) DO NOTHING
                    """), {"g_id": f"tr-goal-{pet_name}-1", "pet_id": pet_id})

                    conn.execute(text("""
                        INSERT INTO pet_training_goals (id, pet_id, program_id, goal_name, status, progress_notes)
                        VALUES (:g_id, :pet_id, 'tp001', 'Quieto (Stay)', 'in_progress', 'Mantiene la postura por 15 segundos con distractores leves.')
                        ON CONFLICT (id) DO NOTHING
                    """), {"g_id": f"tr-goal-{pet_name}-2", "pet_id": pet_id})

                    # Rides (Transporte)
                    conn.execute(text("""
                        INSERT INTO pet_rides (id, driver_id, pet_id, origin_address, destination_address, status, price, requires_carrier)
                        VALUES (:ride_id, 'u004', :pet_id, 'Calle Falsa 123, CDMX', 'Hospital Veterinario Michicondrias', 'completed', 210.00, true)
                        ON CONFLICT (id) DO NOTHING
                    """), {"ride_id": f"ride-{pet_name}-1", "pet_id": pet_id})

                    # Insurance (Seguros)
                    conn.execute(text("""
                        INSERT INTO pet_insurance_policies (id, pet_id, insurer_id, policy_number, coverage_details, start_date, end_date, monthly_premium, status)
                        VALUES (:pol_id, :pet_id, 'u010', :pol_num, 'Cobertura del 80% en consultas y hospitalizaciones por accidente o enfermedad.', :start, :end, 350.00, 'active')
                        ON CONFLICT (id) DO NOTHING
                    """), {
                        "pol_id": f"pol-{pet_name}",
                        "pet_id": pet_id,
                        "pol_num": f"POL-MX-{pet_name.upper()}-01",
                        "start": date.today() - timedelta(days=100),
                        "end": date.today() + timedelta(days=265)
                    })

                    conn.execute(text("""
                        INSERT INTO insurance_claims (id, policy_id, amount_claimed, reason, status)
                        VALUES (:claim_id, :pol_id, 1440.00, 'Reembolso por consulta de especialidad y rayos X', 'approved')
                        ON CONFLICT (id) DO NOTHING
                    """), {"claim_id": f"claim-{pet_name}-1", "pol_id": f"pol-{pet_name}"})

                    # Funerary Bookings
                    conn.execute(text("""
                        INSERT INTO funerary_bookings (id, client_id, pet_id, service_id, scheduled_date, status, notes)
                        VALUES (:fb_id, :user_id, :pet_id, 'fs001', :date, 'confirmed', 'Reserva de previsión plan individual')
                        ON CONFLICT (id) DO NOTHING
                    """), {"fb_id": f"fb-{pet_name}", "user_id": user_id, "pet_id": pet_id, "date": date.today() + timedelta(days=200)})

            # 5. SPECIAL DECEASED PET & MEMORIAL
            print("Creating deceased pet Toby and memorial posts...")
            conn.execute(text("""
                INSERT INTO pets (id, owner_id, name, species, breed, age_months, size, is_active, gender, is_vaccinated, is_sterilized, is_dewormed, weight_kg, temperament, energy_level)
                VALUES ('pet-dec-01', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'Toby', 'perro', 'Beagle', 108, 'mediano', false, 'macho', true, true, true, 13.5, 'Cariñoso y dormilón', 'baja')
                ON CONFLICT (id) DO NOTHING
            """))

            conn.execute(text("""
                INSERT INTO pet_deaths (id, pet_id, funerary_id, date_of_death, cause_of_death, cremation_type, urn_model, certificate_url, notes)
                VALUES ('death-toby-01', 'pet-dec-01', 'u012', :date, 'Paro cardiorrespiratorio por edad avanzada', 'individual', 'Urna de Roble Tallado', 'https://cdn.michicondrias.com/certificates/toby_death.pdf', 'Fue el mejor perro del mundo.')
                ON CONFLICT (id) DO NOTHING
            """), {"date": date.today() - timedelta(days=25)})

            conn.execute(text("""
                INSERT INTO pet_memorial_posts (id, pet_id, user_id, message, photo_url)
                VALUES ('post-toby-01', 'pet-dec-01', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'Toby, nos diste 9 años de amor incondicional. Correrás por siempre en nuestros recuerdos.', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1')
                ON CONFLICT (id) DO NOTHING
            """))

            conn.execute(text("""
                INSERT INTO pet_memorial_posts (id, pet_id, user_id, message, photo_url)
                VALUES ('post-toby-02', 'pet-dec-01', 'u002', 'Un abrazo fuerte a la familia. Toby era un paciente genial.', null)
                ON CONFLICT (id) DO NOTHING
            """))

            # 6. ADOPTIONS
            print("Seeding adoption listings, forms, requests, and contracts...")
            # Create listed pets in pets table first (owned by Refugio u006)
            conn.execute(text("""
                INSERT INTO pets (id, owner_id, name, species, breed, age_months, size, is_active, gender, is_vaccinated, is_sterilized, is_dewormed, weight_kg, temperament, energy_level)
                VALUES ('pet-adopt-01', 'u006', 'Max', 'perro', 'Golden Retriever', 4, 'mediano', false, 'macho', true, false, true, 8.5, 'Juguetón, enérgico y muy inteligente', 'alta')
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO pets (id, owner_id, name, species, breed, age_months, size, is_active, gender, is_vaccinated, is_sterilized, is_dewormed, weight_kg, temperament, energy_level)
                VALUES ('pet-adopt-02', 'u006', 'Luna', 'gato', 'Siamés', 6, 'pequeño', false, 'hembra', true, true, true, 2.8, 'Tranquila, silenciosa y un poco tímida', 'baja')
                ON CONFLICT (id) DO NOTHING
            """))

            conn.execute(text("""
                INSERT INTO adoption_listings (id, name, species, breed, age_months, size, description, photo_url, published_by, is_approved, status, is_vaccinated, is_sterilized, is_dewormed, temperament, energy_level, social_cats, social_dogs, social_children, weight_kg, gender, location, is_emergency, gallery)
                VALUES ('adopt-1', 'Max', 'perro', 'Golden Retriever', 4, 'mediano', 'Precioso cachorro de Golden Retriever listo para un hogar amoroso.', 'https://images.unsplash.com/photo-1552053831-71594a27632d', 'u006', true, 'abierto', true, false, true, 'Juguetón, alegre y muy amigable.', 'alta', true, true, true, 8.5, 'macho', 'CDMX, México', false, '[]'::json)
                ON CONFLICT (id) DO NOTHING
            """))

            conn.execute(text("""
                INSERT INTO adoption_listings (id, name, species, breed, age_months, size, description, photo_url, published_by, is_approved, status, is_vaccinated, is_sterilized, is_dewormed, temperament, energy_level, social_cats, social_dogs, social_children, weight_kg, gender, location, is_emergency, gallery)
                VALUES ('adopt-2', 'Luna', 'gato', 'Siamés', 6, 'pequeño', 'Gatita siamesa de ojos azules muy educada y juguetona.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', 'u006', true, 'abierto', true, true, true, 'Independiente pero cariñosa.', 'media', true, false, true, 2.8, 'hembra', 'EdoMex, México', false, '[]'::json)
                ON CONFLICT (id) DO NOTHING
            """))

            # Compatibility Form filled by hackminor
            conn.execute(text("""
                INSERT INTO adoption_forms (id, pet_id, applicant_id, has_other_pets, has_yard, hours_left_alone, experience_level, compatibility_score, status)
                VALUES ('form-hackminor-1', 'pet-adopt-01', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', true, true, 4, 'intermedio', 95, 'approved')
                ON CONFLICT (id) DO NOTHING
            """))

            # Adoption Request
            conn.execute(text("""
                INSERT INTO adoption_requests (id, user_id, listing_id, status, applicant_name, house_type, has_yard, own_or_rent, landlord_permission, other_pets, has_children, children_ages, hours_alone, financial_commitment, reason, previous_experience)
                VALUES ('req-hackminor-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'adopt-1', 'pending', 'Ricardo Minor', 'casa', true, 'own', true, 'Sí, dos perros pequeños', false, '', 4, true, 'Buscamos un compañero activo para nuestra familia y mascotas.', 'He tenido perros Golden Retriever antes.')
                ON CONFLICT (id) DO NOTHING
            """))

            # Contract
            conn.execute(text("""
                INSERT INTO adoption_contracts (id, form_id, refuge_id, terms, signed_contract_url)
                VALUES ('contract-hackminor-1', 'form-hackminor-1', 'u006', 'El adoptante se compromete a brindar alimento, vacunas, cariño y un espacio digno.', 'https://cdn.michicondrias.com/contracts/contract_hackminor_1.pdf')
                ON CONFLICT (id) DO NOTHING
            """))

            # 7. ECOMMERCE
            print("Seeding ecommerce orders, order items, and reviews...")
            # Orders for hackminor
            conn.execute(text("""
                INSERT INTO orders (id, user_id, total_amount, status, shipping_address)
                VALUES ('ord-hackminor-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 1148.00, 'delivered', 'Av. Insurgentes Sur 456, Depto 102, CDMX')
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase)
                VALUES ('item-1', 'ord-hackminor-1', 'pr001', 1, 899.00)
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase)
                VALUES ('item-2', 'ord-hackminor-1', 'pr003', 1, 249.00)
                ON CONFLICT (id) DO NOTHING
            """))

            # Order for michicondriasapp
            conn.execute(text("""
                INSERT INTO orders (id, user_id, total_amount, status, shipping_address)
                VALUES ('ord-michi-1', 'bc4cdc0f-48d5-4da5-a33a-ac687b8fa411', 549.00, 'shipped', 'Calle Roble 89, Col. Del Valle, Monterrey')
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase)
                VALUES ('item-3', 'ord-michi-1', 'pr002', 1, 549.00)
                ON CONFLICT (id) DO NOTHING
            """))

            # Product reviews
            conn.execute(text("""
                INSERT INTO product_reviews (id, product_id, user_id, rating, comment)
                VALUES ('rev-pr1', 'pr001', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 5, 'Excelente alimento. El pelaje de mi perro brilla mucho más desde que lo consume.')
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO product_reviews (id, product_id, user_id, rating, comment)
                VALUES ('rev-pr3', 'pr003', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 4, 'La pelota es resistente y rebota bien, pero a mi perro le tomó unos días interesarse.')
                ON CONFLICT (id) DO NOTHING
            """))

            # 8. SITTERS & WALKERS
            print("Seeding walker and sitter requests and reviews...")
            # Walk requests for Milanesillo
            conn.execute(text("""
                INSERT INTO walk_requests (id, walker_id, client_user_id, pet_id, status, requested_date, requested_time, duration_minutes, pickup_address, notes, total_price)
                VALUES ('walk-req-1', 'wk001', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'cd854a88-7fab-44d5-85b2-bf52cb4b8dd0', 'completed', :req_date, '09:00', 60, 'Calle Falsa 123, CDMX', 'Llevar correa larga y premios.', 150.00)
                ON CONFLICT (id) DO NOTHING
            """), {"req_date": (date.today() - timedelta(days=2)).strftime("%Y-%m-%d")})

            conn.execute(text("""
                INSERT INTO walk_requests (id, walker_id, client_user_id, pet_id, status, requested_date, requested_time, duration_minutes, pickup_address, notes, total_price)
                VALUES ('walk-req-2', 'wk001', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'cd854a88-7fab-44d5-85b2-bf52cb4b8dd0', 'pending', :req_date, '17:00', 45, 'Calle Falsa 123, CDMX', 'Monitorear si se cansa rápido.', 120.00)
                ON CONFLICT (id) DO NOTHING
            """), {"req_date": (date.today() + timedelta(days=2)).strftime("%Y-%m-%d")})

            # Walker review by hackminor
            conn.execute(text("""
                INSERT INTO walk_reviews (id, walk_request_id, reviewer_user_id, walker_id, rating, comment)
                VALUES ('walk-rev-1', 'walk-req-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'wk001', 5, 'Juan es extremadamente puntual y trata excelente a Milanesillo. Altamente recomendado.')
                ON CONFLICT (id) DO NOTHING
            """))

            # Sit request for Yuki
            conn.execute(text("""
                INSERT INTO sit_requests (id, sitter_id, client_user_id, pet_id, status, service_type, start_date, end_date, address, notes, total_price)
                VALUES ('sit-req-1', 'st001', 'bc4cdc0f-48d5-4da5-a33a-ac687b8fa411', '7f4c3709-be71-408a-9483-2224c5cb66bc', 'completed', 'hospedaje', :start, :end, 'Calle Roble 89, Monterrey', 'Yuki come dos veces al día. Cepillar por las noches.', 600.00)
                ON CONFLICT (id) DO NOTHING
            """), {
                "start": (date.today() - timedelta(days=5)).strftime("%Y-%m-%d"),
                "end": (date.today() - timedelta(days=3)).strftime("%Y-%m-%d")
            })

            # Sitter review
            conn.execute(text("""
                INSERT INTO sit_reviews (id, sit_request_id, reviewer_user_id, sitter_id, rating, comment)
                VALUES ('sit-rev-1', 'sit-req-1', 'bc4cdc0f-48d5-4da5-a33a-ac687b8fa411', 'st001', 5, 'María cuidó increíblemente bien a Yuki. Me mandó fotos y reportes constantes. Repetiremos seguro.')
                ON CONFLICT (id) DO NOTHING
            """))


            # 9. SPONSOR CAMPAIGNS
            print("Seeding sponsor campaigns and stats...")
            conn.execute(text("""
                INSERT INTO sponsor_campaigns (id, sponsor_id, title, banner_url, target_link, budget_limit, spent, active)
                VALUES ('camp-1', 'u010', 'Croquetas Purina Pro Plan - 20% Descuento', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119', 'https://purina.com.mx/proplan', 5000.00, 1250.00, true)
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO sponsor_campaigns (id, sponsor_id, title, banner_url, target_link, budget_limit, spent, active)
                VALUES ('camp-2', 'u010', 'Seguros PetMedic - Protege a tu mejor amigo', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', 'https://petmedic.com.mx', 3000.00, 420.00, true)
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO sponsor_campaigns (id, sponsor_id, title, banner_url, target_link, budget_limit, spent, active)
                VALUES ('camp-boost-1', 'u010', 'Boost Alerta: Bdbej Perdido', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1', 'https://michicondrias.com/lost', 500.00, 250.00, true)
                ON CONFLICT (id) DO NOTHING
            """))


            conn.execute(text("""
                INSERT INTO campaign_stats (id, campaign_id, views_count, clicks_count)
                VALUES ('camp-stat-1', 'camp-1', 450, 42)
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO campaign_stats (id, campaign_id, views_count, clicks_count)
                VALUES ('camp-stat-2', 'camp-2', 210, 18)
                ON CONFLICT (id) DO NOTHING
            """))

            # 10. LOST PETS
            print("Seeding lost pets reports...")
            # Lost pet report for Bdbej (completed / resolved)
            conn.execute(text("""
                INSERT INTO lost_pet_reports (id, reporter_id, pet_name, species, breed, color, size, age_approx, description, image_url, report_type, last_seen_location, latitude, longitude, has_tracker, tracker_device_id, contact_phone, contact_email, status, is_resolved)
                VALUES ('lost-rep-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'Bdbej', 'gato', 'Mestizo', 'Blanco con negro', 'pequeño', '1 año', 'Gato tímido, se asusta con ruidos fuertes.', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce', 'lost', 'Colonia Roma Norte, CDMX', 19.415, -99.162, false, null, '5512345678', 'hackminor@live.com.mx', 'active', false)
                ON CONFLICT (id) DO NOTHING
            """))

            # Boosted alert campaign
            conn.execute(text("""
                INSERT INTO boosted_alerts (id, campaign_id, lost_pet_report_id, extra_radius_meters, amount_paid)
                VALUES ('boost-1', 'camp-boost-1', 'lost-rep-1', 1000, 250.00)
                ON CONFLICT (id) DO NOTHING
            """))

            # Populate old lost_pets table for compatibility
            conn.execute(text("""
                INSERT INTO lost_pets (id, user_id, pet_name, species, breed, description, last_seen_location, date_lost, contact_phone, image_url, is_found)
                VALUES ('lost-old-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'Bdbej', 'gato', 'Mestizo', 'Gato tímido extraviado en Roma Norte.', 'Colonia Roma Norte, CDMX', :date_lost, '5512345678', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce', false)
                ON CONFLICT (id) DO NOTHING
            """), {"date_lost": datetime.now() - timedelta(days=3)})

            # 11. PET FRIENDLY VENUES REVIEWS & COUPONS
            print("Seeding venue reviews and claimed coupons...")
            conn.execute(text("""
                INSERT INTO venue_reviews (id, client_id, venue_id, rating, review_text)
                VALUES ('v-rev-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'pfv001', 5, 'El café para michis es maravilloso. La comida es buena y el trato a las mascotas inmejorable.')
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO venue_reviews (id, client_id, venue_id, rating, review_text)
                VALUES ('v-rev-2', '704f96f6-2811-4b00-b351-8e33167a35f8', 'pfv001', 4, 'Buen lugar para pasar la tarde con Nala. Muy limpio.')
                ON CONFLICT (id) DO NOTHING
            """))

            conn.execute(text("""
                INSERT INTO claimed_coupons (id, client_id, venue_id, coupon_code, status)
                VALUES ('cc-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'pfv001', 'MICHICAFE10', 'active')
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO claimed_coupons (id, client_id, venue_id, coupon_code, status)
                VALUES ('cc-2', 'bc4cdc0f-48d5-4da5-a33a-ac687b8fa411', 'pfv002', 'WOOFBAR15', 'redeemed')
                ON CONFLICT (id) DO NOTHING
            """))


            # 12. DONATIONS
            print("Seeding donations...")
            conn.execute(text("""
                INSERT INTO donations (id, user_id, amount, currency, message, status)
                VALUES ('don-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 200.00, 'MXN', 'Mucha fuerza para alimentar a los perritos del refugio.', 'completed')
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO donations (id, user_id, amount, currency, message, status)
                VALUES ('don-2', 'bc4cdc0f-48d5-4da5-a33a-ac687b8fa411', 150.00, 'MXN', 'Para vacunas de los michis rescatados.', 'completed')
                ON CONFLICT (id) DO NOTHING
            """))


            # 13. NOTIFICATIONS
            print("Seeding user notifications...")
            # For hackminor
            conn.execute(text("""
                INSERT INTO notifications (id, user_id, title, message, type, is_read)
                VALUES ('notif-hm-1', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'Recordatorio de Vacuna', 'La vacuna Antirrábica de Milanesillo vence pronto.', 'health', false)
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO notifications (id, user_id, title, message, type, is_read)
                VALUES ('notif-hm-2', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'Cita Confirmada', 'Tu cita de estética para Pyke el 20 de Junio ha sido confirmada.', 'grooming', false)
                ON CONFLICT (id) DO NOTHING
            """))
            conn.execute(text("""
                INSERT INTO notifications (id, user_id, title, message, type, is_read)
                VALUES ('notif-hm-3', 'a9105cb4-06d0-4628-81b2-9b6e6a863283', 'Mensaje del Memorial', 'Dra. Ana López ha dejado una nota de condolencias en el memorial de Toby.', 'memorial', true)
                ON CONFLICT (id) DO NOTHING
            """))

            # For michicondriasapp
            conn.execute(text("""
                INSERT INTO notifications (id, user_id, title, message, type, is_read)
                VALUES ('notif-michi-1', 'bc4cdc0f-48d5-4da5-a33a-ac687b8fa411', 'Pedido Enviado', 'Tu orden ord-michi-1 con Croquetas de Gato ha sido enviada.', 'ecommerce', false)
                ON CONFLICT (id) DO NOTHING
            """))

            # For yurygarcia1897
            conn.execute(text("""
                INSERT INTO notifications (id, user_id, title, message, type, is_read)
                VALUES ('notif-yuri-1', '704f96f6-2811-4b00-b351-8e33167a35f8', 'Nueva Póliza Activa', 'Tu seguro de salud para Nala se encuentra activo.', 'insurance', false)
                ON CONFLICT (id) DO NOTHING
            """))

            trans.commit()
            print("✅ Database cleaning and complete seeding finished successfully!")
        except Exception as e:
            trans.rollback()
            print(f"❌ Database seeding failed: {e}")
            raise e

if __name__ == "__main__":
    run_seed()
