from sqlalchemy import create_engine, text

# Neon Database URL
DATABASE_URL = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
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
