from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import stripe
import json
import httpx
import logging
import time

logger = logging.getLogger(__name__)

from app import crud
from app.api import deps
from app.db.session import get_db
from app.core.config import settings
from app.core import checkout_urls

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/create-checkout-session/{order_id}")
async def create_checkout_session(
    order_id: str,
    source: str | None = None,  # "app" => Stripe regresa a la app por deep link (ver core/checkout_urls.py)
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create a Stripe Checkout Session for a given order.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Los pagos no están disponibles por el momento.")

    crud.crud_ecommerce.release_stale_pending_orders(db)  # un pedido vencido no se cobra (F19)
    order = crud.crud_ecommerce.get_order(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="No puedes pagar este pedido")
    if order.status != "pending":
        detail = "El pedido fue cancelado. Crea uno nuevo desde tu bolsa." if order.status == "cancelled" else "Order is already paid"
        raise HTTPException(status_code=400, detail=detail)

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
                        "unit_amount": round(item.price_at_purchase * 100),  # Stripe usa centavos (round evita 19.99*100=1998.99)
                    },
                    "quantity": item.quantity,
                })

        if not line_items:
            raise HTTPException(status_code=400, detail="El pedido no tiene productos disponibles para cobrar")

        success_url, cancel_url = checkout_urls.checkout_urls("order", order.id, source)
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=order.id, # Link back to our DB order
            # La sesión caduca justo antes de que el pedido pendiente libere su stock (mínimo permitido por Stripe: 30 min)
            expires_at=int(time.time()) + 31 * 60,
            metadata={"order_id": order.id, "user_id": user_id}
        )
        return {"sessionId": checkout_session.id, "url": checkout_session.url}
    
    except HTTPException:
        raise
    except Exception:
        logger.exception("Stripe session creation failed")
        raise HTTPException(status_code=502, detail="No se pudo iniciar el pago. Intenta de nuevo en unos minutos.")

@router.post("/create-subscription-session/{pet_id}")
async def create_subscription_session(
    pet_id: str,
    source: str | None = None,
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Create a Stripe Checkout Session for Michi-Tracker Pro subscription.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Los pagos no están disponibles por el momento.")

    try:
        # Create a checkout session for a recurring payment
        # Assuming you have a standard Price ID or you create it dynamically.
        # For this demo, we can use a hardcoded price_data for a test recurring item or create a Price on the fly.
        
        # NOTE: Stripe requires an existing Price object for subscriptions, or you can create one inline if using `price_data`.
        success_url, cancel_url = checkout_urls.checkout_urls("subscription", pet_id, source)
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
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=pet_id, # We store pet_id here to know which pet to upgrade
            metadata={"pet_id": pet_id, "user_id": user_id}
        )
        return {"sessionId": checkout_session.id, "url": checkout_session.url}
    
    except Exception:
        logger.exception("Stripe subscription session creation failed")
        raise HTTPException(status_code=502, detail="No se pudo iniciar la suscripción. Intenta de nuevo en unos minutos.")

@router.get("/return", response_class=HTMLResponse, include_in_schema=False)
def checkout_return(kind: str, result: str, ref: str, session_id: str | None = None) -> HTMLResponse:
    """Puente público para volver a la app tras Stripe Checkout (Stripe solo redirige a http/https).
    Abre el deep link de la app; si no se abre, ofrece botón manual y enlace a la web."""
    from html import escape
    import json

    ref_ok = checkout_urls.safe_ref(ref)
    sid = checkout_urls.safe_session(session_id)
    if kind not in checkout_urls.KINDS or result not in checkout_urls.RESULTS or not ref_ok:
        raise HTTPException(status_code=400, detail="Enlace de retorno inválido")

    link = checkout_urls.deep_link(kind, result, ref_ok)
    web = checkout_urls.web_url(kind, result, ref_ok, sid)
    ok = result == "success"
    title = "¡Pago recibido!" if ok else "Pago no completado"
    text = ("Gracias. Vuelve a la app de Michicondrias para ver el estado." if ok
            else "No se hizo ningún cargo. Puedes volver a la app e intentarlo de nuevo.")
    page = f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)}</title>
