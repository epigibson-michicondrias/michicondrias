#!/usr/bin/env python3
"""
Seed completo de datos de prueba en PRODUCCIÓN — todos los roles y el usuario final.
Uso: python3 scripts/seed_all_roles.py
"""
import json
import sys
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

BASE = "https://michicondrias.duckdns.org"
PASS = "MichiTest2026!"

def api(method, path, token=None, body=None, form=False):
    url = f"{BASE}{path}"
    data = None
    headers = {}
    if body is not None:
        if form:
            from urllib.parse import urlencode
            data = urlencode(body).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            j = json.loads(raw)
            print(f"  !! {method} {path} -> {e.code}: {str(j)[:150]}")
            return j
        except Exception:
            print(f"  !! {method} {path} -> {e.code}: {raw[:120]}")
            return {"error": raw}
    except Exception as e:
        print(f"  !! {method} {path} -> {e}")
        return {"error": str(e)}

TOKENS = {}
IDS = {}

def login(email):
    if email in TOKENS:
        return TOKENS[email]
    r = api("POST", "/core/api/v1/login/access-token", form=True,
            body={"username": email, "password": PASS})
    tok = r.get("access_token")
    if not tok:
        print(f"FALLO login {email}: {r}")
        sys.exit(1)
    TOKENS[email] = tok
    me = api("GET", "/core/api/v1/users/me", token=tok)
    IDS[email] = me.get("id")
    return tok

def iso(days=0):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

def show(label, r, id_key="id"):
    ok = bool(r.get(id_key))
    print(f"  {'OK' if ok else 'ERR'} {label}: {r.get(id_key, str(r)[:120])}")
    return r.get(id_key)

# ═══════════════ IDS FIJAS DE PRUEBAS ANTERIORES ═══════════════
MAX = "c016c63a-1fd9-4178-b356-dba068263d6f"
LUNA = "5c2dfe33-7362-4fcb-8eb4-c69c40b7a165"
ROCKY = "8c88584a-b66b-4e29-a67b-d32f729a1d47"
VET_PROFILE = "d9b6ce82-a32e-4878-ba63-d8caee262d8e"

print("\n═══ 1. CLÍNICA Y SERVICIOS (hospital) ═══")
tok_hosp = login("test.hospital@example.com")
clinic = api("POST", "/directorio/api/v1/clinics/", token=tok_hosp, body={
    "name": "Hospital Michi Central", "address": "Av. Reforma 500, Col. Juárez",
    "city": "Ciudad de México", "state": "CDMX", "phone": "555-0100",
    "email": "test.hospital@example.com", "website": "https://michicentral.test",
    "description": "Hospital veterinario 24/7 con urgencias, cirugía y laboratorio propio.",
    "is_24_hours": True, "has_emergency": True, "owner_user_id": IDS["test.hospital@example.com"]})
clinic_id = show("clínica", clinic)
IDS["clinic"] = clinic_id

# servicios de la clínica
services = {}
if clinic_id:
    for name, desc, price, dur, cat in [
        ("Consulta general", "Revisión completa del paciente", 450, 30, "consulta"),
        ("Vacunación", "Aplicación de vacunas y refuerzos", 350, 20, "prevención"),
        ("Cirugía menor", "Esterilización, pequeñas lesiones", 2500, 90, "cirugía"),
        ("Laboratorio clínico", "Análisis de sangre y orina", 680, 45, "diagnóstico"),
        ("Urgencias 24h", "Atención de emergencias", 900, 45, "urgencias"),
    ]:
        tok_vet = login("test.veterinario@example.com")
        sid = show(f"servicio {name}", api("POST", "/directorio/api/v1/clinics/" + clinic_id + "/services/",
                                          token=tok_hosp if clinic_id else tok_vet,
                                          body={"name": name, "description": desc, "price": price,
                                                "duration_minutes": dur, "category": cat}))
        if sid:
            services[name] = sid
IDS["services"] = services

