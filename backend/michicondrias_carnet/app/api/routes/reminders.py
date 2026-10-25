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
    """Medicamentos recetados a la mascota, del más reciente al más antiguo, con sus tomas programadas."""
    assert_can_read_pet_record(db, pet_id, identity)
    rows = db.execute(text(
        "SELECT p.id, p.medication_name, p.dosage, p.frequency_hours, p.duration_days, p.instructions, "
        "p.reminders_enabled, mr.id, mr.date "
        "FROM prescriptions p JOIN medical_records mr ON mr.id = p.medical_record_id "
        "WHERE mr.pet_id = :pid ORDER BY mr.date DESC"
    ), {"pid": pet_id}).fetchall()
    doses = db.execute(text(
        "SELECT id, prescription_id, remind_at, sent FROM medication_reminders WHERE pet_id = :pid ORDER BY remind_at"
    ), {"pid": pet_id}).fetchall()
    by_rx: dict[str, list] = {}
    for d in doses:
        by_rx.setdefault(d[1], []).append({"id": d[0], "remind_at": d[2], "sent": bool(d[3])})
    return [
        {
            "prescription_id": r[0], "medication_name": r[1], "dosage": r[2], "frequency_hours": r[3],
            "duration_days": r[4], "instructions": r[5], "reminders_enabled": bool(r[6]) if r[6] is not None else True,
            "record_id": r[7], "record_date": _iso(r[8]), "doses": by_rx.get(r[0], []),
        }
        for r in rows
    ]


class RemindersToggle(BaseModel):
    enabled: bool


@router.patch("/prescriptions/{prescription_id}")
def set_prescription_reminders(
    prescription_id: str,
    body: RemindersToggle,
    db: Session = Depends(get_db),
    identity: dict = Depends(get_identity),
) -> Any:
    """El dueño activa o desactiva los avisos de un medicamento. Al activarlo, si la receta no tiene tomas
    programadas (recetas anteriores al emisor), se programan desde la toma que toca ahora hasta el fin del tratamiento."""
    row = db.execute(text(
        "SELECT p.frequency_hours, p.duration_days, mr.date, mr.pet_id, pets.owner_id "
        "FROM prescriptions p JOIN medical_records mr ON mr.id = p.medical_record_id "
        "LEFT JOIN pets ON pets.id = mr.pet_id WHERE p.id = :id"
    ), {"id": prescription_id}).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    freq, days, record_date, pet_id, owner_id = row
    if owner_id != identity["user_id"]:
        raise HTTPException(status_code=403, detail="Solo el dueño de la mascota decide si recibe los avisos")

    db.execute(text("UPDATE prescriptions SET reminders_enabled = :on WHERE id = :id"), {"on": body.enabled, "id": prescription_id})
    created = 0
    has_doses = db.execute(text("SELECT 1 FROM medication_reminders WHERE prescription_id = :id LIMIT 1"), {"id": prescription_id}).first()
    if body.enabled and not has_doses and freq and freq > 0 and days and days > 0:
        start = record_date if isinstance(record_date, datetime) else datetime.fromisoformat(str(record_date).replace("Z", "+00:00"))
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        total = min((days * 24) // freq, 400)
        for i in range(total):
            at = start + timedelta(hours=freq * i)
            if at < now - timedelta(hours=freq):
                continue  # tomas ya pasadas: no se inventa si se dieron o no
            db.execute(text(
                "INSERT INTO medication_reminders (id, prescription_id, pet_id, remind_at, sent) VALUES (:id, :rx, :pid, :at, false)"
            ), {"id": str(uuid.uuid4()), "rx": prescription_id, "pid": pet_id, "at": at.isoformat()})
            created += 1
    db.commit()
    return {"prescription_id": prescription_id, "reminders_enabled": body.enabled, "doses_created": created}
