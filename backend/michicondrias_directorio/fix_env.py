import os
import pg8000.native
import shutil

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
    # 2. Fix env.py 
    env_path = os.path.join(base_path, service, "alembic", "env.py")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        if "version_table" not in content:
            # Replaces context.configure(...) 
            # In alembic default, context.configure for online mode is around line 66
            content = content.replace(
                "context.configure(",
                f"context.configure(\n        version_table='{table}',"
            )
            with open(env_path, "w", encoding="utf-8") as f:
                f.write(content)
                
    # 3. Clean versions dir
    versions_dir = os.path.join(base_path, service, "alembic", "versions")
    if os.path.exists(versions_dir):
        for file in os.listdir(versions_dir):
            if file.endswith(".py"):
                os.remove(os.path.join(versions_dir, file))
        print(f"Cleaned versions for {service}")
