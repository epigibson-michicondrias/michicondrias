"""Add users.phone, users.location, users.bio

Revision ID: c4f8e1a27d63
Revises: b7d2c9a41e55
Create Date: 2026-10-02 12:30:00.000000

Idempotente (IF NOT EXISTS / IF EXISTS) y reversible.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'c4f8e1a27d63'
down_revision: Union[str, Sequence[str], None] = 'b7d2c9a41e55'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(120)")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(500)")


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS bio")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS location")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS phone")
