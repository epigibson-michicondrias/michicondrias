from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int # 1-5
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str
    product_id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

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
    specifications: Optional[str] = None

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
    specifications: Optional[str] = None

class ProductResponse(ProductBase):
    id: str
    average_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0

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

# ORDER SCHEMAS
class OrderItemBase(BaseModel):
    product_id: str
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: str
    price_at_purchase: float
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_amount: float
    status: str
    shipping_address: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
