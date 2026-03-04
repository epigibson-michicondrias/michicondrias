import os
import sys
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine

def main():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog');"))
            tables = result.fetchall()
            print("Tablas en DB:")
            for row in tables:
                print(row)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
