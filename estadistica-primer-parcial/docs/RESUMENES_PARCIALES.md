# Resúmenes de parciales · contrato editorial

**Propósito:** acceder rápidamente a tres hojas completas y breves por parcial (teoría, práctica, machete), sin concatenar las nueve unidades de estudio.

## Ubicaciones

- `content/partials/P1.json` → primer parcial 2026. Fuente principal: primer parcial presencial UP 2026, Guías 1–4 e integrador P1.
- `content/partials/P2.json` → segundo parcial 2026. Fuente principal: segundo parcial presencial UP 2026, Guías 6–10 e integrador P2.
- Cada JSON contiene `theory` (explicaciones resumidas), `cheatBlocks` (machete resumido), y `practiceRefs` (referencias a ejercicios de las unidades); **no copia claves ni soluciones de ejercicio**.

## Criterios de selección

- Priorizar habilidades efectivamente requeridas por las consignas: caso e hipótesis, variables/diseño, FA/FR/FAA/FRA, centro y percentiles, CV y asimetría, correlación y regresión (P1); probabilidad de tablas y condicional, normal, t apareada/independiente, hipótesis y p, comparación de proporciones (P2).
- No incluir para repaso contrarreloj preguntas con una alternativa obviamente correcta y distractores absurdos, ni fragmentos que solo definan términos sin transferencia al examen.
- Un ejercicio fuente puede ser una adaptación razonada; jamás presentarlo como transcripción del examen. Si faltan datos originales para calcular una medida, reconocerlo y no completar cifras inventadas.
- Mantener **teoría ≤10 conceptos y ~1000 palabras**, práctica de **8–30 ejercicios realmente seleccionados**, machete de una sola lectura vertical. Preferir menos contenido bien seleccionado a más relleno.
- Otros chats pueden mejorar `content/units/Mn.json` sin tocar los dos resúmenes. Si renombran un ID enlazado, actualizar `practiceRefs`; los IDs existentes se consideran estables.

## Verificación obligatoria

Ejecutar `node tests/validate-content.mjs` y `node tests/validate-partials.mjs`, comprobar integridad de las referencias, sintaxis de la UI, navegación entre las tres pestañas y éxito de despliegue GitHub Pages. Verificar en un navegador real cuando esté disponible; no presentar un despliegue exitoso como prueba de todas las interacciones.

## URLs

- Primer parcial: `?all=1` (Teoría), `?all=1&tab=practice` (Práctica), `?all=1&tab=cheat` (Machete).
- Segundo parcial: `?partial=2&all=1`, con los mismos parámetros de pestaña.
- Las unidades completas conservan su propia navegación y todos los ejercicios originales.
