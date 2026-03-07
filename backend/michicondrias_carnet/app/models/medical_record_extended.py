import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text, Float, Integer, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class MedicalRecordExtended(Base):
    """
    Extended Medical Record model for veterinary dashboard functionality.
    This extends the existing MedicalRecord with dashboard-specific fields.
    """
    __tablename__ = "medical_records_extended"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    original_record_id = Column(String, ForeignKey("medical_records.id"), nullable=False, unique=True, index=True)
    
    # Dashboard-specific fields
    status = Column(String(20), nullable=False, default="stable")  # stable, critical, emergency
    alert_level = Column(String(10), nullable=False, default="green")  # yellow, red, green
    next_checkup_date = Column(DateTime(timezone=True), nullable=True)
    follow_up_required = Column(Boolean, default=False)
    is_critical = Column(Boolean, default=False)
    emergency_contact_notified = Column(Boolean, default=False)
    
    # Additional clinical fields
    severity_score = Column(Integer, nullable=True)  # 1-10 severity scale
    prognosis = Column(String(50), nullable=True)  # good, fair, guarded, poor
    requires_hospitalization = Column(Boolean, default=False)
    estimated_recovery_days = Column(Integer, nullable=True)
    
    # Monitoring fields
    last_vitals_check = Column(DateTime(timezone=True), nullable=True)
    temperature_trend = Column(String(10), nullable=True)  # stable, rising, falling
    heart_rate_trend = Column(String(10), nullable=True)
    respiratory_rate_trend = Column(String(10), nullable=True)
    
    # Treatment response
    treatment_response = Column(String(20), nullable=True)  # improving, stable, worsening
    side_effects_observed = Column(Text, nullable=True)
    medication_adherence = Column(String(10), nullable=True)  # good, fair, poor
    
    # Financial and administrative
    treatment_cost_estimate = Column(Float, nullable=True)
    insurance_claim_status = Column(String(20), nullable=True)
    payment_status = Column(String(20), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    original_record = relationship("MedicalRecord", backref="extended_record")

    # Indexes for performance
    __table_args__ = (
        Index('idx_medical_extended_clinic_status', 'status', 'created_at'),
        Index('idx_medical_extended_alert_level', 'alert_level'),
        Index('idx_medical_extended_next_checkup', 'next_checkup_date'),
        Index('idx_medical_extended_critical', 'is_critical', 'alert_level'),
        Index('idx_medical_extended_clinic_critical', 'is_critical', 'status', 'created_at'),
    )

    def __repr__(self):
        return f"<MedicalRecordExtended(id={self.id}, status={self.status}, alert_level={self.alert_level})>"
