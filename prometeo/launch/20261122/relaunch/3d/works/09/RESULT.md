# Recibo FORJA Escena · 3d-w7-20261122-09

**Estado al corte:** SOURCE_IMPLEMENTED · 20/20 V8_LOGIC_PASS · ORIGINAL_GLB_BINARY_OBSERVED · WEBGL_NOT_RUN · FIRST_ARTICLE_REQUIRED · HUMAN_APPROVED_NO.

- `room=3d`, `batchId=3d-w7-20261122`, `taskNumber=9`, `taskId=3d-w7-20261122-09`.
- Rama exclusiva: `candidate/prometeo-3d-w7-20261122-09`. No se modificaron obras ni lanzadores anteriores.
- Fuente del brief W7: SHA `58de659e2aa01c0746d59ca6f95c36bdc59f3030`; brief W6 conservado: SHA `942c3ba8b851137886e959d2790771556e2d9f5d`.
- FlowBefore = FlowAfter = 3D `2.3.0`; SHA256 canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`. Esta tarea **no promueve** un flujo candidato.

## Obra y cambio causal

El editor W6 ofrecía herramientas, jerarquía, gizmo, timeline y almacenamiento, pero el `DEMO_PROJECT.json` usado para validación tenía **0 GLB**. En W7 se generó un activo binario real de autor, con **2 mallas PBR, 4 nodos glTF fuente, pivote y 1 animación nativa**. El JSON entregado incluye ese activo de **19.740 bytes**, **13 nodos** y **3 tracks**; puede volver a reconstruirse desde su source. Se conservó compatibilidad estructural con proyectos anteriores del esquema v2 sin assets.

Pruebas: sintaxis V8 de 3 módulos, generador y cabecera GLB comprobados, comparación del buffer original y los bytes del proyecto y **20/20** casos del `scene-core.test.mjs` ejecutados en V8 con la lógica real del núcleo. El editor dispone de una prueba interactiva adicional de serialización, pero **no está ejecutada en navegador**. El retorno de ART-DIRECTION es `FIRST_ARTICLE_REQUIRED` y DEEP-SPEC es `SPIKE_REQUIRED`. No hay screenshots reales ni visita WebGL/Android.

## Artefactos y enlaces

- [Editor web (Pages, sujeto a despliegue)](https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/3d/works/09/)
- [Fuente en rama aislada](https://github.com/JuanManuelPM/Experimentos/tree/candidate/prometeo-3d-w7-20261122-09/prometeo/launch/20261122/relaunch/3d/works/09)
- [Book de preproducción](PREPRODUCTION.deep-spec-v1.json), [Flow fijado](FLOW_LOCK.json), [Trace de etapas](STAGE_TRACE.visited-v1.json), [QA](QA_RECEIPT.json).

## Test que decide la aceptación

En navegador con GPU: abrir editor a 390 y 1440; verificar que el activo GLB aparece sin overlay invasivo; seleccionar pivote original y moverlo; insertar keyframes, guardar JSON y recargarlo; reproducir pista y clip nativo y cotejar transformaciones en cinco tiempos; verificar ausencia de nodos perdidos; probar control táctil Android. Hasta realizarlo, no corresponde declarar `VERIFIED_RENDER`, `READY_TO_BUILD_NOT_ARTISTICALLY_APPROVED` ni `HUMAN_APPROVED`.

Publicado/ROOT, si se ejecuta, se confirma exclusivamente por readback posterior; este recibo no supone HTTP público, captura o interacción.
