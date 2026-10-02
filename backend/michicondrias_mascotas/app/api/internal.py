"""Dependencias de autorización para endpoints internos y de administración."""
import hmac

from fastapi import Depends, Header, HTTPException, status
from jose import jwt, JWTError

from app.api import deps
from app.core.config import settings


def require_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    """Solo otros servicios (por ejemplo ecommerce tras un pago) pueden llamar a estos endpoints.
    Si INTERNAL_SERVICE_TOKEN no está configurado, se rechaza todo (falla cerrado)."""
    expected = settings.INTERNAL_SERVICE_TOKEN
    if not expected or not x_internal_token or not hmac.compare_digest(x_internal_token, expected):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo para uso interno entre servicios")


def require_admin(token: str = Depends(deps.oauth2_scheme)) -> str:
    """Exige un token válido (no temporal) con rol admin y devuelve el id del usuario."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")
    if payload.get("is_temp", False) or not payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere rol: admin")
    return payload["sub"]
