from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.ecommerce import OrderCreate, OrderResponse

router = APIRouter()

@router.post("/", response_model=OrderResponse)
def create_order(
    *,
    db: Session = Depends(get_db),
    order_in: OrderCreate,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Finalize checkout and create an order.
    """
    try:
        return crud.crud_ecommerce.create_order(db, order_in=order_in, user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=List[OrderResponse])
def read_my_orders(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    skip: int = 0,
    limit: int = 20,
) -> Any:
    """
    Retrieve current user's order history.
    """
    return crud.crud_ecommerce.get_user_orders(db, user_id=user_id, skip=skip, limit=limit)

@router.get("/seller/me", response_model=List[OrderResponse])
def read_seller_orders(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Retrieve orders containing products from the current seller.
    """
    return crud.crud_ecommerce.get_seller_orders(db, seller_id=user_id, skip=skip, limit=limit)

@router.get("/{order_id}", response_model=OrderResponse)
def read_order(
    order_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Get order details.
    """
    order = crud.crud_ecommerce.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status_seller(
    order_id: str,
    status: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Update order status (Seller can update status for their orders).
    """
    order = crud.crud_ecommerce.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user is the seller of any product in this order
    from app.models.ecommerce import OrderItem, Product
    has_seller_product = db.query(OrderItem).join(Product).filter(
        OrderItem.order_id == order_id,
        Product.seller_id == user_id
    ).first()
    
    is_seller = has_seller_product is not None
    is_buyer = order.user_id == user_id
    if not is_seller and not is_buyer:
        raise HTTPException(status_code=403, detail="Not authorized to update this order")

    # El estado "paid" solo lo pone el webhook de Stripe (o un admin). Antes cualquiera podía enviar status=paid.
    if is_seller:
        if status not in ("confirmed", "shipped", "delivered", "cancelled"):
            raise HTTPException(status_code=400, detail="Estado no permitido")
        if order.status == "pending":
            raise HTTPException(status_code=400, detail="El pedido aún no está pagado")
    else:
        # El comprador solo puede cancelar un pedido que todavía no pagó
        if status != "cancelled" or order.status != "pending":
            raise HTTPException(status_code=403, detail="Solo puedes cancelar un pedido pendiente de pago")
        for item in order.items:  # devolver el stock apartado al crear el pedido
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity
    
    updated_order = crud.crud_ecommerce.update_order_status(db, order_id=order_id, status=status)
    return updated_order

# --- ADMIN ENDPOINTS ---

@router.get("/admin/all", response_model=List[OrderResponse])
def read_all_orders(
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Retrieve all orders across the system (Admin only).
    """
    return crud.crud_ecommerce.get_all_orders(db, skip=skip, limit=limit)

@router.patch("/admin/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    status: str,
    db: Session = Depends(get_db),
    admin_id: str = Depends(deps.require_admin),
) -> Any:
    """
    Update an order's status (Admin only).
    """
    order = crud.crud_ecommerce.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    updated_order = crud.crud_ecommerce.update_order_status(db, order_id=order_id, status=status)
    return updated_order
