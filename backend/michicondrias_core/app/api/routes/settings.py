from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.global_setting import GlobalSettingCreate, GlobalSettingUpdate, GlobalSettingResponse
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[GlobalSettingResponse])
def read_settings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    public_only: bool = False,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve settings.
    """
    settings = crud.crud_setting.get_settings(db, skip=skip, limit=limit, public_only=public_only)
    return settings

@router.get("/public", response_model=List[GlobalSettingResponse])
def read_public_settings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve public settings without authentication.
    """
    settings = crud.crud_setting.get_settings(db, skip=skip, limit=limit, public_only=True)
    return settings

@router.post("/", response_model=GlobalSettingResponse)
def create_setting(
    *,
    db: Session = Depends(get_db),
    setting_in: GlobalSettingCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new setting.
    """
    setting = crud.crud_setting.get_setting_by_key(db, key=setting_in.key)
    if setting:
        raise HTTPException(
            status_code=400,
            detail="The setting with this key already exists in the system.",
        )
    setting = crud.crud_setting.create_setting(db=db, setting=setting_in)
    return setting

@router.put("/{setting_id}", response_model=GlobalSettingResponse)
def update_setting(
    *,
    db: Session = Depends(get_db),
    setting_id: str,
    setting_in: GlobalSettingUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a setting.
    """
    setting = crud.crud_setting.get_setting(db, setting_id=setting_id)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    setting = crud.crud_setting.update_setting(db=db, db_setting=setting, setting_update=setting_in)
    return setting

@router.delete("/{setting_id}", response_model=GlobalSettingResponse)
def delete_setting(
    *,
    db: Session = Depends(get_db),
    setting_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a setting.
    """
    setting = crud.crud_setting.get_setting(db, setting_id=setting_id)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    setting = crud.crud_setting.remove_setting(db=db, setting_id=setting_id)
    return setting
