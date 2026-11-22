# Integración candidata · prevención del flujo 3D (2026-11-22)

**Estado: IMPLEMENTACIÓN CANDIDATA, NO ACTIVADA.** Baseline fijado: 2.3.0 / `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`. Fuente humana: [MEJORA_FLUJO.md](./MEJORA_FLUJO.md), catálogo de reglas [PREVENTIVE_GATES.json](./PREVENTIVE_GATES.json). Propiedad: `JuanManuelPM/Experimentos:prometeo/3d-flow/`.

## Qué se implementó

`SCENE_PREFLIGHT_ADAPTER.mjs` ya conecta el compilador 2.3.0 inmutable con el nuevo compilador preventivo y verifica que comparten exactamente brief y hashes. Es un punto de integración **ejecutable en esta rama candidata**, no un cambio del índice vigente. \`PREVENTIVE_COMPILER.mjs\` compila un recibo determinista **en planificación, antes de autoría masiva**, a partir del brief inmutable, hashes fijados, clasificación semántica realizada por el ejecutor, opciones artísticas distintas y un primer artículo limitado. Usa las reglas del manifiesto como datos y selecciona sólo las aplicables; **no** busca palabras como «Cocina», «bondi» u «osu» en el encargo para disparar recetas hardcodeadas. `ART_SCALE` es transversal; la clasificación se anota por capacidad y no por nombre de obra. Exige dos referencias con notas de derechos, escala, 1–3 riesgos, técnica y alternativa distinta, criterio observable para cambiar de estrategia. Una ruta fallida requiere cambio de técnica **antes de duplicar** los activos, pero no cancela el brief completo.

**Punto exacto de inserción futuro:** usar como subprocedimiento `planning -> acquisition` del método de 17 etapas. La raíz `prometeo/control` mantiene selección de problemas, aprendizaje y autoridad transversal; este módulo sólo contiene contratos técnicos específicos del medio 3D. Para tareas futuras, el ejecutor compila semánticamente `intent.capabilityTags`, compara alternativas y obtiene un recibo. No se exige ningún formulario ni nuevo prompt humano. Una integración autorizada de 2.3.1 deberá copiar y versionar este contrato en una versión completa y garantizar que el lanzador fija hash de brief y flujo; **nunca** escribir la herramienta sobre `versions/2.3.0`.

## Contrato de ejecución

1. Obtener el brief original, su hash y el hash de flujo desde el lanzador/registro, sin reescribir el pedido.
2. El ejecutor decide internamente `experienceType`, `heroView`, `inputMode`, `referenceScale`, `artLanguage`, dos referencias lícitas y etiquetas de capacidades (por ejemplo `walkable_interior` o `brief_requests_rhythm_game`), no todas indiscriminadamente.
3. Identificar hasta 3 fallos de mayor impacto; comparar la ruta elegida con una alternativa realmente diferente. Hacer **antes de producción masiva** el `firstArticle` discriminante. Una maqueta mínima no equivale al producto ni sustituye la entrega completa.
4. Registrar `PASS_WITH_ACTUAL_EVIDENCE` únicamente con artefacto URL, observación y consecuencia de decisión. Cuando no existe acceso de render o dispositivo, `NOT_RUN`, nunca un PASS textual o inventado. `FAIL` indica cambiar estrategia a tiempo.
5. Continuar el brief original completo, publicar en rama/ruta aislada, permitir la evaluación humana de la obra; INFORMAR clases de defecto al mecanismo compartido para próximas tandas. Este recibo no aprueba estética, no reemplaza la UI ROOT ni modifica escenas ya publicadas.

## Matriz de prueba y límites

- **Interior:** `walkable_interior` + `moving_actors` + `3d_studio_or_game_ui` exige techo, oclusión, actor y cámara; el corte barato es un cuarto con puerta, mobiliario, dos alturas y móvil. La regresión comprueba que el gate de ritmo NO se activa.
- **Ritmo:** `brief_requests_rhythm_game` exige audio original/licenciado, reloj temporal, tap/hold/slide, latencia y recuperación de foco. La regresión comprueba que el gate de cámara interior NO se activa.
- **Contratos negativos:** una segunda ruta idéntica se rechaza; PASS sin evidencia se rechaza; divergencia del SHA fijado o activación silenciosa de reglas candidatas se rechaza.

`node --test PREVENTIVE_COMPILER.test.mjs` ejecuta pruebas de selección/contratos y compatibilidad con el compilador de escena 2.3.0. Esta simulación **no** ejecuta una escena WebGL, no mide oclusión real ni sincronía de audio. La comparación contrafactual demuestra qué decisiones se exigirían antes de construir; no demuestra todavía que una obra posterior sea mejor. Antes de una **promoción**: dos primeros artículos reales de clases distintas, evidencia visual/funcional observada, comparativa de decisiones respecto de 2.3.0, revisión autorizada, empaquetado inmutable y CAS/HEAD de `FLOW_INDEX.json`. Los workers W4/W5 siguen usando el flujo fijado; sin reescribir escenas ni briefs.

## Política de versión y publicación

Esta rama agrega código y pruebas a la **propuesta**, no a la versión inmutable. No altera `FLOW_INDEX.json`, `FLOW_3D_MASTER.md`, `gh-pages`, el método común ni las versiones históricas. Estado honesto: motor preventivo preparado y probado en tests lógicos; impacto artístico aún `NOT_RUN`. El próximo integrador con evidencia puede proponer 2.3.1, no activarlo por la mera existencia de este archivo.
