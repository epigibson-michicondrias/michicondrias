import uuid
from sqlalchemy import Column, String, Date, Text, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class Pet(Base):
    __tablename__ = "pets"

    id = Column(String(36), primary_key=True)
    status = Column(String(50))

class PetDeath(Base):
    __tablename__ = "pet_deaths"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id = Column(String(36), nullable=False)
    funerary_id = Column(String(36), nullable=False)
    date_of_death = Column(Date, nullable=False)
    cause_of_death = Column(String(255), nullable=True)
    cremation_type = Column(String(50), nullable=True)  # 'individual', 'collective', 'no_cremation'
    urn_model = Column(String(100), nullable=True)
    certificate_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

class PetMemorialPost(Base):
    __tablename__ = "pet_memorial_posts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id = Column(String(36), nullable=False)
    user_id = Column(String(36), nullable=False)
    message = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
