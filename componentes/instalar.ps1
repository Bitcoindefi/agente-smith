# ==========================================================================
#  Open Boga · Instalador (Windows PowerShell)
#  Sistema 100% autocontenido (MIT). No descarga contenido de terceros.
#  Uso:
#    Desde el clon:   ./componentes/instalar.ps1
#    Oneliner:        irm https://raw.githubusercontent.com/Bitcoindefi/open-boga/main/componentes/instalar.ps1 | iex
# ==========================================================================
$ErrorActionPreference = "Stop"
function Info($m){ Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[ok] $m" -ForegroundColor Green }

# --- Prerrequisitos ---
foreach ($cmd in @("git","node","claude")) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    throw "Falta '$cmd' en el PATH. Instala Git, Node.js (>=22) y Claude Code antes de continuar."
  }
}
$skillsDir = Join-Path $HOME ".claude\skills"
$mcpDir    = Join-Path $HOME ".claude\mcp-servers\saij"
New-Item -ItemType Directory -Force -Path $skillsDir, $mcpDir | Out-Null

# --- Ubicar el repo Open Boga (clon local, o clonar si es oneliner) ---
if ($PSScriptRoot -and (Test-Path (Join-Path $PSScriptRoot "mcp-saij\server.mjs"))) {
  $repo = Split-Path $PSScriptRoot -Parent
} else {
  $repo = Join-Path $HOME "open-boga"
  if (-not (Test-Path $repo)) {
    Info "Clonando open-boga en $repo"
    git clone --depth 1 https://github.com/Bitcoindefi/open-boga.git $repo | Out-Null
  }
}
Ok "Repo Open Boga: $repo"

# --- 1) Skills (todas propias, desde el repo) ---
foreach ($s in @("abogacia-argentina","argentina-plazos","argentina-diagnostico","argentina-bucles","saij-argentina")) {
  $srcDir = Join-Path $repo "skills\$s"
  $dstDir = Join-Path $skillsDir $s
  New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
  Copy-Item (Join-Path $srcDir "*") $dstDir -Recurse -Force
}
Ok "5 skills instaladas en $skillsDir"

# --- 2) MCP de SAIJ ---
Copy-Item (Join-Path $repo "componentes\mcp-saij\server.mjs") (Join-Path $mcpDir "server.mjs") -Force
$serverPath = (Join-Path $mcpDir "server.mjs") -replace '\\','/'
claude mcp remove saij -s user 2>$null | Out-Null
claude mcp add saij --scope user -- node --use-system-ca $serverPath
Ok "MCP 'saij' registrado"

Write-Host ""
Ok "Open Boga instalado. Reinicia Claude Code y verifica con /mcp."
