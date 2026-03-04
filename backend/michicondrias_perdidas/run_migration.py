import os
import sys
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine

def main():
    try:
        with engine.connect() as conn:
            queries = [
                "ALTER TABLE lost_pet_reports ADD COLUMN has_tracker BOOLEAN DEFAULT FALSE;",
                "ALTER TABLE lost_pet_reports ADD COLUMN tracker_device_id VARCHAR(100);",
                "ALTER TABLE lost_pet_reports ADD COLUMN current_lat FLOAT;",
                "ALTER TABLE lost_pet_reports ADD COLUMN current_lng FLOAT;",
                "ALTER TABLE lost_pet_reports ADD COLUMN last_tracked_at TIMESTAMP WITH TIME ZONE;"
            ]
            
            for q in queries:
                try:
                    conn.execute(text(q))
                    conn.commit()
                    print(f"Válido: {q}")
                except Exception as e:
                    # rollback to clear the error state and continue
                    conn.rollback()
                    print(f"Ignorado o ya existe")
                    
        print("Migración SQLAlchemy finalizada exitosamente.")
    except Exception as e:
        print(f"Falla fatal de conexión a DB con URI ({engine.url}): {e}")

if __name__ == "__main__":
    main()
