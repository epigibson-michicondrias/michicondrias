
import psycopg2
import sys

def check_db():
    conn = None
    try:
        # Use credentials from docker-compose/config
        conn = psycopg2.connect(
            host="localhost",
            port=5433,
            user="user",
            password="password",
            dbname="michicondrias_db"
        )
        cur = conn.cursor()
        
        print("--- Checking pets table ---")
        cur.execute("SELECT id, owner_id, name, adopted_from_listing_id FROM pets;")
        rows = cur.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Owner: {row[1]}, Name: {row[2]}, Listing: {row[3]}")
        
        print("\n--- Checking adoption_listings table ---")
        cur.execute("SELECT id, name, status, adopted_by FROM adoption_listings WHERE name ILIKE '%Milanesillo%';")
        rows = cur.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Name: {row[1]}, Status: {row[2]}, AdoptedBy: {row[3]}")

        print("\n--- Checking adoption_requests table ---")
        # Find approved requests for Milanesillo
        cur.execute("""
            SELECT ar.id, ar.user_id, ar.status, al.name 
            FROM adoption_requests ar
            JOIN adoption_listings al ON ar.listing_id = al.id
            WHERE al.name ILIKE '%Milanesillo%' AND ar.status = 'ADOPTED';
        """)
        rows = cur.fetchall()
        for row in rows:
            print(f"REQ_ID: {row[0]}, UserID: {row[1]}, Status: {row[2]}, Pet: {row[3]}")

        cur.close()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    check_db()
