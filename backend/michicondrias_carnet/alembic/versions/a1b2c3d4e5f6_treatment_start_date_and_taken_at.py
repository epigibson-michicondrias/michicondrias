"""Fecha de inicio del tratamiento (la fija el dueño) y sello de cada toma

Revision ID: a1b2c3d4e5f6
Revises: d7f3b8a1c925
Create Date: 2026-10-25

Aditivas e idempotentes. `prescriptions.start_date` es nullable: si es null se usa la fecha de la consulta
(comportamiento actual). `medication_reminders.taken_at` guarda cuándo el dueño marcó la toma.
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'd7f3b8a1c925'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS start_date TEXT")
    op.execute("ALTER TABLE medication_reminders ADD COLUMN IF NOT EXISTS taken_at TEXT")


def downgrade() -> None:
    op.execute("ALTER TABLE medication_reminders DROP COLUMN IF EXISTS taken_at")
    op.execute("ALTER TABLE prescriptions DROP COLUMN IF EXISTS start_date")
