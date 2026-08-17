---
name: argentina-plazos
description: "Computa plazos procesales, administrativos y de prescripción bajo derecho argentino: días hábiles judiciales, hábiles administrativos, corridos, en horas y en meses, con ferias, suspensiones y plazo de gracia, diferenciando jurisdicción (nacional/federal y provincias). Usar ante cualquier vencimiento, prescripción, caducidad, recurso o cómputo de plazo en causa judicial o administrativa argentina."
license: MIT
---

# Cómputo de plazos · Derecho argentino

Skill original de Agente Smith (MIT). Método: **nunca computar sin identificar primero
jurisdicción, tipo de plazo y norma fuente — y verificar la norma en SAIJ antes de
afirmar el resultado.**

## Procedimiento obligatorio

1. **Jurisdicción y fuero.** ¿Nacional/federal, CABA o provincia (cuál)? ¿Judicial o
   administrativo? El código procesal aplicable cambia el cómputo completo. Si no está
   dicho, PREGUNTAR antes de computar.
2. **Tipo de plazo.** Identificar cuál de estos es, y su norma fuente:
   - **Días hábiles judiciales** (regla general procesal): no cuentan sábados, domingos,
     feriados ni días inhábiles declarados por el tribunal superior de la jurisdicción.
   - **Días hábiles administrativos** (procedimiento administrativo): régimen distinto
     del judicial (en el orden nacional, LNPA 19.549 y su reglamento).
   - **Días corridos** (derecho de fondo, CCCN art. 6; prescripción; muchos plazos de
     leyes especiales): cuentan todos los días; si vence en inhábil, verificar si la
     norma traslada el vencimiento.
   - **Horas / meses / años**: cómputo del CCCN art. 6 (los plazos de meses vencen el
     mismo número del mes correspondiente).
3. **Inicio del cómputo.** Regla procesal general: desde el día hábil siguiente a la
   **notificación válida**. Presupuesto crítico: si la notificación es nula o
   cuestionada, dejarlo asentado — el cómputo es condicional.
4. **Verificar la norma en SAIJ** (`saij_buscar_legislacion` + `saij_documento`) antes
   de afirmar cantidad de días o carácter del plazo. Citar artículo y texto.
5. **Cargar el calendario de ferias y asuetos del año.** Antes de computar,
   identificar el año del cómputo y buscar su calendario en `plazos/ferias-<año>/`:
   - Si el calendario **existe** para la jurisdicción → usarlo como referencia y
     verificar las fechas contra las acordadas del tribunal (pueden haber cambiado).
   - Si el calendario **no existe** para el año y jurisdicción → marcar el cómputo
     entero con **🔲** y advertir: *"Calendario de ferias y asuetos para <año> no
     cargado — verificar la acordada de feria vigente del tribunal superior de la
     jurisdicción."*
6. **Computar con calendario real**: feriados nacionales + feriados/asuetos locales de
   la jurisdicción (verificar — los provinciales NO son los nacionales). Si el
   calendario cargado tiene fechas marcadas 🔲, reflejar esa misma incertidumbre
   en el resultado del cómputo.
7. **Aplicar ferias y suspensiones** que correspondan:
   - Ferias judiciales (en el orden nacional, enero y feria de invierno según acordadas
     de la CSJN; cada provincia fija las suyas por acordada de su superior tribunal —
     verificar SIEMPRE la acordada local del año en curso).
   - Suspensiones por mediación prejudicial obligatoria u otras instancias previas
     según la jurisdicción y materia (verificar norma local).
8. **Plazo de gracia.** En el orden nacional, presentación en las dos primeras horas
   del día hábil siguiente al vencimiento (CPCCN art. 124). Las provincias tienen sus
   propias reglas (algunas dan más horas, otras difieren) — **verificar el código
   procesal local antes de contar con la gracia**.
9. **Salida.** Entregar tabla: acto · tipo de plazo · norma fuente (verificada, con
   uuid SAIJ) · inicio · vencimiento · gracia aplicable · calendario usado (año /
   jurisdicción / fuente) · riesgo.
