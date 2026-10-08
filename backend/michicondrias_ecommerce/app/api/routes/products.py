from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
import os
import uuid

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.ecommerce import ProductCreate, ProductUpdate, ProductResponse, ReviewCreate, ReviewResponse, ReviewEligibility, PresignedUrlResponse
from app.core.s3 import upload_file_to_s3, generate_presigned_url
from app.core.config import settings

router = APIRouter()


def require_seller(token: str = Depends(deps.oauth2_scheme)) -> str:
    """Solo vendedores (o admin) publican productos; un consumidor no puede crear su propio catálogo."""
    payload = deps._decode_token(token)
    if payload.get("role", "consumidor") not in ("vendedor", "admin"):
        raise HTTPException(status_code=403, detail="Solo los vendedores pueden publicar productos")
    return payload["sub"]

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

@router.get("/seller/me", response_model=List[ProductResponse])
def read_my_products(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Retrieve products created by the current seller.
    """
    return crud.crud_ecommerce.get_products(db, seller_id=user_id)

@router.get("/presigned-url", response_model=PresignedUrlResponse)
def get_presigned_url(
    file_extension: Optional[str] = None,
    ext: Optional[str] = None,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Get a presigned URL for S3 upload. Declarada antes de /{product_id}: si no, la ruta dinámica la tapaba (404).
    Acepta `file_extension` o `ext` (como el resto de microservicios).
    """
    from app.core.s3 import image_content_type
    try:
        clean_ext, content_type = image_content_type(file_extension or ext or "")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Usa jpg, png, webp, gif o heic.")

    unique_id = uuid.uuid4().hex
    object_name = f"products/{user_id}/{unique_id}.{clean_ext}"

    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="Could not generate presigned URL")

    return {
        "url": url,
        "object_key": object_name,
        "public_url": f"{settings.STORAGE_BASE_URL}/{object_name}"
    }

def _viewer(token: Optional[str]) -> Optional[dict]:
    """Payload del token si es válido (sin exigir login); None para visitantes."""
    try:
        return deps._decode_token(token) if token else None
    except HTTPException:
        return None


@router.get("/{product_id}", response_model=ProductResponse)
def read_product(
    product_id: str,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(deps.oauth2_scheme),
) -> Any:
    """
    Get a specific product by id. (Public endpoint)
    Los productos pendientes de aprobación o desactivados solo los ve su vendedor o un admin.
    """
    product = crud.crud_ecommerce.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not (product.is_active and product.is_approved):
        viewer = _viewer(token)
        if not viewer or (viewer.get("sub") != product.seller_id and viewer.get("role") != "admin"):
            raise HTTPException(status_code=404, detail="Product not found")
    return product

def _validate_category(db: Session, category_id: Optional[str], subcategory_id: Optional[str]) -> None:
    from app.models.ecommerce import Category, Subcategory
    if category_id and not db.query(Category.id).filter(Category.id == category_id).first():
        raise HTTPException(status_code=400, detail="La categoría seleccionada no existe")
    if subcategory_id:
        sub = db.query(Subcategory).filter(Subcategory.id == subcategory_id).first()
        if not sub or (category_id and sub.category_id != category_id):
            raise HTTPException(status_code=400, detail="La subcategoría seleccionada no es válida")


@router.post("/", response_model=ProductResponse)
async def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: ProductCreate,
    user_id: str = Depends(require_seller),
) -> Any:
    """
    Create new product with pre-uploaded S3 URL.
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        # Override seller_id to ensure the current user is the owner
        product_in.seller_id = user_id
        _validate_category(db, product_in.category_id, product_in.subcategory_id)
        
        product = crud.crud_ecommerce.create_product(db=db, product=product_in)
        return product
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error creating product in database")
        raise HTTPException(status_code=500, detail="No se pudo guardar el producto. Intenta de nuevo.")

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    *,
    db: Session = Depends(get_db),
    product_in: ProductUpdate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Update a product. Only the seller can update their own products.
    """
    product = crud.crud_ecommerce.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")
    
    update_data = product_in.model_dump(exclude_unset=True)
    update_data.pop("category", None)  # campo legado: "category" es una relación, no una columna
    if "category_id" in update_data or "subcategory_id" in update_data:
        _validate_category(db, update_data.get("category_id", product.category_id), update_data.get("subcategory_id"))
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Delete a product. Only the seller can delete their own products.
    """
    product = crud.crud_ecommerce.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    
    crud.crud_ecommerce.delete_product(db, product_id)
    return {"message": "Product deleted successfully"}

@router.post("/{product_id}/reviews", response_model=ReviewResponse)
def create_product_review(
    product_id: str,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Leave a review for a product. Solo quien compró (pedido pagado) puede opinar, una vez por producto.
    """
    product = crud.crud_ecommerce.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not crud.crud_ecommerce.user_has_purchased(db, user_id, product_id):
        raise HTTPException(status_code=403, detail="Solo puedes opinar sobre productos que ya compraste y pagaste.")
    if crud.crud_ecommerce.user_has_reviewed(db, user_id, product_id):
        raise HTTPException(status_code=409, detail="Ya calificaste este producto.")
    return crud.crud_ecommerce.create_review(db, review=review_in, product_id=product_id, user_id=user_id)

@router.get("/{product_id}/review-eligibility", response_model=ReviewEligibility)
def get_review_eligibility(
    product_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    ¿Puede el usuario opinar sobre este producto? (F19) La app solo muestra el formulario si `can_review`.
    `reason`: "not_purchased" (no tiene un pedido pagado con él) o "already_reviewed".
    """
    if not crud.crud_ecommerce.user_has_purchased(db, user_id, product_id):
        return {"can_review": False, "reason": "not_purchased"}
    if crud.crud_ecommerce.user_has_reviewed(db, user_id, product_id):
        return {"can_review": False, "reason": "already_reviewed"}
    return {"can_review": True, "reason": None}

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
