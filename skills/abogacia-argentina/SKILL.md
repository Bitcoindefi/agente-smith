---
name: abogacia-argentina
description: "Punto de entrada para práctica jurídica argentina: fija las reglas de operación (jurisdicción primero, fuente primaria SAIJ, marcadores de verificación pendiente, alerta normativa, cómputo diferenciado de plazos) y rutea por área del derecho (laboral, civil, penal, familia, consumidor, societario, administrativo, previsional, tributario, tránsito, protección de datos) hacia sus ejes normativos y las sub-skills plazos/diagnóstico/bucles. Usar en cualquier consulta o trabajo de abogacía bajo derecho argentino."
license: MIT
---

# Abogacía Argentina · Router del sistema Agente Smith

Skill original de Agente Smith (MIT). El sistema asiste el análisis jurídico; **no
reemplaza el juicio ni la firma del abogado** y no constituye asesoramiento legal.

## Reglas de operación (siempre, no negociables)

1. **Jurisdicción primero.** Nacional/federal ≠ CABA ≠ provincias: cambian el código
   procesal, los plazos y la autoridad competente. Si el fuero no está definido,
   preguntarlo antes de computar plazos o citar procedimiento. Si el workspace tiene
   fichas de jurisdicción (`jurisdicciones/`), leer la que corresponda.
2. **Fuente primaria antes de afirmar.** Toda norma o fallo se verifica en SAIJ (MCP
   `saij`: `saij_buscar_legislacion`, `saij_buscar_jurisprudencia`, `saij_documento`)
   leyendo el texto real. La norma se cita por lo que dice, no por lo que se recuerda.
3. **Verificación pendiente.** Jamás inventar jurisprudencia, carátulas, números de
   fallo o citas. Lo no verificado se marca 🔲 y se dice qué falta confirmar.
4. **Alerta normativa.** En zonas de reforma reciente o discusión de vigencia, marcar
   ⚠️ con la fecha de corte del conocimiento y verificar el texto actualizado.
5. **Plazos diferenciados.** Hábiles judiciales ≠ hábiles administrativos ≠ corridos.
   Todo vencimiento pasa por la skill `argentina-plazos`.
6. **Casos privados.** El contenido de `casos/` es local y confidencial: nunca va a
   repos, memoria persistente ni servicios externos.

## Ruteo por área — ejes normativos de partida

Puntos de entrada para la búsqueda (verificar SIEMPRE el texto vigente en SAIJ; no
son citas listas para usar):

| Área | Ejes normativos de partida |
|------|---------------------------|
| Laboral | LCT 20.744 · riesgos del trabajo 24.557 · empleo 24.013 · reformas recientes ⚠️ |
| Civil y comercial | CCCN (Ley 26.994): contratos, daños, prescripción |
| Familia | CCCN Libro Segundo · protección integral 26.061 · violencia 26.485 |
| Consumidor | LDC 24.240 y modificatorias · lealtad comercial |
| Societario | LGS 19.550 · normativa del registro público de la jurisdicción |
| Administrativo | LNPA 19.549 y reglamento (nacional) · ley de procedimiento local ⚠️ por jurisdicción |
| Previsional | Ley 24.241 (SIPA) · regímenes especiales · normativa ANSES |
| Concursos | LCQ 24.522 |
| Tributario | Ley 11.683 (nacional) · códigos fiscales locales |
| Tránsito | Ley 24.449 · Ley 26.363 (ANSV) · adhesiones y códigos de faltas locales ⚠️ |
| Protección de datos | Ley 25.326 · normativa AAIP ⚠️ reforma en discusión |
| Penal | CP · CPPF (federal, implementación progresiva ⚠️) · CPP de cada provincia |

## Sub-skills

- **`argentina-plazos`** — cómputo de todo plazo, prescripción o caducidad.
- **`argentina-diagnostico`** — auditoría de un escrito ya redactado, antes de presentar.
- **`argentina-bucles`** — construcción de un escrito nuevo desde cero, con fuentes.
- **`saij-argentina`** — documentación del conector SAIJ (búsquedas y texto completo).

## Flujo de trabajo sobre un caso

1. Leer `FICHA.md` del caso (y su archivo maestro si lo indica) + reglas estratégicas.
2. Confirmar jurisdicción/fuero y leer su ficha en `jurisdicciones/`.
3. Identificar el área y sus ejes normativos; verificar los textos en SAIJ.
4. Trabajar con la sub-skill que corresponda (plazos / diagnóstico / bucles).
5. Registrar fuentes verificadas (uuid + URL) en la carpeta del caso.
6. Toda decisión estratégica o irreversible vuelve al abogado.
