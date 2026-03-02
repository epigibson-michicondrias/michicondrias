from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: Optional[int] = 0
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = True
    seller_id: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str

    class Config:
        from_attributes = True

class DonationBase(BaseModel):
    amount: float
    currency: Optional[str] = "MXN"
    message: Optional[str] = None

class DonationCreate(DonationBase):
    pass

class DonationUpdate(BaseModel):
    status: str

class DonationResponse(DonationBase):
    id: str
    user_id: Optional[str] = None
    date: datetime
    status: str

    class Config:
        from_attributes = True
