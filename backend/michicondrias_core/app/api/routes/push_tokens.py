from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud import crud_push_token
from app.api import deps
from app.db.session import get_db
from app.schemas.push_token import PushTokenCreate, PushTokenResponse, PushTokenDeactivateResponse

router = APIRouter()

@router.post("", response_model=PushTokenResponse)
def register_push_token(
    *,
    db: Session = Depends(get_db),
    token_in: PushTokenCreate,
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Registra o actualiza el token de push del usuario actual (upsert por token)."""
    return crud_push_token.upsert_push_token(
        db,
        user_id=current_user_id,
        token=token_in.token,
        platform=token_in.platform,
    )

@router.get("/me", response_model=List[PushTokenResponse])
def read_my_push_tokens(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Lista los tokens de push activos del usuario actual (útil para depurar)."""
    return crud_push_token.get_active_push_tokens(db, user_id=current_user_id)

@router.delete("/{token:path}", response_model=PushTokenDeactivateResponse)
def deactivate_push_token(
    token: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Desactiva un token de push (al cerrar sesión o desinstalar la app)."""
    db_obj = crud_push_token.deactivate_push_token(db, user_id=current_user_id, token=token)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Token no encontrado")
    return {"deactivated": True}
