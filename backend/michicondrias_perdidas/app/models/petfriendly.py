import uuid
from sqlalchemy import Column, String, Text, DateTime, Float, Integer
from sqlalchemy.sql import func
from app.db.session import Base


class PetfriendlyPlace(Base):
    __tablename__ = "petfriendly_places"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    added_by = Column(String, nullable=False, index=True)

    name = Column(String(200), nullable=False)
    category = Column(String(60), nullable=False)  # restaurante, cafe, parque, hotel, tienda, veterinaria
    address = Column(String(300), nullable=True)
    city = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    phone = Column(String(30), nullable=True)
    website = Column(String(255), nullable=True)
    rating = Column(Integer, default=0)  # 1-5

    pet_sizes_allowed = Column(String(60), default="todos")  # pequeños, medianos, grandes, todos
    has_water_bowls = Column(String(10), default="no")
    has_pet_menu = Column(String(10), default="no")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
