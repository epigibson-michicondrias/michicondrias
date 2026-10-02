from typing import List
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.session import engine
from app.models.sighting import LostPetSighting
from app.schemas.sighting import SightingCreate

_table_ready = False


def _ensure_table() -> None:
    """Crea la tabla de avistamientos si aún no existe (idempotente, una vez por proceso)."""
    global _table_ready
    if not _table_ready:
        LostPetSighting.__table__.create(bind=engine, checkfirst=True)
        _table_ready = True


def create_sighting(db: Session, report_id: str, reporter_id: str, data: SightingCreate) -> LostPetSighting:
    _ensure_table()
    sighting = LostPetSighting(report_id=report_id, reporter_id=reporter_id, **data.model_dump())
    db.add(sighting)
    db.commit()
    db.refresh(sighting)
    return sighting


def list_sightings(db: Session, report_id: str) -> List[LostPetSighting]:
    _ensure_table()
    return db.query(LostPetSighting).filter(LostPetSighting.report_id == report_id).order_by(desc(LostPetSighting.created_at)).all()
