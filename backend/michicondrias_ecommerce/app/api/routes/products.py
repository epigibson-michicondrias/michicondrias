from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
import os
import uuid

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.ecommerce import ProductCreate, ProductUpdate, ProductResponse, ReviewCreate, ReviewResponse
from app.core.s3 import upload_file_to_s3

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

@router.post("/", response_model=ProductResponse)
async def create_product(
    *,
    db: Session = Depends(get_db),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    stock: int = Form(0),
    category_id: Optional[str] = Form(None),
    subcategory_id: Optional[str] = Form(None),
    specifications: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create new product with image upload to S3.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Handle empty strings from FormData
    cat_id = category_id if category_id and category_id.strip() else None
    subcat_id = subcategory_id if subcategory_id and subcategory_id.strip() else None

    image_url = None
    if image:
        try:
            # Generate a unique filename for S3
            ext = os.path.splitext(image.filename)[1] or ".jpg"
            unique_id = uuid.uuid4().hex
            object_name = f"products/{user_id}/{unique_id}{ext}"
            
            # Upload to S3
            image_url = upload_file_to_s3(image.file, object_name, content_type=image.content_type)
            if not image_url:
                logger.error(f"S3 Upload failed for product: {name}")
                raise HTTPException(status_code=500, detail="Error al subir la imagen a S3")
        except Exception as e:
            logger.exception("Unexpected error during S3 upload")
            raise HTTPException(status_code=500, detail=f"Error interno en S3: {str(e)}")

    try:
        product_in = ProductCreate(
            name=name,
            description=description,
            price=price,
            stock=stock,
            category_id=cat_id,
            subcategory_id=subcat_id,
            specifications=specifications,
            image_url=image_url,
            seller_id=user_id
        )
        
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
