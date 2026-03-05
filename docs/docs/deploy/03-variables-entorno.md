---
sidebar_position: 3
---

# Paso 2: Variables de Entorno

Las variables de entorno son la forma de configurar cada Lambda sin hardcodear valores sensibles en el código.

## Configurar en AWS Console

En la función Lambda → **Configuration** → **Environment variables** → **Edit**

## Variables requeridas

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/michicondrias_db?sslmode=require` | Conexión a la base de datos Neon |
| `SECRET_KEY` | `tu_clave_secreta_compartida` | Firma y verificación de JWT tokens |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | Credenciales IAM para generar presigned URLs de S3 |
| `AWS_SECRET_ACCESS_KEY` | `wJa...` | Secreto IAM correspondiente |
| `AWS_REGION` | `us-east-1` | Región donde está el bucket S3 |
| `S3_BUCKET_NAME` | `michicondrias-media` | Nombre del bucket para almacenar imágenes |
| `API_GATEWAY_URL` | `https://kowly51wia.execute-api.us-east-1.amazonaws.com` | URL base para llamadas entre microservicios |
| `PROXY_PREFIX` | `/paseadores` | Prefijo del path en API Gateway |

## Explicación detallada de cada variable

### `DATABASE_URL`

```
postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/michicondrias_db?sslmode=require
│            │    │    │                                │                │
│            │    │    └── Host de Neon                  └── Base de datos└── Obligatorio
│            │    └── Password                                                para Neon
│            └── Username
└── Driver de PostgreSQL
```

Todos los servicios comparten la **misma base de datos** pero usan **tablas distintas**. Por eso la URL es la misma en todas las Lambdas.

### `SECRET_KEY` — La más importante

:::danger SECRET_KEY debe ser idéntica en TODOS los servicios
El servicio `core` genera el JWT cuando el usuario hace login. Todos los demás servicios validan ese JWT usando la misma `SECRET_KEY`. 

Si pones una clave distinta en `michicondrias-paseadores`, **todos los endpoints protegidos darán 403 Forbidden** porque el JWT no se podrá decodificar.
:::

Cómo funciona internamente (en `deps.py` de cada servicio):

```python
from jose import jwt

def _decode_token(token: str) -> dict:
    # Usa la SECRET_KEY para verificar que el JWT fue firmado por Core
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    return payload  # Contiene: {"sub": "user-uuid", "role": "consumidor"}
```

### `PROXY_PREFIX` — Evita 404s

Cuando API Gateway recibe una request a `/paseadores/api/v1/walkers/`, envía **todo el path** a Lambda, incluyendo el prefijo `/paseadores`.

Pero FastAPI registró sus rutas como `/api/v1/walkers/` (sin el prefijo).

```
Sin PROXY_PREFIX:
  Request llega:    /paseadores/api/v1/walkers/
  FastAPI busca:    /api/v1/walkers/  ← No coincide con /paseadores/api/v1/walkers/
  Resultado:        404 Not Found ❌

Con PROXY_PREFIX=/paseadores:
  Request llega:    /paseadores/api/v1/walkers/
  Mangum + root_path automáticamente quita el prefijo
  FastAPI busca:    /api/v1/walkers/  ← Coincide ✅
```

En el código:
```python
import os

app = FastAPI(
    root_path=os.getenv("PROXY_PREFIX", "")  # ← Aquí se usa
)
```
