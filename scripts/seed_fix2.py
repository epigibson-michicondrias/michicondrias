#!/usr/bin/env python3
"""Seed final: servicios de clínica, citas, solicitudes de adopción, reclamos, viajes, recetas y notificaciones."""
import json, sys, uuid, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone

BASE = "https://michicondrias.duckdns.org"
PASS = "MichiTest2026!"
MAX = "c016c63a-1fd9-4178-b356-dba068263d6f"
LUNA = "5c2dfe33-7362-4fcb-8eb4-c69c40b7a165"
ROCKY = "8c88584a-b66b-4e29-a67b-d32f729a1d47"
VET_PROFILE = "d9b6ce82-a32e-4878-ba63-d8caee262d8e"
CLINIC = "c330c96b-ec57-4baf-9bae-8b66e13ed058"

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
            print(f"  !! {method} {path} -> {e.code}: {str(j)[:130]}")
            return j
        except Exception:
            print(f"  !! {method} {path} -> {e.code}: {raw[:100]}")
            return {"error": raw}
    except Exception as e:
        print(f"  !! {method} {path} -> {e}")
        return {"error": str(e)}

TOKENS = {}
def login(email):
    if email in TOKENS: return TOKENS[email]
    r = api("POST", "/core/api/v1/login/access-token", form=True, body={"username": email, "password": PASS})
    tok = r.get("access_token")
    if not tok: print("FALLO", email, r); sys.exit(1)
    TOKENS[email] = tok
    return tok

def iso(days=0):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

def show(label, r):
    ok = bool(r.get("id"))
    print(f"  {'OK' if ok else 'ERR'} {label}: {r.get('id', str(r)[:110])}")
    return r.get("id")

tok_hosp = login("test.hospital@example.com")
tok_ana = login("test.consumidor@example.com")
tok_luis = login("test.consumidor2@example.com")
tok_vet = login("test.veterinario@example.com")
tok_aseg = login("test.aseguradora@example.com")

print("\n═══ 1. SERVICIOS DE CLÍNICA ═══")
services = {}
for name, desc, price, dur, cat in [
    ("Consulta general", "Revisión completa del paciente", 450, 30, "consulta"),
    ("Vacunación", "Aplicación de vacunas y refuerzos", 350, 20, "prevencion"),
    ("Cirugía menor", "Esterilización, pequeñas lesiones", 2500, 90, "cirugia"),
    ("Laboratorio clínico", "Análisis de sangre y orina", 680, 45, "diagnostico"),
    ("Urgencias 24h", "Atención de emergencias", 900, 45, "urgencias"),
]:
    sid = show(f"servicio {name}", api("POST", f"/directorio/api/v1/catalog/clinics/{CLINIC}/services",
                                      token=tok_hosp,
                                      body={"name": name, "description": desc, "price": price,
                                            "duration_minutes": dur, "category": cat}))
    if sid: services[name] = sid

print("\n═══ 2. HORARIOS ═══")
for dow, s, e in [(0,"09:00","18:00"),(1,"09:00","18:00"),(2,"09:00","18:00"),(3,"09:00","18:00"),(4,"09:00","18:00"),(5,"09:00","14:00")]:
    api("POST", f"/directorio/api/v1/schedule/clinics/{CLINIC}/schedule", token=tok_hosp,
        body={"day_of_week": dow, "start_time": s, "end_time": e, "slot_duration_minutes": 30})
print("  OK 6 bloques de horario")

print("\n═══ 3. CITAS ═══")
svc_id = services.get("Consulta general")
for pet_id, when, reason, who, notes in [
    (MAX, -30, "Control anual y vacunación", tok_ana, "Cita pasada — ya atendida."),
    (LUNA, -7, "Revisión post-esterilización", tok_ana, "Cita pasada — sin complicaciones."),
    (MAX, 2, "Consulta por cojera", tok_ana, "Cita futura — pendiente de atención."),
    (ROCKY, 5, "Primera consulta del cachorro", tok_luis, "Cita futura — primera revisión."),
    (LUNA, 10, "Refuerzo de vacuna", tok_ana, "Cita futura — refuerzo anual."),
]:
    r = api("POST", "/directorio/api/v1/appointments/", token=who, body={
        "clinic_id": CLINIC, "service_id": svc_id, "pet_id": pet_id, "vet_id": VET_PROFILE,
        "appointment_date": iso(when)[:10], "start_time": "10:00",
        "reason": reason, "notes": notes, "is_emergency": False})
    show(f"cita {reason[:30]}", r)

