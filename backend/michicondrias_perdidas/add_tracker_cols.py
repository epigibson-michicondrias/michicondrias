import psycopg2
import os
import sys

# Agregamos la ruta para poder importar de app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.config import settings

def main():
    try:
        conn = psycopg2.connect(
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        queries = [
            "ALTER TABLE lost_pet_reports ADD COLUMN has_tracker BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE lost_pet_reports ADD COLUMN tracker_device_id VARCHAR(100);",
            "ALTER TABLE lost_pet_reports ADD COLUMN current_lat FLOAT;",
            "ALTER TABLE lost_pet_reports ADD COLUMN current_lng FLOAT;",
            "ALTER TABLE lost_pet_reports ADD COLUMN last_tracked_at TIMESTAMP WITH TIME ZONE;"
        ]
        
        for q in queries:
            try:
                cursor.execute(q)
                print(f"Válido: {q}")
            except Exception as e:
                print(f"Ignorado o ya existe: {e}")
                
        cursor.close()
        conn.close()
        print("Columnas tracker añadidas exitosamente.")
    except Exception as e:
        print(f"Error fatal conectando a DB: {e}")

if __name__ == "__main__":
    main()
