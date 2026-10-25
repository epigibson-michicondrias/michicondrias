"""Prueba local del emisor de recordatorios del carnet (sin tocar producción): consulta con receta, dosis
programadas, el emisor avisa a tiempo y marcar como tomada.

Uso: cd backend/michicondrias_carnet && DATABASE_URL=postgresql://u:p@127.0.0.1:1/x SECRET_KEY=x \
     ../.venv/bin/python ../../scripts/pruebas/recordatorios_carnet.py
Debe imprimir dosis que empiezan en +0 h, una pasada que avisa la primera toma de cada medicamento, otra que no
repite, «notificaciones: 4» y «tomada: 1».
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
