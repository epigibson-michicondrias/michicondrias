"""Emisor de avisos al usuario (push).

Hoy solo registra la notificación in-app en la tabla `notifications` (como ya
hacen otros servicios). El envío real por FCM queda pendiente de credenciales.
"""
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.crud.crud_notification import create_notification
from app.schemas.notification import NotificationCreate

logger = logging.getLogger(__name__)


def notify_user_push(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    link: Optional[str] = None,
) -> None:
    """Registra un aviso para el usuario y deja el enganche listo para push.

    - Inserta la fila en `notifications` (la app ya la lee y la muestra).
    - TODO(FCM): enviar el push a los `push_tokens` activos del usuario cuando
      se conecte Firebase Cloud Messaging (hacen falta credenciales de FCM;
      no inventarlas). Mientras tanto, este emisor es solo in-app.
    """
    create_notification(
        db,
        NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type="general",
            link=link,
        ),
    )
    # TODO(FCM): iterar crud_push_token.get_active_push_tokens(db, user_id)
    # y enviar el mensaje por FCM a cada token (android/ios/web).
    logger.info("[PUSH] Aviso in-app registrado para %s: %s", user_id, title)
