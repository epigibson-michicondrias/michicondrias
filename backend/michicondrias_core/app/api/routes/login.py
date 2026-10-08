from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr, Field

from app.core import security
from app.core.config import settings
from app.core.email import send_password_reset_email
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, LoginResponse, TwoFactorVerifyLoginRequest, TokenPayload
from app import crud
import pyotp
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ResetPasswordCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)

@router.post("/login/access-token", response_model=LoginResponse)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login. If 2FA is enabled, returns a temp token.
    Otherwise, returns the final JWT access token directly.
    """
    user = crud.crud_user.get_user_by_email(db, form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="La cuenta está desactivada")

    # Get role name
    role_name = "consumidor"
    if user.role and user.role.name:
        role_name = user.role.name

    # Check 2FA
    if user.is_two_factor_enabled:
        # Generate short-lived temp token (5 minutes) containing subject and role
        temp_token_expires = timedelta(minutes=5)
        temp_token = security.create_access_token(
            user.id, role=role_name, expires_delta=temp_token_expires, 
            is_temp=True, purpose="2fa_temp"
        )
        return {
            "require_2fa": True,
            "temp_token": temp_token
        }

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "require_2fa": False,
        "access_token": security.create_access_token(
            user.id, role=role_name, expires_delta=access_token_expires,
            purpose="auth"
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
    
    # Validate token purpose
    purpose = payload.get("purpose", "")
    if purpose != "2fa_temp":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token no válido para verificación 2FA",
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
            user.id, role=role_name, expires_delta=access_token_expires,
            purpose="auth"
        ),
        "token_type": "bearer",
    }


@router.post("/forgot-password")
def forgot_password(
    body: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Send a password reset email. Always returns success to prevent email enumeration.
    """
    user = crud.crud_user.get_user_by_email(db, body.email)
    
    if user and user.is_active:
        reset_token = security.create_access_token(
            user.id, 
            role=user.role.name if user.role else "consumidor",
            expires_delta=timedelta(minutes=30),
            is_temp=True,
            purpose="password_reset"
        )

        # Código de 6 dígitos (F12): viaja por correo y en la base solo queda su HMAC, con vencimiento.
        # El enlace con token se sigue enviando mientras tanto.
        code = security.generate_reset_code()
        user.reset_code_hash = security.hash_reset_code(code)
        user.reset_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        db.commit()

        # Send the actual email (falls back to logging if Resend is not configured)
        send_password_reset_email(
            email=user.email,
            token=reset_token,
            user_name=user.full_name,
            code=code,
        )
    
    return {"message": "Si el correo existe, recibirás un código y un enlace para restablecer tu contraseña"}


@router.post("/reset-password")
def reset_password(
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset password using a valid reset token.
    """
    try:
        payload = jwt.decode(
            body.token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token inválido o expirado",
        )
    
    if not token_data.is_temp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token no válido para reset de contraseña",
        )
    
    # Validate token purpose
    purpose = payload.get("purpose", "")
    if purpose != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token no válido para reset de contraseña",
        )
    
    # Validate password strength
    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 8 caracteres",
        )
    
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.hashed_password = security.get_password_hash(body.new_password)
    db.add(user)
    db.commit()
    
    logger.info(f"[PASSWORD RESET] Password successfully reset for user {user.email}")
    
    return {"message": "Contraseña actualizada correctamente"}


@router.post("/reset-password/code")
def reset_password_with_code(
    body: ResetPasswordCodeRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Restablece la contraseña con el código de 6 dígitos del correo. El código es de un solo uso
    y vence a los 30 minutos. El flujo del enlace con token sigue disponible mientras tanto.
    """
    user = crud.crud_user.get_user_by_email(db, body.email)
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not user.reset_code_hash or not user.reset_code_expires_at:
        raise HTTPException(status_code=400, detail="No hay un código de recuperación vigente. Solicita uno nuevo.")
    # SQLite devuelve fechas sin zona y Postgres con zona: se normaliza antes de comparar
    expires = user.reset_code_expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="El código expiró. Solicita uno nuevo.")
    if not security.verify_reset_code(body.code, user.reset_code_hash):
        raise HTTPException(status_code=400, detail="El código no es correcto")

    user.hashed_password = security.get_password_hash(body.new_password)
    # Un solo uso: al quedar sin código no se puede repetir el mismo
    user.reset_code_hash = None
    user.reset_code_expires_at = None
    db.commit()

    logger.info(f"[PASSWORD RESET] Password successfully reset with code for user {user.email}")
    return {"message": "Contraseña actualizada correctamente"}
