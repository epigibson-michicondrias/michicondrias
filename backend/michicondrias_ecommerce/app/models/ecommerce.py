import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text, Float, Integer
from sqlalchemy.sql import func
from app.db.session import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    category = Column(String, index=True, nullable=True) # e.g. "food", "toys", "accessories"
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    seller_id = Column(String, index=True, nullable=True) # Refers to users.id for multi-vendor

class Donation(Base):
    __tablename__ = "donations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, index=True, nullable=True) # Refers to users.id from core app. Null for anonymous.
    amount = Column(Float, nullable=False)
    currency = Column(String, default="MXN")
    message = Column(Text, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="completed") # e.g. "pending", "completed", "failed"
