from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings

# Point to core login URL for stateless validation
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.CORE_SERVICE_URL}/api/v1/login/access-token")

ALGORITHM = "HS256"

def _decode_token(token: str) -> dict:
    """Decode and validate JWT token. Rejects temporary tokens (2FA/reset)."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
        # Reject temporary tokens (2FA pending or password reset)
        if payload.get("is_temp", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Se requiere completar la verificación 2FA",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    payload = _decode_token(token)
    return payload["sub"]
