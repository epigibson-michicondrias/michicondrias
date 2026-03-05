---
sidebar_position: 4
---

# Paso 3: Configurar API Gateway

API Gateway es el "enrutador" central que decide a cuál Lambda enviar cada request basándose en el path de la URL.

## Abrir el API Gateway existente

1. AWS Console → **API Gateway** → abrir el API existente (`michicondrias-api`)

## Crear recurso para el nuevo servicio

1. En la vista de **Resources**, click en `/` (root)
2. **Actions** → **Create Resource**:
   - **Resource Name:** `paseadores`
   - **Resource Path:** `/paseadores`
   - ✅ **Configure as proxy resource**

### ¿Qué es un proxy resource?

:::info Proxy resource vs. Resource individual
Un **proxy resource** (`{proxy+}`) captura **TODAS** las sub-rutas y las envía a Lambda:

```
/paseadores/api/v1/walkers/          ← ✅ Capturado
/paseadores/api/v1/walkers/123       ← ✅ Capturado
/paseadores/api/v1/walkers/requests/ ← ✅ Capturado
/paseadores/lo-que-sea/deep/path     ← ✅ Capturado
```

Sin proxy resource, tendrías que crear un recurso por **cada endpoint individual**, lo cual es impráctico cuando tienes 15+ endpoints que pueden cambiar.
:::

3. Se creará un recurso que se ve como `/paseadores/{proxy+}`

## Configurar la integración con Lambda

En el recurso proxy creado:

| Campo | Valor | ¿Por qué? |
|---|---|---|
| **Integration type** | Lambda Function Proxy | API Gateway pasa todo el request tal cual a Lambda |
| **Lambda Function** | `michicondrias-paseadores` | La función que creamos en el paso anterior |
| **Use Lambda Proxy integration** | ✅ Sí | Mangum necesita el evento completo para procesarlo |

### Lambda Proxy Integration explicado

```
Sin proxy integration (NO usar):
  API Gateway → Transforma cada header/body/param → Lambda → Transforma la respuesta
  (Mapeos manuales complicados)

Con proxy integration (LO QUE USAMOS):
  API Gateway → Pasa TODO el evento HTTP tal cual → Lambda (Mangum lo procesa)
  (Mangum se encarga de toda la transformación automáticamente)
```

4. Click **"Create"**

## Habilitar CORS

1. Seleccionar `/paseadores` → **Actions** → **Enable CORS**
2. **Access-Control-Allow-Headers:** `Content-Type, Authorization, X-Correlation-ID`
3. **Access-Control-Allow-Origin:** `https://michicondrias.vercel.app`
4. **Access-Control-Allow-Methods:** `GET, POST, PUT, PATCH, DELETE, OPTIONS`
5. Click **"Enable CORS and replace existing CORS headers"**

:::info ¿Por qué CORS en API Gateway si FastAPI ya tiene middleware CORS?
Son diferentes capas:

1. **API Gateway CORS** → Responde a las requests `OPTIONS` (preflight) del navegador **antes** de que lleguen a Lambda
2. **FastAPI CORS middleware** → Agrega los headers CORS a las respuestas **reales** (GET, POST, etc.)

Si no configuras CORS en API Gateway, el navegador bloqueará la request en la fase de preflight y **nunca llegará** a Lambda.
:::

## Desplegar los cambios

:::danger ¡No olvides este paso!
Los cambios en API Gateway **NO se activan automáticamente**. Requiere un deploy explícito.
:::

1. **Actions** → **Deploy API**
2. **Deployment stage:** `default` (o tu stage actual)
3. Click **"Deploy"**

## Repetir para cada servicio nuevo

Para `michicondrias-cuidadores`, repetir exactamente los mismos pasos pero con:
- Resource Name: `cuidadores`
- Lambda Function: `michicondrias-cuidadores`
