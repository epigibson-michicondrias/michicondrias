import psycopg2

def enable_realtime():
    conn_str = "postgresql://postgres.zaegmfufrzjmjiemrvvp:Michicondrias201094*@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    cur = conn.cursor()

    tables_to_publish = [
        "adoption_listings", "adoption_requests", "clinics", 
        "lost_pets", "medical_records", "orders", 
        "petfriendly_places", "pets", "products", 
        "sit_requests", "sitters", "users", 
        "walk_requests", "walkers", "medication_reminders"
    ]

    for table in tables_to_publish:
        # PostgreSQL doesn't have an IF NOT EXISTS for ADD TABLE TO PUBLICATION natively in a simple way
        # so we'll just try to add and catch the exception if it's already there.
        try:
            cur.execute(f"ALTER PUBLICATION supabase_realtime ADD TABLE {table};")
            print(f"✅ Realtime enabled for {table}")
        except psycopg2.errors.DuplicateObject:
            print(f"✅ Realtime was already enabled for {table}")
        except Exception as e:
             # in case publication hasn't been created yet or table doesn't exist
            print(f"❌ Failed for {table} - {e}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    enable_realtime()
