"""Add users.reset_code_hash / reset_code_expires_at (código de 6 dígitos para recuperar la contraseña)

Revision ID: f12a8b3c4d5e
Revises: d3e9a7b4c215
Create Date: 2026-10-08 00:30:00.000000

Idempotente (IF NOT EXISTS / IF EXISTS) y reversible. Columnas nullable: el flujo de enlace
(reset-password con token) sigue funcionando mientras tanto, y los usuarios sin código pendiente
no cambian.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'f12a8b3c4d5e'
down_revision: Union[str, Sequence[str], None] = 'd3e9a7b4c215'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Hash HMAC del código (nunca el código en claro) y su vencimiento
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_hash VARCHAR(128)")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expires_at TIMESTAMPTZ")


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS reset_code_expires_at")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS reset_code_hash")
