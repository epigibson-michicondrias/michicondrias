"""remove_medical_records_from_directorio

Revision ID: e22597b05a68
Revises: ff52b4db4eb2
Create Date: 2026-03-04 17:34:47.661493

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e22597b05a68'
down_revision: Union[str, Sequence[str], None] = 'ff52b4db4eb2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
