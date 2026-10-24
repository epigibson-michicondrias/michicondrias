"""Add is_suspended to clinics

Revision ID: c4e8a1b2d3f4
Revises: a1c0de5e7001
Create Date: 2026-10-23 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4e8a1b2d3f4'
down_revision: Union[str, Sequence[str], None] = 'a1c0de5e7001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('clinics', sa.Column('is_suspended', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('clinics', 'is_suspended')
