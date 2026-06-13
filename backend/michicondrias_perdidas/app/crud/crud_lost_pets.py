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


def update_tracker_location(db: Session, report_id: str, lat: float, lng: float) -> Optional[LostPetReport]:
    db_report = get_report_by_id(db, report_id)
    if not db_report:
        return None
    db_report.current_lat = lat
    db_report.current_lng = lng
    db_report.last_tracked_at = datetime.utcnow()
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


def find_matching_reports(db: Session, report: LostPetReport, max_distance_km: float = 10.0, limit: int = 5) -> List[LostPetReport]:
    """
    Find matching reports (if this report is 'lost', find 'found' reports, and vice-versa)
    for the same species within a given distance.
    """
    opposite_type = "found" if report.report_type == "lost" else "lost"
    
    query = db.query(LostPetReport).filter(
        LostPetReport.report_type == opposite_type,
        LostPetReport.species == report.species,
        LostPetReport.status == "active",
        LostPetReport.id != report.id
    )
    
    if report.latitude is not None and report.longitude is not None:
        # Bounding box delta: 1 degree approx 111km
        lat_delta = max_distance_km / 111.0
        lng_delta = max_distance_km / (111.0 * abs(report.latitude + 0.000001) / 90.0) # adjust for longitude variance
        # Simplify lng_delta calculation
        import math
        cos_lat = math.cos(math.radians(report.latitude))
        lng_delta = max_distance_km / (111.0 * cos_lat) if cos_lat > 0 else lat_delta
        
        query = query.filter(
            LostPetReport.latitude.between(report.latitude - lat_delta, report.latitude + lat_delta),
            LostPetReport.longitude.between(report.longitude - lng_delta, report.longitude + lng_delta)
        )
        
    results = query.all()
    
    # Sort by exact Haversine distance in python if lat/lng are present
    if report.latitude is not None and report.longitude is not None:
        import math
        def haversine_distance(r):
            if r.latitude is None or r.longitude is None:
                return float('inf')
            # R of Earth
            R = 6371.0
            lat1, lon1 = math.radians(report.latitude), math.radians(report.longitude)
            lat2, lon2 = math.radians(r.latitude), math.radians(r.longitude)
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c
            
        results.sort(key=haversine_distance)
        # Filter exact distance
        results = [r for r in results if haversine_distance(r) <= max_distance_km]
        
    return results[:limit]

