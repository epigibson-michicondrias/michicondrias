from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text, Float, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, index=True, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="category")


class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    is_active = Column(Boolean, default=True)

    category = relationship("Category", back_populates="subcategories")
    products = relationship("Product", back_populates="subcategory")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    subcategory_id = Column(String, ForeignKey("subcategories.id"), nullable=True)
    
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    seller_id = Column(String, index=True, nullable=True)

    category = relationship("Category", back_populates="products")
    subcategory = relationship("Subcategory", back_populates="products")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, index=True, nullable=True) # Refers to users.id from core app. Null for anonymous.
    amount = Column(Float, nullable=False)
    currency = Column(String, default="MXN")
    message = Column(Text, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="completed") # e.g. "pending", "completed", "failed"
