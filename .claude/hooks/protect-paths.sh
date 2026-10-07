#!/usr/bin/env bash
# PreToolUse (Edit|Write|MultiEdit): bloquea escrituras en rutas intocables.
# Exit 2 = bloquear; el mensaje de stderr le llega a Claude.
set -euo pipefail

input=$(cat)
file=$(jq -r '.tool_input.file_path // empty' <<<"$input")
tool=$(jq -r '.tool_name // empty' <<<"$input")
[[ -z "$file" ]] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${file#"$root"/}"
base=$(basename "$rel")

block() {
  echo "Bloqueado por .claude/hooks/protect-paths.sh: $rel — $1. Si de verdad hay que cambiarlo, pídeselo al usuario para que lo haga él." >&2
  exit 2
}

case "$base" in
  .env.example) ;;
  .env|.env.*) block "archivo de variables de entorno (secretos)" ;;
  *.keystore|*.jks) block "keystore de firma del APK" ;;
esac

case "$rel" in
  mobile/android/*|mobile/ios/*) block "carpeta nativa generada por prebuild" ;;
  mobile/eas.json) block "configuración de EAS" ;;
esac

# Migraciones: crear nuevas sí, modificar las existentes (ya aplicadas en producción) no.
if [[ "$rel" =~ ^backend/[^/]+/alembic/versions/ || "$rel" =~ ^supabase/migrations/ ]]; then
  if [[ -e "$file" || "$tool" != "Write" ]]; then
    block "migración existente (puede estar aplicada en producción); crea una migración nueva en su lugar"
  fi
fi

exit 0
