"""El dueño activa o desactiva los avisos de cada medicamento recetado

Revision ID: d7f3b8a1c925
Revises: c14a7e2b9d01
Create Date: 2026-10-24

Aditiva e idempotente: por defecto los avisos siguen activos (comportamiento actual). Con `false` las tomas se
siguen programando y se pueden marcar como dadas; solo deja de llegar el aviso a la bandeja.
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'd7f3b8a1c925'
down_revision: Union[str, Sequence[str], None] = 'c14a7e2b9d01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN NOT NULL DEFAULT true")


def downgrade() -> None:
    op.execute("ALTER TABLE prescriptions DROP COLUMN IF EXISTS reminders_enabled")
