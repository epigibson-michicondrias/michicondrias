#!/usr/bin/env python3
"""Seed de repuesto: los módulos que fallaron por nombres de campos."""
import json, sys, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone

BASE = "https://michicondrias.duckdns.org"
PASS = "MichiTest2026!"
MAX = "c016c63a-1fd9-4178-b356-dba068263d6f"
LUNA = "5c2dfe33-7362-4fcb-8eb4-c69c40b7a165"
ROCKY = "8c88584a-b66b-4e29-a67b-d32f729a1d47"
VET_PROFILE = "d9b6ce82-a32e-4878-ba63-d8caee262d8e"

def api(method, path, token=None, body=None, form=False):
    url = f"{BASE}{path}"
    data = None; headers = {}
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
            print(f"  !! {method} {path} -> {e.code}: {str(j)[:140]}")
            return j
        except Exception:
            print(f"  !! {method} {path} -> {e.code}: {raw[:100]}")
            return {"error": raw}
    except Exception as e:
        print(f"  !! {method} {path} -> {e}")
        return {"error": str(e)}

TOKENS = {}
IDS = {}
def login(email):
    if email in TOKENS: return TOKENS[email]
    r = api("POST", "/core/api/v1/login/access-token", form=True, body={"username": email, "password": PASS})
    tok = r.get("access_token")
    if not tok: print("FALLO", email, r); sys.exit(1)
    TOKENS[email] = tok
    IDS[email] = api("GET", "/core/api/v1/users/me", token=tok).get("id")
    return tok

def iso(days=0):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

def show(label, r):
    ok = bool(r.get("id"))
    print(f"  {'OK' if ok else 'ERR'} {label}: {r.get('id', str(r)[:110])}")
    return r.get("id")

# ── 1. Servicios de clínica (ruta correcta) ──
print("\n═══ 1. SERVICIOS DE CLÍNICA ═══")
tok_hosp = login("test.hospital@example.com")
# buscar la clínica creada
clinics = api("GET", "/directorio/api/v1/clinics/", token=tok_hosp)
clinic_id = None
for c in (clinics if isinstance(clinics, list) else []):
    if c.get("name") == "Hospital Michi Central":
        clinic_id = c["id"]; break
if not clinic_id and isinstance(clinics, list) and clinics:
    clinic_id = clinics[0].get("id")
print("  clínica:", clinic_id)

services = {}
if clinic_id:
    for name, desc, price, dur, cat in [
        ("Consulta general", "Revisión completa del paciente", 450, 30, "consulta"),
        ("Vacunación", "Aplicación de vacunas y refuerzos", 350, 20, "prevencion"),
        ("Cirugía menor", "Esterilización, pequeñas lesiones", 2500, 90, "cirugia"),
        ("Laboratorio clínico", "Análisis de sangre y orina", 680, 45, "diagnostico"),
        ("Urgencias 24h", "Atención de emergencias", 900, 45, "urgencias"),
    ]:
        sid = show(f"servicio {name}", api("POST", f"/directorio/api/v1/catalog/clinics/{clinic_id}/services",
                                          token=tok_hosp,
                                          body={"name": name, "description": desc, "price": price,
                                                "duration_minutes": dur, "category": cat}))
        if sid: services[name] = sid
    # horarios
    for dow, s, e in [(0,"09:00","18:00"),(1,"09:00","18:00"),(2,"09:00","18:00"),(3,"09:00","18:00"),(4,"09:00","18:00"),(5,"09:00","14:00")]:
        api("POST", f"/directorio/api/v1/schedule/clinics/{clinic_id}/schedule", token=tok_hosp,
            body={"day_of_week": dow, "start_time": s, "end_time": e, "slot_duration_minutes": 30})
    print("  OK horarios")

# ── 2. Citas ──
print("\n═══ 2. CITAS ═══")
tok_ana = login("test.consumidor@example.com")
tok_luis = login("test.consumidor2@example.com")
svc_id = services.get("Consulta general")
for pet_id, when, reason, who in [
    (MAX, -30, "Control anual y vacunación", tok_ana),
    (LUNA, -7, "Revisión post-esterilización", tok_ana),
    (MAX, 2, "Consulta por cojera", tok_ana),
    (ROCKY, 5, "Primera consulta del cachorro", tok_luis),
]:
    r = api("POST", "/directorio/api/v1/appointments/", token=who, body={
        "clinic_id": clinic_id, "service_id": svc_id, "pet_id": pet_id, "vet_id": VET_PROFILE,
        "appointment_date": iso(when)[:10], "start_time": "10:00",
        "reason": reason, "notes": "Cita de prueba.", "is_emergency": False})
    show(f"cita {reason[:30]}", r)

