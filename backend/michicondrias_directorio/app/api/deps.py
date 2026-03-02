from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings

# OAuth2PasswordBearer is configured to point to the core service login URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/api/v1/login/access-token")

ALGORITHM = "HS256"

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
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
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

def require_admin(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role", "consumidor")
        if role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Se requiere rol de administrador",
            )
        return payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
