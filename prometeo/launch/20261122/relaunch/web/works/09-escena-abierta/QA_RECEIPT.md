# ESCENA ABIERTA · WEB W003 / 09 · evidencia y límites

**Identidad:** `room=web`, `batchId=web-w003-20261122`, `taskNumber=9`, `taskId=web-w003-20261122-09`.

**Artefacto:** sitio del festival cultural ficticio, 21 encuentros originales en 3 días y 3 escenarios, 4 disciplinas, fotos de ambiente de Unsplash acreditadas. Grilla filtrable, búsqueda normalizada con acentos, rutas individuales `#evento/<id>`, agenda persistida, detección de solapes, exportación iCalendar y reglas de movimiento reducido. Motor puro reutilizable en `festival-core.mjs`.

**Estados comprobados:** 6 archivos de obra leídos de GitHub candidata con SHA individual. 11/11 comprobaciones lógicas ejecutadas directamente en V8 sobre el mismo código de `data.mjs` y `festival-core.mjs`: IDs, distribución días, filtro escenario, categoría, búsqueda con acentos, extremos contiguos, cruces de medianoche, conflictos reales, persistencia, ICS UTC y fallback storage. Primer artículo visual local observado con Chromium en 390/1440, sin desborde, con interacción real de botón; no es un test del HTML final.

**NOT_RUN:** ejecución de `node tests.mjs` como proceso; navegador de la **aplicación final** 320/390/1440, teclado/táctil, recarga, hash/direct link y reducción de movimiento; decodificación de las fotos de CDN; inspección de página pública servida; valoración artística independiente. No inventar su equivalencia con pruebas V8 o capturas de prototipo. HUMAN_APPROVED=NO.

**Benchmarks consultados:** Sónar oficial (organización por días/escenarios), Unsound oficial (programación, música y discurso), Bergen Assembly oficial (contexto cultural editorial), Unsplash License (fotografías ambientales gratuitas). Se examinó texto/documentación web, no una auditoría de píxeles de esos sitios. La rama privada de corrección WEB es candidata SPEC_ONLY 2.0.0; su SHA observado `1a0e709beec9a84986fc33c5ce4ab0a162dccaf2` no certifica promoción activa.

**Diferencia respecto a W002/09:** W002 tenía 24 eventos, 5 fotografías de referencia e informe de lógica V8 sin browser; W003 posee 21 eventos nuevos, una portada de dos masas tipográficas y grilla de calendario; primera pantalla pasó captura Chromium local **de prototipo** pero el E2E de la aplicación final sigue abierto. No existe evidencia para declarar mejora artística causal.

**Defecto causal y gate próximo:** `stage=S08/S10` · `cause=prueba de componentes y datos antes de interacción DOM completa` · `preventive_gate=E2E served HTML en 320/390/1440 y rehidratación de agenda con URL directa` · `test=filtrar, guardar, cerrar dialog, recargar, detectar conflicto, exportar` · `owner=Web` · `counterexample=un test de motor correcto mientras el botón no recibe clic por CSS`.

**Rollback:** desindexar únicamente esta tanda W003 si aparece regresión. No editar obras históricas W001/W002, flujos privados ni otros números.
