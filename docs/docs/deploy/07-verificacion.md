---
sidebar_position: 7
---

# Paso 6: Verificación y Troubleshooting

Una vez completados todos los pasos anteriores, es hora de verificar que todo funciona correctamente.

## Checklist de Deploy

Usa esta lista para verificar que no olvidaste nada:

- [ ] Lambda `michicondrias-{servicio}` creada en AWS
- [ ] Handler configurado como `app.main.handler`
- [ ] Memory: 256 MB, Timeout: 30 segundos
- [ ] Variables de entorno configuradas (`DATABASE_URL`, `SECRET_KEY`, `PROXY_PREFIX`, etc.)
- [ ] API Gateway: recurso `/{servicio}/{proxy+}` creado
- [ ] API Gateway: integración Lambda Proxy configurada
- [ ] CORS habilitado en el recurso de API Gateway
- [ ] **API Gateway desplegado** (Deploy API)
- [ ] Tablas SQL creadas en Neon
- [ ] Nombre del servicio agregado al `matrix` en `deploy-backend.yml`
- [ ] Push a `main` para llevar el código a Lambda
- [ ] GitHub Actions completó sin errores

## Test manual

Abre estas URLs en tu navegador para verificar:

```
# Endpoint raíz (no requiere auth)
GET https://kowly51wia.execute-api.us-east-1.amazonaws.com/paseadores/
→ {"message": "Bienvenido al API de Michicondrias Paseadores 🚶"}

GET https://kowly51wia.execute-api.us-east-1.amazonaws.com/cuidadores/
→ {"message": "Bienvenido al API de Michicondrias Cuidadores 🏠"}

# Endpoints de listado (no requieren auth)
GET .../paseadores/api/v1/walkers/
→ [] (array vacío si no hay paseadores registrados)

GET .../cuidadores/api/v1/sitters/
→ [] (array vacío si no hay cuidadores registrados)
```

## Troubleshooting

### `{"message": "Internal server error"}`

**Causa:** Lambda crasheó antes de poder responder.

**Solución:**
1. AWS Console → **CloudWatch** → **Log Groups**
2. Buscar `/aws/lambda/michicondrias-paseadores`
3. Abrir el **último log stream**
4. Buscar el traceback de Python — usualmente es un `ImportError` o error de conexión a DB

### `404 Not Found`

**Causa:** El path no coincide con lo que FastAPI espera.

**Solución:**
1. Verificar que `PROXY_PREFIX` está configurado correctamente:
   - Para paseadores: `PROXY_PREFIX=/paseadores`
   - Para cuidadores: `PROXY_PREFIX=/cuidadores`
2. Verificar que el recurso en API Gateway es un **proxy resource** (`{proxy+}`)
3. Verificar que hiciste **Deploy API** después de crear el recurso

### `403 Forbidden` en endpoints protegidos

**Causa:** El JWT no se puede validar.

**Solución:**
1. Verificar que `SECRET_KEY` en esta Lambda es **idéntica** a la de `michicondrias-core`
2. Copiarla directamente: Lambda Core → Configuration → Environment variables → copiar valor de `SECRET_KEY`
3. Pegar en la Lambda del nuevo servicio

### `GLIBC_2.28 not found`

**Causa:** Las dependencias Python se compilaron para Ubuntu, no para Amazon Linux.

**Solución:**
1. Verificar que CI/CD usa la imagen Docker:
   ```
   public.ecr.aws/sam/build-python3.11
   ```
2. Si instalaste deps manualmente (sin Docker), re-hacer el deploy via CI/CD

### `Connection refused` / `could not connect to server`

**Causa:** `DATABASE_URL` incorrecta o sin `?sslmode=require`.

**Solución:**
1. Verificar que la URL termina en `?sslmode=require` (Neon lo requiere)
2. Verificar que el endpoint de Neon no expiró (Neon pausa branches inactivos)
3. Probar la conexión desde Neon Console → SQL Editor

### `Task timed out after 3.00 seconds`

**Causa:** Timeout de Lambda muy bajo.

**Solución:**
1. Lambda → Configuration → General configuration → Edit
2. Subir **Timeout** a 30 segundos
3. Los cold starts de Lambda + conexión SSL a Neon pueden tardar 5-10 segundos la primera vez

### CORS blocked en el frontend

**Causa:** Falta CORS en API Gateway.

**Solución:**
1. API Gateway → Seleccionar recurso → **Actions** → **Enable CORS**
2. Configurar headers y origins permitidos
3. **Re-deploy la API** (esto es lo que más se olvida)

:::tip Debug rápido con Correlation ID
Cada request que pasa por nuestro middleware genera un `X-Correlation-ID` único. Si algo falla:
1. Busca el `correlation_id` en la respuesta del error (viene en el JSON)
2. Búscalo en CloudWatch Logs
3. Verás el traceback completo con ese ID
:::
