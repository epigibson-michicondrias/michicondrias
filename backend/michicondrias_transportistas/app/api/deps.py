from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from typing import List
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.CORE_SERVICE_URL}/api/v1/login/access-token", auto_error=False)

ALGORITHM = "HS256"

def _decode_token(token: str) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No se pudieron validar las credenciales",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se pudieron validar las credenciales",
        )

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    payload = _decode_token(token)
    return payload["sub"]

def get_current_user_role(token: str = Depends(oauth2_scheme)) -> str:
    payload = _decode_token(token)
    return payload.get("role", "consumidor")

def require_role(allowed_roles: List[str]):
    def dependency(token: str = Depends(oauth2_scheme)) -> dict:
        payload = _decode_token(token)
        role = payload.get("role", "consumidor")
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los siguientes roles: {', '.join(allowed_roles)}",
            )
        return payload
    return dependency

def require_consumidor(payload: dict = Depends(require_role(["consumidor", "admin"]))) -> str:
    return payload["sub"]

def require_transportista(payload: dict = Depends(require_role(["transportista", "admin"]))) -> str:
    return payload["sub"]
