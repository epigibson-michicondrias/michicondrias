from sqlalchemy import Column, String, Text, Boolean
from app.models.base import BaseModel

class GlobalSetting(BaseModel):
    __tablename__ = "global_settings"

    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    is_public = Column(Boolean, default=False)
    type = Column(String(50), default="string") # string, boolean, number, json
