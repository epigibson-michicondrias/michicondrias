from sqlalchemy.orm import Session
from app.models.global_setting import GlobalSetting
from app.schemas.global_setting import GlobalSettingCreate, GlobalSettingUpdate

def get_setting(db: Session, setting_id: str):
    return db.query(GlobalSetting).filter(GlobalSetting.id == setting_id).first()

def get_setting_by_key(db: Session, key: str):
    return db.query(GlobalSetting).filter(GlobalSetting.key == key).first()

def get_settings(db: Session, skip: int = 0, limit: int = 100, public_only: bool = False):
    query = db.query(GlobalSetting)
    if public_only:
        query = query.filter(GlobalSetting.is_public == True)
    return query.offset(skip).limit(limit).all()

def create_setting(db: Session, setting: GlobalSettingCreate):
    db_setting = GlobalSetting(
        key=setting.key,
        value=setting.value,
        description=setting.description,
        is_public=setting.is_public,
        type=setting.type
    )
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

def update_setting(db: Session, db_setting: GlobalSetting, setting_update: GlobalSettingUpdate):
    update_data = setting_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_setting, key, value)
    
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

def remove_setting(db: Session, setting_id: str):
    db_setting = db.query(GlobalSetting).filter(GlobalSetting.id == setting_id).first()
    if db_setting:
        db.delete(db_setting)
        db.commit()
    return db_setting
