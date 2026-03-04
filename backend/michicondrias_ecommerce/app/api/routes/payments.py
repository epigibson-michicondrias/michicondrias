from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe
import json
import httpx
import logging

logger = logging.getLogger(__name__)

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
        logger.exception("Stripe session creation failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-subscription-session/{pet_id}")
async def create_subscription_session(
    pet_id: str,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create a Stripe Checkout Session for Michi-Tracker Pro subscription.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe no está configurado.")

    try:
        # Create a checkout session for a recurring payment
        # Assuming you have a standard Price ID or you create it dynamically.
        # For this demo, we can use a hardcoded price_data for a test recurring item or create a Price on the fly.
        
        # NOTE: Stripe requires an existing Price object for subscriptions, or you can create one inline if using `price_data`.
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "mxn",
                        "product_data": {
                            "name": "Michi-Tracker Pro",
                            "description": "Suscripción mensual para rastreo GPS en tiempo real.",
                        },
                        "unit_amount": 19900, # $199.00 MXN
                        "recurring": {
                            "interval": "month"
                        }
                    },
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{settings.FRONTEND_URL}/dashboard/mascotas/{pet_id}?subscription=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard/mascotas/{pet_id}?subscription=cancelled",
            client_reference_id=pet_id, # We store pet_id here to know which pet to upgrade
            metadata={"pet_id": pet_id, "user_id": user_id}
        )
        return {"sessionId": checkout_session.id, "url": checkout_session.url}
    
    except Exception as e:
        logger.exception("Stripe subscription session creation failed")
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
        mode = session.get('mode')
        
        if mode == 'payment':
            # Regular Store Order
            order_id = session.get('client_reference_id')
            if order_id:
                db_order = crud.crud_ecommerce.get_order(db, order_id=order_id)
                if db_order and db_order.status != 'paid':
                    db_order.status = 'paid'
                    db.commit()
                    logger.info(f"Order {order_id} marked as paid.")
        
        elif mode == 'subscription':
            # Michi-Tracker Pro Subscription Setup
            pet_id = session.get('client_reference_id')
            subscription_id = session.get('subscription')
            if pet_id and subscription_id:
                logger.info(f"Activating Michi-Tracker Pro for pet {pet_id} (Sub: {subscription_id})")
                _notify_mascotas_service(pet_id, True, subscription_id)

    elif event['type'] == 'customer.subscription.deleted':
        # Subscription was cancelled or failed to pay for too long
        subscription = event['data']['object']
        subscription_id = subscription.get('id')
        logger.info(f"Subscription {subscription_id} cancelled. Revoking access.")
        # We need the pet_id to update. We could fetch it if we stored it in the subscription metadata
        # during creation, or we can broadcast a global block by subscription_id to Mascotas.
        # But wait, we can just hit a special endpoint or we can find by sub_id if we have one.
        # Mascotas needs logic to search by stripe_subscription_id. 
        # For now, let's call a theoretical endpoint that revokes by sub_id.
        _notify_mascotas_service_by_sub(subscription_id, False)

    return {"status": "success"}

def _notify_mascotas_service(pet_id: str, active: bool, sub_id: str):
    """Internal HTTP call to the Mascotas microservice to toggle the Tracker flag."""
    try:
        url = f"{settings.MASCOTAS_SERVICE_URL}/api/v1/pets/{pet_id}/subscription"
        payload = {"has_active_subscription": active, "stripe_subscription_id": sub_id}
        with httpx.Client() as client:
            resp = client.patch(url, json=payload, timeout=10.0)
            resp.raise_for_status()
            logger.info("Mascotas service updated successfully.")
    except Exception as e:
        logger.error(f"Failed to notify Mascotas service for pet {pet_id}: {e}")

def _notify_mascotas_service_by_sub(sub_id: str, active: bool):
    """Revoke subscription by sub_id (Since webhook only gives us sub_id on cancel)"""
    # Note: To fully implement this, Mascotas needs a `PATCH /pets/by-subscription/{sub_id}` endpoint.
    logger.warning("Subscription cancellation hook triggered.")
    try:
        url = f"{settings.MASCOTAS_SERVICE_URL}/api/v1/pets/by-subscription/{sub_id}"
        payload = {"has_active_subscription": active, "stripe_subscription_id": None}
        with httpx.Client() as client:
            resp = client.patch(url, json=payload, timeout=10.0)
            logger.info(f"Mascotas service revocation by sub {sub_id} status: {resp.status_code}")
    except Exception as e:
        logger.error(f"Failed to revoke Mascotas service sub {sub_id}: {e}")
