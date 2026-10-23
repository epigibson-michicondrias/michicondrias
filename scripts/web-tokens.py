#!/usr/bin/env python3
"""Genera frontend/src/app/tokens.css desde las copias espejo de la app.

- Colores: `frontend/src/constants/palettes.ts` (Midnight & Gold, claro y oscuro) → `--color-<clave>`.
- Medidas: `frontend/src/constants/design.ts` (spacing, radius, font, layout) → `--space-*`, `--radius-*`, `--font-*`.

Nunca se editan los tokens a mano: se cambia la app, se copia el espejo (`scripts/web-drift.sh`) y se corre esto.
Uso (desde la raíz): python3 scripts/web-tokens.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONST = ROOT / "frontend/src/constants"
OUT = ROOT / "frontend/src/app/tokens.css"


def kebab(name: str) -> str:
    return re.sub(r"(?<!^)([A-Z])", r"-\1", name).lower()


def block(src: str, start: str) -> str:
    """Contenido entre la llave que abre después de `start` y su llave de cierre."""
    i = src.index("{", src.index(start))
    depth = 0
    for j in range(i, len(src)):
        depth += src[j] == "{"
        depth -= src[j] == "}"
        if depth == 0:
            return src[i + 1 : j]
    raise ValueError(start)


def colors(mode: str) -> dict[str, str]:
    palette = block((CONST / "palettes.ts").read_text(), "const midnightGold")
    body = block(palette, f"{mode}:")
    out = {}
    for key, value in re.findall(r"(\w+):\s*['\"]([^'\"]+)['\"]", body):
        if key == "statusBar":
            continue
        out[key] = value
    for key, a, b in re.findall(r"(\w+):\s*\[\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\]", body):
        out[key] = f"linear-gradient(135deg, {a}, {b})"
    return out


def numbers(group: str) -> dict[str, int]:
    body = block((CONST / "design.ts").read_text(), f"export const {group} =")
    out = {}
    for key, val in re.findall(r"(\w+):\s*(?:scaled\()?(\d+)\)?", body):
        out[key] = int(val)
    return out


def declarations(values: dict[str, str], indent: str = "  ") -> str:
    return "\n".join(f"{indent}--color-{kebab(k)}: {v};" for k, v in values.items())


light, dark = colors("light"), colors("dark")
spacing, radius, font = numbers("spacing"), numbers("radius"), numbers("font")
layout = (CONST / "design.ts").read_text()
min_touch = int(re.search(r"minTouch:\s*(\d+)", layout).group(1))
screen_pad = int(re.search(r"screenPadding:\s*scaled\((\d+)\)", layout).group(1))

css = f"""/* Generado por scripts/web-tokens.py desde las copias espejo de la app. No editar a mano. */

:root {{
{chr(10).join(f"  --space-{k}: {v}px;" for k, v in spacing.items())}
{chr(10).join(f"  --radius-{k}: {v}px;" for k, v in radius.items())}
{chr(10).join(f"  --font-{k}: {v}px;" for k, v in font.items())}
  --min-touch: {min_touch}px;
  --screen-padding: {screen_pad}px;
  --shadow-card: 0 1px 6px rgba(0, 0, 0, 0.04);
  --shadow-raised: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-floating: 0 8px 20px rgba(0, 0, 0, 0.14);

  /* Midnight & Gold — claro */
{declarations(light)}
  color-scheme: light;
}}

/* Oscuro: lo pide el sistema, salvo que el usuario haya elegido claro */
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
{declarations(dark, "    ")}
    color-scheme: dark;
  }}
}}

/* Oscuro elegido a mano (ThemeContext) */
:root[data-theme="dark"] {{
{declarations(dark)}
  color-scheme: dark;
}}
"""

OUT.write_text(css)
print(f"{OUT.relative_to(ROOT)}: {len(light)} colores claro, {len(dark)} oscuro, "
      f"{len(spacing)} espacios, {len(radius)} radios, {len(font)} tamaños")
