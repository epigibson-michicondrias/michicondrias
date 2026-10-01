#!/usr/bin/env bash
# Arranca un microservicio con uvicorn. Uso: run-service.sh <servicio>
# PROXY_PREFIX=/<servicio> replica lo que hacía API Gateway (root_path de FastAPI).
set -euo pipefail
SVC="${1:?uso: run-service.sh <servicio>}"
BASE=/opt/michicondrias
PORT="$(awk -v s="$SVC" '$1==s {print $2}' "$BASE/services.conf")"
[ -n "$PORT" ] || { echo "servicio desconocido: $SVC" >&2; exit 1; }
cd "$BASE/services/michicondrias_$SVC"
export PROXY_PREFIX="/$SVC"
exec "$BASE/venvs/$SVC/bin/uvicorn" app.main:app \
  --host 127.0.0.1 --port "$PORT" \
  --proxy-headers --forwarded-allow-ips 127.0.0.1
