#!/usr/bin/env python3
import sys
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"

def run_migration():
    print("🚀 Iniciando migración para columnas de 2FA...")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # Añadir columnas si no existen
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS is_two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL;
            """))
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(100);
            """))
            conn.commit()
            print("✅ Columnas is_two_factor_enabled y two_factor_secret añadidas con éxito (o ya existían).")
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
