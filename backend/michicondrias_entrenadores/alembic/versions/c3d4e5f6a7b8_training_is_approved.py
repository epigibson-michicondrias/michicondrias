"""Aprobación admin para programas de entrenamiento (X3.1)

Revision ID: c3d4e5f6a7b8
Revises: (último de entrenadores)
Create Date: 2026-10-25

Aditiva e idempotente: `is_approved` default true (no rompe datos existentes).
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'a1d4b6f2c908'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE training_programs ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true")


def downgrade() -> None:
    op.execute("ALTER TABLE training_programs DROP COLUMN IF EXISTS is_approved")
