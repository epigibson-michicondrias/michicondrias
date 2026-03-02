---
sidebar_position: 2
---

# Deploying to AWS Lambda

This guide covers the exact steps taken to transform the standard local FastAPI microservices into AWS Lambda functions, deploying them automatically using GitHub actions.

## 1. Adapting FastAPI for AWS (Mangum)
AWS Lambda does not run Web Servers (like Uvicorn or Gunicorn) locally. Instead, it natively invokes a Python handler function. To map this to FastAPI's asynchronous routing, we use the `mangum` adapter.

In each microservice's `app/main.py` file, we appended:
```python
from mangum import Mangum
from fastapi import FastAPI
import os

app = FastAPI(
    title="Michicondrias Service",
    # Vital for API Gateway to sub-route requests properly
    root_path=os.getenv("PROXY_PREFIX", "") 
)

# Allow Vercel CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://michicondrias.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

handler = Mangum(app)
```

## 2. CI/CD Architecture using S3
AWS Lambda has a hard deployment size limit (`50MB` for direct ZIP uploads). Because Python libraries such as `psycopg2` and `pydantic` are heavy, the `michicondrias_core` service easily exceeds `65MB`.

To bypass this limit, the CI/CD pipeline uploads the deployment package to an intermediary **S3 Bucket**, and tells Lambda to update its code from that bucket (which extends the limit to `250MB` uncompressed).

### The Deployment Workflow (GitHub Actions)
Each microservice has its own `.yml` workflow inside `.github/workflows/`. For example, `deploy_core.yml`:

1. **Checkout Code:** Retrieves the latest code from `main`.
2. **Setup Python:** Installs Python 3.11.
3. **Build Virtual Environment:** Installs all `requirements.txt` dependencies.
4. **Package ZIP:** Compresses the application code along with the installed dependencies (`site-packages`).
5. **AWS Auth:** Connects to AWS using long-lived IAM Credentials (`AWS_ACCESS_KEY_ID`).
6. **S3 Upload:** Pushes the heavy ZIP file into `s3://michicondrias-deployments/core/deploy.zip`.
7. **Lambda Update:** Executes `aws lambda update-function-code --function-name michicondrias-core --s3-bucket michicondrias-deployments --s3-key core/deploy.zip`.

## 3. Important Fixes Implemented

### GLIBC Compatibility (The Amazon Linux Issue)
Lambda runs on `Amazon Linux 2023`. Running `pip install` on standard Ubuntu GitHub runners downloads Ubuntu-specific C-bindings (like `psycopg2` or `cryptography`), causing `libcrypt.so` fatal errors in AWS.
To solve this, the CI/CD process compiles the dependencies natively using a Docker container loaded with Amazon Linux 2023:
```yaml
- name: Package application
  run: |
    docker run --rm -v ${{ github.workspace }}:/var/task public.ecr.aws/sam/build-python3.11 \
    /bin/sh -c "pip install -r backend/michicondrias_core/requirements.txt -t backend/michicondrias_core/package"
```

### AWS Lambda Read-Only Filesystem
AWS Lambda completely restricts writing to the filesystem except for the `/tmp/` directory. Services that expected local disk writing (e.g. `UPLOAD_DIR = "app/uploads"`) throw `OSError: Read-only file system`. This was mitigated by routing all file writing directly into **AWS S3** via `boto3`.
