from pydantic import BaseModel
from typing import Optional

class GlobalSettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    is_public: Optional[bool] = False
    type: Optional[str] = "string"

class GlobalSettingCreate(GlobalSettingBase):
    pass

class GlobalSettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    type: Optional[str] = None

class GlobalSettingResponse(GlobalSettingBase):
    id: str
    
    class Config:
        from_attributes = True
