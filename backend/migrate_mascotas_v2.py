import os
from sqlalchemy import create_engine, text

# Neon Database URL
DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Adding columns to pets table...")
    
    # Add gender
    try:
        conn.execute(text("ALTER TABLE pets ADD COLUMN gender VARCHAR(20);"))
        print("- Added gender")
    except Exception as e:
        print(f"- Error adding gender: {e}")

    # Add gallery
    try:
        conn.execute(text("ALTER TABLE pets ADD COLUMN gallery JSON;"))
        print("- Added gallery")
    except Exception as e:
        print(f"- Error adding gallery: {e}")

    conn.commit()
    print("Migration complete!")
