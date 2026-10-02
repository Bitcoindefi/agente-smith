---
name: argentina-vigia
description: "Revisa todos los expedientes abiertos de una sola pasada y reporta qué vence pronto, qué plazo nadie computó todavía, y qué caso no se puede computar porque a la ficha le falta la jurisdicción o el fuero. Usar al empezar el día o la semana, al volver de la feria, antes de irse de licencia, o cuando el usuario diga «qué tengo pendiente», «cómo vienen los plazos», «revisá los casos» o «qué se me vence»."
license: MIT
---

# Vigía de vencimientos · Todos los expedientes de una pasada

Skill original de Agente Smith (MIT).

Las otras skills trabajan **un** caso. Esta mira **todos** a la vez, porque el
plazo que se pierde en una Defensoría casi nunca es el que estabas mirando.

## El modo de falla que esta skill persigue

No es el plazo que computaste y se te pasó. Ese lo tenés en la cabeza.

Es la fila que quedó así:

```
| contestar demanda | hábiles judiciales |  |  | 🔲 a computar |
```

Alguien abrió el caso, cargó el acto, y no volvió. Con tres expedientes eso se
nota. Con veinte no se nota nunca, y desde afuera se ve idéntico a un caso al
día: una tabla prolija, sin fechas rojas, porque **no hay fechas**.

Por eso el reporte separa tres cosas distintas y no las mezcla:

| | qué es | por qué duele |
|---|---|---|
| **vence pronto** | tiene fecha y está cerca | lo que ya sabés |
| **sin computar** | no tiene fecha porque nadie la calculó | lo que no sabés que no sabés |
| **bloqueado** | no se puede calcular: falta jurisdicción o fuero en la `FICHA.md` | el que parece un problema administrativo y es un plazo escondido |

## Procedimiento

**1. Escaneá lo mecánico.**

```bash
node componentes/vigia/escanear.mjs
```

Recorre `casos/`, lee cada `FICHA.md` y cada `plazos.md`, y devuelve el estado.
Con `--json` sale estructurado; con `--dias N` cambiás la ventana de "vence
pronto", que por defecto son 15 días corridos.

**El script no computa ningún plazo, a propósito.** Sólo lee fechas ya escritas
y cuenta días corridos hasta ellas para ordenar la urgencia. Restar días hábiles
sin saber la jurisdicción, la feria y las acordadas del tribunal sería adivinar
justo lo que la regla del proyecto prohíbe adivinar.

**2. Los bloqueados van primero.**

Un caso sin jurisdicción o sin fuero en la ficha **no tiene un problema de
formulario: tiene todos sus plazos sin computar y no lo parece.** Antes de
seguir, pedile al defensor esos datos. No los deduzcas del nombre del juzgado ni
del tipo de carátula.

**3. Recién ahí, computá lo que falta.**

Para cada fila `🔲`, activá **`argentina-plazos`** con la jurisdicción y el fuero
de la ficha. Esa skill pregunta lo que le falte; dejala preguntar. Escribí el
resultado en la `plazos.md` del caso, con la norma fuente en la columna de tipo.

**4. Marcá lo que quede sin verificar.**

Si computaste un vencimiento pero no pudiste confirmar la feria o una acordada
del tribunal en SAIJ, la fila queda `🔲` con la nota de qué falta verificar. Un
plazo computado a medias que figura como cerrado es peor que uno sin computar,
porque deja de aparecer en este reporte.

## Cuándo correrla

Al empezar la semana, al volver de la feria, antes de tomarte licencia, y cuando
recibís un expediente de otro defensor. Los cuatro son momentos donde el estado
real de los plazos y el que uno recuerda se separan.

## Lo que esta skill no hace

**No manda avisos ni recordatorios.** Reporta cuando la corrés. Un sistema que
avisa solo hace falta y es la evolución natural, pero necesita un lugar donde
correr programado; mientras tanto, esto se corre y se lee.

**No abre el expediente electrónico.** Lee lo que está escrito en `casos/`. Si
el juzgado notificó algo que nadie cargó, el vigía no lo sabe. Sincronizar con
el sistema del Poder Judicial es otro trabajo.

**No decide qué es urgente.** Ordena por fecha y marca lo fatal con 🔴 si vos lo
marcaste. La prioridad entre dos plazos del mismo día la pone el defensor.
