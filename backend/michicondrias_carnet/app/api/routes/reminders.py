import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.carnet import MedicationReminderResponse
from pydantic import BaseModel
from app.api.pet_access import get_identity, assert_can_read_pet_record

router = APIRouter()

@router.get("/pet/{pet_id}", response_model=List[MedicationReminderResponse])
def read_reminders_by_pet(
    pet_id: str,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    identity: dict = Depends(get_identity),
) -> Any:
    """
    Retrieve medication reminders for a specific pet.
    Security: Only the pet owner or a registered veterinarian can view these reminders.
    """
    assert_can_read_pet_record(db, pet_id, identity)

    reminders = crud.crud_carnet.get_reminders_by_pet(
        db, pet_id=pet_id, unread_only=unread_only, skip=skip, limit=limit
    )
    return reminders

@router.post("/{reminder_id}/check", response_model=MedicationReminderResponse)
def check_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Mark a medication reminder as taken/completed.
    Security: Only the pet owner can register that the medication was administered.
    """
    reminder = db.query(crud.crud_carnet.MedicationReminder).filter(
        crud.crud_carnet.MedicationReminder.id == reminder_id
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Recordatorio no encontrado")
        
    # Check if user is the pet owner
    pet_result = db.execute(
        text("SELECT owner_id FROM pets WHERE id = :pet_id"),
        {"pet_id": reminder.pet_id}
    ).fetchone()
    
    if not pet_result or pet_result[0] != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para marcar este recordatorio como tomado")
        
    updated_reminder = crud.crud_carnet.check_reminder(db, reminder_id=reminder_id)
    return updated_reminder


# ── Tratamientos: cada medicamento recetado con sus tomas y el interruptor de avisos del dueño ──
# `reminders_enabled` (migración d7f3b8a1c925) va por SQL directo, como las columnas del emisor (app/jobs/reminders.py).

def _iso(value) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


@router.get("/pet/{pet_id}/treatments")
def read_treatments(pet_id: str, db: Session = Depends(get_db), identity: dict = Depends(get_identity)) -> Any:
    """Medicamentos recetados a la mascota, del más reciente al más antiguo, con sus tomas programadas.
    Cada tratamiento trae `status` (por-iniciar / en-curso / terminado) calculado de las fechas."""
    assert_can_read_pet_record(db, pet_id, identity)
    rows = db.execute(text(
        "SELECT p.id, p.medication_name, p.dosage, p.frequency_hours, p.duration_days, p.instructions, "
        "p.reminders_enabled, p.start_date, mr.id, mr.date "
        "FROM prescriptions p JOIN medical_records mr ON mr.id = p.medical_record_id "
        "WHERE mr.pet_id = :pid ORDER BY mr.date DESC"
    ), {"pid": pet_id}).fetchall()
    doses = db.execute(text(
        "SELECT id, prescription_id, remind_at, sent, taken_at FROM medication_reminders WHERE pet_id = :pid ORDER BY remind_at"
    ), {"pid": pet_id}).fetchall()
    by_rx: dict[str, list] = {}
    for d in doses:
        by_rx.setdefault(d[1], []).append({"id": d[0], "remind_at": d[2], "sent": bool(d[3]), "taken_at": d[4]})

    def _treatment_status(start_iso: str | None, record_iso: str, freq: int, days: int) -> str:
        start_raw = start_iso or record_iso
        start = start_raw if isinstance(start_raw, datetime) else datetime.fromisoformat(str(start_raw).replace("Z", "+00:00"))
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        end = start + timedelta(days=days or 0)
        now = datetime.now(timezone.utc)
        if now < start:
            return "por-iniciar"
        if now >= end:
            return "terminado"
        return "en-curso"

    return [
        {
            "prescription_id": r[0], "medication_name": r[1], "dosage": r[2], "frequency_hours": r[3],
            "duration_days": r[4], "instructions": r[5], "reminders_enabled": bool(r[6]) if r[6] is not None else True,
            "start_date": r[7], "record_id": r[8], "record_date": _iso(r[9]),
            "status": _treatment_status(r[7], str(r[9]), r[3], r[4]),
            "doses": by_rx.get(r[0], []),
        }
        for r in rows
    ]


class PrescriptionUpdate(BaseModel):
    enabled: bool | None = None
    start_date: str | None = None  # ISO date/datetime; el dueño indica cuándo empieza el tratamiento


@router.patch("/prescriptions/{prescription_id}")
def set_prescription_reminders(
    prescription_id: str,
    body: PrescriptionUpdate,
    db: Session = Depends(get_db),
    identity: dict = Depends(get_identity),
) -> Any:
    """El dueño gestiona un medicamento recetado:
    - `enabled`: activa o desactiva los avisos. Al activarlo, si no hay tomas programadas se crean.
    - `start_date`: indica cuándo empieza el tratamiento (p. ej. cuando compró el medicamento).
      Reprograma las tomas desde esa fecha; las tomas ya marcadas como tomadas se conservan como historial."""
    row = db.execute(text(
        "SELECT p.frequency_hours, p.duration_days, mr.date, mr.pet_id, pets.owner_id, p.start_date "
        "FROM prescriptions p JOIN medical_records mr ON mr.id = p.medical_record_id "
        "LEFT JOIN pets ON pets.id = mr.pet_id WHERE p.id = :id"
    ), {"id": prescription_id}).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    freq, days, record_date, pet_id, owner_id, current_start = row
    if owner_id != identity["user_id"]:
        raise HTTPException(status_code=403, detail="Solo el dueño de la mascota decide sobre sus tratamientos")

    if body.enabled is not None:
        db.execute(text("UPDATE prescriptions SET reminders_enabled = :on WHERE id = :id"), {"on": body.enabled, "id": prescription_id})

    doses_created = 0
    # Fecha de inicio efectiva: la que fija el dueño, o la de la consulta
    start_raw = body.start_date or current_start or record_date
    start = start_raw if isinstance(start_raw, datetime) else datetime.fromisoformat(str(start_raw).replace("Z", "+00:00"))
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)

    if body.start_date is not None:
        db.execute(text("UPDATE prescriptions SET start_date = :sd WHERE id = :id"), {"sd": body.start_date, "id": prescription_id})
        # Reprogramar: borrar tomas no marcadas (las tomadas son historial) y recrear desde la nueva fecha
        db.execute(text("DELETE FROM medication_reminders WHERE prescription_id = :id AND sent = false"), {"id": prescription_id})
    elif body.enabled is True:
        has_doses = db.execute(text("SELECT 1 FROM medication_reminders WHERE prescription_id = :id LIMIT 1"), {"id": prescription_id}).first()
        if has_doses:
            db.commit()
            return {"prescription_id": prescription_id, "reminders_enabled": body.enabled, "doses_created": 0}

    # (Re)programar tomas desde la fecha de inicio
    if freq and freq > 0 and days and days > 0 and (body.start_date is not None or body.enabled is True):
        now = datetime.now(timezone.utc)
        total = min((days * 24) // freq, 400)
        for i in range(total):
            at = start + timedelta(hours=freq * i)
            if body.start_date is None and at < now - timedelta(hours=freq):
                continue  # sin fecha explícita: no se inventan tomas ya pasadas
            db.execute(text(
                "INSERT INTO medication_reminders (id, prescription_id, pet_id, remind_at, sent) VALUES (:id, :rx, :pid, :at, false)"
            ), {"id": str(uuid.uuid4()), "rx": prescription_id, "pid": pet_id, "at": at.isoformat()})
            doses_created += 1
    db.commit()
    return {"prescription_id": prescription_id, "reminders_enabled": body.enabled, "doses_created": doses_created, "start_date": body.start_date}