# ── 3. Solicitudes de adopción ──
print("\n═══ 3. SOLITUDES DE ADOPCIÓN ═══")
listings = api("GET", "/adopciones/api/v1/pets/")
for listing in (listings if isinstance(listings, list) else [])[:2]:
    r = api("POST", f"/adopciones/api/v1/pets/{listing['id']}/request", token=tok_luis, body={
        "message": "Me encantaría darle un hogar. Tengo casa con patio y experiencia con mascotas.",
        "house_type": "casa", "has_yard": True, "has_other_pets": False, "experience_years": 5})
    show(f"solicitud {listing['name']}", r)

# ── 4. Seguros ──
print("\n═══ 4. SEGUROS ═══")
tok_aseg = login("test.aseguradora@example.com")
plans = []
for name, desc, limit, premium, min_a, max_a in [
    ("Plan Básico Michi", "Accidentes y consultas básicas", 15000, 299, 0, 8),
    ("Plan Premium Michi", "Accidentes, enfermedades, cirugía y laboratorio", 50000, 599, 0, 6),
    ("Plan Senior Michi", "Diseñado para mascotas mayores de 7 años", 30000, 499, 7, 15),
]:
    pid = show(f"plan {name}", api("POST", "/aseguradoras/api/v1/insurance/plans", token=tok_aseg, body={
        "name": name, "description": desc, "coverage_limit": limit, "base_premium": premium,
        "min_age": min_a, "max_age": max_a, "allowed_species": ["perro", "gato"]}))
    if pid: plans.append(pid)

if plans:
    pol = api("POST", "/aseguradoras/api/v1/insurance/policies", token=tok_aseg, body={
        "pet_id": MAX, "insurer_id": IDS["test.aseguradora@example.com"],
        "policy_number": "MICH-2026-0001", "coverage_details": "Accidentes y enfermedades hasta $50,000 MXN",
        "start_date": iso(0)[:10], "end_date": iso(365)[:10], "monthly_premium": 599, "status": "active"})
    pol_id = show("póliza Max", pol)
    if pol_id:
        show("reclamo", api("POST", "/aseguradoras/api/v1/insurance/claims", token=tok_ana, body={
            "policy_id": pol_id, "amount_claimed": 1200,
            "reason": "Consulta por cojera y radiografías", "status": "pending"}))

# ── 5. Entrenadores ──
print("\n═══ 5. ENTRENADORES ═══")
tok_ent = login("test.entrenador@example.com")
for title, desc, price, weeks in [
    ("Obediencia básica", "Órdenes fundamentales: sentado, quieto, ven, caminar sin tirar", 1800, 8),
    ("Trucos y agilidad", "Trucos avanzados y circuito de agilidad", 2400, 12),
    ("Terapia de conducta", "Corrección de ansiedad, ladridos y mordidas", 3200, 10),
]:
    show(f"programa {title}", api("POST", "/entrenadores/api/v1/training/programs", token=tok_ent, body={
        "title": title, "description": desc, "price": price, "duration_weeks": weeks}))

# ── 6. Transportistas ──
print("\n═══ 6. TRANSPORTES ═══")
tok_trans = login("test.transportista@example.com")
show("viaje solicitado", api("POST", "/transportistas/api/v1/rides/request", token=tok_ana, body={
    "pet_id": MAX, "origin_address": "Calle Reforma 123, CDMX",
    "destination_address": "Hospital Michi Central, CDMX",
    "requires_carrier": True, "scheduled_at": iso(2),
    "notes": "Transporte para consulta veterinaria."}))

# ── 7. Patrocinadores ──
print("\n═══ 7. PATROCINADORES ═══")
tok_pat = login("test.patrocinador@example.com")
for title, budget in [
    ("Campaña Primavera Michi", 15000),
    ("Boost Perdidos CDMX", 8000),
]:
    show(f"campaña {title}", api("POST", "/patrocinadores/api/v1/sponsors/campaigns", token=tok_pat, body={
        "title": title, "banner_url": "https://example.com/banner.jpg",
        "target_link": "https://michicondrias.duckdns.org/adopciones", "budget_limit": budget}))

# ── 8. Paseadores y cuidadores ──
print("\n═══ 8. PASEADORES / CUIDADORES ═══")
tok_pase = login("test.paseador@example.com")
show("paseador", api("POST", "/paseadores/api/v1/walkers/", token=tok_pase, body={
    "display_name": "Juan Paseador", "bio": "Paseador con 4 años de experiencia. Especializado en perros grandes.",
    "location": "Condesa, Roma, Juárez", "price_per_walk": 180, "price_per_hour": 250,
    "experience_years": 4, "accepts_dogs": True, "accepts_cats": False, "max_pets_per_walk": 3}))
tok_cuid = login("test.cuidador@example.com")
show("cuidador", api("POST", "/cuidadores/api/v1/sitters/", token=tok_cuid, body={
    "display_name": "María Cuidadora", "bio": "Cuidadora en hogar. Experiencia con gatos y perros senior.",
    "location": "Coyoacán, Del Valle", "price_per_walk": 350, "price_per_hour": 200,
    "experience_years": 6, "accepts_dogs": True, "accepts_cats": True, "max_pets_per_walk": 2}))

print("\nListo.")
