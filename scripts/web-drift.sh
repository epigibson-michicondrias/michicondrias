#!/usr/bin/env bash
# Compara las copias espejo de la web (frontend/src) contra su original en la app (mobile/).
# Ignora líneas de import (las rutas y libs cambian: lucide-react-native → lucide-react, etc.).
#   scripts/web-drift.sh          resumen: igual / difiere / falta
#   scripts/web-drift.sh -d       además muestra el diff de cada archivo que difiere
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

show_diff=0
[[ "${1:-}" == "-d" ]] && show_diff=1

# origen (mobile) → espejo (frontend)
pairs=()
for f in mobile/src/types/*.ts; do pairs+=("$f:frontend/src/types/$(basename "$f")"); done
for f in mobile/src/services/*.ts; do
  [[ "$(basename "$f")" == rideGeo.ts ]] && continue   # usa expo-location: la web tiene su propia versión
  pairs+=("$f:frontend/src/services/$(basename "$f")")
done
pairs+=(
  "mobile/src/constants/roles.ts:frontend/src/constants/roles.ts"
  "mobile/src/constants/roleTools.ts:frontend/src/constants/roleTools.ts"
  "mobile/constants/design.ts:frontend/src/constants/design.ts"
  "mobile/constants/palettes.ts:frontend/src/constants/palettes.ts"
  "mobile/src/utils/formatters.ts:frontend/src/utils/formatters.ts"
  "mobile/src/utils/validators.ts:frontend/src/utils/validators.ts"
)

# Quita las sentencias import (también las de varias líneas) y las líneas en blanco.
strip() {
  awk '
    inimp { if ($0 ~ /from[ \t]+["\x27]/ || $0 ~ /;[ \t]*$/) inimp=0; next }
    /^[ \t]*import[ \t{*"\x27A-Za-z]/ { if ($0 !~ /from[ \t]+["\x27]/ && $0 !~ /^[ \t]*import[ \t]+["\x27]/ && $0 !~ /;[ \t]*$/) inimp=1; next }
    /^[ \t]*$/ { next }
    { print }
  ' "$1" 2>/dev/null
}

same=0; differ=(); missing=()
for p in "${pairs[@]}"; do
  src="${p%%:*}"; dst="${p#*:}"
  if [[ ! -f "$dst" ]]; then missing+=("$dst"); continue; fi
  if diff -q <(strip "$src") <(strip "$dst") >/dev/null; then same=$((same+1)); else differ+=("$src → $dst"); fi
done
# Espejos que ya no tienen original (se borró o renombró en la app)
for f in frontend/src/types/*.ts frontend/src/services/*.ts; do
  [[ -f "$f" ]] || continue
  m="mobile/src/${f#frontend/src/}"
  [[ -f "$m" ]] || missing+=("(huérfano en la web) $f")
done

echo "Espejo web ↔ app: ${same} iguales · ${#differ[@]} difieren · ${#missing[@]} faltan/huérfanos"
for d in "${differ[@]}"; do
  echo "  ≠ $d"
  if [[ $show_diff -eq 1 ]]; then diff <(strip "${d%% → *}") <(strip "${d##* → }") | sed 's/^/      /'; fi
done
for m in "${missing[@]}"; do echo "  ✗ $m"; done
[[ ${#differ[@]} -eq 0 && ${#missing[@]} -eq 0 ]]