# horarios de la clínica (lun-vie 9-18, sáb 9-14)
if clinic_id:
    for dow, s, e in [(0, "09:00", "18:00"), (1, "09:00", "18:00"), (2, "09:00", "18:00"),
                       (3, "09:00", "18:00"), (4, "09:00", "18:00"), (5, "09:00", "14:00")]:
        api("POST", f"/directorio/api/v1/clinics/{clinic_id}/schedules/", token=tok_hosp,
            body={"day_of_week": dow, "start_time": s, "end_time": e, "slot_duration_minutes": 30})
    print("  OK horarios de la clínica")

print("\n═══ 2. CITAS (consumidor + vet) ═══")
tok_ana = login("test.consumidor@example.com")
tok_luis = login("test.consumidor2@example.com")
tok_vet = login("test.veterinario@example.com")

# citas pasada, hoy y futura
for pet_id, when, reason, status_note in [
    (MAX, -30, "Control anual y vacunación", "pasada"),
    (LUNA, -7, "Revisión post-esterilización", "pasada"),
    (MAX, 2, "Consulta por cojera", "futura"),
    (ROCKY, 5, "Primera consulta del cachorro", "futura"),
]:
    tok = tok_ana if pet_id in (MAX, LUNA) else tok_luis
    svc = services.get("Consulta general")
    r = api("POST", "/directorio/api/v1/appointments/", token=tok, body={
        "clinic_id": clinic_id, "service_id": svc, "pet_id": pet_id, "vet_id": VET_PROFILE,
        "appointment_date": iso(when)[:10], "start_time": "10:00",
        "reason": reason, "notes": f"Cita {status_note} generada para pruebas.", "is_emergency": False})
    show(f"cita {status_note} ({reason[:30]})", r)

print("\n═══ 3. COMPRAS Y RESEÑAS (consumidor) ═══")
# obtener productos
prods = api("GET", "/ecommerce/api/v1/products/")
prod_by_name = {p["name"]: p for p in prods}
prod_ids = {p["id"]: p["name"] for p in prods}

# pedidos: uno pagado, uno entregado
for items, status_hint in [
    ([{"product_id": list(prod_ids)[0], "quantity": 1}, {"product_id": list(prod_ids)[2], "quantity": 2}], "pagado"),
    ([{"product_id": list(prod_ids)[1], "quantity": 1}], "entregado"),
]:
    r = api("POST", "/ecommerce/api/v1/orders/", token=tok_ana, body={
        "items": items, "shipping_address": "Calle Reforma 123, Col. Centro, CDMX, 06000"})
    oid = show(f"pedido {status_hint}", r)
    # los pedidos se marcan como pagados vía SQL después (Stripe no está configurado)

print("\n═══ 4. SOLITUDES DE ADOPCIÓN ═══")
listings = api("GET", "/adopciones/api/v1/pets/")
for listing in listings[:2]:
    r = api("POST", f"/adopciones/api/v1/pets/{listing['id']}/request", token=tok_luis, body={
        "message": "Me encantaría darle un hogar. Tengo casa con patio y experiencia con mascotas.",
        "housing_type": "casa", "has_yard": True, "other_pets": False, "experience_years": 5})
    show(f"solicitud para {listing['name']}", r)

print("\n═══ 5. NOTIFICACIONES (core) ═══")
# las notificaciones las crean los emisores; al menos una de prueba para que la bandeja no esté vacía
# se insertan via SQL después

print("\n═══ 6. SEGUROS (aseguradora) ═══")
tok_aseg = login("test.aseguradora@example.com")
plans = []
for name, desc, limit, premium, min_a, max_a, species in [
    ("Plan Básico Michi", "Cobertura de accidentes y consultas básicas", 15000, 299, 0, 8, "perro,gato"),
    ("Plan Premium Michi", "Accidentes, enfermedades, cirugía y laboratorio", 50000, 599, 0, 6, "perro,gato"),
    ("Plan Senior Michi", "Diseñado para mascotas mayores de 7 años", 30000, 499, 7, 15, "perro,gato"),
]:
    pid = show(f"plan {name}", api("POST", "/aseguradoras/api/v1/insurance/plans", token=tok_aseg, body={
        "name": name, "description": desc, "coverage_limit": limit, "base_premium": premium,
        "min_age": min_a, "max_age": max_a, "allowed_species": species}))
    if pid:
        plans.append(pid)
