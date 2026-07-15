---
name: argentina-bucles
description: "Bucle de fundamentación para construir DESDE CERO un escrito de fondo bajo derecho argentino (demanda, contestación, recurso, alegato, descargo administrativo): encuadre, investigación de fuentes en SAIJ, esqueleto argumental en cascada, borrador, crítica adversarial y verificación de citas. Usar cuando hay que redactar y fundamentar un escrito nuevo; para auditar uno ya escrito usar argentina-diagnostico."
license: MIT
---

# Bucle de fundamentación · Redacción de escritos desde cero

Skill original de Open Boga (MIT). Método iterativo en 7 pasos: no se redacta nada
hasta tener el esqueleto argumental montado sobre fuentes verificadas.

## Paso 1 · Encuadre

- Hechos en una cronología limpia (fecha → hecho → prueba que lo respalda).
- Pretensión exacta: ¿qué se pide y contra quién?
- Jurisdicción y fuero (condiciona procedimiento, plazos y estilo). Si falta, preguntar.
- Restricciones estratégicas del caso (qué NO decir, qué no convalidar, qué reservar).
  Leerlas de la ficha del caso y respetarlas como reglas duras.

## Paso 2 · Investigación de fuentes (SAIJ)

Para cada eje del argumento:
1. `saij_buscar_legislacion` → identificar la norma → `saij_documento(uuid)` → **leer
   el texto real** y su vigencia. La norma se cita por lo que dice, no por lo que se
   recuerda.
2. `saij_buscar_jurisprudencia` → fallos que sostengan (y fallos que contradigan — se
   buscan a propósito). Leer con `saij_documento` antes de citar.
3. Registrar cada fuente: norma/fallo · cita textual breve · uuid · URL.
4. Lo no verificable queda 🔲 y NO entra al escrito como afirmación.

## Paso 3 · Esqueleto argumental

- Cada argumento como silogismo: **norma (verificada) → hecho (probado) → consecuencia
  (pedida)**. Si falta la prueba del hecho, el argumento baja a subsidiario o se
  descarta.
- Cascada de subsidiariedad: argumento principal → subsidiarios en orden ("aun si no
  se admitiera X, entonces Y"). Las nulidades e inadmisibilidades van como cuestión
  previa, sin convalidar nada.
- Un párrafo = una idea. Numerar secciones.

## Paso 4 · Borrador

Redactar sección por sección sobre el esqueleto: encabezado y personería → objeto →
hechos → prueba → derecho → petitorio → reservas. Estilo: claro, sobrio, sin adjetivos
que no prueben nada; cada afirmación fáctica con su respaldo citado.

## Paso 5 · Crítica adversarial (el bucle)

Releer el borrador dos veces con sombreros distintos:
- **Como contraparte:** ¿qué contestaría? ¿qué hecho negaría? ¿qué debilidad explota?
  → reforzar o podar.
- **Como juez/autoridad:** ¿qué falta probar? ¿qué pedido es incongruente o excesivo?
  ¿dónde hay ruido que tapa el punto fuerte? → simplificar.
Repetir el bucle hasta que una pasada no produzca cambios sustanciales (máx. 3).

## Paso 6 · Verificación final de citas

Pasar el escrito por la tabla de fuentes del Paso 2: toda cita del texto final debe
estar en la tabla y verificada. Cita sin fuente verificada: se elimina o se marca
expresamente como pendiente para decisión del abogado.

## Paso 7 · Cierre

Correr `argentina-diagnostico` sobre el resultado (auditoría de las 9 secciones) y
entregar: escrito + tabla de fuentes + lista de decisiones estratégicas que quedan en
cabeza del abogado firmante.

## Reglas duras

- Jamás inventar jurisprudencia, carátulas o números: si no está verificado, no se cita.
- Las reglas estratégicas del caso (ficha) prevalecen sobre cualquier preferencia de
  redacción.
- El escrito final lo firma y decide el abogado: señalar toda decisión irreversible.
