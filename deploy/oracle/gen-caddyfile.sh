#!/usr/bin/env bash
# Genera el Caddyfile (reemplazo del API Gateway) desde services.conf.
# Uso: gen-caddyfile.sh <dominio-api> [services.conf]  > /etc/caddy/Caddyfile
set -euo pipefail
DOMAIN="${1:?uso: gen-caddyfile.sh api.tudominio.com [services.conf]}"
CONF="${2:-/opt/michicondrias/services.conf}"
echo "$DOMAIN {"
echo "    encode gzip"
echo "    respond /healthz \"ok\" 200"
while read -r name port _; do
  [[ -z "${name:-}" || "$name" == \#* ]] && continue
  echo "    @$name path /$name /$name/*"
  echo "    handle @$name {"
  echo "        reverse_proxy 127.0.0.1:$port"
  echo "    }"
done < "$CONF"
echo "}"
echo
# Otros proyectos en la misma VM (p. ej. Nexus) dejan sus sitios aquí
echo "import /etc/caddy/sites/*.caddy"
