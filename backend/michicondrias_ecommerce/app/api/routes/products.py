from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
import os
import uuid

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.ecommerce import ProductCreate, ProductUpdate, ProductResponse, ReviewCreate, ReviewResponse, PresignedUrlResponse
from app.core.s3 import upload_file_to_s3, generate_presigned_url
from app.core.config import settings

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    seller_id: Optional[str] = None
) -> Any:
    """
    Retrieve products. (Public endpoint)
    """
    products = crud.crud_ecommerce.get_products(db, skip=skip, limit=limit, category=category, seller_id=seller_id)
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def read_product(
    product_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific product by id. (Public endpoint)
    """
    product = crud.crud_ecommerce.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_presigned_url(
    file_extension: str,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Get a presigned URL for S3 upload.
    """
    if not file_extension.startswith("."):
        file_extension = f".{file_extension}"
        
    unique_id = uuid.uuid4().hex
    object_name = f"products/{user_id}/{unique_id}{file_extension}"
    
    url = generate_presigned_url(object_name)
    if not url:
        raise HTTPException(status_code=500, detail="Could not generate presigned URL")
        
    return {
        "url": url,
        "object_key": object_name,
        "public_url": f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
    }

@router.post("/", response_model=ProductResponse)
async def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: ProductCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create new product with pre-uploaded S3 URL.
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        # Override seller_id to ensure the current user is the owner
        product_in.seller_id = user_id
        
        product = crud.crud_ecommerce.create_product(db=db, product=product_in)
        return product
    except Exception as e:
        logger.exception("Error creating product in database")
        raise HTTPException(status_code=500, detail=f"Error al guardar en base de datos: {str(e)}")

@router.post("/{product_id}/reviews", response_model=ReviewResponse)
def create_product_review(
    product_id: str,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Leave a review for a product.
    """
    return crud.crud_ecommerce.create_review(db, review=review_in, product_id=product_id, user_id=user_id)

@router.get("/{product_id}/reviews", response_model=List[ReviewResponse])
def get_product_reviews(
    product_id: str,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get reviews for a product.
    """
    return crud.crud_ecommerce.get_product_reviews(db, product_id=product_id, skip=skip, limit=limit)

# --- ADMIN ENDPOINTS FOR MODERATION ---

@router.get("/admin/pending", response_model=List[ProductResponse])
def get_pending_products(
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Retrieve products pending approval (Admin only)."""
    return crud.crud_ecommerce.get_pending_products(db)

@router.post("/admin/{product_id}/approve", response_model=ProductResponse)
def approve_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Approve a product (Admin only)."""
    product = crud.crud_ecommerce.approve_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/admin/{product_id}/reject")
def reject_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin)
) -> Any:
    """Reject and delete a product (Admin only)."""
    product = crud.crud_ecommerce.delete_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
