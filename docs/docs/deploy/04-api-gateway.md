---
sidebar_position: 4
---

# Paso 3: Configurar API Gateway

API Gateway es el "enrutador" central que decide a cuál Lambda enviar cada request basándose en el path de la URL.

## Método recomendado: AWS CLI

Nuestro API es un **HTTP API v2** (ID: `kowly51wia`). Necesitamos:
1. Crear una **integración** (conecta API Gateway → Lambda)
2. Crear 2 **rutas** (base + proxy para sub-rutas)
3. Dar **permiso** a API Gateway para invocar la Lambda

### Paso 3.1: Crear la integración

```bash
aws apigatewayv2 create-integration \
  --api-id kowly51wia \
  --integration-type AWS_PROXY \
  --integration-uri "arn:aws:lambda:us-east-1:491799435777:function:michicondrias-NOMBRE_SERVICIO" \
  --payload-format-version 2.0
```

**Resultado:** Recibirás un `IntegrationId` (ejemplo: `334yll3`). **Anótalo**, lo necesitas para las rutas.

### ¿Qué hace cada flag?

| Flag | Valor | ¿Por qué? |
|---|---|---|
| `--api-id` | `kowly51wia` | ID de nuestro API Gateway existente |
| `--integration-type` | `AWS_PROXY` | API Gateway pasa todo el request tal cual a Lambda |
| `--integration-uri` | ARN de la Lambda | La función destino |
| `--payload-format-version` | `2.0` | Formato moderno de eventos (más limpio que 1.0) |

:::info ¿Qué es AWS_PROXY?
```
Sin proxy (NO usar):
  API Gateway → Transforma cada header/body → Lambda → Transforma respuesta
  (Mapeos manuales complicados)

Con proxy (LO QUE USAMOS):
  API Gateway → Pasa TODO el evento HTTP → Lambda (Mangum lo procesa)
  (Mangum se encarga automáticamente)
```
:::

### Paso 3.2: Crear las rutas

Cada servicio necesita **2 rutas**: una para la URL base y otra con `{proxy+}` para capturar todas las sub-rutas.

```bash
# Ruta base: /nombre_servicio
aws apigatewayv2 create-route \
  --api-id kowly51wia \
  --route-key "ANY /NOMBRE_SERVICIO" \
  --target "integrations/TU_INTEGRATION_ID"

# Ruta proxy: /nombre_servicio/* (captura todas las sub-rutas)
aws apigatewayv2 create-route \
  --api-id kowly51wia \
  --route-key "ANY /NOMBRE_SERVICIO/{proxy+}" \
  --target "integrations/TU_INTEGRATION_ID"
```

:::warning Reemplaza los valores
- `NOMBRE_SERVICIO` → nombre de tu servicio (ej: `paseadores`)
- `TU_INTEGRATION_ID` → el ID que recibiste en el paso 3.1 (ej: `334yll3`)
:::

### ¿Por qué 2 rutas?

```
ANY /paseadores           → Captura: /paseadores/  (la raíz del servicio)
ANY /paseadores/{proxy+}  → Captura: /paseadores/api/v1/walkers/
                                     /paseadores/api/v1/walkers/123
                                     /paseadores/lo-que-sea/deep/path
```

Si solo creas la ruta `{proxy+}`, la URL base `/paseadores/` dará 404.

### Paso 3.3: Dar permiso de invocación

API Gateway necesita permiso explícito para llamar a la Lambda:

```bash
aws lambda add-permission \
  --function-name michicondrias-NOMBRE_SERVICIO \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:491799435777:kowly51wia/*/*"
```

### ¿Qué significa `kowly51wia/*/*`?

```
arn:aws:execute-api:us-east-1:491799435777:kowly51wia/*/*
                                            │          ││
                                            │          │└── Cualquier recurso/path
                                            │          └── Cualquier stage (default, prod, etc)
                                            └── ID de nuestro API Gateway
```

Esto permite que **cualquier ruta** de nuestro API Gateway invoque la Lambda. Si quisieras restringirlo, podrías poner `/paseadores/*` en lugar de `/*/*`.

### Paso 3.4: Verificar que funciona

HTTP API v2 no necesita un deploy explícito como REST API v1 — los cambios se auto-propagan al stage `$default`. Verifica:

```bash
# Debe responder con el mensaje de bienvenida
curl https://kowly51wia.execute-api.us-east-1.amazonaws.com/NOMBRE_SERVICIO/
```

## CORS

:::info ¿Se necesita configurar CORS en API Gateway?
Para HTTP API v2, **el CORS se maneja directamente en FastAPI** via el middleware `CORSMiddleware` que ya tienen todos nuestros servicios en `main.py`. A diferencia de REST API v1, HTTP API v2 no requiere configuración de CORS separada en la consola.

Si necesitas ajustarlo:
```bash
aws apigatewayv2 update-api \
  --api-id kowly51wia \
  --cors-configuration AllowOrigins="https://michicondrias.vercel.app,http://localhost:3000",AllowMethods="*",AllowHeaders="*"
```
:::
