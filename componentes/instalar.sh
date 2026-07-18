#!/usr/bin/env bash
# ==========================================================================
#  Agente Smith · Instalador (macOS / Linux)
#  Sistema 100% autocontenido (MIT). No descarga contenido de terceros.
#  Uso:
#    Desde el clon:  bash componentes/instalar.sh
#    Oneliner:       curl -fsSL https://raw.githubusercontent.com/Bitcoindefi/agente-smith/main/componentes/instalar.sh | bash
# ==========================================================================
set -euo pipefail
info(){ printf '\033[36m==> %s\033[0m\n' "$1"; }
ok(){ printf '\033[32m[ok] %s\033[0m\n' "$1"; }

for c in git node claude; do
  command -v "$c" >/dev/null 2>&1 || { echo "Falta '$c' en el PATH. Instalá Git, Node.js (>=22) y Claude Code."; exit 1; }
done

SKILLS="$HOME/.claude/skills"
MCPDIR="$HOME/.claude/mcp-servers/saij"
mkdir -p "$SKILLS" "$MCPDIR"

# Ubicar el repo (clon local, o clonar si es oneliner)
SELF="${BASH_SOURCE[0]:-}"
if [ -n "$SELF" ] && [ -f "$(dirname "$SELF")/mcp-saij/server.mjs" ]; then
  REPO="$(cd "$(dirname "$SELF")/.." && pwd)"
else
  REPO="$HOME/agente-smith"
  [ -d "$REPO" ] || { info "Clonando agente-smith en $REPO"; git clone --depth 1 https://github.com/Bitcoindefi/agente-smith.git "$REPO"; }
fi
ok "Repo Agente Smith: $REPO"

# 1) Skills (todas propias, desde el repo)
for s in abogacia-argentina argentina-plazos argentina-diagnostico argentina-bucles saij-argentina; do
  mkdir -p "$SKILLS/$s"
  cp -r "$REPO/skills/$s/." "$SKILLS/$s/"
done
ok "5 skills instaladas en $SKILLS"

# 2) MCP de SAIJ
cp "$REPO/componentes/mcp-saij/server.mjs" "$MCPDIR/server.mjs"
claude mcp remove saij -s user 2>/dev/null || true
claude mcp add saij --scope user -- node --use-system-ca "$MCPDIR/server.mjs"
ok "MCP 'saij' registrado"

echo
ok "Agente Smith instalado. Reiniciá Claude Code y verificá con /mcp."
