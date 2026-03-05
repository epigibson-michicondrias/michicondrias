---
sidebar_position: 8
---

# 🧰 Plantilla Rápida: Nuevo Microservicio

Esta página contiene **todos los archivos y comandos** necesarios para crear un nuevo microservicio desde cero. Solo necesitas reemplazar los nombres marcados.

:::tip Modo de uso
1. **Busca y reemplaza** en toda esta página:
   - `NOMBRE_SERVICIO` → nombre del servicio en minúsculas (ej: `inventario`)
   - `NOMBRE_RECURSO` → nombre del recurso principal en minúsculas (ej: `product`)
   - `NOMBRE_RECURSO_PLURAL` → plural del recurso (ej: `products`)
   - `NOMBRE_TABLA` → nombre de tabla SQL (ej: `products`)
   - `EMOJI_SERVICIO` → un emoji representativo (ej: `📦`)
2. **Copia cada archivo** a su ubicación correspondiente
3. **Ejecuta los comandos AWS CLI** al final
:::

---

## Archivo 1: `backend/michicondrias_NOMBRE_SERVICIO/requirements.txt`

```txt
fastapi
uvicorn
mangum
sqlalchemy
psycopg2-binary
python-jose[cryptography]
pydantic-settings
boto3
```

---

## Archivo 2: `backend/michicondrias_NOMBRE_SERVICIO/app/models/base.py`

```python
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime, timezone
import uuid

class Base(DeclarativeBase):
    pass

class BaseModel(Base):
    __abstract__ = True
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
```

---

## Archivo 3: `backend/michicondrias_NOMBRE_SERVICIO/app/core/config.py`

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # --- Base de datos (Neon) ---
    DATABASE_URL: str = ""

    # --- JWT (DEBE coincidir con Core) ---
    SECRET_KEY: str = ""

    # --- AWS S3 ---
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "michicondrias-media"

    # --- API Gateway ---
    API_GATEWAY_URL: str = ""
    PROXY_PREFIX: str = ""

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

---

## Archivo 4: `backend/michicondrias_NOMBRE_SERVICIO/app/core/s3.py`

```python
import boto3
from botocore.config import Config as BotoConfig
from app.core.config import settings
import uuid

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
    config=BotoConfig(signature_version="s3v4"),
)

def generate_presigned_url(extension: str, folder: str = "NOMBRE_SERVICIO") -> dict:
    object_key = f"{folder}/{uuid.uuid4()}.{extension}"
    url = s3_client.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.S3_BUCKET_NAME, "Key": object_key, "ContentType": f"image/{extension}"},
        ExpiresIn=3600,
    )
    public_url = f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{object_key}"
    return {"url": url, "object_key": public_url}
```

---

## Archivo 5: `backend/michicondrias_NOMBRE_SERVICIO/app/db/session.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Archivo 6: `backend/michicondrias_NOMBRE_SERVICIO/app/api/deps.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

security = HTTPBearer()

def _decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido o expirado")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return _decode_token(credentials.credentials)

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere rol admin")
    return user
```

---

## Archivo 7: `backend/michicondrias_NOMBRE_SERVICIO/app/models/NOMBRE_RECURSO.py`

:::info Personaliza este archivo
Este es el modelo de ejemplo. Agrega/quita columnas según las necesidades de tu servicio.
:::

```python
from sqlalchemy import Column, String, Float, Integer, Boolean, Text
from app.models.base import BaseModel

