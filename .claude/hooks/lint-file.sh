#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): ESLint --fix sobre el archivo editado de mobile/ o frontend/.
# No bloquea: si quedan errores se los muestra a Claude (exit 2 en PostToolUse solo informa).
# La raíz se toma del repo del archivo, así funciona también en worktrees (p. ej. ../michicondrias-web).
set -uo pipefail

input=$(cat)
file=$(jq -r '.tool_input.file_path // empty' <<<"$input")
[[ -f "$file" ]] || exit 0
root=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-$(pwd)}")
rel="${file#"$root"/}"

[[ "$rel" =~ ^(mobile|frontend)/.*\.(ts|tsx|js|jsx|mjs)$ ]] || exit 0
[[ "$rel" =~ ^mobile/(android|ios|dist|node_modules)/ ]] && exit 0
[[ "$rel" =~ ^frontend/(\.next|node_modules|out)/ ]] && exit 0

app="${rel%%/*}"
cd "$root/$app" || exit 0
out=$(npx eslint --fix --quiet "${rel#"$app"/}" 2>&1)
if [[ $? -ne 0 ]]; then
  echo "ESLint encontró errores en $rel:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
