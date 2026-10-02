"""clinic_prescriptions: las recetas de clínica dejan de compartir el nombre 'prescriptions' con el carnet

Revision ID: a1c0de5e7001
Revises: e22597b05a68
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'a1c0de5e7001'
down_revision: Union[str, Sequence[str], None] = 'e22597b05a68'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE IF NOT EXISTS clinic_prescriptions (
        id UUID PRIMARY KEY,
        clinic_id VARCHAR NOT NULL,
        patient_id VARCHAR NOT NULL,
        veterinarian_id VARCHAR NOT NULL,
        medications JSONB NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        notes TEXT,
        issued_date TIMESTAMPTZ DEFAULT now(),
        expiry_date TIMESTAMPTZ,
        filled_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ
    )""")
    # Si en la BD "prescriptions" tenía la forma de clínica (tabla creada a mano), se copian esas filas.
    op.execute("""
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prescriptions' AND column_name='clinic_id') THEN
        INSERT INTO clinic_prescriptions (id, clinic_id, patient_id, veterinarian_id, medications, status, notes, issued_date, expiry_date, filled_date, created_at, updated_at)
        SELECT id::uuid, clinic_id, patient_id, veterinarian_id, medications, status, notes, issued_date, expiry_date, filled_date, created_at, updated_at
        FROM prescriptions ON CONFLICT (id) DO NOTHING;
      END IF;
    END $$""")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS clinic_prescriptions")
