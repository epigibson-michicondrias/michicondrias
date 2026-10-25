"""Aprobación admin para establecimientos (X3.1)

Revision ID: b2c3d4e5f6a7
Revises: (último de establecimientos)
Create Date: 2026-10-25

Aditiva e idempotente: `is_approved` default true (no rompe datos existentes).
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE pet_friendly_venues ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true")


def downgrade() -> None:
    op.execute("ALTER TABLE pet_friendly_venues DROP COLUMN IF EXISTS is_approved")