class NOMBRE_RECURSO_CLASS(BaseModel):
    __tablename__ = "NOMBRE_TABLA"

    user_id = Column(String(36), nullable=False, unique=True)
    display_name = Column(String(200), nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    location = Column(String(300), nullable=True)
    rating = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    gallery = Column(Text, nullable=True)
    # ← Agrega tus columnas específicas aquí
```

---

## Archivo 8: `backend/michicondrias_NOMBRE_SERVICIO/app/api/routes/NOMBRE_RECURSO_PLURAL.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.NOMBRE_RECURSO import NOMBRE_RECURSO_CLASS
from app.core.s3 import generate_presigned_url

router = APIRouter()

# --- Listado público ---
@router.get("/NOMBRE_RECURSO_PLURAL/")
def list_items(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
):
    items = db.query(NOMBRE_RECURSO_CLASS).filter(
        NOMBRE_RECURSO_CLASS.is_active == True
    ).offset(skip).limit(limit).all()
    return items

# --- Detalle por ID ---
@router.get("/NOMBRE_RECURSO_PLURAL/{item_id}")
def get_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(NOMBRE_RECURSO_CLASS).filter(NOMBRE_RECURSO_CLASS.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return item

# --- Mi perfil (auth requerida) ---
@router.get("/NOMBRE_RECURSO_PLURAL/me/profile")
def get_my_profile(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(NOMBRE_RECURSO_CLASS).filter(
        NOMBRE_RECURSO_CLASS.user_id == user["sub"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return item

# --- Registro (auth requerida) ---
@router.post("/NOMBRE_RECURSO_PLURAL/")
def create_item(data: dict, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(NOMBRE_RECURSO_CLASS).filter(
        NOMBRE_RECURSO_CLASS.user_id == user["sub"]
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya tienes un perfil registrado")
    item = NOMBRE_RECURSO_CLASS(user_id=user["sub"], **data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

# --- Actualizar (auth requerida) ---
@router.put("/NOMBRE_RECURSO_PLURAL/{item_id}")
def update_item(item_id: str, data: dict, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(NOMBRE_RECURSO_CLASS).filter(NOMBRE_RECURSO_CLASS.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    if item.user_id != user["sub"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    for key, val in data.items():
        if hasattr(item, key):
            setattr(item, key, val)
    db.commit()
    db.refresh(item)
    return item

# --- Presigned URL para fotos ---
@router.get("/NOMBRE_RECURSO_PLURAL/presigned-url")
def get_presigned_url(ext: str = Query("jpg"), user: dict = Depends(get_current_user)):
    return generate_presigned_url(ext)
```

---

## Archivo 9: `backend/michicondrias_NOMBRE_SERVICIO/app/api/main.py`

```python
from fastapi import APIRouter
from app.api.routes.NOMBRE_RECURSO_PLURAL import router as resource_router

api_router = APIRouter()
api_router.include_router(resource_router, prefix="/api/v1", tags=["NOMBRE_RECURSO_PLURAL"])
```

---

## Archivo 10: `backend/michicondrias_NOMBRE_SERVICIO/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os
import uuid
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.api.main import api_router

class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("x-correlation-id", str(uuid.uuid4()))
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        print(f"[{correlation_id}] {request.method} {request.url.path} → {response.status_code} ({duration:.2f}s)")
        response.headers["x-correlation-id"] = correlation_id
        return response

app = FastAPI(
    title="Michicondrias NOMBRE_SERVICIO API",
    root_path=os.getenv("PROXY_PREFIX", ""),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://michicondrias.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ObservabilityMiddleware)
app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Bienvenido al API de Michicondrias NOMBRE_SERVICIO EMOJI_SERVICIO"}

handler = Mangum(app)
```

---

## Archivo 11: Frontend — `frontend/src/lib/services/NOMBRE_SERVICIO.ts`

```typescript
import { apiFetch } from "../api";

export interface NOMBRE_RECURSO_TYPE {
    id: string;
    user_id: string;
    display_name: string;
    bio?: string | null;
    photo_url?: string | null;
    location?: string | null;
    rating?: number;
    is_verified: boolean;
    is_active: boolean;
    gallery?: string | null;
    // ← Agrega tus campos específicos aquí
}

export async function listItems(params?: Record<string, string>) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<NOMBRE_RECURSO_TYPE[]>("NOMBRE_SERVICIO", `/NOMBRE_RECURSO_PLURAL/${qs}`);
}

export async function getItem(id: string) {
    return apiFetch<NOMBRE_RECURSO_TYPE>("NOMBRE_SERVICIO", `/NOMBRE_RECURSO_PLURAL/${id}`);
}

export async function createItem(data: Partial<NOMBRE_RECURSO_TYPE>) {
    return apiFetch<NOMBRE_RECURSO_TYPE>("NOMBRE_SERVICIO", "/NOMBRE_RECURSO_PLURAL/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateItem(id: string, data: Partial<NOMBRE_RECURSO_TYPE>) {
    return apiFetch<NOMBRE_RECURSO_TYPE>("NOMBRE_SERVICIO", `/NOMBRE_RECURSO_PLURAL/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function getMyProfile() {
    return apiFetch<NOMBRE_RECURSO_TYPE>("NOMBRE_SERVICIO", "/NOMBRE_RECURSO_PLURAL/me/profile");
}

export async function getPresignedUrl(ext: string) {
    return apiFetch<{ url: string; object_key: string }>("NOMBRE_SERVICIO", `/NOMBRE_RECURSO_PLURAL/presigned-url?ext=${ext}`);
}
```

---

## Archivo 12: Frontend — Agregar a `api.ts`

Agrega esta línea al objeto `API_URLS` en `frontend/src/lib/api.ts`:

```typescript
NOMBRE_SERVICIO: `${BASE_URL}/NOMBRE_SERVICIO/api/v1`,
```

---

## Archivo 13: SQL — Crear tabla en Neon

Ejecutar en **Neon Console → SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS NOMBRE_TABLA (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(500),
    location VARCHAR(300),
    rating FLOAT DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    gallery TEXT
    -- ← Agrega tus columnas específicas aquí
);

CREATE INDEX idx_NOMBRE_TABLA_user_id ON NOMBRE_TABLA(user_id);
CREATE INDEX idx_NOMBRE_TABLA_is_active ON NOMBRE_TABLA(is_active);
```

---

## Archivo 14: CI/CD — Agregar al matrix

En `.github/workflows/deploy-backend.yml`, agrega tu servicio al array:

```yaml
service: [core, adopciones, ..., NOMBRE_SERVICIO]
```

---

## Archivo 15: Sidebar — Agregar navegación

En `frontend/src/components/Sidebar.tsx`, agrega dentro del array `menuItems`:

```tsx
{ href: "/dashboard/NOMBRE_SERVICIO", icon: <svg>...</svg>, label: "LABEL_SERVICIO", roles: ["all"] },
```

---

## 🚀 Comandos AWS CLI — Deploy Completo

Ejecuta estos comandos **en orden** después de que el CI/CD suba el ZIP a S3.

### 1. Crear la Lambda

```bash
aws lambda create-function \
  --function-name michicondrias-NOMBRE_SERVICIO \
  --runtime python3.11 \
  --role "arn:aws:iam::491799435777:role/michicondrias-lambda-ex" \
  --handler app.main.handler \
  --timeout 30 \
  --memory-size 256 \
  --code S3Bucket=michicondrias-storage-1,S3Key=deployments/NOMBRE_SERVICIO.zip \
  --environment "Variables={DATABASE_URL=postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require,PROXY_PREFIX=/NOMBRE_SERVICIO,API_GATEWAY_URL=https://kowly51wia.execute-api.us-east-1.amazonaws.com}"
```

### 2. Crear integración API Gateway

```bash
aws apigatewayv2 create-integration \
  --api-id kowly51wia \
  --integration-type AWS_PROXY \
  --integration-uri "arn:aws:lambda:us-east-1:491799435777:function:michicondrias-NOMBRE_SERVICIO" \
  --payload-format-version 2.0
```

> ⚠️ **Anota el `IntegrationId`** del resultado (ej: `abc123d`)

### 3. Crear rutas (reemplaza `TU_INTEGRATION_ID`)

```bash
aws apigatewayv2 create-route \
  --api-id kowly51wia \
  --route-key "ANY /NOMBRE_SERVICIO" \
  --target "integrations/TU_INTEGRATION_ID"

aws apigatewayv2 create-route \
  --api-id kowly51wia \
  --route-key "ANY /NOMBRE_SERVICIO/{proxy+}" \
  --target "integrations/TU_INTEGRATION_ID"
```

### 4. Permisos de invocación

```bash
aws lambda add-permission \
  --function-name michicondrias-NOMBRE_SERVICIO \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:491799435777:kowly51wia/*/*"
```

### 5. Verificar

```bash
curl https://kowly51wia.execute-api.us-east-1.amazonaws.com/NOMBRE_SERVICIO/
# → {"message": "Bienvenido al API de Michicondrias NOMBRE_SERVICIO EMOJI_SERVICIO"}
```

---

## ✅ Checklist Final

| # | Paso | Archivo/Comando |
|---|---|---|
| 1 | Crear carpeta backend | `backend/michicondrias_NOMBRE_SERVICIO/` (10 archivos Python) |
| 2 | Crear service frontend | `frontend/src/lib/services/NOMBRE_SERVICIO.ts` |
| 3 | Agregar a `api.ts` | Línea en `API_URLS` |
| 4 | Crear página dashboard | `frontend/src/app/dashboard/NOMBRE_SERVICIO/page.tsx` |
| 5 | Agregar a Sidebar | Línea en `menuItems` |
| 6 | Agregar al CI/CD matrix | Línea en `deploy-backend.yml` |
| 7 | Push a `main` | Git push (CI/CD sube ZIP a S3) |
| 8 | Crear SQL en Neon | Ejecutar CREATE TABLE |
| 9 | Crear Lambda (CLI) | `aws lambda create-function ...` |
| 10 | Crear integración (CLI) | `aws apigatewayv2 create-integration ...` |
| 11 | Crear rutas (CLI) | `aws apigatewayv2 create-route ...` × 2 |
| 12 | Dar permisos (CLI) | `aws lambda add-permission ...` |
| 13 | Verificar | `curl .../NOMBRE_SERVICIO/` |
