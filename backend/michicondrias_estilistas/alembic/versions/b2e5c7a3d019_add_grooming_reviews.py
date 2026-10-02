"""Add grooming_reviews

Revision ID: b2e5c7a3d019
Revises:
Create Date: 2026-10-02 13:05:00.000000

Primera migración del servicio estilistas (las demás tablas ya existen en la BD compartida).
Idempotente (IF NOT EXISTS) y reversible.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'b2e5c7a3d019'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS grooming_reviews (
            id VARCHAR(36) PRIMARY KEY,
            appointment_id VARCHAR(36) NOT NULL REFERENCES grooming_appointments(id) ON DELETE CASCADE,
            groomer_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            CONSTRAINT uq_grooming_reviews_appointment_user UNIQUE (appointment_id, user_id),
            CONSTRAINT ck_grooming_reviews_rating CHECK (rating >= 1 AND rating <= 5)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_grooming_reviews_appointment_id ON grooming_reviews (appointment_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_grooming_reviews_groomer_id ON grooming_reviews (groomer_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_grooming_reviews_user_id ON grooming_reviews (user_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS grooming_reviews")
