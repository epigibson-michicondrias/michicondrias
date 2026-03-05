from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.services import ClinicService, ClinicSchedule, ScheduleException, Appointment, AppointmentReminder
from app.schemas.services import (
    ClinicServiceCreate, ClinicServiceUpdate,
    ClinicScheduleCreate,
    ScheduleExceptionCreate,
    AppointmentCreate,
)


# ============================================================
# CLINIC SERVICES CRUD
# ============================================================

def get_clinic_services(db: Session, clinic_id: str):
    return db.query(ClinicService).filter(
        ClinicService.clinic_id == clinic_id,
        ClinicService.is_active == True
    ).all()

def get_service(db: Session, service_id: str):
    return db.query(ClinicService).filter(ClinicService.id == service_id).first()

def create_clinic_service(db: Session, clinic_id: str, service: ClinicServiceCreate):
    db_svc = ClinicService(
        clinic_id=clinic_id,
        **service.model_dump()
    )
    db.add(db_svc)
    db.commit()
    db.refresh(db_svc)
    return db_svc

def update_clinic_service(db: Session, db_svc: ClinicService, update: ClinicServiceUpdate):
    for key, value in update.model_dump(exclude_unset=True).items():
        setattr(db_svc, key, value)
    db.add(db_svc)
    db.commit()
    db.refresh(db_svc)
    return db_svc

def delete_clinic_service(db: Session, service_id: str):
    svc = db.query(ClinicService).filter(ClinicService.id == service_id).first()
    if svc:
        svc.is_active = False  # Soft delete
        db.commit()
        db.refresh(svc)
    return svc


# ============================================================
# CLINIC SCHEDULE CRUD
# ============================================================

def get_clinic_schedule(db: Session, clinic_id: str):
    return db.query(ClinicSchedule).filter(
        ClinicSchedule.clinic_id == clinic_id,
        ClinicSchedule.is_active == True
    ).order_by(ClinicSchedule.day_of_week).all()

def set_clinic_schedule(db: Session, clinic_id: str, schedules: list[ClinicScheduleCreate]):
    """Replace the entire weekly schedule for a clinic."""
    # Deactivate existing
    db.query(ClinicSchedule).filter(ClinicSchedule.clinic_id == clinic_id).update({"is_active": False})
    db.commit()

    results = []
    for s in schedules:
        db_schedule = ClinicSchedule(
            clinic_id=clinic_id,
            day_of_week=s.day_of_week,
            start_time=time.fromisoformat(s.start_time),
            end_time=time.fromisoformat(s.end_time),
            slot_duration_minutes=s.slot_duration_minutes,
            is_active=True,
        )
        db.add(db_schedule)
        results.append(db_schedule)
    db.commit()
    for r in results:
        db.refresh(r)
    return results


# ============================================================
# SCHEDULE EXCEPTIONS CRUD
# ============================================================

def get_schedule_exceptions(db: Session, clinic_id: str):
    return db.query(ScheduleException).filter(
        ScheduleException.clinic_id == clinic_id
    ).order_by(ScheduleException.date).all()

def create_schedule_exception(db: Session, clinic_id: str, exc: ScheduleExceptionCreate):
    db_exc = ScheduleException(
        clinic_id=clinic_id,
        date=date.fromisoformat(exc.date),
        is_closed=exc.is_closed,
        custom_start=time.fromisoformat(exc.custom_start) if exc.custom_start else None,
        custom_end=time.fromisoformat(exc.custom_end) if exc.custom_end else None,
        reason=exc.reason,
    )
    db.add(db_exc)
    db.commit()
    db.refresh(db_exc)
    return db_exc


# ============================================================
# AVAILABILITY ENGINE
# ============================================================

def get_available_slots(db: Session, clinic_id: str, target_date: str, service_id: str):
    """
    Calculate available time slots for a given clinic + date + service.
    Logic:
    1. Find the weekly schedule for that day_of_week
    2. Check for schedule exceptions (closed / custom hours)
    3. Generate all possible slots based on service duration
    4. Subtract already-booked appointments
    """
    d = date.fromisoformat(target_date)
    day_of_week = d.weekday()  # 0=Monday

    # 1. Get the schedule for this weekday
    schedule = db.query(ClinicSchedule).filter(
        ClinicSchedule.clinic_id == clinic_id,
        ClinicSchedule.day_of_week == day_of_week,
        ClinicSchedule.is_active == True,
    ).first()

    if not schedule:
        return []  # Clinic doesn't work this day

    # 2. Check for exceptions
    exception = db.query(ScheduleException).filter(
        ScheduleException.clinic_id == clinic_id,
        ScheduleException.date == d,
    ).first()

    if exception and exception.is_closed:
        return []  # Clinic is closed this specific date

    # Determine working hours
    if exception and exception.custom_start and exception.custom_end:
        work_start = exception.custom_start
        work_end = exception.custom_end
    else:
        work_start = schedule.start_time
        work_end = schedule.end_time

    # 3. Get service duration
    service = db.query(ClinicService).filter(ClinicService.id == service_id).first()
    duration = service.duration_minutes if service else schedule.slot_duration_minutes

    # 4. Generate all possible slots
    all_slots = []
    current = datetime.combine(d, work_start)
    end_dt = datetime.combine(d, work_end)

    while current + timedelta(minutes=duration) <= end_dt:
        slot_end = current + timedelta(minutes=duration)
        all_slots.append((current.time(), slot_end.time()))
        current = slot_end

    # 5. Get booked appointments for this clinic on this date
    booked = db.query(Appointment).filter(
        Appointment.clinic_id == clinic_id,
        Appointment.date == d,
        Appointment.status.in_(["pending", "confirmed"]),
    ).all()

    booked_times = set()
    for appt in booked:
        booked_times.add((appt.start_time, appt.end_time))

    # 6. Filter out booked slots
    available = []
    for start, end in all_slots:
        # Check if this slot overlaps with any booked appointment
        is_booked = False
        for b_start, b_end in booked_times:
            if start < b_end and end > b_start:
                is_booked = True
                break
        if not is_booked:
            available.append({
                "start_time": start.strftime("%H:%M"),
                "end_time": end.strftime("%H:%M"),
            })
    return available


