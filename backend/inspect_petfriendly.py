import os
from sqlalchemy import create_engine, text

URL = "postgresql://postgres.zaegmfufrzjmjiemrvvp:Michicondrias201094*@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

def main():
    try:
        engine = create_engine(URL)
        with engine.connect() as conn:
            print("Inspeccionando columnas de 'petfriendly_places'...")
            result = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'petfriendly_places';
            """))
            columns = result.fetchall()
            if not columns:
                print("⚠️ No se encontró la tabla 'petfriendly_places'.")
            for col in columns:
                print(f"- {col[0]}: {col[1]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
