from sqlalchemy import create_engine, text
import os

# Neon Database URL
DATABASE_URL = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Adding enrichment columns to adoption_listings...")
    
    # Add gender
    try:
        conn.execute(text("ALTER TABLE adoption_listings ADD COLUMN gender VARCHAR(20);"))
        print("- Added gender")
    except Exception as e:
        print(f"- Error adding gender: {e}")

    # Add location
    try:
        conn.execute(text("ALTER TABLE adoption_listings ADD COLUMN location VARCHAR(100);"))
        print("- Added location")
    except Exception as e:
        print(f"- Error adding location: {e}")

    # Add is_emergency
    try:
        conn.execute(text("ALTER TABLE adoption_listings ADD COLUMN is_emergency BOOLEAN DEFAULT FALSE;"))
        print("- Added is_emergency")
    except Exception as e:
        print(f"- Error adding is_emergency: {e}")

    # Add gallery
    try:
        conn.execute(text("ALTER TABLE adoption_listings ADD COLUMN gallery JSON;"))
        print("- Added gallery")
    except Exception as e:
        print(f"- Error adding gallery: {e}")

    conn.commit()
    print("Migration complete!")
