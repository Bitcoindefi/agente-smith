---
name: argentina-diagnostico
description: "Revisión crítica de un escrito judicial o administrativo argentino YA redactado, antes de presentarlo: competencia, legitimación y personería, admisibilidad y vía procesal, plazos, hechos, prueba, fundamentación normativa verificada, petitorio, formalidades y riesgos (costas, preclusión). Usar cuando el abogado aporta una demanda, contestación, recurso o presentación para control de calidad previo a la presentación."
license: MIT
---

# Diagnóstico previo de escritos · Derecho argentino

Skill original de Open Boga (MIT). Opera sobre un escrito **ya redactado** que el
abogado aporta. Objetivo: detectar defectos que causen rechazo, nulidad o riesgo,
ANTES de presentar. No reescribe el escrito (eso es `argentina-bucles`); lo audita.

## Método: auditoría en 9 secciones con semáforo

Revisar el escrito completo y calificar cada sección 🟢 (firme) / 🟡 (mejorable) /
🔴 (defecto que puede causar rechazo). Citar la parte exacta del escrito en cada
observación.

**A. Competencia.** ¿Tribunal/organismo correcto en lo material, territorial y por
grado? ¿Federal vs. provincial vs. CABA bien elegido? ¿Se fundó la competencia?

**B. Legitimación y personería.** ¿Legitimación activa/pasiva explicada? ¿Poder o
patrocinio en regla, ratificación necesaria, representación invocada correctamente?

**C. Vía y admisibilidad.** ¿La vía procesal elegida es la que corresponde a la
pretensión? ¿Instancias previas obligatorias cumplidas según jurisdicción y materia
(reclamo o agotamiento administrativo, mediación u otra instancia prejudicial)?
¿Requisitos de admisión del recurso (plazo, forma, fundamentación autónoma)?

**D. Plazos.** ¿La presentación está en término? Computar con la skill
`argentina-plazos` (jurisdicción primero). Si la notificación de origen es
cuestionable, señalar el doble escenario.

**E. Hechos.** ¿Relato claro, cronológico, completo y consistente con la prueba?
¿Alguna afirmación fáctica sin respaldo documental? Marcar cada una (riesgo:
juramento/temeridad).

**F. Prueba.** ¿Toda la prueba ofrecida y bien individualizada? ¿Pertinente y
conducente? ¿Obtención lícita? ¿Falta prueba clave para algún hecho esencial?

**G. Derecho.** La sección más auditada: **verificar cada norma y cada fallo citado
contra SAIJ** (`saij_buscar_legislacion` / `saij_buscar_jurisprudencia` /
`saij_documento`). ¿La norma dice lo que el escrito le atribuye? ¿Está vigente?
¿El fallo existe y sostiene lo que se le atribuye? Toda cita no verificable: 🔴.

**H. Petitorio y congruencia.** ¿Pide todo lo que el desarrollo sostiene (y nada que
no sostenga)? ¿Montos, intereses, costas? ¿Reservas necesarias (caso federal, vías
ulteriores) formuladas?

**I. Formalidades y riesgos.** Firma, copias, tasa/bono/aportes según jurisdicción,
domicilio constituido (electrónico si aplica), traducciones/legalizaciones. Riesgos:
condena en costas, sanciones por temeridad, preclusión de planteos no introducidos
ahora, y todo efecto irreversible de presentar (p. ej. pérdida de beneficios de pago
voluntario, consentimiento de actos que se querían impugnar).

## Salida

1. **Tabla semáforo** de las 9 secciones con observación puntual por sección.
2. **Lista priorizada de correcciones**: primero lo que causa rechazo (🔴), después lo
   que debilita (🟡), después estilo.
3. **Citas verificadas**: tabla norma/fallo → qué dice realmente → uuid SAIJ → veredicto
   (confirma / no confirma / 🔲 pendiente).
4. **Decisiones que no son del asistente**: si el escrito implica una opción
   estratégica irreversible, señalarla expresamente y devolverla al abogado.

## Reglas duras

- No "aprobar en general": cada sección se pronuncia.
- Ninguna cita se da por buena sin verificación en fuente primaria (o queda 🔲).
- El diagnóstico no reemplaza el juicio del profesional firmante.
