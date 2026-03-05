import psycopg2

INDEXES_TO_CREATE = [
    # Pets
    ("pets", "owner_id"),
    ("pets", "id", "hash"), # For exact UUID lookups
    ("pets", "adopted_from_listing_id"),
    ("pets", "is_active"),
    ("lost_pets", "user_id"),
    ("petfriendly_places", "created_by_user_id"),
    
    # Adopciones
    ("adoption_listings", "published_by"),
    ("adoption_listings", "status"),
    ("adoption_requests", "listing_id"),
    ("adoption_requests", "user_id"),
    ("adoption_requests", "status"),

    # Carnet
    ("medical_records", "pet_id"),
    ("vaccines", "pet_id"),
    ("medication_reminders", "prescription_id"),
    ("medication_reminders", "pet_id"),

    # Cuidadores
    ("sitters", "user_id"),
    ("sit_requests", "sitter_id"),
    ("sit_requests", "client_user_id"),
    ("sit_requests", "status"),
    ("sit_reviews", "sitter_id"),

    # Directorio
    ("clinics", "owner_user_id"),
    ("veterinarians", "user_id"),
    ("veterinarians", "clinic_id"),

    # Ecommerce
    ("products", "category_id"),
    ("products", "subcategory_id"),
    ("products", "seller_id"),
    ("products", "is_active"),
    ("orders", "user_id"),
    ("order_items", "order_id"),

    # Paseadores
    ("walkers", "user_id"),
    ("walk_requests", "walker_id"),
    ("walk_requests", "client_user_id"),
    ("walk_requests", "status"),
    ("walk_reviews", "walker_id"),
    
    # Users
    ("users", "email")
]

def optimize_db():
    conn_str = "postgresql://postgres.zaegmfufrzjmjiemrvvp:Michicondrias201094*@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    cur = conn.cursor()

    print("Adding database indexes for optimization...")
    for item in INDEXES_TO_CREATE:
        table = item[0]
        col = item[1]
        index_type = item[2] if len(item) > 2 else "btree"

        index_name = f"idx_{table}_{col}"
        
        create_sql = f"CREATE INDEX CONCURRENTLY IF NOT EXISTS {index_name} ON {table} USING {index_type} ({col});"

        try:
            cur.execute(create_sql)
            print(f"✅ Created index: {index_name}")
        except Exception as e:
            print(f"❌ Failed to create index {index_name}: {e}")

    cur.close()
    conn.close()
    print("Optimization complete.")

if __name__ == "__main__":
    optimize_db()
