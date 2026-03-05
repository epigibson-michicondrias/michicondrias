
import os
import uuid
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

def fix_milanesillo():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("--- Fetching Milanesillo listing info ---")
            l = conn.execute(text("SELECT * FROM adoption_listings WHERE name ILIKE '%Milanesillo%';")).fetchone()
            if not l:
                print("Milanesillo listing not found!")
                return

            # Map listing columns to pet columns
            # Column indices based on the table structure we saw earlier
            # We'll use col names for safety if we can, but since we use Text we can use a dict
            listing = dict(l._mapping)
            print(f"Listing ID: {listing['id']}, Owner: {listing['adopted_by']}")

            owner_id = listing['adopted_by']
            if not owner_id:
                # Try to get from request if not in listing
                r = conn.execute(text(f"SELECT user_id FROM adoption_requests WHERE listing_id = '{listing['id']}' AND status = 'ADOPTED';")).fetchone()
                if r:
                    owner_id = r[0]
                else:
                    print("Could not find owner ID!")
                    return

            # Check if pet already exists to avoid double insert
            existing = conn.execute(text(f"SELECT id FROM pets WHERE name = '{listing['name']}' AND owner_id = '{owner_id}';")).fetchone()
            if existing:
                print(f"Pet already exists with ID: {existing[0]}")
                return

            # Generate new pet ID
            pet_id = str(uuid.uuid4())
            
            print(f"Creating pet record with ID: {pet_id}")
            # Insert into pets table
            # We explicitly list common columns. If some don't exist, SQLAlchemy will fail but we've migrated.
            conn.execute(text("""
                INSERT INTO pets (
                    id, owner_id, name, species, breed, age_months, size, description, photo_url, 
                    is_active, adopted_from_listing_id,
                    is_vaccinated, is_sterilized, is_dewormed, temperament, energy_level,
                    social_cats, social_dogs, social_children, weight_kg, microchip_number,
                    gender, gallery, created_at, updated_at
                ) VALUES (
                    :id, :owner_id, :name, :species, :breed, :age_months, :size, :description, :photo_url, 
                    true, :listing_id,
                    :is_vaccinated, :is_sterilized, :is_dewormed, :temperament, :energy_level,
                    :social_cats, :social_dogs, :social_children, :weight_kg, :microchip_number,
                    :gender, :gallery, now(), now()
                );
            """), {
                "id": pet_id,
                "owner_id": owner_id,
                "name": listing['name'],
                "species": listing['species'],
                "breed": listing.get('breed'),
                "age_months": listing.get('age_months'),
                "size": listing.get('size'),
                "description": listing.get('description'),
                "photo_url": listing.get('photo_url'),
                "listing_id": listing['id'],
                "is_vaccinated": listing.get('is_vaccinated', False),
                "is_sterilized": listing.get('is_sterilized', False),
                "is_dewormed": listing.get('is_dewormed', False),
                "temperament": listing.get('temperament'),
                "energy_level": listing.get('energy_level'),
                "social_cats": listing.get('social_cats', True),
                "social_dogs": listing.get('social_dogs', True),
                "social_children": listing.get('social_children', True),
                "weight_kg": listing.get('weight_kg'),
                "microchip_number": listing.get('microchip_number'),
                "gender": listing.get('gender'),
                "gallery": listing.get('gallery')
            })
            conn.commit()
            print("SUCCESS: Milanesillo pet record created manually!")

    except Exception as e:
        print(f"Error during fix: {e}")

if __name__ == "__main__":
    fix_milanesillo()
