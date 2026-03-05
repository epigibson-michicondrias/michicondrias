
import os
from sqlalchemy import create_engine, inspect

# Use the connection string from the user's screenshot
DATABASE_URL = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

def diagnostic():
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        print("--- Table: pets ---")
        if "pets" in inspector.get_table_names():
            columns = inspector.get_columns("pets")
            for col in columns:
                print(f"Column: {col['name']} ({col['type']})")
            
            with engine.connect() as conn:
                from sqlalchemy import text
                res = conn.execute(text("SELECT id, owner_id, name, is_active FROM pets WHERE name ILIKE '%Milanesillo%';")).fetchall()
                print(f"\n--- Records Found: {len(res)} ---")
                for row in res:
                    print(f"ID: {row[0]}, Owner: {row[1]}, Name: {row[2]}, Active: {row[3]}")
                
                # Check users to see if owner_id exists
                if len(res) > 0:
                    owner_id = res[0][1]
                    user_res = conn.execute(text(f"SELECT id, email FROM users WHERE id = '{owner_id}';")).fetchone()
                    if user_res:
                        print(f"Owner User Found: {user_res[1]} (ID: {user_res[0]})")
                    else:
                        print(f"WARNING: Owner ID {owner_id} NOT found in users table!")
        else:
            print("Table 'pets' NOT found!")

    except Exception as e:
        print(f"Error during diagnostic: {e}")

if __name__ == "__main__":
    diagnostic()
