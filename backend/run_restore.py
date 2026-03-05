import psycopg2
import os
import sys

SUPABASE_URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"
BACKUP_FILE = r"C:\Users\hackm\Downloads\neon-backup.sql"

if not os.path.exists(BACKUP_FILE):
    print("Error: File not found")
    sys.exit(1)

with open(BACKUP_FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

clean_lines = []
for line in lines:
    if line.startswith("\\"):
        continue
    upper_line = line.upper()
    if "OWNER TO" in upper_line or "GRANT" in upper_line or "REVOKE" in upper_line:
        if "NEONDB" in upper_line or "NEON_" in upper_line:
            continue
    # Just in case there are inline
    line = line.replace("neondb_owner", "postgres")
    line = line.replace("neon_superuser", "postgres")
    clean_lines.append(line)

sql_script = "".join(clean_lines)

print("Conectando a Supabase...")
try:
    conn = psycopg2.connect(SUPABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Ejecutando script de migración...")
    cur.execute(sql_script)
    
    print("✅ ¡Migración de datos completada con éxito en Supabase!")
    cur.close()
    conn.close()
except psycopg2.Error as e:
    print(f"❌ Error durante la migración: {e}")
    sys.exit(1)
