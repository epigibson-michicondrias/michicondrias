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

services = {
    "michicondrias_core": "alembic_version_core",
    "michicondrias_adopciones": "alembic_version_adopciones",
    "michicondrias_directorio": "alembic_version_directorio"
}

base_path = r"c:\desarrollos\michicondrias\backend"

for service, table in services.items():
    env_path = os.path.join(base_path, service, "alembic", "env.py")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        if "include_object" not in content:
            include_code = """
def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table":
        # Do not generate drops for tables that exist in DB but belong to other apps
        return name in target_metadata.tables
    return True
"""
            # Insert function before run_migrations_online
            content = content.replace("def run_migrations_online()", include_code + "\ndef run_migrations_online()")
            
            # Add to configure
            content = content.replace("target_metadata=target_metadata", "target_metadata=target_metadata,\n        include_object=include_object")
            
            with open(env_path, "w", encoding="utf-8") as f:
                f.write(content)
                
    # Clean versions dir
    versions_dir = os.path.join(base_path, service, "alembic", "versions")
    if os.path.exists(versions_dir):
        for file in os.listdir(versions_dir):
            if file.endswith(".py"):
                os.remove(os.path.join(versions_dir, file))
        print(f"Cleaned versions for {service}")
