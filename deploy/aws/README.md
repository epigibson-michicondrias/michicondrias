# Volver a AWS (Lambda + API Gateway)

El código sigue siendo compatible con Lambda: `app/main.py` conserva `handler = Mangum(app)` y `PROXY_PREFIX`.

1. **Secrets de GitHub:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `DATABASE_URL`
   (ya no está escrita en el workflow).
2. **Infra base:** `scripts/aws/setup_aws.ps1`, `setup_apigateway.ps1`, `setup_lambda_env.ps1`
   (la guía completa está en `docs/docs/deploy/`). Revisa `API_ID`/`ACCOUNT_ID` en el workflow:
   si creas un API Gateway nuevo, cambia `API_ID`.
3. **Variables de la Lambda `michicondrias-core`** (las demás las copian de ahí):
   `DATABASE_URL`, `SECRET_KEY`, `RESEND_API_KEY`, `API_GATEWAY_URL` (= URL pública de la API),
   y para S3: `S3_BUCKET_NAME`, `AWS_REGION`; deja **vacíos** `S3_ENDPOINT_URL` y `STORAGE_PUBLIC_BASE_URL`.
4. **Archivos:** `rclone sync` del bucket de Oracle al de S3 y `scripts/deploy/rewrite_storage_urls.py`
   con `--old`/`--new` invertidos.
5. **Deploy:** Actions → *Deploy Backend to AWS Lambda* → Run workflow.
6. **DNS:** apunta `api.tudominio.com` al dominio personalizado del API Gateway.
   Sin dominio propio, actualiza `EXPO_PUBLIC_API_URL` y publica un build nuevo de la app.
