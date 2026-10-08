"""F14: marcas de aviso enviado para dosis de medicamento y refuerzos de vacuna

Revision ID: c14a7e2b9d01
Revises: 01c6019e217b
Create Date: 2026-10-08

Aditiva e idempotente: `sent` sigue significando «el dueño marcó la dosis como dada»; el aviso a la bandeja se
registra aparte para no confundir ambas cosas.
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'c14a7e2b9d01'
down_revision: Union[str, Sequence[str], None] = '01c6019e217b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE medication_reminders ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ")
    op.execute("ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS booster_notified_at TIMESTAMPTZ")


def downgrade() -> None:
    op.execute("ALTER TABLE vaccines DROP COLUMN IF EXISTS booster_notified_at")
    op.execute("ALTER TABLE medication_reminders DROP COLUMN IF EXISTS notified_at")
