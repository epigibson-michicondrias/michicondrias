from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import crud
from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.models.role import Role

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
def get_admin_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Returns aggregated metrics for the admin dashboard. (Admin only)
    """
    total_users = crud.crud_user.count_total_users(db)
    pending_kyc = crud.crud_user.count_users_by_status(db, "PENDING")
    verified_kyc = crud.crud_user.count_users_by_status(db, "VERIFIED")
    
    # Get all roles to map names to counts
    roles = db.query(Role).all()
    users_by_role = {}
    for role in roles:
        count = crud.crud_user.count_users_by_role(db, role.id)
        users_by_role[role.name] = count

    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    since_7 = now - timedelta(days=7)
    since_30 = now - timedelta(days=30)
    active_users = db.query(User).filter(User.is_active == True).count()  # noqa: E712
    new_7 = db.query(User).filter(User.created_at >= since_7).count()
    new_30 = db.query(User).filter(User.created_at >= since_30).count()
    rejected_kyc = crud.crud_user.count_users_by_status(db, "REJECTED")

    # Registros por día (últimos 14 días) — datos reales de users.created_at
    since_14 = now - timedelta(days=13)
    rows = db.query(User.created_at).filter(User.created_at >= since_14.replace(hour=0, minute=0, second=0, microsecond=0)).all()
    per_day = {}
    for (created,) in rows:
        if created:
            key = created.date().isoformat()
            per_day[key] = per_day.get(key, 0) + 1
    registrations = []
    for i in range(14):
        d = (since_14 + timedelta(days=i)).date().isoformat()
        registrations.append({"date": d, "count": per_day.get(d, 0)})

    professionals = sum(c for name, c in users_by_role.items() if name not in ("consumidor", "admin"))

    return {
        "kpis": {
            "total_users": total_users,
            "pending_verifications": pending_kyc,
            "approved_verifications": verified_kyc,
            "system_admins": users_by_role.get("admin", 0),
            # nuevos (aditivos: la app publicada ignora claves desconocidas)
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "rejected_verifications": rejected_kyc,
            "professionals": professionals,
            "new_users_7d": new_7,
            "new_users_30d": new_30,
        },
        "role_distribution": users_by_role,
        "registrations_14d": registrations,
    }
