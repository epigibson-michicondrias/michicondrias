
import os
from sqlalchemy import create_engine, text

# Use the connection string from the user's screenshot
DATABASE_URL = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

def diagnostic():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("--- Checking adoption_listings for Milanesillo ---")
            listings = conn.execute(text("SELECT id, name, status, adopted_by FROM adoption_listings WHERE name ILIKE '%Milanesillo%';")).fetchall()
            for l in listings:
                print(f"Listing ID: {l[0]}, Name: {l[1]}, Status: {l[2]}, AdoptedBy: {l[3]}")
                
                listing_id = l[0]
                print(f"\n--- Checking adoption_requests for Listing {listing_id} ---")
                requests = conn.execute(text(f"SELECT id, user_id, status FROM adoption_requests WHERE listing_id = '{listing_id}';")).fetchall()
                for r in requests:
                    print(f"  Req ID: {r[0]}, User ID: {r[1]}, Status: {r[2]}")
                    
                    user_id = r[1]
                    print(f"  --- Checking pets table for User {user_id} and Listing {listing_id} ---")
                    # Note: Column names might vary if migrations were different, but we check common ones
                    pets = conn.execute(text(f"SELECT id, owner_id, name, is_active, adopted_from_listing_id FROM pets WHERE owner_id = '{user_id}';")).fetchall()
                    for p in pets:
                        print(f"    Pet ID: {p[0]}, Owner: {p[1]}, Name: {p[2]}, Active: {p[3]}, FromListing: {p[4]}")

            print("\n--- Checking ALL recently created pets ---")
            all_pets = conn.execute(text("SELECT id, owner_id, name, created_at, is_active FROM pets ORDER BY created_at DESC LIMIT 5;")).fetchall()
            for p in all_pets:
                print(f"Pet ID: {p[0]}, Owner: {p[1]}, Name: {p[2]}, Created: {p[3]}, Active: {p[4]}")

    except Exception as e:
        print(f"Error during diagnostic: {e}")

if __name__ == "__main__":
    diagnostic()
