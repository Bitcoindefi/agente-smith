---
name: argentina-desvios
description: "Registra cuándo un tribunal aplicó algo distinto de lo que dice la ficha de jurisdicción, y avisa cuando el mismo desvío se repitió lo suficiente como para sospechar que la ficha quedó vieja. Usar al cerrar un acto procesal donde el criterio real no coincidió con el esperado, o cuando el usuario diga «anotá este desvío», «el juzgado aplicó otra cosa» o «revisá los desvíos»."
license: MIT
---

# Registro de desvíos · Cuando la práctica y la ficha no coinciden

Skill original de Agente Smith (MIT).

`jurisdicciones/*.md` dice lo que dice el código procesal. Los tribunales, a
veces, aplican otra cosa: un plazo que se cuenta distinto, un formato que se
rechaza, una acordada local que nadie fichó.

Esa brecha crece en silencio, porque nadie tiene tiempo de reconciliar la ficha
con la práctica después de cada expediente. Vive en la cabeza de quien litiga y
**se pierde cuando esa persona cambia de dependencia**.

Esta skill la escribe.

## Cómo funciona

Cada vez que la realidad no coincide con la ficha, se anota:

```bash
node componentes/desvios/desvios.mjs anotar \
  --jurisdiccion Salta \
  --tema plazo-traslado \
  --ficha "10 días hábiles" \
  --aplicado "5 días hábiles" \
  --juzgado "Juzgado Civil y Comercial 3ª Nom." \
  --fuente "Acordada 12/2026"
```

Y cada tanto se revisa:

```bash
node componentes/desvios/desvios.mjs revisar
```

Si el mismo desvío (misma jurisdicción, mismo tema) se repitió **5 veces en los
últimos 12 meses**, aparece como propuesta de revisar esa ficha. Los dos números
se cambian con `--umbral` y `--meses`.

## Las tres decisiones del diseño

**Se agrupa por jurisdicción y tema, no por juzgado.** Un juzgado que aplica algo
raro una vez es un caso. Tres juzgados de la misma jurisdicción aplicando lo
mismo es una ficha desactualizada. Por eso el conteo no suma temas distintos ni
jurisdicciones distintas para llegar al umbral: sumar peras con manzanas
produciría propuestas falsas, y una propuesta falsa quema la confianza en todas
las siguientes.

**La ventana es móvil.** Un desvío de hace tres años no dice nada del criterio de
hoy: los tribunales cambian de integración y las acordadas se derogan. Por eso
sólo cuentan los últimos doce meses.

**La fuente se pide pero no se exige.** Un desvío sin acordada citada igual se
anota, marcado `🔲`. Al revisar, si **ninguno** de los registros de un grupo tiene
fuente, el reporte lo dice fuerte: cinco impresiones repetidas no son un criterio
verificado, y reescribir una ficha sobre eso sería exactamente lo que la regla de
la casa prohíbe.

## Qué anotar y qué no

**Anotá** cuando el tribunal aplicó un criterio distinto del que la ficha
describe: el cómputo de un plazo, la admisibilidad de una vía, un requisito de
forma, un plazo de gracia.

**No anotes** una resolución desfavorable. Que te rechacen un planteo no es un
desvío de criterio procesal: es el resultado del caso. Mezclarlos convertiría el
registro en un archivo de derrotas y dejaría de servir para lo que sirve.

## Qué hacer con una propuesta

El reporte propone; no concluye. Que un tribunal aplique algo distinto cinco
veces puede significar dos cosas opuestas:

- **la ficha quedó vieja**, y hay que actualizarla con la fuente
- **el tribunal se está equivocando**, y hay que plantearlo en el expediente

La primera se resuelve editando `jurisdicciones/<j>.md` con la cita verificada.
La segunda es un argumento para un escrito, y el registro te dio las cinco veces
documentadas para sostenerlo.

Lo decide quien litiga. El agente sólo cuenta.

## Dónde vive el registro

En `desvios.local.jsonl`, en la raíz. El `.gitignore` es denegar-por-defecto ahí,
así que **queda fuera del repositorio sin hacer nada**. Es una línea de JSON por
desvío, así que se puede leer, filtrar y versionar aparte si la oficina quiere.

## Lo que esta skill no hace

**No anota sola.** Detectar un desvío requiere haber esperado un criterio y
haber visto otro, y eso lo nota una persona. El agente puede sugerir anotarlo
cuando lo ve, pero no lo escribe sin que se lo pidan.

**No edita las fichas.** Propone revisarlas. Reescribir `jurisdicciones/*.md`
automáticamente a partir de una estadística sería fabricar derecho a partir de
una frecuencia.
