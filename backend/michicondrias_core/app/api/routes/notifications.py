from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.crud import crud_notification
from app.api import deps
from app.db.session import get_db
from app.schemas.notification import NotificationCreate, NotificationResponse, UnreadCountResponse, MarkAllReadResponse
from app.api.internal import require_internal_token
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()


@router.get("/me", response_model=List[NotificationResponse])
def read_my_notifications(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Retrieve notifications for the current authenticated user."""
    return crud_notification.get_notifications_by_user(db, user_id=current_user_id, skip=skip, limit=limit)


@router.get("/me/unread-count", response_model=UnreadCountResponse)
def read_my_unread_count(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Cantidad de notificaciones sin leer del usuario (badge de la campana)."""
    return {"count": crud_notification.count_unread(db, user_id=current_user_id)}


@router.patch("/me/read-all", response_model=MarkAllReadResponse)
def mark_all_my_notifications_as_read(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Marca como leídas todas las notificaciones del usuario en una sola operación."""
    return {"updated": crud_notification.mark_all_as_read(db, user_id=current_user_id)}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Mark a notification as read."""
    notif = crud_notification.get_notification(db, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    if notif.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    return crud_notification.mark_notification_as_read(db, notification_id)


@router.post("/broadcast", response_model=NotificationResponse)
async def broadcast_notification(
    notification_in: NotificationCreate,
    db: Session = Depends(get_db),
    _internal: None = Depends(require_internal_token),
) -> Any:
    """Internal/Service-to-service: Broadcast a notification and push via WS if active."""
    notif = crud_notification.create_notification(db, notification_in)
    
    await manager.send_personal_message(
        {
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "link": notif.link,
            "created_at": notif.created_at.isoformat() if notif.created_at else ""
        },
        user_id=notif.user_id
    )
    return notif


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str | None = None):
    """WebSocket para notificaciones en tiempo real. Exige ?token=<JWT> del mismo usuario del que se escucha."""
    try:
        payload = jwt.decode(token or "", settings.SECRET_KEY, algorithms=["HS256"])
        authorized = payload.get("sub") == user_id and not payload.get("is_temp", False)
    except JWTError:
        authorized = False
    if not authorized:
        await websocket.close(code=1008)  # policy violation
        return
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
