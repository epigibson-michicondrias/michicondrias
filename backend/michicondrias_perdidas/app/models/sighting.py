import uuid
from sqlalchemy import Column, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.db.session import Base


class LostPetSighting(Base):
    """Avistamiento: un usuario avisa que vio a la mascota de un reporte."""
    __tablename__ = "lost_pet_sightings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String, nullable=False, index=True)
    reporter_id = Column(String, nullable=False, index=True)
    location_text = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
