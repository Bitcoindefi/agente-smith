---
name: argentina-configuracion
description: "Entrevista inicial que captura cómo trabaja esta Defensoría en concreto: qué jurisdicciones y fueros toca de verdad, en qué juzgados, cómo se notifica, qué feria aplica y quién firma. Escribe el resultado en configuracion.local.md, que queda fuera del repositorio. Usar la primera vez que se abre el proyecto, cuando el usuario diga «configurar», «primera vez», «arranquemos», o cuando una skill necesite un dato del estudio que nadie declaró."
license: MIT
---

# Configuración inicial · Cómo trabaja esta Defensoría

Skill original de Agente Smith (MIT).

El agente viene sabiendo derecho argentino y tres jurisdicciones. Lo que no sabe
es **cómo trabaja esta oficina en particular**, y hoy eso lo deduce de cada
conversación, mal y de nuevo cada vez.

Esta skill lo pregunta una vez y lo escribe.

## Por qué importa más de lo que parece

Tres ejemplos de lo que cambia según la respuesta:

**La forma de notificación cambia el cómputo.** No es lo mismo un plazo que
corre desde una notificación electrónica que desde una cédula en papel: cambia
el día de inicio y a veces el plazo de gracia. Si el agente no sabe cómo notifica
el juzgado donde tramitás, tiene que preguntarlo en cada cómputo o adivinarlo.

**La feria no es una sola.** La feria judicial nacional, la de Jujuy y la de
Salta no coinciden, y encima hay asuetos locales. Si el agente sabe en qué
jurisdicciones trabajás de verdad, chequea las que corresponden en vez de las
tres.

**Quién firma cambia el escrito.** Un escrito de la Defensoría lleva el cargo, la
dependencia y la matrícula de quien firma. Eso no se inventa y no cambia entre
casos.

## El procedimiento

Es una conversación, no un formulario. Preguntá de a poco, aceptá "no sé" y
seguí. Lo que falte queda marcado y se completa después.

### 1. Jurisdicciones y fueros reales

De las tres fichadas (CABA-Nacional, Jujuy, Salta), **¿en cuáles litiga de
verdad?** Y dentro de cada una, ¿qué fueros?

No preguntes por todas: preguntá cuáles usa. Una Defensoría que sólo trabaja
familia en Salta no necesita que el agente le ofrezca criterios previsionales
nacionales en cada consulta.

### 2. Juzgados y dependencias

¿En qué juzgados tramita habitualmente? Nombre, fuero, y si tiene alguna
particularidad conocida (una acordada propia, un criterio distinto sobre plazos,
una mesa de entradas con horario acotado).

Esto es lo que después alimenta el registro de desvíos: cuando un juzgado aplica
sistemáticamente algo distinto de lo que dice el código, conviene tenerlo escrito
antes de que cueste un plazo.

### 3. Notificación

¿Cómo se notifica en esos juzgados: electrónica, cédula, ambas según el acto?
¿Hay plazo de gracia y de cuántas horas?

Si la respuesta es "depende", anotá de qué depende. Eso vale más que una regla
falsa.

### 4. Feria y asuetos

¿Qué ferias aplican? ¿Hay asuetos provinciales o locales que el agente deba
tener en cuenta al computar?

### 5. Quién firma

Nombre y cargo de quien firma los escritos, dependencia, y cómo va el
encabezado. Esto va a `configuracion.local.md`, que **no se sube al
repositorio**.

### 6. Convención de nombres

¿Cómo nombra las carpetas de caso? La sugerencia del proyecto es
`AAAA-NNN-caratula-corta`, pero si esta oficina usa el número de expediente o el
apellido, conviene que el agente lo respete.

## Dónde se escribe

En `configuracion.local.md`, en la raíz. El `.gitignore` del proyecto es
denegar-por-defecto en la raíz, así que ese archivo **queda fuera del repositorio
sin que haya que hacer nada**. No lo agregues a la lista de permitidos.

Formato sugerido:

```markdown
# Configuración de esta Defensoría

> Archivo local. No se versiona. Última actualización: AAAA-MM-DD

## Jurisdicciones y fueros
- Salta · familia, civil y comercial
- CABA-Nacional · previsional

## Juzgados habituales
| Juzgado | Fuero | Particularidades |
|---|---|---|
| ... | ... | ... |

## Notificación
- ...

## Feria y asuetos
- ...

## Firma
- ...

## Convención de nombres de caso
- ...
```

## Cuándo volver a correrla

Cuando cambie algo de lo anterior: una jurisdicción nueva, un juzgado nuevo, un
cambio de quien firma. No hace falta rehacer la entrevista entera; actualizá la
sección que cambió y la fecha.

## Lo que esta skill no hace

**No inventa un dato faltante.** Si no sabés cómo notifica un juzgado, queda
`🔲 verificación pendiente` y el agente lo va a preguntar cuando haga falta. Un
dato inventado en la configuración es peor que uno ausente, porque el ausente se
pregunta y el inventado se usa.

**No reemplaza las fichas de jurisdicción.** `jurisdicciones/*.md` tiene el
derecho; esto tiene la práctica de esta oficina. Si los dos se contradicen, gana
el código procesal y el desvío se anota.
