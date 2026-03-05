import psycopg2

TABLES_TO_SECURE = [
    "adoption_listings", "adoption_requests", "clinics", 
    "lost_pets", "medical_records", "orders", 
    "petfriendly_places", "pets", "products", 
    "sit_requests", "sitters", "users", 
    "walk_requests", "walkers", "medication_reminders",
    "categories", "subcategories", "prescriptions",
    "product_reviews", "sit_reviews", "walk_reviews",
    "order_items", "donations", "veterinarians", "vaccines"
]

def enable_rls():
    conn_str = "postgresql://postgres.zaegmfufrzjmjiemrvvp:Michicondrias201094*@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    cur = conn.cursor()

    print("Enabling Row Level Security (RLS) on all tables...")
    for table in TABLES_TO_SECURE:
        try:
            # Enable RLS. 
            # Note: without policies, this blocks all anon/authenticated access.
            # However, since FastAPI uses service_role, it will bypass this completely.
            cur.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
            print(f"✅ RLS enabled for {table}")
        except Exception as e:
            print(f"❌ Failed to enable RLS for {table}: {e}")

    cur.close()
    conn.close()
    print("RLS configuration complete. Database secured against direct client access.")

if __name__ == "__main__":
    enable_rls()
