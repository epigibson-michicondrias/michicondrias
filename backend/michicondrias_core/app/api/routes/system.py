from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

_system_settings = {
    "maintenance_mode": False,
    "debug_mode": False,
    "ota_updates_enabled": True,
    "push_notifications_enabled": True,
    "cache_version": "1.0.0",
    "last_sync": ""
}


@router.get("/admin/system/settings")
def get_system_settings(
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """Get system settings (Admin only)."""
    return _system_settings


@router.patch("/admin/system/settings")
def update_system_settings(
    settings_update: Dict[str, Any],
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """Update system settings (Admin only)."""
    _system_settings.update(settings_update)
    return _system_settings


@router.post("/admin/system/database/sync")
def sync_database(
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """Trigger database sync (Admin only)."""
    from datetime import datetime
    _system_settings["last_sync"] = datetime.utcnow().isoformat()
    return {"message": "Database sync initiated successfully"}


@router.post("/admin/system/cache/clear")
def clear_cache(
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """Clear system cache (Admin only)."""
    from datetime import datetime
    _system_settings["cache_version"] = str(int(_system_settings.get("cache_version", "0").split(".")[0]) + 1) + ".0.0"
    _system_settings["last_sync"] = datetime.utcnow().isoformat()
    return {"message": "Cache cleared successfully"}
