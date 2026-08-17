<p align="center">
  <img src="logo.png" width="220" alt="Agente Smith">
</p>

<h1 align="center">Agente Smith</h1>

<p align="center">
  <b>Abogado generalista de IA para el derecho argentino, sobre Claude Code.</b><br>
  Laboral · Civil · Penal · Familia · Consumidor · Societario · Administrativo · Previsional · Tributario · Tránsito · Datos personales
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/licencia-MIT-00b34a?style=flat-square" alt="Licencia MIT"></a>
  <img src="https://img.shields.io/badge/Claude_Code-agente-0b3d2e?style=flat-square" alt="Claude Code">
  <img src="https://img.shields.io/badge/SAIJ-899K%2B_docs_en_vivo-00b34a?style=flat-square" alt="SAIJ">
  <img src="https://img.shields.io/badge/jurisdicciones-CABA%2FNacional_·_Jujuy_·_Salta-0b3d2e?style=flat-square" alt="Jurisdicciones">
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-bienvenidos-00b34a?style=flat-square" alt="PRs bienvenidos"></a>
</p>

---

## Demo — Workflow completo

El siguiente ejemplo muestra un flujo completo con un caso **100% ficticio**:
se abre un caso, se confirma la jurisdicción, se busca jurisprudencia en SAIJ
y se computa el plazo aplicable.

### Paso 1 — Abrir un caso nuevo

<p align="center">
  <img src="demo/step1-open-case.svg" alt="Abrir un caso nuevo" width="720">
</p>

### Paso 2 — Confirmar jurisdicción

<p align="center">
  <img src="demo/step2-jurisdiction.svg" alt="Confirmar jurisdicción" width="720">
</p>

### Paso 3 — Buscar en SAIJ

<p align="center">
  <img src="demo/step3-saij-search.svg" alt="Búsqueda en SAIJ" width="720">
</p>

### Paso 4 — Computar el plazo

<p align="center">
  <img src="demo/step4-deadline.svg" alt="Cómputo de plazo" width="720">
</p>

> ⚠️ **Nota:** todos los datos del ejemplo son ficticios. Los nombres, carátulas
> y cifras no corresponden a ningún caso real.

---

> ⚖️ **Qué es.** Un **agente abogado generalista**: rutea cada consulta por área del
> derecho argentino, computa plazos según la jurisdicción, diagnostica escritos antes
> de presentarlos, fundamenta nuevos desde cero e investiga en vivo sobre **SAIJ**
> (jurisprudencia, legislación y doctrina — 899K+ documentos), todo organizado por
> casos. Nació en la práctica real de una Defensoría de Pobres y Ausentes y lleva esa
> marca en el alma: está del lado del que litiga contra la maquinaria.
> **No reemplaza el juicio profesional del abogado ni constituye asesoramiento
> legal**: asiste el análisis y deja marcada toda cita sin verificar.

## Componentes

| Capa | Qué hace |
|------|----------|
| **Skills** | `abogacia-argentina` (router generalista por área: laboral, civil, penal, familia, consumidor, societario, administrativo, previsional, tributario, tránsito, protección de datos), `argentina-formatos` (anatomía de cada tipo de escrito: demanda ≠ descargo ≠ recurso ≠ nota), `argentina-plazos`, `argentina-diagnostico`, `argentina-bucles`, `saij-argentina`. Todas propias, MIT. |
| **MCP SAIJ** | Búsqueda en vivo de jurisprudencia, legislación y doctrina + texto completo por uuid. Código propio, cero dependencias. |
| **Multi-jurisdicción** | CABA/Nacional (CPCCN, CPPF), Jujuy y Salta — extensible con una ficha por provincia. Pregunta el fuero al abrir cada caso. |
| **Workspace de casos** | Cada caso es una subcarpeta en `casos/` con ficha, escritos, documentación, jurisprudencia y plazos. |
| **Alma** | [`soul.md`](soul.md): el carácter del agente — quién es, qué busca y las reglas que eligió. |

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
1. Instala las 6 skills (todas propias, MIT) en `~/.claude/skills/`.
2. Registra el MCP de SAIJ con `claude mcp add`.

Sistema 100% autocontenido: no descarga contenido de terceros.

## Uso

1. Abrí Claude Code en esta carpeta.
2. Para un caso nuevo: copiá `_PLANTILLA-CASO/` dentro de `casos/` con el nombre del expediente.
3. Pedí, por ejemplo: *"Abrí el caso Pérez, fuero penal Salta"* → el agente carga el
   perfil de área, pregunta/fija el fuero y computa plazos.
4. O consultá directo, de cualquier área: *"despido sin causa con 8 años de
   antigüedad"*, *"prescripción de expensas"*, *"multa de tránsito no notificada"* →
   el router identifica el área y trabaja con fuente primaria.
5. Para investigar: *"Buscá en SAIJ jurisprudencia sobre prisión preventiva"* → usa el MCP.

## Jurisdicciones

Fichas de referencia en [`jurisdicciones/`](jurisdicciones/): código procesal, régimen de
plazos y fuentes de cada jurisdicción. SAIJ tiene cobertura de legislación y jurisprudencia
**Local** de Jujuy y Salta, además de Nacional/Federal — se consulta en vivo, sin descargar nada.
¿Tu provincia no está? Sumá su ficha: ver [CONTRIBUTING.md](CONTRIBUTING.md).

## El alma

> *"El derecho contiene las herramientas para impugnarse a sí mismo. Una rebelión
> sin método es solo ruido. La mía deja jurisprudencia."* — [`soul.md`](soul.md)

## Contribuir

Las contribuciones son bienvenidas: fichas de nuevas provincias, mejoras a las
skills, cobertura de más áreas. Reglas de la casa en [CONTRIBUTING.md](CONTRIBUTING.md)
— la primera: **jamás datos de casos reales en el repo**.

---

## Quickstart (English)

### Prerequisites

- [Claude Code](https://claude.ai/code) installed and running in your terminal.
- macOS, Linux, or Windows (PowerShell).

### Install

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/Bitcoindefi/agente-smith/main/componentes/instalar.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Bitcoindefi/agente-smith/main/componentes/instalar.ps1 | iex
```

**SAIJ skill only (via npx):**
```bash
npx skills add Bitcoindefi/agente-smith
```

The installer sets up all six skills in `~/.claude/skills/` and registers the SAIJ
MCP server. No third-party content is downloaded.

### Run

```bash
cd /path/to/agente-smith
claude
```

### Basic usage

1. **Open a new case:** *"Open the case Pérez, jurisdiction CABA, criminal division"* —
   the agent loads the area profile, confirms the jurisdiction, and computes deadlines.
2. **Ask a legal question:** *"Unjust dismissal with 8 years of seniority"* — the router
   identifies the area and works with primary sources (SAIJ).
3. **Research in SAIJ:** *"Search SAIJ for case law on preventive detention"* — the
   MCP server queries 899K+ live documents.

All case data stays in your local `casos/` directory and is never pushed to the
repository.

---

## Cómo citar

Este repositorio incluye [`CITATION.cff`](CITATION.cff); GitHub genera la cita en
APA/BibTeX desde el botón **"Cite this repository"**.

## Licencia

- Todo el código y contenido de este repositorio: **MIT** — ver [`LICENSE`](LICENSE).
- Fuente de datos: **SAIJ** (Ministerio de Justicia de la Nación), acceso público.
  Verificá siempre vigencia y texto en la fuente oficial antes de citar.
