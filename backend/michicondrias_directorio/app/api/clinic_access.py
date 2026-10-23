"""Acceso a la clínica: dueño, o veterinario asociado a ella (perfil en `veterinarians`)."""
from sqlalchemy import text
from sqlalchemy.orm import Session


def is_clinic_staff(db: Session, user_id: str, clinic_id: str) -> bool:
    row = db.execute(text(
        "SELECT 1 FROM clinics WHERE id = :cid AND owner_user_id = :uid "
        "UNION ALL "
        "SELECT 1 FROM veterinarians WHERE clinic_id = :cid AND user_id = :uid LIMIT 1"
    ), {"cid": clinic_id, "uid": user_id}).first()
    return bool(row)
