from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

class MedicalRecordExtended(Base):
    """
    Extended Medical Record model for veterinary dashboard functionality.
    This matches the Supabase table structure.
    """
    __tablename__ = "medical_records_extended"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_record_id = Column(String, nullable=False)  # TEXT en Supabase
    clinic_id = Column(String, nullable=True)  # TEXT en Supabase
    
    # Dashboard-specific fields
    status = Column(String(20), nullable=False, default="stable")
    alert_level = Column(String(10), nullable=False, default="green")
    next_checkup_date = Column(DateTime(timezone=True))
    follow_up_required = Column(Boolean, default=False)
    is_critical = Column(Boolean, default=False)
    emergency_contact_notified = Column(Boolean, default=False)
    
    # Additional clinical fields
    severity_score = Column(Integer)
    prognosis = Column(String(50))
    requires_hospitalization = Column(Boolean, default=False)
    estimated_recovery_days = Column(Integer)
    
    # Monitoring fields
    last_vitals_check = Column(DateTime(timezone=True))
    temperature_trend = Column(String(10))
    heart_rate_trend = Column(String(10))
    respiratory_rate_trend = Column(String(10))
    
    # Treatment response
    treatment_response = Column(String(20))
    side_effects_observed = Column(Text)
    medication_adherence = Column(String(10))
    
    # Financial and administrative
    treatment_cost_estimate = Column(Float)
    insurance_claim_status = Column(String(20))
    payment_status = Column(String(20))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<MedicalRecordExtended(id={self.id}, status={self.status}, alert_level={self.alert_level})>"


class ClinicMetrics(Base):
    """
    Clinic metrics model for dashboard functionality.
    This matches the Supabase table structure.
    """
    __tablename__ = "clinic_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(String, nullable=False)  # TEXT en Supabase
    metric_date = Column(DateTime, nullable=False)
    
    # Appointment metrics
    today_appointments = Column(Integer, default=0)
    pending_confirmations = Column(Integer, default=0)
    surgeries_today = Column(Integer, default=0)
    emergency_cases = Column(Integer, default=0)
    vaccinations_today = Column(Integer, default=0)
    checkups_today = Column(Integer, default=0)
    
    # Clinical metrics
    lab_results_pending = Column(Integer, default=0)
    prescriptions_active = Column(Integer, default=0)
    critical_patients = Column(Integer, default=0)
    
    # Business metrics
    inventory_alerts = Column(Integer, default=0)
    daily_revenue = Column(Float, default=0)
    occupancy_rate = Column(Integer, default=0)
    new_patients_today = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<ClinicMetrics(id={self.id}, clinic_id={self.clinic_id}, date={self.metric_date})>"


class ClinicAlerts(Base):
    """
    Clinic alerts model for dashboard functionality.
    This matches the Supabase table structure.
    """
    __tablename__ = "clinic_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(String, nullable=False)  # TEXT en Supabase
    
    # Alert information
    type = Column(String(20), nullable=False)
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(10), nullable=False)
    
    # Metadata
    icon = Column(String(50))
    color = Column(String(7))  # Hex color
    is_read = Column(Boolean, default=False)
    action_url = Column(Text)
    
    # Relationships (ajustados a TEXT)
    patient_id = Column(String)
    appointment_id = Column(String)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))

    def __repr__(self):
        return f"<ClinicAlerts(id={self.id}, type={self.type}, priority={self.priority})>"


class InventoryItems(Base):
    """
    Inventory items model for dashboard functionality.
    This matches the Supabase table structure.
    """
    __tablename__ = "inventory_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(String, nullable=False)  # TEXT en Supabase
    
    # Item information
    name = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    unit = Column(String(20), nullable=False)  # ml, mg, tablets, etc.
    
    # Stock management
    current_stock = Column(Float, nullable=False, default=0)
    min_stock = Column(Float, nullable=False, default=0)
    max_stock = Column(Float, nullable=False, default=0)
    reorder_point = Column(Float)
    
    # Supplier information
    supplier = Column(String(100))
    supplier_contact = Column(String(100))
    cost_per_unit = Column(Float)
    selling_price = Column(Float)
    
    # Medical specifics
    is_medication = Column(Boolean, default=False)
    requires_prescription = Column(Boolean, default=False)
    storage_requirements = Column(Text)
    expiry_date = Column(DateTime)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_critical = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_restocked_at = Column(DateTime(timezone=True))

    def __repr__(self):
        return f"<InventoryItems(id={self.id}, name={self.name}, stock={self.current_stock})>"


class LabTests(Base):
    """
    Lab tests model for dashboard functionality.
    This matches the Supabase table structure.
    """
    __tablename__ = "lab_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(String, nullable=False)  # TEXT en Supabase
    patient_id = Column(String, nullable=False)  # TEXT en Supabase
    
    # Test information
    test_type = Column(String(50), nullable=False)
    test_name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Status tracking
    status = Column(String(20), nullable=False, default="pending")
    
    # Dates
    requested_date = Column(DateTime(timezone=True), server_default=func.now())
    sample_collection_date = Column(DateTime(timezone=True))
    completed_date = Column(DateTime(timezone=True))
    
    # Results
    results = Column(JSON)  # Flexible structure for different test types
    interpretation = Column(Text)
    recommendations = Column(Text)
    
    # Staff (ajustados a TEXT)
    requesting_vet_id = Column(String)
    processing_tech_id = Column(String)
    
    # Financial
    cost = Column(Float)
    is_paid = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<LabTests(id={self.id}, test_name={self.test_name}, status={self.status})>"


class Surgeries(Base):
    """
    Surgeries model for dashboard functionality.
    This matches the Supabase table structure.
    """
    __tablename__ = "surgeries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(String, nullable=False)  # TEXT en Supabase
    patient_id = Column(String, nullable=False)  # TEXT en Supabase
    
    # Surgery information
    surgery_type = Column(String(50), nullable=False)
    surgery_name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Scheduling
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    estimated_duration = Column(Integer)  # in minutes
    actual_duration = Column(Integer)  # in minutes
    
    # Staff (ajustados a TEXT)
    surgeon_id = Column(String)
    assistant_ids = Column(JSON)  # Array of assistant vet IDs
    
    # Operating room
    operating_room = Column(String(20))
    equipment_needed = Column(JSON)
    
    # Anesthesia
    anesthesia_type = Column(String(50))
    anesthesiologist_id = Column(String)
    
    # Status tracking
    status = Column(String(20), nullable=False, default="scheduled")
    
    # Medical information
    pre_op_notes = Column(Text)
    post_op_notes = Column(Text)
    complications = Column(Text)
    
    # Financial
    estimated_cost = Column(Float)
    actual_cost = Column(Float)
    is_paid = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Surgeries(id={self.id}, surgery_name={self.surgery_name}, status={self.status})>"
