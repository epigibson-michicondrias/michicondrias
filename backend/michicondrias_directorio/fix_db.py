import os
import pg8000.native

# 1. Reset DB
try:
    conn = pg8000.native.Connection(user='user', password='password', host='localhost', port=5433, database='michicondrias_db')
    conn.run("DROP SCHEMA public CASCADE;")
    conn.run("CREATE SCHEMA public;")
    print("Database schema reset successfully.")
except Exception as e:
    print(f"Error resetting DB: {e}")

# 2. Fix alembic.ini files
services = {
    "michicondrias_core": "alembic_version_core",
    "michicondrias_adopciones": "alembic_version_adopciones",
    "michicondrias_directorio": "alembic_version_directorio"
}

base_path = r"c:\desarrollos\michicondrias\backend"

for service, table in services.items():
    ini_path = os.path.join(base_path, service, "alembic.ini")
    if os.path.exists(ini_path):
        with open(ini_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "version_table =" not in content:
            # Insert after script_location
            new_content = content.replace(
                "script_location = %(here)s/alembic",
                f"script_location = %(here)s/alembic\nversion_table = {table}"
            )
            with open(ini_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated {ini_path}")
        else:
            print(f"Already updated {ini_path}")
    else:
        print(f"Not found: {ini_path}")
