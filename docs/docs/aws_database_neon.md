---
sidebar_position: 3
---

# Neon Serverless Database

To prevent high continuous costs from running an RDS instance or an EC2 Virtual Machine just for a database, Michicondrias uses **Neon Serverless Postgres**.

Neon splits storage and compute. When the application doesn't receive traffic for 5 minutes, Neon suspends the compute nodes ("scales to zero"). When a new request arrives, it boots up automatically in ~1-3 seconds.

## 1. Connecting to Neon
Instead of `postgresql+psycopg2://` (which occasionally has driver issues with serverless poolers on AWS Lambda), we utilize the standard `postgresql://` driver schema.

The connection string format:
```bash
postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require&channel_binding=require
```

This is injected into each Lambda function via the `DATABASE_URL` environment variable during CI/CD deployment or manually using `setup_lambda_env.ps1`.

## 2. Managing Schema Migrations (Alembic)
Since the database is now in the cloud, running `alembic upgrade head` locally inside the Docker container is not enough. We must push those schema definitions into Neon.

We use a unified script approach. Instead of fighting with missing `alembic` modules inside smaller microservices:
1. We unified the execution inside the `michicondrias_core` virtual environment.
2. We force-fed the `DATABASE_URL` environment variable via PowerShell before invoking Python.

```powershell
# generate_migrations.ps1

$env:DATABASE_URL = "postgresql://user:pass@endpoint..."
cd backend\michicondrias_core
venv\Scripts\python.exe -m alembic revision --autogenerate -m "Sync schema updates"
venv\Scripts\python.exe -m alembic upgrade head
```
This forces Alembic to compare the current SQLAlchemy Python Models in the codebase against the live Neon Serverless Postgres DB, automatically generating `_sync_schema_updates.py` files containing the needed `op.add_column` definitions. 

## 3. Resolving "Timeout" Cold Starts
Because Neon Serverless Postgres takes a few seconds to 'wake up', and AWS Lambda by default times out HTTP requests at exactly **3.00 seconds**, initial login and registration attempts threw `500 Internal Server Error`.

To fix this, we increased the AWS Lambda limits:
```bash
aws lambda update-function-configuration --function-name michicondrias-core --timeout 15
```
This grants enough headroom for Neon to turn on, establish the connection pool, and execute the queries.
