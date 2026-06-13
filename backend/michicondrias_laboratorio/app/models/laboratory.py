import uuid
from sqlalchemy import Column, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class LabOrder(Base):
    __tablename__ = "lab_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id = Column(String(36), nullable=False, index=True)
    requesting_vet_id = Column(String(36), nullable=True, index=True)
    lab_id = Column(String(36), nullable=True, index=True)
    test_names = Column(ARRAY(String(255)), nullable=False)
    status = Column(String(30), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to LabResult
    results = relationship("LabResult", back_populates="order", cascade="all, delete-orphan")


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("lab_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    parameter_name = Column(String(100), nullable=False)
    measured_value = Column(Float, nullable=False)
    reference_range = Column(String(50), nullable=True)
    unit = Column(String(20), nullable=True)
    is_anomaly = Column(Boolean, default=False)
    pdf_report_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to LabOrder
    order = relationship("LabOrder", back_populates="results")
