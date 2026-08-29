---
name: argentina-expedientes
description: "Abre, lista, valida y archiva expedientes en casos/. Exige jurisdicción y fuero al crear el caso, no después, porque un expediente sin esos datos tiene todos sus plazos ciegos. Usar cuando el usuario diga «abrí un caso», «nuevo expediente», «qué casos tengo», «revisá las fichas» o «archivá el caso»."
license: MIT
---

# Expedientes · Abrir, listar, validar y archivar

Skill original de Agente Smith (MIT).

Hasta ahora abrir un caso era copiar `_PLANTILLA-CASO/` a mano y completar la
ficha después. Esta skill hace lo mismo pero **pide la jurisdicción y el fuero
antes de dejar el caso abierto**, que es la única diferencia que importa.

## Por qué el orden cambia todo

`argentina-vigia` reporta como **bloqueado** todo expediente al que le falta la
jurisdicción, porque sin ella no se puede computar ni un plazo. Esos casos no
nacen bloqueados por descuido: nacen así porque el formulario se completaba
después, y el después a veces no llega.

Un caso con la ficha a medias no se ve como un problema. Se ve como un caso
nuevo. Y mientras tanto sus plazos corren sin que nadie los pueda calcular.

Por eso acá la ficha no es un trámite posterior: es la condición para abrir.

## Comandos

```bash
node componentes/casos/casos.mjs nuevo <nombre> --jurisdiccion <j> --fuero <f> [--caratula "..."]
node componentes/casos/casos.mjs listar [--json]
node componentes/casos/casos.mjs validar [<nombre>]
node componentes/casos/casos.mjs cerrar <nombre>
```

Nombre sugerido: `AAAA-NNN-caratula-corta`, por ejemplo `2026-014-perez-c-anses`.

### nuevo

Copia la plantilla, escribe jurisdicción, fuero, carátula y fecha de inicio en
la `FICHA.md`, y deja en `notas.md` el recordatorio de qué ficha de jurisdicción
leer para ese caso.

**Se niega a abrir el caso si falta alguno de los dos datos.** No es rigidez: es
que un caso abierto con la ficha vacía es peor que ninguno, porque ocupa lugar
en la lista y parece atendido.

**También rechaza una jurisdicción sin ficha propia.** Si el caso tramita en una
provincia que todavía no está en `jurisdicciones/`, hay que escribir esa ficha
primero: sin ella el cómputo de plazos no tiene contra qué verificarse, y un
plazo computado sin fuente es exactamente lo que la regla de la casa prohíbe.

### listar y validar

`listar` muestra todos con su jurisdicción y estado, marcando con ⚠️ los de
ficha incompleta. `validar` es lo mismo pero enfocado en qué falta.

Los dos devuelven código distinto de cero si hay alguno incompleto, así que
sirven para encadenar o para un chequeo antes de empezar el día.

Sirven sobre todo para los casos que ya existían antes de esta skill, o los que
alguien copió a mano.

### cerrar

Marca el estado como archivado. **No borra nada.**

Se niega si quedan plazos marcados `🔲`. Un caso archivado deja de aparecer en el
vigía, así que cerrarlo con un plazo sin resolver no lo cierra: lo vuelve
invisible. Si el plazo ya no corre, quitale la marca y explicá por qué en
`notas.md`.

## Después de abrir un caso

1. Completá en la `FICHA.md` las partes, el objeto y la estrategia.
2. Leé la ficha de jurisdicción que quedó anotada en `notas.md`.
3. Cargá los plazos en `plazos.md` computándolos con **`argentina-plazos`**.
4. Verificá en SAIJ toda norma o jurisprudencia antes de citarla.

## Lo que esta skill no hace

**No inventa la carátula ni el número de expediente.** Si no se los das, quedan
vacíos y `validar` los marca. Deducirlos del nombre de la carpeta sería fabricar
un dato de un caso real.

**No decide la jurisdicción.** Ni por el nombre del juzgado, ni por el tipo de
carátula, ni por lo que parece más probable. Se pregunta o no se abre.