<style>body{{font-family:system-ui,sans-serif;background:#0f0522;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px;text-align:center}}
.c{{max-width:380px}}a.b{{display:block;background:#f5c542;color:#1a0b3b;font-weight:700;padding:16px;border-radius:14px;text-decoration:none;margin:20px 0 12px}}
a.s{{color:#cbb8ff;font-size:14px}}p{{line-height:1.5;color:#d8ccf5}}</style></head><body><div class="c">
<h1>{escape(title)}</h1><p>{escape(text)}</p>
<a class="b" href="{escape(link)}">Abrir la app</a><a class="s" href="{escape(web)}">Continuar en el navegador</a></div>
<script>setTimeout(function(){{window.location.href={json.dumps(link)};}},300);</script></body></html>"""
    return HTMLResponse(page)


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Listen for Stripe events (e.g. payment success) to securely update DB records.
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook de Stripe no configurado")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        mode = session.get('mode')
        meta = session.get('metadata') or {}

        if mode == 'payment' and meta.get('kind') == 'donation':
            # Donación: solo se marca pagada si Stripe confirma el cobro (payment_status == 'paid')
            donation_id = meta.get('donation_id') or session.get('client_reference_id')
            db_donation = crud.crud_ecommerce.get_donation(db, donation_id) if donation_id else None
            if db_donation and session.get('payment_status') == 'paid':
                crud.crud_ecommerce.mark_donation_paid(db, db_donation)
                logger.info(f"Donation {donation_id} marked as paid.")

        elif mode == 'payment':
            # Regular Store Order
            order_id = session.get('client_reference_id')
            if order_id:
                db_order = crud.crud_ecommerce.get_order_for_update(db, order_id=order_id)
                # Solo pendientes (o cancelados por tiempo con pago tardío) pasan a pagado; un evento repetido no
                # debe regresar a "paid" un pedido que ya fue enviado o entregado.
                if db_order and db_order.status in ('pending', 'cancelled'):
                    if db_order.status == 'cancelled':
                        # El stock ya se había devuelto: se vuelve a apartar (sin bajar de 0)
                        for item in db_order.items:
                            product = crud.crud_ecommerce.get_product(db, item.product_id)
                            if product:
                                product.stock = max(0, (product.stock or 0) - item.quantity)
                        logger.warning(f"Order {order_id} was cancelled but paid; reactivating.")
                    db_order.status = 'paid'
                    db.commit()
                    logger.info(f"Order {order_id} marked as paid.")
                    crud.crud_ecommerce.notify_order_paid(db, db_order)
        
        elif mode == 'subscription':
            # Michi-Tracker Pro Subscription Setup
            pet_id = session.get('client_reference_id')
            subscription_id = session.get('subscription')
            if pet_id and subscription_id:
                logger.info(f"Activating Michi-Tracker Pro for pet {pet_id} (Sub: {subscription_id})")
                _notify_mascotas_service(pet_id, True, subscription_id)

    elif event['type'] == 'checkout.session.expired':
        session = event['data']['object']
        meta = session.get('metadata') or {}
        if meta.get('kind') == 'donation':
            donation_id = meta.get('donation_id') or session.get('client_reference_id')
            db_donation = crud.crud_ecommerce.get_donation(db, donation_id) if donation_id else None
            if db_donation and db_donation.status == 'pending':
                crud.crud_ecommerce.update_donation_status(db, db_donation, 'expired')

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

def _internal_headers() -> dict:
    return {"X-Internal-Token": settings.INTERNAL_SERVICE_TOKEN or ""}


def _notify_mascotas_service(pet_id: str, active: bool, sub_id: str):
    """Internal HTTP call to the Mascotas microservice to toggle the Tracker flag."""
    try:
        url = f"{settings.MASCOTAS_SERVICE_URL}/api/v1/pets/{pet_id}/subscription"
        payload = {"has_active_subscription": active, "stripe_subscription_id": sub_id}
        with httpx.Client() as client:
            resp = client.patch(url, json=payload, headers=_internal_headers(), timeout=10.0)
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
            resp = client.patch(url, json=payload, headers=_internal_headers(), timeout=10.0)
            logger.info(f"Mascotas service revocation by sub {sub_id} status: {resp.status_code}")
    except Exception as e:
        logger.error(f"Failed to revoke sub {sub_id}: {e}")


@router.post("/billing/portal-session")
async def create_billing_portal_session(
    user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """Create a Stripe Billing Portal session for unified subscription/billing management."""
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Los pagos no están disponibles por el momento.")

    safe_user_id = "".join(c for c in user_id if c.isalnum() or c == "-")
    try:
        # El cliente de Stripe se busca por el user_id guardado en su metadata; nunca se toma uno ajeno
        found = stripe.Customer.search(query=f"metadata['user_id']:'{safe_user_id}'", limit=1)
        if found and len(found.data) > 0:
            customer_id = found.data[0].id
        else:
            customer_id = stripe.Customer.create(metadata={"user_id": safe_user_id}).id

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{settings.FRONTEND_URL}/dashboard/billing",
        )
        return {"url": session.url}
    except Exception:
        logger.exception("Billing portal session creation failed")
        raise HTTPException(status_code=502, detail="No se pudo abrir el portal de facturación. Intenta de nuevo en unos minutos.")
