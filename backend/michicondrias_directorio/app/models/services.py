from sqlalchemy import Column, String, Integer, Text, ForeignKey, Boolean, Date, Time, Float
from app.models.base import BaseModel


class ClinicService(BaseModel):
    """Services offered by a clinic (consulta, vacunación, cirugía, etc.)"""
    __tablename__ = "clinic_services"

    clinic_id = Column(String(36), ForeignKey("clinics.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)  # Price in MXN, null = "Consultar"
    duration_minutes = Column(Integer, nullable=False, default=30)
    category = Column(String(100), nullable=True)  # e.g. "Consulta", "Vacunación", "Cirugía"
    is_active = Column(Boolean, default=True)


class ClinicSchedule(BaseModel):
    """Weekly recurring schedule template for a clinic."""
    __tablename__ = "clinic_schedules"

    clinic_id = Column(String(36), ForeignKey("clinics.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)       # e.g. 09:00
    end_time = Column(Time, nullable=False)          # e.g. 18:00
    slot_duration_minutes = Column(Integer, nullable=False, default=30)
    is_active = Column(Boolean, default=True)


class ScheduleException(BaseModel):
    """Holidays, closures, or custom hours for a specific date."""
    __tablename__ = "schedule_exceptions"

    clinic_id = Column(String(36), ForeignKey("clinics.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    is_closed = Column(Boolean, default=True)  # True = entire day closed
    custom_start = Column(Time, nullable=True)  # Override hours if not fully closed
    custom_end = Column(Time, nullable=True)
    reason = Column(String(255), nullable=True)  # "Día Festivo", "Mantenimiento"


class Appointment(BaseModel):
    """A booked appointment between a consumer and a clinic."""
    __tablename__ = "appointments"

    clinic_id = Column(String(36), ForeignKey("clinics.id"), nullable=False, index=True)
    service_id = Column(String(36), ForeignKey("clinic_services.id"), nullable=False, index=True)
    pet_id = Column(String(36), nullable=False, index=True)  # From mascotas microservice
    user_id = Column(String(36), nullable=False, index=True)  # Consumer who books
    vet_id = Column(String(36), ForeignKey("veterinarians.id"), nullable=True)  # Optional specific vet
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    # Statuses: pending, confirmed, completed, cancelled, no_show
    notes = Column(Text, nullable=True)  # Consumer notes
    cancellation_reason = Column(Text, nullable=True)


class AppointmentReminder(BaseModel):
    """Scheduled reminders for appointments."""
    __tablename__ = "appointment_reminders"

    appointment_id = Column(String(36), ForeignKey("appointments.id"), nullable=False, index=True)
    remind_at = Column(String(50), nullable=False)  # ISO datetime string
    reminder_type = Column(String(30), nullable=False, default="in_app")  # in_app, email, push
    sent = Column(Boolean, default=False)
