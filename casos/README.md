# casos/

Acá va **un subcarpeta por caso/expediente**. Todo lo que pongas dentro de estas
subcarpetas es **privado y no se sube al repositorio** (lo excluye el `.gitignore`
en modo denegar-por-defecto).

## Cómo abrir un caso nuevo

1. Copiá la plantilla `_PLANTILLA-CASO/` dentro de `casos/` con el nombre del expediente.
   Sugerencia de nombre: `AAAA-NNN-caratula-corta` (ej: `2026-014-perez-c-anses`).
2. Completá `FICHA.md` con carátula, partes, fuero/jurisdicción y objeto.
3. Pedile a Claude: *"Abrí el caso <nombre>"* y trabajá.

## Estructura de cada caso

```
casos/<nombre-del-caso>/
├── FICHA.md            ← datos del caso, partes, fuero, estado, próximos plazos
├── plazos.md           ← registro de vencimientos
├── notas.md            ← notas de trabajo
├── escritos/           ← escritos redactados
├── documentacion/      ← prueba, DNI, documentación del asistido
└── jurisprudencia/     ← fallos guardados de SAIJ
```

> 🔒 **Privacidad:** este README es lo único de `casos/` que se versiona. Las carpetas
> de casos jamás se commitean. Verificá siempre con `git status` antes de subir.
