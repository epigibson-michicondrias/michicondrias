from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
import uuid


class BaseModel:
    """Base model with UUID primary key and timestamps."""
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
