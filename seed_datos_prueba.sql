-- ═══════════════════════════════════════════
-- SEED DE DATOS DE PRUEBA - MICHIcondrias
-- ═══════════════════════════════════════════

INSERT INTO roles (id, name) VALUES
  ('4a285592-5fd8-4716-99e2-b3374b2f2fb6', 'admin'),
  ('ac098499-8f4f-4bbb-aade-69d8a92d4878', 'veterinario'),
  ('9c6a08d3-e2a1-40dd-8a80-5b06ff234add', 'vendedor'),
  ('274565d0-7c1b-43cf-b1af-459ac773f204', 'paseador'),
  ('8ba88656-73c7-4af0-a96f-c2e35e37ee38', 'cuidador'),
  ('ca486a64-1baf-4613-bf5e-ca6eab125a9a', 'refugio'),
  ('66025b58-7fe3-4e94-bef6-ee4ee1b20200', 'consumidor') ON CONFLICT DO NOTHING;

INSERT INTO users (id, email, full_name, hashed_password, is_active, verification_status) VALUES
  ('29c79b82-5cd4-4443-955b-99287cef7be6', 'admin@michicondrias.com', 'Admin General', '$2b$12$LJ3m4ys3GzWG/d4N0.Vy1.ZQxOqP8hK5jS7fX9vK2mN4pR6tU8wY0', true, 'VERIFIED'),
  ('8625ba8b-71e0-45cb-8e21-26b98dfc3ba6', 'vet@michicondrias.com', 'Dra. Ana López', '$2b$12$LJ3m4ys3GzWG/d4N0.Vy1.ZQxOqP8hK5jS7fX9vK2mN4pR6tU8wY0', true, 'VERIFIED'),
  ('3a8adaeb-1486-4af2-9aff-2ad27495c138', 'vendedor@michicondrias.com', 'Carlos Vendedor', '$2b$12$LJ3m4ys3GzWG/d4N0.Vy1.ZQxOqP8hK5jS7fX9vK2mN4pR6tU8wY0', true, 'VERIFIED'),
  ('2b9d6aed-93cd-4c10-9d67-fa5dc4b9bb4b', 'paseador@michicondrias.com', 'Juan Paseador', '$2b$12$LJ3m4ys3GzWG/d4N0.Vy1.ZQxOqP8hK5jS7fX9vK2mN4pR6tU8wY0', true, 'VERIFIED'),
  ('5fb012af-58eb-47de-8596-5070e3f41794', 'cuidador@michicondrias.com', 'María Cuidadora', '$2b$12$LJ3m4ys3GzWG/d4N0.Vy1.ZQxOqP8hK5jS7fX9vK2mN4pR6tU8wY0', true, 'VERIFIED'),
  ('5dd0ec5c-3892-4ba6-97d0-2f3f5c007550', 'refugio@michicondrias.com', 'Refugio Michis', '$2b$12$LJ3m4ys3GzWG/d4N0.Vy1.ZQxOqP8hK5jS7fX9vK2mN4pR6tU8wY0', true, 'VERIFIED'),
  ('55c094cf-37b1-4bf8-87b7-fb2b7ee81073', 'usuario@michicondrias.com', 'Pedro Usuario', '$2b$12$LJ3m4ys3GzWG/d4N0.Vy1.ZQxOqP8hK5jS7fX9vK2mN4pR6tU8wY0', true, 'VERIFIED') ON CONFLICT DO NOTHING;

INSERT INTO clinics (id, name, address, city, state, phone, email, description, is_24_hours, has_emergency) VALUES
  ('3acfb020-6a3f-405c-b2fa-bf13c2d37227', 'Hospital Veterinario Michicondrias', 'Av. Central 123', 'CDMX', 'CDMX', '555-1234', 'contacto@michicondrias.com', 'Clínica 24/7 con urgencias', True, True),
  ('d606578f-841e-46f1-929b-7272d0aab292', 'Pet Care Center', 'Calle Reforma 456', 'Guadalajara', 'JAL', '555-5678', 'info@petcare.com', 'Atención integral para mascotas', False, True),
  ('f783804b-f96e-4560-b2f1-c2439f4cafd5', 'Vet Express', 'Blvd. Independencia 789', 'Monterrey', 'NL', '555-9012', 'vet@express.com', 'Consultas y vacunación', False, False) ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, price, stock) VALUES
  ('2c79aa78-f3fc-42bc-9296-606822f7135f', 'Alimento Premium Perro', 'Alimento balanceado para perros adultos', 899.0, 50),
  ('39f88506-7a80-4bc7-b81b-e1041ae030ec', 'Juguete Pelota Resistente', 'Pelota de goma ultra resistente', 249.0, 100),
  ('3f4ef5a8-e2c0-4ad9-9b3f-25417314115d', 'Cama Ortopédica Grande', 'Cama con memory foam', 1599.0, 20),
  ('11756d8c-6d1f-4f2f-9598-8b4c78037a1c', 'Shampoo Neutro Gatos', 'Shampoo hipoalergénico', 189.0, 75),
  ('e05eca5b-cc57-4615-ac1c-aa41c952d552', 'Collar Antipulgas', 'Collar protección 6 meses', 349.0, 30),
  ('098f2f4a-04b0-427e-a61e-b63cf94619bc', 'Comedero Automático', 'Comedero con temporizador', 1299.0, 15),
  ('fec1c7bf-ac73-4234-b790-956cc74b2141', 'Snacks Training', 'Premios naturales', 149.0, 200),
  ('e143b8c1-e446-4c3b-b655-0943172b19a0', 'Correa Retráctil 5m', 'Correa extensible', 299.0, 40) ON CONFLICT DO NOTHING;

