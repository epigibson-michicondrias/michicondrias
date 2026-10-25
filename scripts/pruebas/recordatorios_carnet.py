"""Prueba local del emisor de recordatorios del carnet (sin tocar producción): consulta con receta, dosis
programadas, el emisor avisa a tiempo y marcar como tomada.

Uso: cd backend/michicondrias_carnet && DATABASE_URL=postgresql://u:p@127.0.0.1:1/x SECRET_KEY=x \
     ../.venv/bin/python ../../scripts/pruebas/recordatorios_carnet.py
Debe imprimir dosis que empiezan en +0 h, una pasada que avisa la primera toma de cada medicamento, otra que no
repite, «notificaciones: 4», «tomada: 1» y «OK» en todas las pruebas del interruptor de avisos.
"""
import sys; sys.path.insert(0, '.')
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db.session import Base
import app.models.carnet  # noqa
from app.crud import crud_carnet
from app.schemas.carnet import MedicalRecordCreate
from app.jobs.reminders import run_once

eng = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
Base.metadata.create_all(eng, tables=[t for n, t in Base.metadata.tables.items() if n in ("medical_records", "prescriptions", "medication_reminders", "vaccines")])
db = sessionmaker(bind=eng)()
db.execute(text("ALTER TABLE medication_reminders ADD COLUMN notified_at TEXT"))
db.execute(text("ALTER TABLE vaccines ADD COLUMN booster_notified_at TEXT"))
db.execute(text("ALTER TABLE prescriptions ADD COLUMN reminders_enabled BOOLEAN NOT NULL DEFAULT 1"))
db.execute(text("CREATE TABLE pets (id TEXT, owner_id TEXT, name TEXT)"))
db.execute(text("CREATE TABLE notifications (id TEXT, user_id TEXT, title TEXT, message TEXT, type TEXT, is_read BOOLEAN, link TEXT)"))
db.execute(text("CREATE TABLE veterinarians (id TEXT, user_id TEXT)"))
db.execute(text("INSERT INTO pets VALUES ('p1','owner1','Luna')")); db.commit()

rec = crud_carnet.create_medical_record(db, MedicalRecordCreate(pet_id="p1", reason_for_visit="Control", prescriptions=[
    {"medication_name": "Meloxicam", "dosage": "0.5 ml", "frequency_hours": 24, "duration_days": 5},
    {"medication_name": "Amoxicilina", "dosage": "1/4", "frequency_hours": 12, "duration_days": 7},
    {"medication_name": "Raro", "dosage": "1", "frequency_hours": 36, "duration_days": 5},
]), vet_id=None)
for p in rec.prescriptions:
    rows = db.execute(text("SELECT remind_at FROM medication_reminders WHERE prescription_id=:id ORDER BY remind_at"), {"id": p.id}).fetchall()
    first = datetime.fromisoformat(rows[0][0]); last = datetime.fromisoformat(rows[-1][0])
    print(f"{p.medication_name}: {len(rows)} dosis · primera +{(first - datetime.now(timezone.utc)).total_seconds()/3600:.1f} h · última +{(last-first).total_seconds()/3600:.0f} h")

now = datetime.now(timezone.utc) + timedelta(minutes=5)
print("pasada 1:", run_once(db, now))           # primera toma de cada medicamento
print("pasada 2 (misma hora):", run_once(db, now))  # no repite
print("pasada +12h:", run_once(db, now + timedelta(hours=12)))  # 2.ª toma de amoxicilina
print("notificaciones:", db.execute(text("SELECT count(*) FROM notifications WHERE user_id='owner1' AND type='recetas'")).scalar())
print(db.execute(text("SELECT title, message, link FROM notifications LIMIT 1")).fetchone())
r = db.execute(text("SELECT id FROM medication_reminders LIMIT 1")).scalar()
crud_carnet.check_reminder(db, r); print("tomada:", db.execute(text("SELECT sent FROM medication_reminders WHERE id=:i"), {"i": r}).scalar())

# ── Interruptor de avisos del dueño (PATCH /reminders/prescriptions/{id}) y tratamientos (GET …/treatments) ──
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from app.api.pet_access import get_identity
from app.api import deps as api_deps
app.dependency_overrides[get_db] = lambda: db
c = TestClient(app)
def as_user(uid, role="consumidor"):
    app.dependency_overrides[get_identity] = lambda: {"user_id": uid, "role": role}
    app.dependency_overrides[api_deps.get_current_user_id] = lambda: uid
melox = next(p for p in rec.prescriptions if p.medication_name == "Meloxicam")

def check(name, ok): print(("OK  " if ok else "FALLA ") + name)

