"""Orders: payment_intent_id para reutilizar el PaymentIntent

Revision ID: c4f8a2e19b37
Revises: f2b7c4e91a06
Create Date: 2026-10-27 12:00:00.000000

Idempotente (IF NOT EXISTS) y reversible. Sin la columna, cada montaje de la
pantalla de pago creaba un PaymentIntent nuevo en Stripe.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'c4f8a2e19b37'
down_revision: Union[str, Sequence[str], None] = 'f2b7c4e91a06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR")
    op.execute("CREATE INDEX IF NOT EXISTS ix_orders_payment_intent_id ON orders (payment_intent_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_orders_payment_intent_id")
    op.execute("ALTER TABLE orders DROP COLUMN IF EXISTS payment_intent_id")
