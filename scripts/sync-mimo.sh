#!/usr/bin/env bash
# Deja a Mimo (agente de IA de Xiaomi, `mimo`) con las mismas herramientas de proyecto que Claude Code:
#   - skills de .claude/skills          → por `skills.paths` en .mimocode/mimocode.jsonc
#   - agentes de .claude/agents/*.md    → .mimocode/agent/<nombre>.md (encabezado en formato Mimo)
#   - servidores MCP de .mcp.json       → `mcp` en .mimocode/mimocode.jsonc
# Las instrucciones (CLAUDE.md) Mimo ya las hereda solo. Correr de nuevo cuando cambie algo de .claude/ o .mcp.json.
# Uso (desde la raíz): scripts/sync-mimo.sh
set -euo pipefail
cd "$(dirname "$0")/.." || exit 1
mkdir -p .mimocode/agent

# Agentes: mismo cuerpo, encabezado con `mode: subagent` (Mimo no entiende `tools:` como texto de Claude).
for src in .claude/agents/*.md; do
  name=$(basename "$src" .md)
  python3 - "$src" ".mimocode/agent/$name.md" <<'PY'
import re, sys
src, dst = sys.argv[1], sys.argv[2]
text = open(src).read()
m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
front, body = m.group(1), m.group(2)
desc = re.search(r"^description:\s*(.+)$", front, re.M).group(1).strip()
read_only = re.search(r"^tools:\s*(.+)$", front, re.M)
lines = ["---", f"description: {desc}", "mode: subagent"]
if read_only and not re.search(r"\b(Edit|Write)\b", read_only.group(1)):
    lines += ["permission:", "  edit: deny"]
lines += ["---", f"<!-- Generado por scripts/sync-mimo.sh desde {src}. No editar aquí. -->", ""]
open(dst, "w").write("\n".join(lines) + body)
PY
done

# Configuración del proyecto: skills del proyecto + MCP traducidos de .mcp.json.
python3 - <<'PY'
import json
mcp_in = json.load(open(".mcp.json"))["mcpServers"]
mcp = {}
for name, s in mcp_in.items():
    if s.get("type") in ("http", "sse") or "url" in s:
        mcp[name] = {"type": "remote", "url": s["url"]}
    else:
        mcp[name] = {"type": "local", "command": [s["command"], *s.get("args", [])]}
        if s.get("env"):
            mcp[name]["environment"] = s["env"]
config = {
    "$schema": "https://mimo.xiaomi.com/mimocode/config.json",
    "skills": {"paths": [".claude/skills"]},
    "mcp": mcp,
}
header = "// Generado por scripts/sync-mimo.sh desde .claude/skills y .mcp.json. No editar aquí.\n"
open(".mimocode/mimocode.jsonc", "w").write(header + json.dumps(config, indent=2, ensure_ascii=False) + "\n")
print("MCP:", ", ".join(mcp))
PY

echo "Agentes: $(ls .mimocode/agent | sed 's/\.md$//' | tr '\n' ' ')"
echo "Verifica con: mimo debug skill | grep -E 'auditar-modulo|ui-ux-pro-max|motion' · mimo agent list · mimo mcp list"
