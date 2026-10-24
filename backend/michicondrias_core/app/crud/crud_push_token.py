from sqlalchemy.orm import Session
from app.models.push_token import PushToken
import uuid

def get_push_token(db: Session, token: str):
    return db.query(PushToken).filter(PushToken.token == token).first()

def get_active_push_tokens(db: Session, user_id: str):
    return (
        db.query(PushToken)
        .filter(PushToken.user_id == user_id, PushToken.is_active == True)  # noqa: E712
        .order_by(PushToken.created_at.desc())
        .all()
    )

def upsert_push_token(db: Session, user_id: str, token: str, platform: str) -> PushToken:
    """Registra o refresca el token de un dispositivo.

    - Si el token ya existe y es de otro usuario, se reasigna al usuario actual
      (p. ej. el dispositivo cambió de cuenta).
    - Si ya es del usuario, se refrescan plataforma/updated_at y se reactiva.
    """
    db_obj = get_push_token(db, token)
    if db_obj:
        db_obj.user_id = user_id
        db_obj.platform = platform
        db_obj.is_active = True
    else:
        db_obj = PushToken(
            id=str(uuid.uuid4()),
            user_id=user_id,
            token=token,
            platform=platform,
            is_active=True,
        )
        db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def deactivate_push_token(db: Session, user_id: str, token: str):
    """Marca is_active=false (al cerrar sesión o desinstalar la app)."""
    db_obj = db.query(PushToken).filter(
        PushToken.token == token, PushToken.user_id == user_id
    ).first()
    if not db_obj:
        return None
    db_obj.is_active = False
    db.commit()
    db.refresh(db_obj)
    return db_obj
