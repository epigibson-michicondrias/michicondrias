from sqlalchemy import create_engine, text
import json

DATABASE_URL = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
engine = create_engine(DATABASE_URL)

PET_ID = "b76c16ca-d07d-4113-ade2-4c4228bd07d0"

with engine.connect() as conn:
    result = conn.execute(text(f"SELECT * FROM adoption_listings WHERE id = '{PET_ID}'"))
    row = result.fetchone()
    if row:
        # Convert row to dict for easier reading
        data = dict(row._mapping)
        print(json.dumps(data, indent=2, default=str))
    else:
        print("Pet not found")
