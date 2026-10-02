"""add lost_pet_sightings

Revision ID: a1c4e7d9b201
Revises: 55123be017cc
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = 'a1c4e7d9b201'
down_revision: Union[str, Sequence[str], None] = '55123be017cc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if 'lost_pet_sightings' in sa.inspect(bind).get_table_names():
        return
    op.create_table(
        'lost_pet_sightings',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('report_id', sa.String(), nullable=False, index=True),
        sa.Column('reporter_id', sa.String(), nullable=False, index=True),
        sa.Column('location_text', sa.String(255), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('lost_pet_sightings')
