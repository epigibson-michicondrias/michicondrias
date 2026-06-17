"""
Seed de datos de prueba para Michicondrias
Ejecutar: python seed_datos_prueba.py
"""
import uuid
from datetime import datetime, timedelta

PREHASHED = "$2b$12$a5QoQZ8MtozfA65t9GylEen1sHQfIghpuwEWE8fkvr7rFfNB9sKcW"

def uid():
    return str(uuid.uuid4())

# ═══════════════════════════════════════════════════════════
#  DATOS
# ═══════════════════════════════════════════════════════════

USERS = [
    {"email": "admin@michicondrias.com", "full_name": "Admin General"},
    {"email": "vet@michicondrias.com", "full_name": "Dra. Ana López"},
    {"email": "vendedor@michicondrias.com", "full_name": "Carlos Vendedor"},
    {"email": "paseador@michicondrias.com", "full_name": "Juan Paseador"},
    {"email": "cuidador@michicondrias.com", "full_name": "María Cuidadora"},
    {"email": "refugio@michicondrias.com", "full_name": "Refugio Michis"},
    {"email": "usuario@michicondrias.com", "full_name": "Pedro Usuario"},
]

ROLES = ["admin", "veterinario", "vendedor", "paseador", "cuidador", "refugio", "consumidor"]

CLINICAS = [
    {"name": "Hospital Veterinario Michicondrias", "address": "Av. Central 123", "city": "CDMX", "state": "CDMX", "phone": "555-1234", "email": "contacto@michicondrias.com", "description": "Clínica 24/7 con urgencias", "is_24_hours": True, "has_emergency": True},
    {"name": "Pet Care Center", "address": "Calle Reforma 456", "city": "Guadalajara", "state": "JAL", "phone": "555-5678", "email": "info@petcare.com", "description": "Atención integral para mascotas", "is_24_hours": False, "has_emergency": True},
    {"name": "Vet Express", "address": "Blvd. Independencia 789", "city": "Monterrey", "state": "NL", "phone": "555-9012", "email": "vet@express.com", "description": "Consultas y vacunación", "is_24_hours": False, "has_emergency": False},
]

PRODUCTOS = [
    {"name": "Alimento Premium Perro", "description": "Alimento balanceado para perros adultos", "price": 899.00, "stock": 50},
    {"name": "Juguete Pelota Resistente", "description": "Pelota de goma ultra resistente", "price": 249.00, "stock": 100},
    {"name": "Cama Ortopédica Grande", "description": "Cama con memory foam", "price": 1599.00, "stock": 20},
    {"name": "Shampoo Neutro Gatos", "description": "Shampoo hipoalergénico", "price": 189.00, "stock": 75},
    {"name": "Collar Antipulgas", "description": "Collar protección 6 meses", "price": 349.00, "stock": 30},
    {"name": "Comedero Automático", "description": "Comedero con temporizador", "price": 1299.00, "stock": 15},
    {"name": "Snacks Training", "description": "Premios naturales", "price": 149.00, "stock": 200},
    {"name": "Correa Retráctil 5m", "description": "Correa extensible", "price": 299.00, "stock": 40},
]

PETS = [
    {"name": "Max", "species": "perro", "breed": "Labrador", "age_months": 36, "size": "grande"},
    {"name": "Luna", "species": "gato", "breed": "Siamés", "age_months": 24, "size": "pequeño"},
    {"name": "Rocky", "species": "perro", "breed": "Bulldog Francés", "age_months": 18, "size": "pequeño"},
    {"name": "Bella", "species": "perro", "breed": "Golden Retriever", "age_months": 48, "size": "grande"},
    {"name": "Mishi", "species": "gato", "breed": "Mestizo", "age_months": 12, "size": "pequeño"},
]

PERDIDAS = [
    {"pet_name": "Canelo", "species": "perro", "breed": "Chihuahua", "color": "Café", "size": "pequeño", "age_approx": "3 años", "description": "Se escapó del jardín", "report_type": "lost", "last_seen_location": "Parque México, CDMX", "latitude": 19.4194, "longitude": -99.1904, "contact_phone": "555-1111", "contact_email": "usuario@michicondrias.com"},
    {"pet_name": "Simba", "species": "gato", "breed": "Naranja", "color": "Naranja", "size": "pequeño", "age_approx": "2 años", "description": "Gato encontrado en la calle", "report_type": "found", "last_seen_location": "Col. Roma, CDMX", "latitude": 19.4126, "longitude": -99.1660, "contact_phone": "555-2222", "contact_email": "paseador@michicondrias.com"},
    {"pet_name": "Toby", "species": "perro", "breed": "Beagle", "color": "Tricolor", "size": "mediano", "age_approx": "5 años", "description": "Perro con collar azul", "report_type": "lost", "last_seen_location": "Condesa, CDMX", "latitude": 19.4115, "longitude": -99.1734, "contact_phone": "555-3333", "contact_email": "usuario@michicondrias.com"},
]

