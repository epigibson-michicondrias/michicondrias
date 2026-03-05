---
sidebar_position: 2
---

# Paso 1: Crear la Función Lambda

Cada microservicio se despliega como una **función Lambda independiente** en AWS.

## Crear la función en AWS Console

1. Ir a **AWS Console** → **Lambda** → **Functions** → **Create function**
2. Seleccionar **"Author from scratch"**

### Configuración

| Campo | Valor | ¿Por qué? |
|---|---|---|
| **Function name** | `michicondrias-{servicio}` | Convención del proyecto. El pipeline CI/CD usa este nombre exacto para hacer `update-function-code` |
| **Runtime** | `Python 3.11` | Debe coincidir con la imagen Docker del CI/CD (`build-python3.11`) |
| **Architecture** | `x86_64` | Compatibilidad con dependencias compiladas como `psycopg2-binary` |
| **Execution role** | Usar el mismo rol existente | Ya tiene permisos para S3, CloudWatch Logs, etc. |

3. Click **"Create function"**

### Ejemplo concreto

Para los nuevos servicios:
- Nombre: `michicondrias-paseadores` y `michicondrias-cuidadores`

## Configurar el Handler

Después de crear la función:

1. En **Runtime settings** → click **Edit**  
2. **Handler:** `app.main.handler`

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
# ... middleware, routers, etc.

handler = Mangum(app)  # ← Esta variable es la que Lambda busca
```

## Ajustar Timeout y Memoria

En **Configuration** → **General configuration** → **Edit**:

| Parámetro | Valor | ¿Por qué? |
|---|---|---|
| **Memory** | `256 MB` | FastAPI + SQLAlchemy + boto3 necesitan más que los 128 MB default |
| **Timeout** | `30 segundos` | Cold starts + conexión a Neon pueden tardar varios segundos |

:::warning Timeout de API Gateway
API Gateway tiene un timeout máximo de **29 segundos**. Si Lambda tarda más, el cliente recibirá un `504 Gateway Timeout` sin importar que Lambda siga ejecutándose.
:::
