"""Add notifications.link (ruta de la app a la que lleva la notificación)

Revision ID: d3e9a7b4c215
Revises: c4f8e1a27d63
Create Date: 2026-10-07 18:00:00.000000

Idempotente (IF NOT EXISTS / IF EXISTS) y reversible. Columna nullable: los servicios que insertan
notificaciones sin `link` siguen funcionando igual.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'd3e9a7b4c215'
down_revision: Union[str, Sequence[str], None] = 'c4f8e1a27d63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link VARCHAR(255)")
    # El badge consulta "no leídas por usuario" en cada apertura de la app
    op.execute("CREATE INDEX IF NOT EXISTS ix_notifications_user_unread ON notifications (user_id) WHERE is_read = false")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_notifications_user_unread")
    op.execute("ALTER TABLE notifications DROP COLUMN IF EXISTS link")