as_user("otro"); check("ajeno no puede cambiar los avisos (403)", c.patch(f"/api/v1/reminders/prescriptions/{melox.id}", json={"enabled": False}).status_code == 403)
as_user("owner1"); r = c.patch(f"/api/v1/reminders/prescriptions/{melox.id}", json={"enabled": False}); check("dueño apaga los avisos", r.status_code == 200 and r.json()["reminders_enabled"] is False)
before = db.execute(text("SELECT count(*) FROM notifications")).scalar()
run_once(db, now + timedelta(hours=24, minutes=1))
sent_melox = db.execute(text("SELECT count(*) FROM notifications WHERE message LIKE '%Meloxicam%'")).scalar()
check("apagado: no llega el aviso de la 2.ª toma de Meloxicam", sent_melox == 1)
check("apagado: los demás medicamentos sí avisan", db.execute(text("SELECT count(*) FROM notifications")).scalar() > before)

# Receta vieja sin tomas (como la Clorhexidina): al activar, se programan desde la toma que toca
old_date = (datetime.now(timezone.utc) - timedelta(days=9)).isoformat()
db.execute(text("INSERT INTO medical_records (id, pet_id, date, reason_for_visit) VALUES ('mr-old','p1',:d,'Limpieza')"), {"d": old_date})
db.execute(text("INSERT INTO prescriptions (id, medical_record_id, medication_name, dosage, frequency_hours, duration_days, reminders_enabled) VALUES ('rx-old','mr-old','Clorhexidina','10 ml',24,30,1)"))
db.commit()
r = c.patch("/api/v1/reminders/prescriptions/rx-old", json={"enabled": True}).json()
check(f"receta vieja: se programan las tomas que faltan ({r['doses_created']} de 30)", 20 <= r["doses_created"] <= 22)
r2 = c.patch("/api/v1/reminders/prescriptions/rx-old", json={"enabled": True}).json()
check("activar otra vez no duplica tomas", r2["doses_created"] == 0)

t = c.get("/api/v1/reminders/pet/p1/treatments").json()
old = next(x for x in t if x["prescription_id"] == "rx-old")
check("tratamientos: trae cada medicamento con sus tomas y el interruptor", len(t) == 4 and len(old["doses"]) == r["doses_created"] and old["reminders_enabled"] is True)
check("tratamientos: Meloxicam aparece con avisos apagados", next(x for x in t if x["prescription_id"] == melox.id)["reminders_enabled"] is False)

# ── Fecha de inicio del tratamiento (el dueño la fija) y sello de cada toma ──
# El dueño empieza mañana: las tomas se reprograman desde esa fecha
tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
r = c.patch(f"/api/v1/reminders/prescriptions/{melox.id}", json={"start_date": tomorrow}).json()
check("fecha de inicio: se reprograman las tomas", r["doses_created"] == 5 and r["start_date"] == tomorrow)
t = c.get("/api/v1/reminders/pet/p1/treatments").json()
melox_t = next(x for x in t if x["prescription_id"] == melox.id)
check("fecha de inicio: status por-iniciar", melox_t["status"] == "por-iniciar")
check("fecha de inicio: start_date en la respuesta", melox_t["start_date"] == tomorrow)

# Marcar una toma como tomada guarda el sello de tiempo
dose_id = melox_t["doses"][0]["id"]
as_user("owner1")
c.patch(f"/api/v1/reminders/prescriptions/{melox.id}", json={"start_date": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()})
t = c.get("/api/v1/reminders/pet/p1/treatments").json()
melox_t = next(x for x in t if x["prescription_id"] == melox.id)
check("al volver al pasado: status en-curso", melox_t["status"] == "en-curso")
first_dose = melox_t["doses"][0]["id"]
c.post(f"/api/v1/reminders/{first_dose}/check")
t = c.get("/api/v1/reminders/pet/p1/treatments").json()
melox_t = next(x for x in t if x["prescription_id"] == melox.id)
checked = next(d for d in melox_t["doses"] if d["id"] == first_dose)
check("toma marcada: sent y taken_at", checked["sent"] is True and checked["taken_at"] is not None)

# Tratamiento terminado: todas las tomas marcadas
for d in melox_t["doses"]:
    if not d["sent"]:
        c.post(f"/api/v1/reminders/{d['id']}/check")
t = c.get("/api/v1/reminders/pet/p1/treatments").json()
melox_t = next(x for x in t if x["prescription_id"] == melox.id)
check("todas las tomas marcadas", all(d["sent"] for d in melox_t["doses"]))

# Historial: cada toma tomada trae taken_at
check("historial: taken_at en cada toma tomada", all(d["taken_at"] for d in melox_t["doses"]))
