#!/usr/bin/env bash
# Stop: si hay .ts/.tsx modificados en mobile/ o frontend/, corre tsc en esa app. Si falla, Claude no termina y
# recibe los errores. Se corre al final del turno (y no tras cada edición) porque tsc tarda ~17 s.
set -uo pipefail

input=$(cat)
# Evita ciclos: si ya estamos continuando por este mismo hook, no volver a bloquear.
[[ "$(jq -r '.stop_hook_active // false' <<<"$input")" == "true" ]] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0

status=1
for app in mobile frontend; do
  changed=$(git status --porcelain -- "$app/" 2>/dev/null | awk '{print $NF}' | grep -E '\.(ts|tsx)$' || true)
  [[ -z "$changed" ]] && continue
  out=$(cd "$app" && npx tsc --noEmit -p . 2>&1)
  if [[ $? -ne 0 ]]; then
    echo "tsc falló con los cambios actuales en $app/. Corrige los errores antes de terminar:" >&2
    echo "$out" | head -60 >&2
    status=2
  fi
done
[[ $status -eq 2 ]] && exit 2
exit 0
