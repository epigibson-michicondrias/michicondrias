"""Tabla push_tokens (tokens de dispositivos para avisos push)

Revision ID: e7c4a9b2d6f8
Revises: f12a8b3c4d5e
Create Date: 2026-10-24 12:00:00.000000

Idempotente (IF NOT EXISTS) y reversible. user_id es referencia lógica a users.id
(sin FK entre servicios, como el resto del monorepo). token es único: el mismo
dispositivo solo conserva una fila, reasignable de usuario.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'e7c4a9b2d6f8'
down_revision: Union[str, Sequence[str], None] = 'f12a8b3c4d5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS push_tokens (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            token VARCHAR(512) NOT NULL,
            platform VARCHAR(20) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE,
            CONSTRAINT uq_push_tokens_token UNIQUE (token)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_push_tokens_user_id ON push_tokens (user_id)")
    # Los avisos push solo van a los dispositivos activos
    op.execute("CREATE INDEX IF NOT EXISTS ix_push_tokens_user_active ON push_tokens (user_id) WHERE is_active = true")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS push_tokens")
