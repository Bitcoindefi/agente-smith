<p align="center">
  <img src="logo.svg" width="160" alt="Agente Smith">
</p>

<h1 align="center">Agente Smith</h1>

<p align="center">
  <b>Agente de práctica jurídica argentina para Claude Code.</b><br>
  Pensado para la Defensoría de Pobres y Ausentes · CABA/Nacional · Jujuy · Salta
</p>

---

> ⚖️ **Qué es.** Un **agente** para Claude Code que asiste la práctica jurídica
> argentina: rutea por área del derecho, computa plazos por jurisdicción, diagnostica
> y fundamenta escritos, e investiga en vivo sobre **SAIJ** (jurisprudencia,
> legislación y doctrina — 899K+ documentos), organizado por casos. Como su tocayo,
> es implacable y se multiplica en subagentes cuando el caso lo exige — pero trabaja
> del lado de los que defienden. No reemplaza el juicio profesional del abogado ni
> constituye asesoramiento legal: asiste el análisis y deja marcada toda cita sin
> verificar.

## Componentes

| Capa | Qué hace |
|------|----------|
| **Skills** | `abogacia-argentina` (router por área: laboral, civil, penal, familia, consumidor, societario, administrativo, previsional, tributario, tránsito, protección de datos), `argentina-plazos`, `argentina-diagnostico`, `argentina-bucles`, `saij-argentina`. Todas propias, MIT. |
| **MCP SAIJ** | Búsqueda en vivo de jurisprudencia, legislación y doctrina + texto completo por uuid. Código propio, cero dependencias. |
| **Multi-jurisdicción** | CABA/Nacional (CPCCN, CPPF), Jujuy y Salta. Pregunta el fuero al abrir cada caso. |
| **Workspace de casos** | Cada caso es una subcarpeta en `casos/` con ficha, escritos, documentación, jurisprudencia y plazos. |

## Privacidad de los casos 🔒

**Los datos de los casos NUNCA se suben al repo.** El `.gitignore` está en modo
*denegar-por-defecto*: todo lo que esté dentro de `casos/` (salvo el README) queda
excluido automáticamente. Cualquier carpeta nueva de caso es privada por diseño —
aunque te olvides de configurarla. El repo solo versiona el **sistema**, no los expedientes.

## Instalación

**Oneliner (Windows PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Bitcoindefi/agente-smith/main/componentes/instalar.ps1 | iex
```

**Oneliner (macOS / Linux):**
```bash
curl -fsSL https://raw.githubusercontent.com/Bitcoindefi/agente-smith/main/componentes/instalar.sh | bash
```

**Solo la skill de SAIJ (vía skills.sh):**
```bash
npx skills add Bitcoindefi/agente-smith
```

El instalador:
1. Instala las 5 skills (todas propias, MIT) en `~/.claude/skills/`.
2. Registra el MCP de SAIJ con `claude mcp add`.

Sistema 100% autocontenido: no descarga contenido de terceros.

## Uso

1. Abrí Claude Code en esta carpeta.
2. Para un caso nuevo: copiá `_PLANTILLA-CASO/` dentro de `casos/` con el nombre del expediente.
3. Pedí, por ejemplo: *"Abrí el caso Pérez, fuero penal Salta"* → el agente carga el perfil de área, pregunta/fija el fuero y computa plazos.
4. Para investigar: *"Buscá en SAIJ jurisprudencia sobre prisión preventiva"* → usa el MCP.

## Jurisdicciones

Fichas de referencia en [`jurisdicciones/`](jurisdicciones/): código procesal, régimen de
plazos y fuentes de cada jurisdicción. SAIJ tiene cobertura de legislación y jurisprudencia
**Local** de Jujuy y Salta, además de Nacional/Federal — se consulta en vivo, sin descargar nada.

## Licencia

- Todo el código y contenido de este repositorio: **MIT** — ver [`LICENSE`](LICENSE).
- Fuente de datos: **SAIJ** (Ministerio de Justicia de la Nación), acceso público.
  Verificá siempre vigencia y texto en la fuente oficial antes de citar.
