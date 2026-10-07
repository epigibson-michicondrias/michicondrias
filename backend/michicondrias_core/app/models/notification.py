from sqlalchemy import Column, String, Boolean, Text
from app.models.base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(String(36), index=True, nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="general")
    is_read = Column(Boolean, default=False)
    # Ruta de la app a la que lleva la notificación (p. ej. "/tienda/pedido/123"). Opcional: sin ella, la app decide por tipo.
    link = Column(String(255), nullable=True)
