# plazos/ · Calendarios de ferias, asuetos y feriados por jurisdicción

> Calendario real de días inhábiles por jurisdicción para el cómputo de plazos
> procesales. Cada año tiene su propia subcarpeta (`ferias-<año>/`), porque las
> fechas de la feria judicial (enero y julio) **cambian cada año por acordada**
> del tribunal superior de cada jurisdicción.

## Estructura

```
plazos/
├── README.md
└── ferias-<año>/
    ├── caba-nacional.md    ← CABA / Nacional / Federal (CSJN)
    ├── salta.md            ← Provincia de Salta (Corte de Justicia de Salta)
    └── jujuy.md            ← Provincia de Jujuy (STJ de Jujuy)
```

## Formato de cada fichero

Cada archivo documenta para su jurisdicción y año:

1. **Feria judicial de enero** — fecha de inicio y fin, con cita de la acordada.
2. **Feria judicial de invierno (julio)** — fecha de inicio y fin, con cita de la acordada.
3. **Feriados nacionales** que aplican en la jurisdicción.
4. **Asuetos y feriados locales** propios de la provincia (si corresponde).
5. **Fuente de cada asiento** (acordada, boletín oficial, o 🔲 verificación pendiente).

## Regla

Si el calendario del año en curso **no está cargado** en `ferias-<año>/`,
la skill `argentina-plazos` debe marcar el cómputo con **🔲** y advertir:
*"Calendario de ferias y asuetos para <año> no cargado — verificar la acordada
de feria vigente del tribunal superior de la jurisdicción."*

## Cómo contribuir un año nuevo

1. Copiar la carpeta `ferias-<año-anterior>/` como `ferias-<nuevo-año>/`.
2. Actualizar fechas según las acordadas del tribunal superior de cada jurisdicción.
3. Poner 🔲 en las fechas aún no confirmadas con fuente primaria.
4. Cada archivo debe indicar **la fuente de cada dato** (acordada, boletín oficial, SAIJ).
