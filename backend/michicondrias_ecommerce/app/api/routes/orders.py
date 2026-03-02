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
