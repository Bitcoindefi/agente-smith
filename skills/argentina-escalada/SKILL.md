---
name: argentina-escalada
description: "Plan de escalada por etapas para reclamos administrativos, de consumo y ante entes privados regulados en Argentina: identificaci\u00f3n de escalones disponibles, triggers objetivos para pasar de etapa (silencio, respuesta evasiva), regla de tono por escalón, un solo hilo con destinatarios crecientes e integraci\u00f3n con argentina-plazos. Usar ante reclamos prolongados no judiciales o para decidir cuándo judicializar."
license: MIT
---

# Plan de escalada · Reclamos administrativos y de consumo

Skill original de Agente Smith (MIT). Método: **el escalado es una secuencia
deliberada, no una reacción**. Cada etapa tiene destinatarios definidos, trigger
objetivo para pasar a la siguiente, y una regla de tono. Antes de armar el plan:
identificar tipo de contraparte, relación jurídica (consumo / administrativa /
privada regulada) y jurisdicción.

## Paso 1 · Identificar los escalones disponibles

Según la contraparte, del más cercano al más lejano:

| Escalón | Destinatario típico | Cuándo aplica |
|---|---|---|
| 1 | Área operativa / soporte / mesa de entradas | Siempre: primer contacto. |
| 2 | Autoridad directa del área (jefatura, dirección) | Cuando el operativo no resuelve ni escala. |
| 3 | Conducción superior (rectorado, dirección general, gerencia) | Silencio o evasiva del escalón 2. |
| 4 | Organismo de control sectorial | Si existe regulatorio (defensor del usuario, ente, colegio, ministerio). |
| 5 | Defensa de las y los Consumidores / COPREC | Solo si hay relación de consumo (Ley 24.240). |
| 6 | Vía judicial (amparo, proceso de conocimiento) | Último recurso; evaluar con `argentina-plazos` y costo/beneficio. |

Marcar 🔲 los escalones cuya existencia haya que verificar para la contraparte
concreta (no todas las instituciones tienen todos).

## Paso 2 · Triggers objetivos para cambiar de escalón

Nunca escalar por impaciencia: escalar por regla.

- **Silencio**: margen inicial sugerido 10 días hábiles. El margen **se acorta**
  a medida que el reclamo lleva tiempo sin resolución (ej.: 10 → 7 → 5 hábiles).
  No es razonable darle a la quinta nota el mismo plazo que a la primera.
- **Respuesta que no cita norma** aplicable cuando la hay.
- **Respuesta que no considera la prueba aportada** (responde genéricamente).
- **Respuesta que deriva sin comprometer plazo** ("se remitió al área
  correspondiente" sin destino ni fecha).
- Registrar fecha de cada envío y respuesta: el cómputo del silencio pasa por
  `argentina-plazos` con la regla de verificación aritmética (mostrar la resta).

## Paso 3 · Regla de tono por escalón

- Cada escalón se dirige con **ánimo colaborativo** y **reserva sobria** de los
  pasos siguientes ("de no recibir respuesta en el plazo indicado, evaluaré las
  instancias que corresponda"), nunca amenaza explícita antes de tiempo.
- La reserva ya comunica lo suficiente: nombrar el organismo siguiente en la
  reserva es aceptable; anunciar demanda con adjetivos, no.
- El tono puede endurecer entre escalones, pero nunca insultar ni acusar dolo.

## Paso 4 · Un solo hilo, destinatarios crecientes

- Al escalar, **responder al mismo hilo/expediente** sumando destinatarios nuevos
  en Para/CC, sin quitar a nadie: quien llega tarde ve automáticamente todo lo
  actuado, y queda documentado que el nivel anterior no respondió.
- Hilo nuevo sólo cuando se abre instancia formal distinta (organismo de control,
  judicial): ahí el hilo previo se adjunta como antecedente ordenado.
- Detalle de forma y recordatorios: ver `argentina-formatos` §13.

## Paso 5 · Integración con el sistema

- Plazos de cada recurso/instancia (cuando la escalada toca vías formales):
  `argentina-plazos` con jurisdicción explícita.
- Formato de cada pieza (nota, mail, carta documento, recurso):
  `argentina-formatos`.
- Antes de enviar: `argentina-bucles` Paso 6 — verificación de citas y
  **verificación aritmética de fechas** (todo cómputo mostrado como resta explícita).
- Verificar autoridades vigentes con la regla dura #8 de `abogacia-argentina`
  antes de dirigirse a cualquier persona.

## Salida estándar

Tabla de escalada: etapa · destinatario (y canal) · fecha de envío · trigger
aplicable · margen restante · próxima acción. Marcar 🔲 todo dato institucional
no verificado en fuente primaria.
