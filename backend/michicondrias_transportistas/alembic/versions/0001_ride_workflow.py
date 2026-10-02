"""Flujo completo de viajes: cliente, aceptación, fechas, ruta y calificación

Idempotente: las tablas pet_rides/driver_profiles ya existían (creadas sin alembic), así que se
crean solo si faltan y las columnas nuevas se añaden con IF NOT EXISTS (PostgreSQL).

Revision ID: 0001_ride_workflow
Revises:
Create Date: 2026-10-02
"""
from typing import Sequence, Union

from alembic import op

revision: str = "0001_ride_workflow"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_COLUMNS = [
    ("client_id", "VARCHAR(36)"),
    ("preferred_driver_id", "VARCHAR(36)"),
    ("origin_lat", "DOUBLE PRECISION"),
    ("origin_lng", "DOUBLE PRECISION"),
    ("destination_lat", "DOUBLE PRECISION"),
    ("destination_lng", "DOUBLE PRECISION"),
    ("distance_km", "DOUBLE PRECISION"),
    ("scheduled_at", "TIMESTAMP WITH TIME ZONE"),
    ("notes", "VARCHAR(500)"),
    ("created_at", "TIMESTAMP WITH TIME ZONE DEFAULT now()"),
    ("accepted_at", "TIMESTAMP WITH TIME ZONE"),
    ("started_at", "TIMESTAMP WITH TIME ZONE"),
    ("completed_at", "TIMESTAMP WITH TIME ZONE"),
    ("cancelled_at", "TIMESTAMP WITH TIME ZONE"),
    ("cancelled_by", "VARCHAR(36)"),
    ("cancel_reason", "VARCHAR(255)"),
    ("rating", "INTEGER"),
    ("rating_comment", "VARCHAR(500)"),
    ("rated_at", "TIMESTAMP WITH TIME ZONE"),
]


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS pet_rides (
            id VARCHAR(36) PRIMARY KEY,
            driver_id VARCHAR(36),
            pet_id VARCHAR(36) NOT NULL,
            origin_address VARCHAR(255) NOT NULL,
            destination_address VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            price DOUBLE PRECISION,
            requires_carrier BOOLEAN DEFAULT TRUE,
            current_lat DOUBLE PRECISION,
            current_lng DOUBLE PRECISION
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS driver_profiles (
            id VARCHAR(36) PRIMARY KEY,
            driver_id VARCHAR(36) NOT NULL UNIQUE,
            vehicle_model VARCHAR(100) NOT NULL,
            vehicle_plate VARCHAR(30) NOT NULL,
            max_capacity INTEGER DEFAULT 1,
            has_air_conditioning BOOLEAN DEFAULT FALSE,
            has_carriers BOOLEAN DEFAULT FALSE,
            is_available BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
        """
    )
    # El conductor ahora se asigna al aceptar: driver_id puede ser NULL.
    op.execute("ALTER TABLE pet_rides ALTER COLUMN driver_id DROP NOT NULL")
    for name, ddl in NEW_COLUMNS:
        op.execute(f"ALTER TABLE pet_rides ADD COLUMN IF NOT EXISTS {name} {ddl}")
    for col in ("driver_id", "client_id", "preferred_driver_id", "status"):
        op.execute(f"CREATE INDEX IF NOT EXISTS ix_pet_rides_{col} ON pet_rides ({col})")


def downgrade() -> None:
    for col in ("status", "preferred_driver_id", "client_id", "driver_id"):
        op.execute(f"DROP INDEX IF EXISTS ix_pet_rides_{col}")
    for name, _ in reversed(NEW_COLUMNS):
        op.execute(f"ALTER TABLE pet_rides DROP COLUMN IF EXISTS {name}")
    # driver_id se deja nullable a propósito (no se borran viajes abiertos al revertir).
