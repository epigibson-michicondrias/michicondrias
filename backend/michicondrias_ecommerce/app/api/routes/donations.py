import logging
import time
from typing import Any, List

import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.core import checkout_urls
from app.core.config import settings
from app.db.session import get_db
from app.schemas.ecommerce import (
    DonationCreate,
    DonationCheckoutCreate,
    DonationCheckoutResponse,
    DonationResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.get("/", response_model=List[DonationResponse])
def read_donations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Donaciones cobradas (las pendientes de pago no se listan)."""
    return crud.crud_ecommerce.get_donations(db, skip=skip, limit=min(max(limit, 1), 200))


@router.post("/", response_model=DonationResponse)
def create_donation(
    *,
    db: Session = Depends(get_db),
    donation_in: DonationCreate,
    user_id: str = Depends(deps.get_optional_user_id),
) -> Any:
    """Compatibilidad con clientes anteriores: crea una donación PENDIENTE (no cobrada ni listada).
    Para donar de verdad usa POST /donations/checkout."""
    if donation_in.amount < 10 or donation_in.amount > 100000:
        raise HTTPException(status_code=422, detail="El monto debe estar entre $10 y $100,000 MXN")
    return crud.crud_ecommerce.create_donation(db=db, donation=donation_in, user_id=user_id)


@router.post("/checkout", response_model=DonationCheckoutResponse)
def create_donation_checkout(
    *,
    db: Session = Depends(get_db),
    body: DonationCheckoutCreate,
    user_id: str = Depends(deps.get_optional_user_id),
) -> Any:
    """Crea una donación pendiente y su sesión de Stripe Checkout. Se marca 'paid' vía webhook."""
    if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_WEBHOOK_SECRET:
        # Sin webhook la donación nunca pasaría a pagada: se rechaza antes de cobrar nada.
        raise HTTPException(status_code=503, detail="Las donaciones con tarjeta no están disponibles por el momento.")

    amount_cents = round(body.amount * 100)
    donation = crud.crud_ecommerce.create_donation(
        db=db,
        donation=DonationCreate(amount=body.amount, currency="MXN", message=(body.message or "").strip() or None),
        user_id=user_id,
        status="pending",
    )
    try:
        success_url, cancel_url = checkout_urls.checkout_urls("donation", donation.id, body.source)
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "mxn",
                    "product_data": {
                        "name": "Donación Michicondrias",
                        "description": "Fondo de rescate y cuidado de michis",
                    },
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=donation.id,
            expires_at=int(time.time()) + 31 * 60,
            metadata={"kind": "donation", "donation_id": donation.id, "user_id": user_id or ""},
        )
    except Exception:
        logger.exception("Stripe donation session creation failed")
        crud.crud_ecommerce.update_donation_status(db, donation, "failed")
        raise HTTPException(status_code=502, detail="No se pudo iniciar el pago. Intenta de nuevo en unos minutos.")

    donation.stripe_session_id = session.id
    db.commit()
    return {"donation_id": donation.id, "sessionId": session.id, "url": session.url}


@router.get("/mine", response_model=List[DonationResponse])
def read_my_donations(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """Historial de donaciones del usuario (incluye pendientes/expiradas)."""
    return crud.crud_ecommerce.get_user_donations(db, user_id=user_id, skip=skip, limit=min(max(limit, 1), 100))


@router.get("/{donation_id}", response_model=DonationResponse)
def read_donation(
    donation_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_optional_user_id),
) -> Any:
    """Estado de una donación. Si sigue pendiente se consulta a Stripe por si el webhook aún no llegó."""
    donation = crud.crud_ecommerce.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donación no encontrada")
    if donation.user_id and donation.user_id != user_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta donación")
    if donation.status == "pending" and donation.stripe_session_id and settings.STRIPE_SECRET_KEY:
        try:
            session = stripe.checkout.Session.retrieve(donation.stripe_session_id)
            if session.get("payment_status") == "paid":
                donation = crud.crud_ecommerce.mark_donation_paid(db, donation)
            elif session.get("status") == "expired":
                donation = crud.crud_ecommerce.update_donation_status(db, donation, "expired")
        except Exception:
            logger.warning("No se pudo verificar la donación %s con Stripe", donation_id, exc_info=True)
    return donation
