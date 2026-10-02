"""Autorización para actualizar la ubicación del Michi-Tracker: el dueño del reporte, o la pasarela del hardware con el token interno."""
import hmac
import os

from fastapi import Header, HTTPException, status
from jose import jwt, JWTError

from app.core.config import settings


def authorize_tracker_update(
    report_user_id: str,
    authorization: str | None,
    x_internal_token: str | None,
) -> None:
    expected = os.getenv("INTERNAL_SERVICE_TOKEN")
    if expected and x_internal_token and hmac.compare_digest(x_internal_token, expected):
        return
    if authorization and authorization.lower().startswith("bearer "):
        try:
            payload = jwt.decode(authorization[7:], settings.SECRET_KEY, algorithms=["HS256"])
        except JWTError:
            payload = {}
        if payload.get("sub") == report_user_id and not payload.get("is_temp", False):
            return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para actualizar la ubicación de este reporte")