print("\n═══ 4. SOLITUDES DE ADOPCIÓN ═══")
listings = api("GET", "/adopciones/api/v1/pets/")
for listing in (listings if isinstance(listings, list) else [])[:3]:
    r = api("POST", f"/adopciones/api/v1/pets/{listing['id']}/request", token=tok_luis, body={
        "applicant_name": "Luis Martínez", "house_type": "casa", "has_yard": True,
        "own_or_rent": "propia", "landlord_permission": "no aplica", "other_pets": "1 perro",
        "has_children": False, "children_ages": "", "hours_alone": "4",
        "financial_commitment": True,
        "reason": f"Me encantaría adoptar a {listing['name']}. Tengo experiencia y espacio.",
        "previous_experience": "5 años con perros y gatos"})
    show(f"solicitud {listing['name']}", r)

print("\n═══ 5. RECLAMOS DE SEGURO ═══")
plans = api("GET", "/aseguradoras/api/v1/insurance/plans", token=tok_aseg)
pol = api("GET", "/aseguradoras/api/v1/insurance/policies", token=tok_aseg)
pol_id = None
if isinstance(pol, list) and pol:
    pol_id = pol[0].get("id")
elif isinstance(pol, dict):
    pol_id = pol.get("id")
if not pol_id:
    # buscar la póliza creada antes
    r = api("POST", "/aseguradoras/api/v1/insurance/policies", token=tok_aseg, body={
        "pet_id": MAX, "insurer_id": "81585cc3-073e-4b37-8880-4995150555ac",
        "policy_number": "MICH-2026-0002", "coverage_details": "Cobertura amplia",
        "start_date": iso(0)[:10], "end_date": iso(365)[:10], "monthly_premium": 599, "status": "active"})
    pol_id = show("póliza (nueva)", r)
if pol_id:
    show("reclamo", api("POST", "/aseguradoras/api/v1/insurance/claims", token=tok_ana, body={
        "policy_id": pol_id, "amount_claimed": 1200,
        "reason": "Consulta por cojera y radiografías", "status": "pending",
        "medical_receipt_url": "https://example.com/receta.jpg"}))

print("\n═══ 6. VIAJE DE TRANSPORTE ═══")
show("viaje", api("POST", "/transportistas/api/v1/rides/request", token=tok_ana, body={
    "pet_id": MAX, "origin_address": "Calle Reforma 123, CDMX",
    "destination_address": "Hospital Michi Central, CDMX",
    "requires_carrier": True, "scheduled_at": iso(2),
    "notes": "Transporte para consulta veterinaria."}))

print("\n═══ 7. RECETAS EN CARNET ═══")
# crear una receta como vet sobre la consulta de Max
records = api("GET", f"/carnet/api/v1/records/pet/{MAX}", token=tok_vet)
if isinstance(records, list) and records:
    rec = records[0]
    show("receta", api("POST", "/carnet/api/v1/records/", token=tok_vet, body={
        "pet_id": MAX, "veterinarian_id": VET_PROFILE,
        "reason_for_visit": "Seguimiento de cojera", "diagnosis": "Esguince grado I en resolución",
        "treatment": "Meloxicam 0.1 mg/kg cada 24h por 3 días más. Reposo relativo.",
        "weight_kg": 28.3, "temperature_c": 38.5,
        "notes": "Evitar ejercicio intenso. Revisión en 5 días.",
        "prescriptions": [{
            "medication_name": "Meloxicam", "dosage": "0.1 mg/kg",
            "frequency_hours": 24, "duration_days": 5,
            "instructions": "Administrar con alimento. Suspender si hay vómito."
        }]}))

print("\n═══ 8. RESSEÑA DE PRODUCTO (si puede) ═══")
prods = api("GET", "/ecommerce/api/v1/products/")
if isinstance(prods, list) and prods:
    pid = prods[0]["id"]
    r = api("POST", f"/ecommerce/api/v1/products/{pid}/reviews", token=tok_ana, body={
        "rating": 5, "comment": "Excelente producto, mi mascota lo ama. Calidad premium."})
    show("reseña", r)

print("\n═══ 9. DONACIÓN ═══")
show("donación", api("POST", "/ecommerce/api/v1/donations/", token=tok_ana, body={
    "amount": 500, "campaign": "Apoyo a refugios Michi", "message": "Para los michis que buscan hogar."}))

print("\nListo.")