IDS["plans"] = plans

# póliza para Max
if plans:
    pol = api("POST", "/aseguradoras/api/v1/insurance/policies", token=tok_aseg, body={
        "pet_id": MAX, "insurer_id": IDS["test.aseguradora@example.com"],
        "policy_number": "MICH-2026-0001", "coverage_details": "Accidentes y enfermedades hasta $50,000 MXN",
        "start_date": iso(0)[:10], "end_date": iso(365)[:10], "monthly_premium": 599, "status": "active"})
    pol_id = show("póliza Max", pol)
    if pol_id:
        api("POST", "/aseguradoras/api/v1/insurance/claims", token=tok_ana, body={
            "policy_id": pol_id, "amount_claimed": 1200,
            "reason": "Consulta por cojera y radiografías", "status": "pending"})
        print("  OK reclamo de prueba")

print("\n═══ 7. FUNERARIA ═══")
tok_fun = login("test.funeraria@example.com")
for name, desc, price in [
    ("Cremación individual", "Cremación individual con devolución de cenizas en urna", 3500),
    ("Cremación colectiva", "Cremación respetuosa en grupo", 1800),
    ("Memorial digital", "Página de recuerdo permanente con fotos y textos", 800),
]:
    show(f"funerario {name}", api("POST", "/funeraria/api/v1/funerary/services", token=tok_fun, body={
        "name": name, "description": desc, "price": price, "service_type": "cremacion" if "Cremación" in name else "memorial"}))

print("\n═══ 8. ENTRENADORES ═══")
tok_ent = login("test.entrenador@example.com")
for name, desc, price, weeks, level in [
    ("Obediencia básica", "Órdenes fundamentales: sentado, quieto, ven, caminar sin tirar", 1800, 8, "principiante"),
    ("Trucos y agilidad", "Trucos avanzados y circuito de agilidad", 2400, 12, "intermedio"),
    ("Terapia de conducta", "Corrección de ansiedad, ladridos y mordidas", 3200, 10, "avanzado"),
]:
    show(f"programa {name}", api("POST", "/entrenadores/api/v1/training/programs", token=tok_ent, body={
        "name": name, "description": desc, "price": price, "duration_weeks": weeks, "level": level, "max_participants": 6}))

print("\n═══ 9. ESTILISTAS / GROOMING ═══")
tok_est = login("test.estilista@example.com")
for name, desc, price, mins, pet_type in [
    ("Baño y corte higiénico", "Baño con productos premium, corte de uñas y limpieza de oídos", 450, 60, "perro"),
    ("Spa felino", "Baño suave, cepillado y deslanado para gatos", 380, 45, "gato"),
    ("Corte de raza", "Estilismo según estándar de raza", 650, 90, "perro"),
]:
    show(f"grooming {name}", api("POST", "/estilistas/api/v1/grooming/services", token=tok_est, body={
        "name": name, "description": desc, "price": price, "duration_minutes": mins, "pet_type": pet_type}))

print("\n═══ 10. LABORATORIO ═══")
tok_lab = login("test.laboratorio@example.com")
for name, desc, price, sample in [
    ("Biometría hemática completa", "Conteo de células sanguíneas y fórmula leucocitaria", 520, "sangre"),
    ("Perfil hepático", "Enzimas hepáticas y proteínas séricas", 480, "sangre"),
    ("Análisis de orina", "Físico-químico y sedimento urinario", 280, "orina"),
    ("Coproparasitoscópico", "Detección de parásitos intestinales", 220, "heces"),
]:
    show(f"test lab {name}", api("POST", "/laboratorio/api/v1/labs/tests", token=tok_lab, body={
        "name": name, "description": desc, "price": price, "sample_type": sample}))

print("\n═══ 11. TRANSPORTISTAS ═══")
tok_trans = login("test.transportista@example.com")
show("perfil conductor", api("POST", "/transportistas/api/v1/rides/driver-profile", token=tok_trans, body={
    "vehicle_type": "camioneta", "vehicle_model": "Toyota Hilux 2022", "vehicle_plate": "MIC-1234",
    "capacity_pets": 3, "has_climate_control": True, "service_zones": "CDMX, Estado de México",
    "base_price": 250, "price_per_km": 12}))
