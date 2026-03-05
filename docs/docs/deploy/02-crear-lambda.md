---
sidebar_position: 2
---

# Paso 1: Crear la Función Lambda

Cada microservicio se despliega como una **función Lambda independiente** en AWS.

## Método recomendado: AWS CLI

:::tip ¿Por qué CLI y no la consola?
Usar la CLI te permite replicar exactamente la misma configuración en cada servicio nuevo. Además puedes guardar los comandos y re-ejecutarlos si necesitas recrear la función.
:::

### Prerequisitos

```bash
# Verificar que tienes AWS CLI configurado
aws sts get-caller-identity
```

### Paso 1.1: Obtener el rol de ejecución

Todos nuestros servicios usan el mismo rol IAM. Si no lo sabes, cópialo de otro servicio:

```bash
aws lambda get-function-configuration \
  --function-name michicondrias-core \
  --query "Role" \
  --output text
```

**Resultado:** `arn:aws:iam::491799435777:role/michicondrias-lambda-ex`

### Paso 1.2: Crear la función Lambda

El código ya fue subido a S3 por el CI/CD. Solo necesitas apuntarle:

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

:::warning Reemplaza NOMBRE_SERVICIO
Reemplaza **todas** las ocurrencias de `NOMBRE_SERVICIO` con el nombre real de tu servicio (ejemplo: `paseadores`, `cuidadores`, `inventario`).
:::

### ¿Qué hace cada flag?

| Flag | Valor | ¿Por qué? |
|---|---|---|
| `--function-name` | `michicondrias-{servicio}` | Convención del proyecto. CI/CD usa este nombre exacto |
| `--runtime` | `python3.11` | Debe coincidir con la imagen Docker del CI/CD |
| `--role` | ARN del rol IAM | Ya tiene permisos para S3, CW Logs, VPC, etc. |
| `--handler` | `app.main.handler` | Lambda busca: `app/main.py` → variable `handler` |
| `--timeout` | `30` | Cold starts + SSL handshake con Neon tardan ~5-10s |
| `--memory-size` | `256` | FastAPI + SQLAlchemy + boto3 son pesados |
| `--code` | S3Bucket + S3Key | El ZIP ya fue subido por GitHub Actions |
| `--environment` | Variables de entorno | Config sin hardcodear |

### ¿Por qué `app.main.handler`?

Lambda busca una variable siguiendo el patrón `{módulo}.{archivo}.{variable}`:

```
app.main.handler
 │    │     │
 │    │     └── handler = Mangum(app)  ← La variable que Lambda invoca
 │    └── main.py                      ← El archivo dentro de app/
 └── app/                              ← El paquete Python (directorio)
```

En nuestro código (`app/main.py`):

```python
from mangum import Mangum
from fastapi import FastAPI

app = FastAPI(...)
handler = Mangum(app)  # ← Lambda busca esta variable
```

## Método alternativo: AWS Console

1. AWS Console → **Lambda** → **Create function** → **Author from scratch**
2. Configurar: nombre, runtime Python 3.11, rol existente
3. En **Runtime settings** → Edit → Handler: `app.main.handler`
4. En **Configuration** → General → Memory: 256 MB, Timeout: 30s
5. En **Configuration** → Environment variables → agregar todas las vars

:::warning Timeout de API Gateway
API Gateway tiene un timeout máximo de **29 segundos**. Si Lambda tarda más, el cliente recibirá un `504 Gateway Timeout`.
:::
