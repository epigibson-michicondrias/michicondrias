from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

_DEFAULTS: Dict[str, Any] = {
    "maintenance_mode": False,
    "debug_mode": False,
    "ota_updates_enabled": True,
    "push_notifications_enabled": True,
    "cache_version": "1.0.0",
    "last_sync": "",
}
_PREFIX = "system."


def _load(db: Session) -> Dict[str, Any]:
    """Ajustes persistentes en global_settings (antes eran un dict en memoria que se perdía al reiniciar o entre workers)."""
    import json
    from app.models.global_setting import GlobalSetting
    out = dict(_DEFAULTS)
    for row in db.query(GlobalSetting).filter(GlobalSetting.key.like(_PREFIX + "%")).all():
        try:
            out[row.key[len(_PREFIX):]] = json.loads(row.value)
        except ValueError:
            out[row.key[len(_PREFIX):]] = row.value
    return out


def _save(db: Session, values: Dict[str, Any]) -> None:
    import json
    from app.models.global_setting import GlobalSetting
    for k, v in values.items():
        key = _PREFIX + k
        row = db.query(GlobalSetting).filter(GlobalSetting.key == key).first()
        if row:
            row.value = json.dumps(v)
        else:
            db.add(GlobalSetting(key=key, value=json.dumps(v), description="Ajuste del sistema", is_public=False, type="json"))
    db.commit()


@router.get("/admin/system/settings")
def get_system_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """Get system settings (Admin only)."""
    return _load(db)


@router.patch("/admin/system/settings")
def update_system_settings(
    settings_update: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """Update system settings (Admin only)."""
    unknown = [k for k in settings_update if k not in _DEFAULTS]
    if unknown:
        raise HTTPException(status_code=400, detail=f"Ajustes desconocidos: {', '.join(unknown)}")
    _save(db, settings_update)
    return _load(db)


@router.post("/admin/system/database/sync")
def sync_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """Trigger database sync (Admin only)."""
    from datetime import datetime
    _save(db, {"last_sync": datetime.utcnow().isoformat()})
    return {"message": "Database sync initiated successfully"}


@router.post("/admin/system/cache/clear")
def clear_cache(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """Clear system cache (Admin only)."""
    from datetime import datetime
    cur = _load(db)
    try:
        nxt = str(int(str(cur.get("cache_version", "0")).split(".")[0]) + 1) + ".0.0"
    except ValueError:
        nxt = "1.0.0"
    _save(db, {"cache_version": nxt, "last_sync": datetime.utcnow().isoformat()})
    return {"message": "Cache cleared successfully"}