# viaje solicitado por Ana
tok_ana = login("test.consumidor@example.com")
show("viaje solicitado", api("POST", "/transportistas/api/v1/rides/request", token=tok_ana, body={
    "pet_id": MAX, "pickup_address": "Calle Reforma 123, CDMX", "dropoff_address": "Hospital Michi Central, CDMX",
    "pickup_time": iso(2), "notes": "Transporte para consulta veterinaria.", "distance_km": 8.5}))

print("\n═══ 12. PATROCINADORES ═══")
tok_pat = login("test.patrocinador@example.com")
for name, desc, budget, days in [
    ("Campaña Primavera Michi", "Promoción de adopciones en temporada de primavera", 15000, 30),
    ("Boost Perdidos CDMX", "Impulso de reportes de mascotas perdidas en CDMX", 8000, 15),
]:
    show(f"campaña {name}", api("POST", "/patrocinadores/api/v1/sponsors/campaigns", token=tok_pat, body={
        "name": name, "description": desc, "budget": budget, "duration_days": days,
        "target_audience": "dueños de mascotas CDMX", "campaign_type": "adopciones" if "Primavera" in name else "perdidos"}))

print("\n═══ 13. ESTABLECIMIENTOS PET-FRIENDLY ═══")
tok_estab = login("test.establecimiento@example.com")
for name, cat, addr, desc in [
    ("Café Pet Friendly Central", "Cafetería", "Av. Reforma 200, CDMX", "Cafetería con menú para mascotas y terraza."),
    ("Parque Los Venados", "Parque", "Calz. de Tlalpan 500, CDMX", "Parque amplio con área canina y bebederos."),
    ("Hotel Michi Stay", "Hotel", "Calle Amberes 30, CDMX", "Hotel que acepta mascotas sin costo extra."),
]:
    show(f"lugar {name}", api("POST", "/establecimientos/api/v1/venues/", token=tok_estab, body={
        "name": name, "category": cat, "address": addr, "city": "Ciudad de México",
        "description": desc, "phone": "555-0800", "pet_sizes_allowed": "todos",
        "has_water_bowls": True, "has_pet_menu": "Cafetería" in cat}))

print("\n═══ 14. PASEADORES Y CUIDADORES ═══")
tok_pase = login("test.paseador@example.com")
show("perfil paseador", api("POST", "/paseadores/api/v1/walkers/", token=tok_pase, body={
    "bio": "Paseador con 4 años de experiencia. Especializado en perros grandes.",
    "experience_years": 4, "service_zones": "Condesa, Roma, Juárez", "price_per_walk": 180,
    "max_dogs_per_walk": 3, "available_days": "lunes,martes,miércoles,jueves,viernes"}))
tok_cuid = login("test.cuidador@example.com")
show("perfil cuidador", api("POST", "/cuidadores/api/v1/sitters/", token=tok_cuid, body={
    "bio": "Cuidadora en hogar. Experiencia con gatos y perros senior.",
    "experience_years": 6, "service_zones": "Coyoacán, Del Valle", "price_per_night": 350,
    "max_pets": 2, "home_type": "casa", "has_yard": True}))

print("\n═══ 15. MASCOTA EXTRA PARA PROBAR CARRUSEL ═══")
tok_luis = login("test.consumidor2@example.com")
show("mascota extra", api("POST", "/mascotas/api/v1/pets/", token=tok_luis, body={
    "owner_id": IDS["test.consumidor2@example.com"], "name": "Mishi", "species": "gato",
    "breed": "Mestizo", "age_months": 6, "size": "pequeño", "gender": "hembra", "weight_kg": 2.8,
    "description": "Gatita rescatada, muy juguetona.", "is_vaccinated": True, "is_sterilized": False}))

print("\n═══ RESUMEN ═══")
for k, v in IDS.items():
    if k not in ("services", "plans") and isinstance(v, str):
        print(f"  {k}: {v[:12]}")
print("Listo. Faltan: pedidos pagados (Stripe), notificaciones (SQL), recetas (SQL).")
