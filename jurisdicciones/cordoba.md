# Jurisdicción · Provincia de Córdoba

> Confirmá el fuero antes de computar plazos. Los números de norma marcados `🔲`
> verificalos en SAIJ / Digesto provincial antes de citar. Esta ficha arranca como
> esqueleto: la prioridad es que ningún cómputo caiga al régimen nacional por falta
> de jurisdicción declarada.

## Marco institucional
- **Constitución de la Provincia de Córdoba** 🔲 (verificar texto vigente en Digesto
  Jurídico provincial; reforma de 1987 y posteriores reformas 🔲).
- Ministerio Público de Córdoba (Fiscalía y Defensa) — ley orgánica del Ministerio
  Público Fiscal y de la Defensa 🔲 verificar número de ley en Digesto.
- Tribunal Superior de Justicia de Córdoba: dicta las acordadas de feria judicial y
  reglas de plazos 🔲 (verificar acordada vigente cada año).

## Procedimiento por fuero
| Fuero | Código procesal | Notas |
|-------|-----------------|-------|
| Civil y Comercial | **Código Procesal Civil y Comercial de Córdoba** 🔲 (n° de ley a verificar en SAIJ/Digesto) | Plazos en días hábiles judiciales según el CPC provincial; no rige el CPCCN. |
| Penal | **Código Procesal Penal de Córdoba** 🔲 — régimen acusatorio | Confirmar ley vigente y reglas de plazos/audiencias 🔲. |
| Laboral | **Procedimiento laboral provincial** 🔲 (texto único / ley a verificar) | Distinguir días hábiles judiciales del fuero. |
| Contencioso Administrativo | **Régimen contencioso-administrativo provincial** 🔲 | Distinguir plazos administrativos de judiciales; sede judicial 🔲. |
| Familia | Tramita según CPC provincial con reglas propias 🔲 | Verificar disposiciones de proceso de familia del código local 🔲. |

## Cómputo de plazos
- Rige el **código procesal provincial** correspondiente a cada fuero (no el CPCCN).
- Feria judicial: según acordadas anuales del **Tribunal Superior de Justicia de
  Córdoba** 🔲 verificar la acordada vigente (el calendario concreto por año va en
  la issue de calendarios, no acá).
- Plazo de gracia: 🔲 verificar si Córdoba mantiene plazo de gracia en días/horas y
  de cuántas horas, citando fuente (CPC o acordada).
- Usá la skill `argentina-plazos` indicando explícitamente jurisdicción **Córdoba**.

## Consultar en SAIJ
- Legislación provincial: `saij_buscar_legislacion` con "Córdoba" en la consulta
  (ej. "codigo procesal civil comercial Cordoba", "constitucion Cordoba"). Los
  resultados vienen con `jurisdicción: Local`.
- Jurisprudencia del TSJ Córdoba y cámaras: `saij_buscar_jurisprudencia` con
  "Córdoba".
- Sintaxis útil para normas muy citadas: nombre del código + "Córdoba" + "ley".

## Fuentes locales
- **Digesto Jurídico Provincial de Córdoba**: digesto.cba.gov.ar 🔲 (portal oficial;
  verificar apertura desde red propia — desde este entorno no respondió al fetch).
- **Boletín Oficial de Córdoba**: boletinoficial.cba.gov.ar 🔲 (oficial; bloquea
  clientes automatizados con 403 — abrir manualmente para vigencia y textos).
- Municipio de Córdoba (ordenanzas capital): portal de ordenanzas 🔲 URL a confirmar
  en la issue de fuentes locales (#3).