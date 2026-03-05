
import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

def fix_schema():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("--- Altering pets table ---")
            conn.execute(text("ALTER TABLE pets ALTER COLUMN photo_url TYPE TEXT;"))
            
            print("--- Altering adoption_listings table ---")
            conn.execute(text("ALTER TABLE adoption_listings ALTER COLUMN photo_url TYPE TEXT;"))
            
            print("--- Altering users table (just in case) ---")
            # Check users table columns
            conn.execute(text("ALTER TABLE users ALTER COLUMN id_front_url TYPE TEXT;"))
            conn.execute(text("ALTER TABLE users ALTER COLUMN id_back_url TYPE TEXT;"))
            conn.execute(text("ALTER TABLE users ALTER COLUMN proof_of_address_url TYPE TEXT;"))
            
            conn.commit()
            print("SUCCESS: Schema updated (photo_url is now TEXT)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_schema()
