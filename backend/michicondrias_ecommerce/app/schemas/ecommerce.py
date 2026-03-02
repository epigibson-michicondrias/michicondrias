from typing import Optional, List
from datetime import datetime

class SubcategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True
    category_id: str

class SubcategoryCreate(SubcategoryBase):
    pass

class SubcategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SubcategoryResponse(SubcategoryBase):
    id: str

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: str
    subcategories: List[SubcategoryResponse] = []

    class Config:
        from_attributes = True
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: Optional[int] = 0
    category_id: Optional[str] = None
    subcategory_id: Optional[str] = None
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
