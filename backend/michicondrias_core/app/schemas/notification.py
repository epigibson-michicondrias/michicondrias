from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: str
    title: str
    message: str
    type: Optional[str] = "general"
    link: Optional[str] = Field(None, max_length=255)

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    count: int


class MarkAllReadResponse(BaseModel):
    updated: int
