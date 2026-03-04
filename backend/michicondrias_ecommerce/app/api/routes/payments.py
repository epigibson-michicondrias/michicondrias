from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe
import json

from app import crud
from app.api import deps
from app.db.session import get_db
from app.core.config import settings

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/create-checkout-session/{order_id}")
async def create_checkout_session(
    order_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create a Stripe Checkout Session for a given order.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe no está configurado.")

    order = crud.crud_ecommerce.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if order.status == "paid":
        raise HTTPException(status_code=400, detail="Order is already paid")

    try:
        # Build line items
        line_items = []
        for item in order.items:
            product = crud.crud_ecommerce.get_product(db, item.product_id)
            if product:
                line_items.append({
                    "price_data": {
                        "currency": "mxn",
                        "product_data": {
                            "name": product.name,
                            "description": product.description or "Producto de Michicondrias Tienda",
                            "images": [product.image_url] if product.image_url else [],
                        },
                        "unit_amount": int(item.price_at_purchase * 100), # Stripe uses cents
                    },
                    "quantity": item.quantity,
                })

        # Create session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{settings.FRONTEND_URL}/dashboard/tienda/pago-exitoso?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard/tienda/pago-cancelado",
            client_reference_id=order.id, # Link back to our DB order
            metadata={"order_id": order.id, "user_id": user_id}
        )
        return {"sessionId": checkout_session.id, "url": checkout_session.url}
    
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Stripe session creation failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Listen for Stripe events (e.g. payment success) to securely update DB records.
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Stripe Webhook Secret not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order_id = session.get('client_reference_id')
        
        if order_id:
            db_order = crud.crud_ecommerce.get_order(db, order_id=order_id)
            if db_order and db_order.status != 'paid':
                db_order.status = 'paid'
                db.commit()

    return {"status": "success"}
