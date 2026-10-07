#!/usr/bin/env bash
# Stop: si hay .ts/.tsx modificados en mobile/, corre tsc. Si falla, Claude no termina y recibe los errores.
# Se corre al final del turno (y no tras cada edición) porque tsc tarda ~17 s.
set -uo pipefail

input=$(cat)
# Evita ciclos: si ya estamos continuando por este mismo hook, no volver a bloquear.
[[ "$(jq -r '.stop_hook_active // false' <<<"$input")" == "true" ]] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0

changed=$(git status --porcelain -- mobile/ 2>/dev/null | awk '{print $NF}' | grep -E '\.(ts|tsx)$' || true)
[[ -z "$changed" ]] && exit 0

cd mobile || exit 0
out=$(npx tsc --noEmit -p . 2>&1)
if [[ $? -ne 0 ]]; then
  echo "tsc falló con los cambios actuales en mobile/. Corrige los errores antes de terminar:" >&2
  echo "$out" | head -60 >&2
  exit 2
fi
exit 0
