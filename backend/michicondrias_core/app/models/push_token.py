from sqlalchemy import Column, String, Boolean
from app.models.base import BaseModel

class PushToken(BaseModel):
    __tablename__ = "push_tokens"

    # Referencia lógica a users.id (sin FK entre servicios, como el resto del monorepo)
    user_id = Column(String(36), index=True, nullable=False)
    token = Column(String(512), unique=True, nullable=False)
    platform = Column(String(20), nullable=False)  # android | ios | web
    is_active = Column(Boolean, default=True, nullable=False)
