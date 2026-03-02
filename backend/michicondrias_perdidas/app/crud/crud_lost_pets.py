from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from datetime import datetime

from app.models.lost_pet import LostPetReport
from app.schemas.lost_pet import LostPetReportCreate, LostPetReportUpdate


def create_report(db: Session, report_in: LostPetReportCreate, reporter_id: str) -> LostPetReport:
    db_report = LostPetReport(
        reporter_id=reporter_id,
        **report_in.model_dump()
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_reports(
    db: Session,
    report_type: Optional[str] = None,
    status: str = "active",
    species: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[LostPetReport]:
    query = db.query(LostPetReport)
    if report_type:
        query = query.filter(LostPetReport.report_type == report_type)
    if status:
        query = query.filter(LostPetReport.status == status)
    if species:
        query = query.filter(LostPetReport.species == species)
    return query.order_by(desc(LostPetReport.created_at)).offset(skip).limit(limit).all()


def get_report_by_id(db: Session, report_id: str) -> Optional[LostPetReport]:
    return db.query(LostPetReport).filter(LostPetReport.id == report_id).first()


def get_reports_by_user(db: Session, reporter_id: str) -> List[LostPetReport]:
    return db.query(LostPetReport).filter(
        LostPetReport.reporter_id == reporter_id
    ).order_by(desc(LostPetReport.created_at)).all()


def update_report(db: Session, report_id: str, report_in: LostPetReportUpdate) -> Optional[LostPetReport]:
    db_report = get_report_by_id(db, report_id)
    if not db_report:
        return None
    update_data = report_in.model_dump(exclude_unset=True)
    if update_data.get("is_resolved"):
        update_data["resolved_at"] = datetime.utcnow()
        update_data["status"] = "resolved"
    for key, value in update_data.items():
        setattr(db_report, key, value)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_pending_reports(db: Session, skip: int = 0, limit: int = 100) -> List[LostPetReport]:
    """Retrieve new reports that haven't been reviewed by admin yet."""
    return db.query(LostPetReport).filter(LostPetReport.is_reviewed == False).order_by(desc(LostPetReport.created_at)).offset(skip).limit(limit).all()


def approve_report(db: Session, report_id: str) -> Optional[LostPetReport]:
    """Mark a lost pet report as reviewed and valid."""
    db_report = get_report_by_id(db, report_id)
    if not db_report:
        return None
    db_report.is_reviewed = True
    db.commit()
    db.refresh(db_report)
    return db_report


def delete_report(db: Session, report_id: str) -> bool:
    db_report = get_report_by_id(db, report_id)
    if not db_report:
        return False
    db.delete(db_report)
    db.commit()
    return True
