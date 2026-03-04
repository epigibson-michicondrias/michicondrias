from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
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

def require_admin(token: str = Depends(oauth2_scheme)) -> str:
    payload = _decode_token(token)
    role = payload.get("role", "consumidor")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de administrador",
        )
    return payload["sub"]

def get_optional_user_id(token: str = Depends(oauth2_scheme)) -> str:
    if not token:
        return None
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None
