# Despliegue: Oracle Cloud (principal) / AWS (alterno)

El mismo código corre en ambos destinos. Todo lo que cambia entre proveedores vive en
**variables de entorno** y en esta carpeta; el código de los servicios no se toca.

| Concepto | Oracle (VM, Python puro) | AWS (Lambda) |
|---|---|---|
| Cómputo | `uvicorn` por servicio, gestionado por systemd | Lambda + `Mangum` (`app.main.handler`) |
| Enrutamiento `/<servicio>/*` | Caddy (`gen-caddyfile.sh`) | API Gateway HTTP |
| CI/CD | `.github/workflows/deploy-oracle.yml` (automático en push a `main`) | `.github/workflows/deploy-aws-lambda.yml` (manual) |
| Variables | `/etc/michicondrias/common.env` | Config de cada Lambda |
| Archivos | Oracle Object Storage (API S3) | S3 |
| BD | Supabase (igual en ambos) | Supabase (igual en ambos) |

`deploy/services.conf` es la lista de servicios y puertos (fuente única).

## Oracle: puesta en marcha

1. **Dominio:** crea un registro A `api.tudominio.com` → IP pública de la VM.
2. **VM:** Oracle Linux 9 o Ubuntu 24.04 (Ampere A1 recomendada; usuario SSH: `opc` u `ubuntu`). En la Security List / NSG abre TCP 22, 80 y 443.
3. **Llave de deploy:** `ssh-keygen -t ed25519 -f deploy_key -N ""`.
4. **Setup** (en la VM, con el repo clonado):
   ```bash
   sudo bash deploy/oracle/setup-vm.sh api.tudominio.com "$(cat deploy_key.pub)"
   sudo nano /etc/michicondrias/common.env      # usa common.env.example como guía
   ```
5. **Secrets de GitHub:** `ORACLE_HOST` (IP o dominio), `ORACLE_SSH_KEY` (contenido de `deploy_key`), opcional `ORACLE_USER`.
6. Lanza el workflow *Deploy Backend to Oracle VM* (o haz push a `main`). El primer deploy tarda por la instalación de dependencias; los siguientes solo reinstalan si cambió `requirements.txt`.
7. Verifica: `curl https://api.tudominio.com/healthz` y `curl https://api.tudominio.com/core/`.

Operación: `journalctl -u michicondrias@core -f`, `sudo systemctl restart michicondrias@core`.

## Archivos: S3 → Oracle Object Storage

1. Crea un bucket público de lectura (o con política equivalente) y un *Customer Secret Key* (Perfil → Customer secret keys). Esas son `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` en `common.env`.
2. Copia los objetos: `rclone sync s3-aws:michicondrias-storage-1 oci:michicondrias-storage` (remotes S3 en rclone).
3. Reescribe las URLs guardadas en la BD (primero sin `--apply`):
   ```bash
   DATABASE_URL=... python scripts/deploy/rewrite_storage_urls.py \
     --old https://michicondrias-storage-1.s3.us-east-1.amazonaws.com \
     --new https://objectstorage.<region>.oraclecloud.com/n/<ns>/b/<bucket>/o
   ```
4. Presigned URLs: prueba una subida real tras migrar (el cliente usa `s3v4` + `path` style).

## App móvil / frontend

Dos variables y nada más: `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_STORAGE_URL` (frontend: `NEXT_PUBLIC_API_URL`).
Usa un dominio propio (`api.tudominio.com`) para que el siguiente cambio de proveedor sea solo DNS.

## Volver a AWS (o ir y venir)

Ver `deploy/aws/README.md`. Resumen: restaurar `S3_*`/`STORAGE_*` en las variables, correr el workflow manual de Lambda y mover el DNS de `api.` al API Gateway (dominio personalizado).
