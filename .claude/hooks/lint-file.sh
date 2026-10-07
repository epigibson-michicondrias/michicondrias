#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): ESLint --fix sobre el archivo editado de mobile/.
# No bloquea: si quedan errores se los muestra a Claude (exit 2 en PostToolUse solo informa).
set -uo pipefail

input=$(cat)
file=$(jq -r '.tool_input.file_path // empty' <<<"$input")
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${file#"$root"/}"

[[ "$rel" =~ ^mobile/.*\.(ts|tsx|js|jsx)$ ]] || exit 0
[[ "$rel" =~ ^mobile/(android|ios|dist|node_modules)/ ]] && exit 0
[[ -f "$file" ]] || exit 0

cd "$root/mobile" || exit 0
out=$(npx eslint --fix --quiet "${rel#mobile/}" 2>&1)
if [[ $? -ne 0 ]]; then
  echo "ESLint encontró errores en $rel:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