# ============================================================
# APPOINTMENT CRUD
# ============================================================

def get_appointment(db: Session, appointment_id: str):
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def create_appointment(db: Session, user_id: str, appt: AppointmentCreate):
    d = date.fromisoformat(appt.date)
    start = time.fromisoformat(appt.start_time)

    # Calculate end_time from service duration
    service = db.query(ClinicService).filter(ClinicService.id == appt.service_id).first()
    duration = service.duration_minutes if service else 30
    end_dt = datetime.combine(d, start) + timedelta(minutes=duration)

    # Check for double-booking
    existing = db.query(Appointment).filter(
        Appointment.clinic_id == appt.clinic_id,
        Appointment.date == d,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.start_time < end_dt.time(),
        Appointment.end_time > start,
    ).first()

    if existing:
        raise ValueError("Este horario ya está reservado. Por favor selecciona otro.")

    db_appt = Appointment(
        clinic_id=appt.clinic_id,
        service_id=appt.service_id,
        pet_id=appt.pet_id,
        user_id=user_id,
        vet_id=appt.vet_id,
        date=d,
        start_time=start,
        end_time=end_dt.time(),
        status="pending",
        notes=appt.notes,
    )
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)

    # Create reminders (24h before and 2h before)
    appt_datetime = datetime.combine(d, start)
    for hours_before in [24, 2]:
        remind_at = appt_datetime - timedelta(hours=hours_before)
        if remind_at > datetime.now():
            reminder = AppointmentReminder(
                appointment_id=db_appt.id,
                remind_at=remind_at.isoformat(),
                reminder_type="in_app",
            )
            db.add(reminder)
    db.commit()

    return db_appt

def get_user_appointments(db: Session, user_id: str):
    return db.query(Appointment).filter(
        Appointment.user_id == user_id
    ).order_by(Appointment.date.desc(), Appointment.start_time.desc()).all()

def get_clinic_appointments(db: Session, clinic_id: str, status: str = None):
    query = db.query(Appointment).filter(Appointment.clinic_id == clinic_id)
    if status:
        query = query.filter(Appointment.status == status)
    return query.order_by(Appointment.date, Appointment.start_time).all()

def update_appointment_status(db: Session, appointment_id: str, status: str, reason: str = None):
    appt = get_appointment(db, appointment_id)
    if appt:
        appt.status = status
        if reason:
            appt.cancellation_reason = reason
        db.commit()
        db.refresh(appt)
    return appt

def reschedule_appointment(db: Session, appointment_id: str, new_date: str, new_start_time: str):
    appt = get_appointment(db, appointment_id)
    if not appt:
        return None

    if appt.status not in ["pending", "confirmed"]:
        raise ValueError("Solo se pueden reagendar citas pendientes o confirmadas.")

    d = date.fromisoformat(new_date)
    start = time.fromisoformat(new_start_time)

    # Validate against clinic availability (respects schedule and exceptions)
    available_slots = get_available_slots(db, appt.clinic_id, new_date, appt.service_id)
    is_valid_slot = any(
        slot["start_time"] == start.strftime("%H:%M") 
        for slot in available_slots
    )
    if not is_valid_slot:
        raise ValueError("El horario seleccionado no está disponible o la clínica está cerrada.")

    # Calculate new end time
    service = db.query(ClinicService).filter(ClinicService.id == appt.service_id).first()
    duration = service.duration_minutes if service else 30
    end_dt = datetime.combine(d, start) + timedelta(minutes=duration)

    # Check for double-booking at new time
    existing = db.query(Appointment).filter(
        Appointment.clinic_id == appt.clinic_id,
        Appointment.date == d,
        Appointment.id != appointment_id,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.start_time < end_dt.time(),
        Appointment.end_time > start,
    ).first()

    if existing:
        raise ValueError("El nuevo horario ya está reservado.")

    # Mark original as rescheduled and store the reason here
    appt.status = "rescheduled"
    appt.cancellation_reason = "Reagendada a una nueva fecha/hora"
    db.commit()

    # Create new appointment with the updated time
    new_appt = Appointment(
        clinic_id=appt.clinic_id,
        service_id=appt.service_id,
        pet_id=appt.pet_id,
        user_id=appt.user_id,
        vet_id=appt.vet_id,
        date=d,
        start_time=start,
        end_time=end_dt.time(),
        status="pending",
        notes=appt.notes,
        cancellation_reason=None  # The new appointment shouldn't have a cancellation reason
    )
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    
    # Create reminders for the new appointment
    appt_datetime = datetime.combine(d, start)
    for hours_before in [24, 2]:
        remind_at = appt_datetime - timedelta(hours=hours_before)
        if remind_at > datetime.now():
            reminder = AppointmentReminder(
                appointment_id=new_appt.id,
                remind_at=remind_at.isoformat(),
                reminder_type="in_app",
            )
            db.add(reminder)
    db.commit()

    return new_appt