PETFRIENDLY = [
    {"name": "El Michi Café", "category": "Cafetería", "address": "Calle Durango 200, Roma Norte", "city": "CDMX", "description": "Cafetería pet-friendly con menú para mascotas", "latitude": 19.4195, "longitude": -99.1620, "phone": "555-4444", "rating": 5, "pet_sizes_allowed": "todos", "has_water_bowls": "sí", "has_pet_menu": "sí"},
    {"name": "Parque Hundido", "category": "Parque", "address": "Av. México-Xochimilco", "city": "CDMX", "description": "Parque amplio ideal para pasear", "latitude": 19.3629, "longitude": -99.1554, "phone": "555-5555", "rating": 4, "pet_sizes_allowed": "todos", "has_water_bowls": "sí", "has_pet_menu": "no"},
]

VACCINES = [
    {"name": "Antirrábica"},
    {"name": "Moquillo"},
    {"name": "Tríple Felina"},
    {"name": "Leucemia Felina"},
    {"name": "Parvovirus"},
]

# ═══════════════════════════════════════════════════════════
#  GENERAR SQL
# ═══════════════════════════════════════════════════════════

sql = []
sql.append("-- ═══════════════════════════════════════════")
sql.append("-- SEED DE DATOS DE PRUEBA - MICHIcondrias")
sql.append("-- ═══════════════════════════════════════════\n")

# Roles
sql.append("INSERT INTO roles (id, name) VALUES")
sql.append(",\n".join([f"  ('{uid()}', '{r}')" for r in ROLES]) + " ON CONFLICT DO NOTHING;\n")

# Usuarios
sql.append("INSERT INTO users (id, email, full_name, hashed_password, is_active, verification_status) VALUES")
sql.append(",\n".join([f"  ('{uid()}', '{u['email']}', '{u['full_name']}', '{PREHASHED}', true, 'VERIFIED')" for u in USERS]) + " ON CONFLICT DO NOTHING;\n")

# Clínicas
sql.append("INSERT INTO clinics (id, name, address, city, state, phone, email, description, is_24_hours, has_emergency) VALUES")
sql.append(",\n".join([f"  ('{uid()}', '{c['name']}', '{c['address']}', '{c['city']}', '{c['state']}', '{c['phone']}', '{c['email']}', '{c['description']}', {c['is_24_hours']}, {c['has_emergency']})" for c in CLINICAS]) + " ON CONFLICT DO NOTHING;\n")

# Productos
sql.append("INSERT INTO products (id, name, description, price, stock) VALUES")
sql.append(",\n".join([f"  ('{uid()}', '{p['name']}', '{p['description']}', {p['price']}, {p['stock']})" for p in PRODUCTOS]) + " ON CONFLICT DO NOTHING;\n")

# Mascotas
sql.append("INSERT INTO pets (id, name, species, breed, age_months, size) VALUES")
sql.append(",\n".join([f"  ('{uid()}', '{p['name']}', '{p['species']}', '{p['breed']}', {p['age_months']}, '{p['size']}')" for p in PETS]) + " ON CONFLICT DO NOTHING;\n")

# Mascotas Perdidas
sql.append("INSERT INTO lost_pet_reports (id, pet_name, species, breed, color, size, age_approx, description, report_type, last_seen_location, latitude, longitude, contact_phone, contact_email, status, is_resolved) VALUES")
sql.append(",\n".join([f"  ('{uid()}', '{p['pet_name']}', '{p['species']}', '{p['breed']}', '{p['color']}', '{p['size']}', '{p['age_approx']}', '{p['description']}', '{p['report_type']}', '{p['last_seen_location']}', {p['latitude']}, {p['longitude']}, '{p['contact_phone']}', '{p['contact_email']}', 'active', false)" for p in PERDIDAS]) + " ON CONFLICT DO NOTHING;\n")

# Pet-Friendly
sql.append("INSERT INTO petfriendly_places (id, name, category, address, city, description, latitude, longitude, phone, rating, pet_sizes_allowed, has_water_bowls, has_pet_menu) VALUES")
sql.append(",\n".join([f"  ('{uid()}', '{p['name']}', '{p['category']}', '{p['address']}', '{p['city']}', '{p['description']}', {p['latitude']}, {p['longitude']}', '{p['phone']}', {p['rating']}, '{p['pet_sizes_allowed']}', '{p['has_water_bowls']}', '{p['has_pet_menu']}')" for p in PETFRIENDLY]) + " ON CONFLICT DO NOTHING;\n")

# Vacunas
sql.append("INSERT INTO vaccines (id, name) VALUES")
sql.append(",\n".join([f"  ('{uid()}', '{v['name']}')" for v in VACCINES]) + " ON CONFLICT DO NOTHING;\n")

sql.append("\n-- ═══════════════════════════════════════════")
sql.append("-- ¡Seed completado!")
sql.append(f"-- Usuarios: {len(USERS)}")
sql.append(f"-- Roles: {len(ROLES)}")
sql.append(f"-- Clínicas: {len(CLINICAS)}")
sql.append(f"-- Productos: {len(PRODUCTOS)}")
sql.append(f"-- Mascotas: {len(PETS)}")
sql.append(f"-- Perdidas: {len(PERDIDAS)}")
sql.append(f"-- Pet-Friendly: {len(PETFRIENDLY)}")
sql.append(f"-- Vacunas: {len(VACCINES)}")
sql.append("-- ═══════════════════════════════════════════\n")

with open("seed_datos_prueba.sql", "w") as f:
    f.write("\n".join(sql))

print("✅ Archivo seed_datos_prueba.sql generado")
