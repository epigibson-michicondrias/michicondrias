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

    # Optional: Get registration trends (simplified here)
    # Since we don't have a created_at column explicitly verified in migrations yet, 
    # we'll return the raw numbers. If created_at exists, we could group by date.
    
    return {
        "kpis": {
            "total_users": total_users,
            "pending_verifications": pending_kyc,
            "approved_verifications": verified_kyc,
            "system_admins": users_by_role.get("admin", 0),
        },
        "role_distribution": users_by_role
    }
