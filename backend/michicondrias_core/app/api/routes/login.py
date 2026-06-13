from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, LoginResponse, TwoFactorVerifyLoginRequest, TokenPayload
import pyotp

router = APIRouter()

@router.post("/login/access-token", response_model=LoginResponse)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login. If 2FA is enabled, returns a temp token.
    Otherwise, returns the final JWT access token directly.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Get role name
    role_name = "consumidor"
    if user.role and user.role.name:
        role_name = user.role.name

    # Check 2FA
    if user.is_two_factor_enabled:
        # Generate short-lived temp token (5 minutes) containing subject and role
        temp_token_expires = timedelta(minutes=5)
        temp_token = security.create_access_token(
            user.id, role=role_name, expires_delta=temp_token_expires, is_temp=True
        )
        return {
            "require_2fa": True,
            "temp_token": temp_token
        }

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "require_2fa": False,
        "access_token": security.create_access_token(
            user.id, role=role_name, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login/verify-2fa", response_model=Token)
def verify_login_2fa(
    body: TwoFactorVerifyLoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Verify the 2FA code using the temp token and return the final access token.
    """
    try:
        payload = jwt.decode(
            body.temp_token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token temporal inválido o expirado",
        )

    if not token_data.is_temp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token proporcionado no es un token temporal de 2FA",
        )

    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="Usuario no encontrado o inactivo")

    # Verify OTP code
    totp = pyotp.TOTP(user.two_factor_secret)
    if not totp.verify(body.code):
        raise HTTPException(status_code=400, detail="Código de verificación 2FA inválido")

    # Generate final access token
    role_name = user.role.name if user.role else "consumidor"
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, role=role_name, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

