# Recibo de entrega · FORJA Escena · 3d-w6-20261122-09

**Estado:** DELIVERED_SOURCE_VERIFIED_PENDING_PUBLICATION · 11/11 LOGIC PASS V8 · 2/2 JS SYNTAX PASS · DEMO JSON VALID · WEBGL NOT_RUN · ANDROID NOT_RUN · HUMAN_APPROVED_NO.

## Identidad y propiedad

- room=3d; batchId=3d-w6-20261122; taskNumber=9; taskId=3d-w6-20261122-09.
- Brief público SHA blob: 942c3ba8b851137886e959d2790771556e2d9f5d.
- FORJA base fuente index.html SHA 2c468256a9464ecf313de4ef60cfd75afd813795; forge.mjs SHA 2e9a55a9815578afd70beaf8e919ede353d4e2d7.
- Flujo 3D 2.3.0, hash canónico SHA256 53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f. No se modifica el flujo.
- Rama exclusiva: work/3d-w6-20261122-09; ruta exclusiva: prometeo/launch/20261122/next/3d/work-09/.

## Artefactos

- index.html, editor.css, editor.mjs: compositor Three.js con escena original, árbol de nodos, selección, reparenting editorial, gizmo, materiales, cámaras, luces, historial, keyframes, JSON y GLB importado.
- scene-core.mjs: núcleo reutilizable agnóstico de Three.js de validación de proyecto v2, TRS, slerp, upsert de keys y comparación de estado.
- DEMO_PROJECT.json: siete nodos, dos tracks y dos keyframes por track; datos originales sin activos ajenos.
- scene-core.test.mjs: batería reproducible para Node 22+ (12 casos).
- PREPRODUCTION.deep-spec-v1.json: especificación estructural y puerta DEEP-SPEC-1.

## Pruebas efectivamente ejecutadas

En V8 con la fuente scene-core.mjs recuperada de GitHub, sin simular respuestas:

1. valid-document PASS (2 nodos)
2. lerp-position PASS
3. lerp-scale PASS
4. slerp-unit PASS
5. endpoints PASS
6. key-upsert PASS
7. stable-compare PASS
8. reject-duplicate-node-id PASS
9. reject-reversed-keys PASS
10. reject-missing-assets PASS
11. reject-oversized-depth PASS

Análisis de parser de editor.mjs y scene-core.mjs: PASS. DOM ids: 49 referenciados en JS, cero ids faltantes en HTML. DEMO_PROJECT.json: validación propia PASS (7 nodos, 0 assets, 2 tracks). Ficha DEEP-SPEC-1: estructura válida, gate SPIKE_REQUIRED por riesgo alto de ejecución GPU todavía NOT_RUN.

**No ejecutado:** navegador GPU WebGL, importación GLB real en navegador, prueba de ida/vuelta de GLB concreto, interacción Android, pruebas perceptuales humanas, compatibilidad de escenas glTF complejas o exportación de video/audio. Ninguna se presenta como verificada.

## Calidad y causalidad

- FORJA fuente → mantener compatibilidad v1 sin sobrescribirla → conversión solo al abrir JSON v1 → implementación estática observada → pendiente prueba con JSON v1 + activos reales.
- Khronos glTF → conservar estructura y TRS locales → bytes GLB base64 + tree overrides → code/validator observados → falta prueba con GLB real de fuente autorizada.
- Three TransformControls → poder modificar Object3D en viewport → gizmo real con bloqueo orbital → code observado → GPU y táctil NOT_RUN.
- Theatre.js sequences → tener keyframes editables → timeline TRS por UID y tiempos en segundos → matemática observada V8 → UX y reproducción GPU NOT_RUN.

Aprendizaje: stage=preflight/runtime; cause=source checks without browser oracle; preventive_gate=browser WebGL opening of pinned CC0 GLB + roundtrip before calling VERIFIED; test=save/open/compare independent file on PC and Android; owner=3d; counterexample=perfect parser result with missing real GPU or model transfer. Estado humano no aprobado.

## Retorno al coordinador

Solo publicar como entrega parcial de código y test lógico. Nunca marcar VERIFIED_RENDER ni HUMAN_APPROVED sin observación de navegador.
