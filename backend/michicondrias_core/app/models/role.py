from sqlalchemy import Column, String
from app.models.base import BaseModel

class Role(BaseModel):
    __tablename__ = "roles"

    name = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(String(255))
