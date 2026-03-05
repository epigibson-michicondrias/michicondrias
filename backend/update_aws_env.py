import os
import json
import subprocess
import sys

SERVICES = [
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

# Using the Session Pooler URL strictly for IPv4 compatibility on AWS Lambda
SUPABASE_URL = "postgresql://postgres.zaegmfufrzjmjiemrvvp:Michicondrias201094*@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

for service_dir in SERVICES:
    print(f"\n--- Processing {service_dir} ---")
    lambda_name = service_dir.replace("_", "-")
    
    # 1. Update local .env
    env_path = os.path.join(r"C:\desarrollos\michicondrias\backend", service_dir, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        with open(env_path, "w", encoding="utf-8") as f:
            for line in lines:
                if line.startswith("DATABASE_URL="):
                    f.write(f"DATABASE_URL={SUPABASE_URL}\n")
                else:
                    f.write(line)
        print("✅ Local .env updated.")
    
    # 2. Update AWS Lambda
    try:
        # Fetch current config
        result = subprocess.run(
            ["aws", "lambda", "get-function-configuration", "--function-name", lambda_name, "--query", "Environment.Variables", "--output", "json"],
            capture_output=True, text=True, check=True
        )
        env_vars = json.loads(result.stdout)
        
        if env_vars is None:
            env_vars = {}
            
        # Update DATABASE_URL
        env_vars["DATABASE_URL"] = SUPABASE_URL
        
        # Build the Variables= string format for AWS CLI
        var_string = "{" + ",".join([f'{k}="{v}"' for k, v in env_vars.items()]) + "}"
        
        # Deploy update
        print(f"Updating AWS Lambda {lambda_name}...")
        update_result = subprocess.run(
            ["aws", "lambda", "update-function-configuration", "--function-name", lambda_name, "--environment", f"Variables={var_string}"],
            capture_output=True, text=True, check=True
        )
        print("✅ AWS Lambda updated.")
    except Exception as e:
        print(f"❌ Failed to update AWS Lambda {lambda_name}: {e}")

print("\n🚀 All services updated to point to Supabase Session Pooler (IPv4)!")
