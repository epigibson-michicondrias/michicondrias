"""Add training_reviews

Revision ID: a1d4b6f2c908
Revises:
Create Date: 2026-10-02 13:00:00.000000

Primera migración del servicio entrenadores (las demás tablas ya existen en la BD compartida).
Idempotente (IF NOT EXISTS) y reversible.
"""
from typing import Sequence, Union

from alembic import op


revision: str = 'a1d4b6f2c908'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS training_reviews (
            id VARCHAR(36) PRIMARY KEY,
            program_id VARCHAR(36) NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
            trainer_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            CONSTRAINT uq_training_reviews_program_user UNIQUE (program_id, user_id),
            CONSTRAINT ck_training_reviews_rating CHECK (rating >= 1 AND rating <= 5)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_training_reviews_program_id ON training_reviews (program_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_training_reviews_trainer_id ON training_reviews (trainer_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_training_reviews_user_id ON training_reviews (user_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS training_reviews")
