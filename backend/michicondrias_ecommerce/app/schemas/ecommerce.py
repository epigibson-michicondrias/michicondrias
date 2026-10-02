from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)  # 1-5
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

def _clean_optional_id(v):
    """El formulario móvil manda '' cuando no se eligió categoría; la FK exige None."""
    if isinstance(v, str) and not v.strip():
        return None
    return v


class ProductCreate(ProductBase):
    @field_validator("name")
    @classmethod
    def _name_not_blank(cls, v):
        if not v or not v.strip():
            raise ValueError("El nombre del producto es obligatorio")
        return v.strip()

    @field_validator("price")
    @classmethod
    def _price_positive(cls, v):
        if v is None or v <= 0:
            raise ValueError("El precio debe ser mayor a 0")
        return round(v, 2)

    @field_validator("stock")
    @classmethod
    def _stock_not_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("El stock no puede ser negativo")
        return v

    @field_validator("category_id", "subcategory_id", "image_url", mode="before")
    @classmethod
    def _blank_to_none(cls, v):
        return _clean_optional_id(v)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None  # legado: se ignora (la relación se cambia con category_id)
    category_id: Optional[str] = None
    subcategory_id: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    specifications: Optional[str] = None

    @field_validator("name")
    @classmethod
    def _name_not_blank(cls, v):
        if v is not None and not v.strip():
            raise ValueError("El nombre del producto es obligatorio")
        return v.strip() if v else v

    @field_validator("price")
    @classmethod
    def _price_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("El precio debe ser mayor a 0")
        return round(v, 2) if v is not None else v

    @field_validator("stock")
    @classmethod
    def _stock_not_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("El stock no puede ser negativo")
        return v

    @field_validator("category_id", "subcategory_id", "image_url", mode="before")
    @classmethod
    def _blank_to_none(cls, v):
        return _clean_optional_id(v)

class ProductResponse(ProductBase):
    id: str
    is_approved: Optional[bool] = None
    average_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    category: Optional[CategoryResponse] = None

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

class DonationCheckoutCreate(BaseModel):
    amount: float = Field(..., ge=10, le=100000)
    message: Optional[str] = Field(None, max_length=500)
    source: Optional[str] = "app"  # "app" (vuelve por deep link) o "web"

class DonationCheckoutResponse(BaseModel):
    donation_id: str
    sessionId: str
    url: str

class DonationResponse(DonationBase):
    id: str
    user_id: Optional[str] = None
    date: datetime
    status: str
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ORDER SCHEMAS
class OrderItemBase(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1, le=100)  # sin esto, cantidades negativas subían el stock y bajaban el total

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: str
    price_at_purchase: float
    product: Optional[ProductResponse] = None
    
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

class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str
    public_url: str
