import os
import subprocess
import sys

URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"

# Set it in the environment so config.py picks it up
os.environ["DATABASE_URL"] = URL

# The connection string might be using pgbouncer on port 6543, but for migrations, direct connection 5432 is better. 
# The user provided the 5432 one which is perfect for Alembic schema changes.

services = [
    "michicondrias_core",
    "michicondrias_adopciones",
    "michicondrias_mascotas",
    "michicondrias_perdidas",
    "michicondrias_carnet",
    "michicondrias_directorio",
    "michicondrias_ecommerce",
    "michicondrias_paseadores",
    "michicondrias_cuidadores",
]

base_dir = r"C:\desarrollos\michicondrias\backend"

for service in services:
    service_dir = os.path.join(base_dir, service)
    print(f"\n{'='*50}")
    print(f"Running migrations for: {service}")
    print(f"{'='*50}")
    
    if os.path.exists(os.path.join(service_dir, "alembic.ini")):
        try:
            # Setting cwd to the service dir so alembic finds the ini file
            result = subprocess.run(
                ["alembic", "upgrade", "head"],
                cwd=service_dir,
                capture_output=True,
                text=True,
                check=True
            )
            print(result.stdout)
        except subprocess.CalledProcessError as e:
            print(f"FAILED for {service}")
            print(e.stdout)
            print(e.stderr)
            sys.exit(1)
    else:
        print(f"No alembic.ini found in {service}, skipping.")

print("\n✅ All migrations completed successfully on Supabase!")
