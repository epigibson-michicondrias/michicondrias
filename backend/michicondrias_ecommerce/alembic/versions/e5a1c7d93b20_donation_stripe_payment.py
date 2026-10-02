"""Donaciones con pago real: stripe_session_id y paid_at

Revision ID: e5a1c7d93b20
Revises: d3cceadb380a
Create Date: 2026-10-02 12:00:00.000000

Idempotente (IF NOT EXISTS) y reversible. Las donaciones anteriores quedan con status 'completed' (se tratan como pagadas).
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'e5a1c7d93b20'
down_revision: Union[str, Sequence[str], None] = 'd3cceadb380a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE donations ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR")
    op.execute("ALTER TABLE donations ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE")
    op.execute("CREATE INDEX IF NOT EXISTS ix_donations_stripe_session_id ON donations (stripe_session_id)")
    op.execute("ALTER TABLE donations ALTER COLUMN status SET DEFAULT 'pending'")


def downgrade() -> None:
    op.execute("ALTER TABLE donations ALTER COLUMN status SET DEFAULT 'completed'")
    op.execute("DROP INDEX IF EXISTS ix_donations_stripe_session_id")
    op.execute("ALTER TABLE donations DROP COLUMN IF EXISTS paid_at")
    op.execute("ALTER TABLE donations DROP COLUMN IF EXISTS stripe_session_id")
