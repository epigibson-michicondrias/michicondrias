import os

base_path = r"c:\desarrollos\michicondrias\backend\michicondrias_mascotas"
ini_path = os.path.join(base_path, "alembic.ini")
env_path = os.path.join(base_path, "alembic", "env.py")

# 1. Update alembic.ini
with open(ini_path, "r", encoding="utf-8") as f:
    content = f.read()

if "version_table =" not in content:
    content = content.replace(
        "script_location = alembic",
        "script_location = alembic\nversion_table = alembic_version_mascotas"
    )
    with open(ini_path, "w", encoding="utf-8") as f:
        f.write(content)

# 2. Update env.py
with open(env_path, "r", encoding="utf-8") as f:
    content = f.read()

if "target_metadata" in content and "include_object" not in content:
    # Add imports
    imports = """
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.session import Base
from app.models import *
"""
    content = content.replace("from alembic import context", "from alembic import context\n" + imports)
    
    # Set URL
    content = content.replace('config = context.config', 'config = context.config\nconfig.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)')
    
    # Replace target_metadata
    content = content.replace("target_metadata = None", "target_metadata = Base.metadata")
    
    # Add include_object
    include_code = """
def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table":
        # Only true if the table is defined in target_metadata.tables
        return name in target_metadata.tables
    return True
"""
    content = content.replace("def run_migrations_offline()", include_code + "\ndef run_migrations_offline()")
    
    # Update config args - offline
    content = content.replace(
        "target_metadata=target_metadata,\n        literal_binds=True",
        "target_metadata=target_metadata,\n        version_table='alembic_version_mascotas',\n        include_object=include_object,\n        literal_binds=True"
    )

    # Update config args - online
    content = content.replace(
        "target_metadata=target_metadata\n        )",
        "target_metadata=target_metadata,\n            version_table='alembic_version_mascotas',\n            include_object=include_object\n        )"
    )

    with open(env_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Setup completed")
