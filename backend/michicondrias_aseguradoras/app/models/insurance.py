import uuid
from sqlalchemy import Column, String, Text, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class PetInsurancePolicy(Base):
    __tablename__ = "pet_insurance_policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id = Column(String(36), nullable=False, index=True)
    insurer_id = Column(String(36), nullable=False, index=True)
    policy_number = Column(String(100), nullable=False, unique=True)
    coverage_details = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    monthly_premium = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="active")

    claims = relationship("InsuranceClaim", back_populates="policy", cascade="all, delete-orphan")

class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id = Column(String(36), ForeignKey("pet_insurance_policies.id"), nullable=False, index=True)
    amount_claimed = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    medical_receipt_url = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="pending")

    policy = relationship("PetInsurancePolicy", back_populates="claims")