INSERT INTO pets (id, name, species, breed, age_months, size) VALUES
  ('c146dd4d-e90a-4441-b094-6a8d3346b6dd', 'Max', 'perro', 'Labrador', 36, 'grande'),
  ('3e27fd61-84ba-490e-878b-7b44b7216b14', 'Luna', 'gato', 'Siamés', 24, 'pequeño'),
  ('112dbe49-6f88-4df7-943c-89ccd9a534c9', 'Rocky', 'perro', 'Bulldog Francés', 18, 'pequeño'),
  ('6ee01424-9daf-4b8a-ac75-506cc01de385', 'Bella', 'perro', 'Golden Retriever', 48, 'grande'),
  ('49628298-74e1-4276-b9f3-7b8a7eeb4787', 'Mishi', 'gato', 'Mestizo', 12, 'pequeño') ON CONFLICT DO NOTHING;

INSERT INTO lost_pet_reports (id, pet_name, species, breed, color, size, age_approx, description, report_type, last_seen_location, latitude, longitude, contact_phone, contact_email, status, is_resolved) VALUES
  ('197b81e7-1169-4736-a448-07b46c822e38', 'Canelo', 'perro', 'Chihuahua', 'Café', 'pequeño', '3 años', 'Se escapó del jardín', 'lost', 'Parque México, CDMX', 19.4194, -99.1904, '555-1111', 'usuario@michicondrias.com', 'active', false),
  ('c3c91c02-1978-4acc-a638-b134fbfb7a99', 'Simba', 'gato', 'Naranja', 'Naranja', 'pequeño', '2 años', 'Gato encontrado en la calle', 'found', 'Col. Roma, CDMX', 19.4126, -99.166, '555-2222', 'paseador@michicondrias.com', 'active', false),
  ('e6e34bce-1b6f-44b2-b9cf-104e0e327cbb', 'Toby', 'perro', 'Beagle', 'Tricolor', 'mediano', '5 años', 'Perro con collar azul', 'lost', 'Condesa, CDMX', 19.4115, -99.1734, '555-3333', 'usuario@michicondrias.com', 'active', false) ON CONFLICT DO NOTHING;

INSERT INTO petfriendly_places (id, name, category, address, city, description, latitude, longitude, phone, rating, pet_sizes_allowed, has_water_bowls, has_pet_menu) VALUES
  ('04bb9a05-36f4-4a93-aed9-a76c3f1b6cde', 'El Michi Café', 'Cafetería', 'Calle Durango 200, Roma Norte', 'CDMX', 'Cafetería pet-friendly con menú para mascotas', 19.4195, -99.162', '555-4444', 5, 'todos', 'sí', 'sí'),
  ('345f729b-14b5-4af8-a28e-5b0393860aeb', 'Parque Hundido', 'Parque', 'Av. México-Xochimilco', 'CDMX', 'Parque amplio ideal para pasear', 19.3629, -99.1554', '555-5555', 4, 'todos', 'sí', 'no') ON CONFLICT DO NOTHING;

INSERT INTO vaccines (id, name) VALUES
  ('b4aab73b-90d1-425c-9cf9-d40013c6fbb4', 'Antirrábica'),
  ('78f4cec9-5a13-4726-9755-22c1c2fce6f0', 'Moquillo'),
  ('a1b40dd9-ae14-4eab-a350-129aa19b7abf', 'Tríple Felina'),
  ('8f8fd145-52a3-4d61-9aed-73fb92aea31f', 'Leucemia Felina'),
  ('9665cb30-d82e-41b2-9a97-ec180a690e0b', 'Parvovirus') ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════
-- ¡Seed completado!
-- Usuarios: 7
-- Roles: 7
-- Clínicas: 3
-- Productos: 8
-- Mascotas: 5
-- Perdidas: 3
-- Pet-Friendly: 2
-- Vacunas: 5
-- ═══════════════════════════════════════════
