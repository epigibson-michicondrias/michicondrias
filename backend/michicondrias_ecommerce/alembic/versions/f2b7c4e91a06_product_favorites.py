"""Favoritos de productos por usuario (product_favorites)

Revision ID: f2b7c4e91a06
Revises: e5a1c7d93b20
Create Date: 2026-10-19 12:00:00.000000

Idempotente (IF NOT EXISTS) y reversible. Al borrar un producto se borran sus favoritos (ON DELETE CASCADE).
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'f2b7c4e91a06'
down_revision: Union[str, Sequence[str], None] = 'e5a1c7d93b20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS product_favorites (
            id VARCHAR PRIMARY KEY,
            user_id VARCHAR NOT NULL,
            product_id VARCHAR NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            CONSTRAINT uq_product_favorites_user_product UNIQUE (user_id, product_id)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_favorites_user_id ON product_favorites (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_favorites_product_id ON product_favorites (product_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS product_favorites")
