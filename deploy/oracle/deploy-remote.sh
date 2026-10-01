#!/usr/bin/env bash
# Corre EN la VM (como usuario michicondrias). Crea/actualiza venvs y reinicia servicios.
# Uso: deploy-remote.sh [servicio ...]   (sin argumentos = todos)
set -euo pipefail
BASE=/opt/michicondrias
PYBIN="$(cat "$BASE/python-bin" 2>/dev/null || echo python3)"
if [ "$#" -gt 0 ]; then SERVICES=("$@"); else
  mapfile -t SERVICES < <(awk '!/^#/ && NF {print $1}' "$BASE/services.conf")
fi
FAILED=()
for svc in "${SERVICES[@]}"; do
  dir="$BASE/services/michicondrias_$svc"; venv="$BASE/venvs/$svc"
  [ -d "$dir" ] || { echo "== $svc: sin código, se omite"; continue; }
  [ -d "$venv" ] || "$PYBIN" -m venv "$venv"
  hash="$(sha256sum "$dir/requirements.txt" | cut -d' ' -f1)"
  if [ "$(cat "$venv/.req-hash" 2>/dev/null || true)" != "$hash" ]; then
    echo "== $svc: instalando dependencias"
    "$venv/bin/pip" install -q --upgrade pip
    "$venv/bin/pip" install -q -r "$dir/requirements.txt"
    echo "$hash" > "$venv/.req-hash"
  fi
  sudo systemctl enable "michicondrias@$svc" >/dev/null 2>&1
  sudo systemctl restart "michicondrias@$svc"
done
sleep 4
for svc in "${SERVICES[@]}"; do
  port="$(awk -v s="$svc" '$1==s {print $2}' "$BASE/services.conf")"
  if curl -fsS -o /dev/null "http://127.0.0.1:$port/"; then echo "OK   $svc"; else echo "FAIL $svc"; FAILED+=("$svc"); fi
done
[ "${#FAILED[@]}" -eq 0 ] || { echo "Servicios con error: ${FAILED[*]}" >&2; exit 1; }
