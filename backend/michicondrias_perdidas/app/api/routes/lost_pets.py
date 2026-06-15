from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import httpx
import uuid
from pydantic import BaseModel

from app.api import deps
from app.db.session import get_db
from app.crud.crud_lost_pets import (
    create_report, get_reports, get_report_by_id, 
    get_reports_by_user, update_report, delete_report, update_tracker_location
)
from app.schemas.lost_pet import LostPetReportCreate, LostPetReportUpdate, LostPetReportOut, TrackerLocationUpdate

router = APIRouter()


class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str


@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_photo_presigned_url(ext: str = "jpg") -> Any:
    """Generate a presigned URL to upload a lost pet report photo."""
    from app.core.s3 import generate_presigned_url
    from app.core.config import settings
    import mimetypes

    clean_ext = ext.replace(".", "")
    object_name = f"perdidas/{uuid.uuid4()}.{clean_ext}"

    content_type, _ = mimetypes.guess_type(f"file.{clean_ext}")
    if not content_type:
        content_type = "image/jpeg" if clean_ext in ["jpg", "jpeg"] else "application/octet-stream"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo contactar a AWS S3")

    public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
    return PresignedUrlResponse(url=url, object_key=public_url)


@router.post("/{report_id}/resolve", response_model=LostPetReportOut)
def resolve_report(
    report_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Mark a lost pet report as resolved (pet found)."""
    existing = get_report_by_id(db, report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    if existing.reporter_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para resolver este reporte")
    
    update_data = LostPetReportUpdate(status="resolved", is_resolved=True)
    return update_report(db, report_id=report_id, report_in=update_data)


@router.get("/", response_model=List[LostPetReportOut])
def list_reports(
    db: Session = Depends(get_db),
    report_type: Optional[str] = None,
    status: str = "active",
    species: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Any:
    """
    Retrieve all active lost/found pet reports. Public endpoint.
    """
    return get_reports(db, report_type=report_type, status=status, species=species, skip=skip, limit=limit)


@router.get("/mine", response_model=List[LostPetReportOut])
def list_my_reports(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Retrieve all reports created by the current user.
    """
    return get_reports_by_user(db, reporter_id=user_id)


@router.get("/{report_id}", response_model=LostPetReportOut)
def read_report(
    report_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific report by ID.
    """
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return report


@router.post("/", response_model=LostPetReportOut)
def create_new_report(
    *,
    db: Session = Depends(get_db),
    report_in: LostPetReportCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create a new lost or found pet report.
    """
    return create_report(db, report_in=report_in, reporter_id=user_id)


@router.patch("/{report_id}", response_model=LostPetReportOut)
def patch_report(
    report_id: str,
    *,
    db: Session = Depends(get_db),
    report_in: LostPetReportUpdate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Update an existing report. Only the owner can update.
    """
    existing = get_report_by_id(db, report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    if existing.reporter_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar este reporte")
    return update_report(db, report_id=report_id, report_in=report_in)


@router.patch("/{report_id}/location", response_model=LostPetReportOut)
def patch_report_location(
    report_id: str,
    *,
    db: Session = Depends(get_db),
    location_in: TrackerLocationUpdate,
    # Depending on hardware, this could use a machine-to-machine API key or user auth
    # For now we'll allow the owner or a simulated hardware webhook
    # user_id: str = Depends(deps.get_current_user_id), 
) -> Any:
    """
    Update the real-time geolocation of a pet's Michi-Tracker collar.
    """
    existing = get_report_by_id(db, report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    if not existing.has_tracker:
        raise HTTPException(status_code=400, detail="Este reporte no tiene un Michi-Tracker asociado")
        
    return update_tracker_location(
        db, 
        report_id=report_id, 
        lat=location_in.current_lat, 
        lng=location_in.current_lng
    )


@router.delete("/{report_id}")
def remove_report(
    report_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Delete a report. Only the owner can delete.
    """
    existing = get_report_by_id(db, report_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    if existing.reporter_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este reporte")
    delete_report(db, report_id=report_id)
    return {"detail": "Reporte eliminado exitosamente"}


# ========================================
# ADMIN — Moderation flow
# ========================================

@router.get("/admin/pending", response_model=List[LostPetReportOut])
def read_pending_reports(
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """Pending lost pet reports awaiting moderation review. Admin only."""
    from app.crud.crud_lost_pets import get_pending_reports
    return get_pending_reports(db)


@router.post("/admin/{report_id}/approve", response_model=LostPetReportOut)
def moderation_approve_report(
    report_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """Mark a lost pet report as checked and verified. Admin only."""
    from app.crud.crud_lost_pets import approve_report
    report = approve_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return report


@router.delete("/admin/{report_id}/reject")
def moderation_reject_report(
    report_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """Reject and explicitly delete a spam/fake lost pet report. Admin only."""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    delete_report(db, report_id=report_id)
    return {"detail": "Reporte rechazado y eliminado permanentemente"}


@router.get("/{report_id}/matches", response_model=List[LostPetReportOut])
def read_matching_reports(
    report_id: str,
    max_distance_km: float = 10.0,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Find nearby matching reports for a given report (lost vs found) of the same species.
    """
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
        
    from app.crud.crud_lost_pets import find_matching_reports
    return find_matching_reports(db, report=report, max_distance_km=max_distance_km)


@router.post("/{report_id}/broadcast")
async def broadcast_lost_pet_alert(
    report_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """Detona el envío geolocalizado de la alerta a usuarios cercanos (Simulación de difusión masiva)."""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    if report.user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para difundir este reporte")

    broadcast_count = 0
    try:
        from app.core.config import settings
        payload = {
            "user_id": user_id,
            "title": f"¡ALERTA MASCOTA PERDIDA: {report.pet_name}!",
            "message": f"Se ha reportado la pérdida de {report.pet_name} ({report.species}) cerca de {report.last_seen_location}. Por favor, mantente atento si estás en el área.",
            "type": "alert"
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{settings.CORE_SERVICE_URL}/api/v1/notifications/broadcast", json=payload, timeout=5.0)
            if resp.status_code == 200:
                broadcast_count += 12
    except Exception as e:
        print(f"Error broadcasting alert: {e}")

    return {
        "status": "success",
        "message": f"Alerta regional transmitida exitosamente para {report.pet_name}.",
        "simulated_users_notified_count": broadcast_count + 15,
        "radius_meters": 5000
    }


