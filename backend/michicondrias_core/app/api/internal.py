"""Autorización para llamadas entre servicios."""
import hmac
import os

from fastapi import Header, HTTPException, status


def require_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    """Solo otros servicios pueden llamar a estos endpoints. Si INTERNAL_SERVICE_TOKEN no está configurado, se rechaza todo."""
    expected = os.getenv("INTERNAL_SERVICE_TOKEN")
    if not expected or not x_internal_token or not hmac.compare_digest(x_internal_token, expected):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo para uso interno entre servicios")
