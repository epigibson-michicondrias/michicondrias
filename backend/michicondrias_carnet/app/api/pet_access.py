"""Autorización sobre el carnet de una mascota: solo su dueño o un veterinario pueden escribir en él."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings

_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.CORE_SERVICE_URL}/api/v1/login/access-token", auto_error=False)

VET_ROLES = {"veterinario", "clinica", "hospital", "admin"}


def get_identity(token: str = Depends(_oauth2)) -> dict:
    """Usuario autenticado y su rol (claim `role` del JWT). Rechaza tokens temporales (2FA/reset)."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")
    if payload.get("is_temp", False) or not payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")
    return {"user_id": payload["sub"], "role": payload.get("role", "consumidor")}


def assert_can_write_pet_record(db: Session, pet_id: str, identity: dict) -> None:
    row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": pet_id}).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mascota no encontrada")
    if row[0] != identity["user_id"] and identity["role"] not in VET_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el dueño o un veterinario pueden modificar el carnet de esta mascota")
