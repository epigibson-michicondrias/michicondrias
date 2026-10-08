"""F14 — Emisor de recordatorios del carnet.

Cada `REMINDERS_INTERVAL_SECONDS` manda a la bandeja del dueño (tabla `notifications`, misma BD que core):
- **Dosis de medicamento** que ya tocan (`medication_reminders.remind_at` vencido, sin marcar como dada y sin aviso).
  Las dosis viejas (más de `MED_GRACE`) se marcan como avisadas sin notificar, para no inundar la bandeja.
- **Refuerzos de vacuna** que vencen en los próximos `BOOSTER_LEAD` días (o vencieron hace menos de `BOOSTER_OVERDUE`).
  Un solo aviso por vacuna; si se cambia la fecha del refuerzo, `update_vaccine` limpia la marca y se vuelve a avisar.

Corre dentro del servicio (un solo proceso uvicorn en la VM); en Postgres además toma un advisory lock por si algún
día hay más de un proceso. Se apaga con `REMINDERS_JOB_ENABLED=false` (hazlo si algún día corre en Lambda/Mangum).
Las columnas `notified_at`/`booster_notified_at` (migración c14a7e2b9d01) van por SQL directo y no están en los
modelos: así el resto del carnet no truena si el código llega antes que la migración (aquí solo falla la pasada).
"""
import asyncio
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import SessionLocal

logger = logging.getLogger("michicondrias.reminders")

INTERVAL_SECONDS = int(os.getenv("REMINDERS_INTERVAL_SECONDS", "300"))
MED_GRACE = timedelta(hours=6)
BOOSTER_LEAD = timedelta(days=7)
BOOSTER_OVERDUE = timedelta(days=30)
LOCK_KEY = 14014  # advisory lock del job (arbitrario, único en la BD)

try:
    from zoneinfo import ZoneInfo
    LOCAL_TZ = ZoneInfo("America/Mexico_City")
except Exception:  # sin base de zonas horarias: México no usa horario de verano desde 2022
    LOCAL_TZ = timezone(timedelta(hours=-6))


def _as_utc(value) -> datetime | None:
    """Postgres devuelve datetime; SQLite, texto. Siempre a datetime con zona UTC."""
    if value is None:
        return None
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _format_day(value: datetime) -> str:
    return value.astimezone(LOCAL_TZ).strftime("%d/%m/%Y")


def _notify(db: Session, user_id: str, title: str, message: str, ntype: str, link: str) -> None:
    db.execute(text(
        "INSERT INTO notifications (id, user_id, title, message, type, is_read, link) "
        "VALUES (:id, :uid, :title, :msg, :type, false, :link)"
    ), {"id": str(uuid.uuid4()), "uid": user_id, "title": title, "msg": message, "type": ntype, "link": link})


def _pet_link(pet_id: str) -> str:
    return f"/mascotas/{pet_id}?tab=salud"


def _send_medication_reminders(db: Session, now: datetime) -> int:
    # remind_at es texto ISO en UTC con el mismo formato (isoformat), así que la comparación de cadenas es válida.
    rows = db.execute(text(
        "SELECT r.id, r.pet_id, r.remind_at, p.medication_name, p.dosage, pets.owner_id, pets.name "
        "FROM medication_reminders r "
        "JOIN prescriptions p ON p.id = r.prescription_id "
        "LEFT JOIN pets ON pets.id = r.pet_id "
        "WHERE r.sent = false AND r.notified_at IS NULL AND r.remind_at <= :now "
        "ORDER BY r.remind_at LIMIT 500"
    ), {"now": now.isoformat()}).fetchall()
    sent = 0
    for rid, pet_id, remind_at, med_name, dosage, owner_id, pet_name in rows:
        due = _as_utc(remind_at)
        if owner_id and due and now - due <= MED_GRACE:
            name = pet_name or "tu mascota"
            _notify(
                db, owner_id,
                title=f"Hora del medicamento de {name}",
                message=f"Toca darle {med_name} ({dosage}). Cuando se lo des, márcalo como tomado en su carnet.",
                ntype="recetas", link=_pet_link(pet_id),
            )
            sent += 1
        db.execute(text("UPDATE medication_reminders SET notified_at = :now WHERE id = :id"), {"now": now, "id": rid})
    return sent


def _send_booster_reminders(db: Session, now: datetime) -> int:
    rows = db.execute(text(
        "SELECT v.id, v.pet_id, v.name, v.next_due_date, pets.owner_id, pets.name "
        "FROM vaccines v LEFT JOIN pets ON pets.id = v.pet_id "
        "WHERE v.booster_notified_at IS NULL AND v.next_due_date IS NOT NULL "
        "AND v.next_due_date <= :until AND v.next_due_date >= :since "
        "LIMIT 500"
    ), {"until": now + BOOSTER_LEAD, "since": now - BOOSTER_OVERDUE}).fetchall()
    sent = 0
    for vid, pet_id, vaccine_name, due_raw, owner_id, pet_name in rows:
        due = _as_utc(due_raw)
        if owner_id and due:
            name = pet_name or "tu mascota"
            when = _format_day(due)
            message = (
                f"El refuerzo venció el {when}. Agenda la cita con su veterinario."
                if due < now else
                f"Le toca el {when}. Agenda la cita con su veterinario."
            )
            _notify(db, owner_id, title=f"Refuerzo de {vaccine_name} para {name}", message=message,
                    ntype="vacunas", link=_pet_link(pet_id))
            sent += 1
        db.execute(text("UPDATE vaccines SET booster_notified_at = :now WHERE id = :id"), {"now": now, "id": vid})
    return sent


def run_once(db: Session, now: datetime | None = None) -> dict:
    """Una pasada del emisor. Todo en una transacción: si algo falla, no queda nada marcado a medias."""
    now = now or datetime.now(timezone.utc)
    try:
        if db.bind.dialect.name == "postgresql":
            got_lock = db.execute(text("SELECT pg_try_advisory_xact_lock(:k)"), {"k": LOCK_KEY}).scalar()
            if not got_lock:
                db.rollback()
                return {"medication": 0, "boosters": 0, "skipped": True}
        result = {
            "medication": _send_medication_reminders(db, now),
            "boosters": _send_booster_reminders(db, now),
        }
        db.commit()
        return result
    except Exception:
        db.rollback()
        raise


def _run_with_session() -> dict:
    db = SessionLocal()
    try:
        return run_once(db)
    finally:
        db.close()


async def reminders_loop() -> None:
    while True:
        try:
            result = await asyncio.to_thread(_run_with_session)
            if result.get("medication") or result.get("boosters"):
                logger.info(f"Recordatorios enviados: {result}")
        except Exception as e:  # el job nunca debe tumbar el servicio
            logger.error(f"Fallo el emisor de recordatorios: {type(e).__name__}: {e}")
        await asyncio.sleep(INTERVAL_SECONDS)


def is_enabled() -> bool:
    return os.getenv("REMINDERS_JOB_ENABLED", "true").lower() not in ("0", "false", "no")
