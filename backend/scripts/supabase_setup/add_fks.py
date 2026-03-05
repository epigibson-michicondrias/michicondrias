import os
import psycopg2
from psycopg2 import sql

# Target constraints definitions: (table_name, column_name, target_table, target_column, on_delete)
CONSTRAINTS = [
    # Mascotas
    ("pets", "owner_id", "users", "id", "CASCADE"),
    ("pets", "adopted_from_listing_id", "adoption_listings", "id", "SET NULL"),
    ("lost_pets", "user_id", "users", "id", "CASCADE"),
    ("petfriendly_places", "created_by_user_id", "users", "id", "CASCADE"),

    # Adopciones
    ("adoption_listings", "published_by", "users", "id", "CASCADE"),
    ("adoption_listings", "adopted_by", "users", "id", "SET NULL"),
    ("adoption_requests", "listing_id", "adoption_listings", "id", "CASCADE"),
    ("adoption_requests", "user_id", "users", "id", "CASCADE"),

    # Carnet
    ("medical_records", "pet_id", "pets", "id", "CASCADE"),
    ("medical_records", "veterinarian_id", "veterinarians", "id", "SET NULL"),
    ("medical_records", "clinic_id", "clinics", "id", "SET NULL"),
    ("vaccines", "pet_id", "pets", "id", "CASCADE"),
    ("vaccines", "administered_by_vet_id", "veterinarians", "id", "SET NULL"),

    # Cuidadores
    ("sitters", "user_id", "users", "id", "CASCADE"),
    ("sit_requests", "sitter_id", "sitters", "id", "CASCADE"),
    ("sit_requests", "client_user_id", "users", "id", "CASCADE"),
    ("sit_requests", "pet_id", "pets", "id", "CASCADE"),
    ("sit_reviews", "sit_request_id", "sit_requests", "id", "CASCADE"),
    ("sit_reviews", "reviewer_user_id", "users", "id", "CASCADE"),
    ("sit_reviews", "sitter_id", "sitters", "id", "CASCADE"),

    # Directorio
    ("clinics", "owner_user_id", "users", "id", "SET NULL"),
    ("veterinarians", "user_id", "users", "id", "SET NULL"),

    # Ecommerce
    ("products", "seller_id", "users", "id", "SET NULL"),
    ("product_reviews", "user_id", "users", "id", "CASCADE"),
    ("orders", "user_id", "users", "id", "CASCADE"),
    ("donations", "user_id", "users", "id", "SET NULL"),

    # Paseadores
    ("walkers", "user_id", "users", "id", "CASCADE"),
    ("walk_requests", "walker_id", "walkers", "id", "CASCADE"),
    ("walk_requests", "client_user_id", "users", "id", "CASCADE"),
    ("walk_requests", "pet_id", "pets", "id", "CASCADE"),
    ("walk_reviews", "walk_request_id", "walk_requests", "id", "CASCADE"),
    ("walk_reviews", "reviewer_user_id", "users", "id", "CASCADE"),
    ("walk_reviews", "walker_id", "walkers", "id", "CASCADE"),
]

def apply_foreign_keys():
    conn_str = "postgresql://postgres.zaegmfufrzjmjiemrvvp:Michicondrias201094*@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    cur = conn.cursor()

    for table, col, ref_table, ref_col, on_delete in CONSTRAINTS:
        constraint_name = f"fk_{table}_{col}_{ref_table}"
        
        # Check if constraint exists
        cur.execute(f"""
            SELECT conname 
            FROM pg_constraint 
            WHERE conrelid = '{table}'::regclass 
            AND conname = '{constraint_name}';
        """)
        
        if cur.fetchone():
            print(f"✅ Constraint '{constraint_name}' already exists.")
            continue
            
        print(f"Adding constraint {constraint_name}...")
        
        # Try finding invalid rows
        try:
            cur.execute(f"SELECT COUNT(*) FROM {table} WHERE {col} IS NOT NULL AND {col} NOT IN (SELECT {ref_col} FROM {ref_table});")
            invalid_count = cur.fetchone()[0]
            if invalid_count > 0:
                print(f"⚠️ Warning: Found {invalid_count} orphaned rows in '{table}.{col}'. Attempting to delete or set null them to allow FK creation...")
                if on_delete == "CASCADE":
                    cur.execute(f"DELETE FROM {table} WHERE {col} IS NOT NULL AND {col} NOT IN (SELECT {ref_col} FROM {ref_table});")
                else:
                    cur.execute(f"UPDATE {table} SET {col} = NULL WHERE {col} IS NOT NULL AND {col} NOT IN (SELECT {ref_col} FROM {ref_table});")
        except Exception as e:
            print(f"Warning: could not check orphans for {table}.{col}: {e}")
            conn.rollback()

        try:
            cur.execute(f"""
                ALTER TABLE {table} 
                ADD CONSTRAINT {constraint_name} 
                FOREIGN KEY ({col}) 
                REFERENCES {ref_table}({ref_col}) 
                ON DELETE {on_delete};
            """)
            print(f"✅ Successfully added '{constraint_name}'.")
        except Exception as e:
            print(f"❌ Failed to add '{constraint_name}': {e}")
            conn.rollback()

    cur.close()
    conn.close()

if __name__ == "__main__":
    apply_foreign_keys()
