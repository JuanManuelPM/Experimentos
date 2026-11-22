# Una habitación verdadera · W7-07 · QA y límites

**Identidad:** `room=3d` · `batchId=3d-w7-20261122` · `taskNumber=7` · `taskId=3d-w7-20261122-07`.  
**Brief BLOQUEADO:** `gh-pages/prometeo/launch/20261122/relaunch/3d/LAUNCH.md` · SHA Git blob `58de659e2aa01c0746d59ca6f95c36bdc59f3030`.  
**Antiguo:** `3d-w6-20261122-07` · brief `942c3ba8b851137886e959d2790771556e2d9f5d`; ninguna obra anterior modificada.  
**Flow:** 3D 2.3.0; SHA256 canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f` **reportado por QA W6**; no se localizó el FLOW_INDEX exacto para readback independiente; versión especializada y promoción **NO MODIFICADAS**.

## Diferencia respecto a W6
W6 vinculó un escaneo institucional dentro de un iframe Sketchfab y fotos de otras campañas, sin reconstrucción propia, poses/pares métricos ni prueba WebGL. Esta ejecución adopta otra **familia de integración**: el archivo `scene.splat` de un **escaneo real de oficina** y poses de su `cameras.json` publicados por Ahmedn1/roomsplat. Un visor nuestro intenta descargar el binario y renderizarlo con GaussianSplats3D. La escena **no fue entrenada por este worker**; es una reconstrucción preexistente autorizada por procedencia pública MIT a nivel repositorio. Atribución específica del escaneo como asset individual: no hay declaración independiente localizada; revisión legal residual.

## Evidencia realmente comprobada
- **FUENTE_REAL_LEÍDA:** `docs/scene.splat` binario existente (SHA blob Git `2733dd9b6f05199b5197b421bda606b05735f4b3`); contenido renderizable y tamaño exacto no medidos aquí. `docs/cameras.json` leído con nombres, `pos`, `forward`, `up` de fotogramas reales (muestra 01 y 02 también fijadas como fallback).
- **DERECHOS_LEÍDOS:** `Ahmedn1/roomsplat@main/LICENSE` MIT, copyright 2026 Ahmed Dawod, blob `c8513b82ff66c5ad33039d7cf6d87d4c2f11ba5f`. Las fotos del video fuente **no** están integradas y no se infiere permiso sobre terceros retratados.
- **SOURCE_VERIFIED:** `index.html`, `photo-view-aligner.js`, `photo-view-aligner.test.mjs` y Book, leídos de la rama después de escribir, SHA blob verificados, 13/13 checks de integridad/estructura de la implementación.
- **LOGIC_EXECUTED:** 8/8 aserciones en V8 sobre el módulo **real** recuperado del repositorio: vector unitario, rechazo de cámaras degeneradas, aplicación de pose, RMSE 2D cero, clamp desplazamientos, clamp zoom, rechazo de landmarks inválidos y etiqueta de alineación solo manual. No implica que el navegador renderice.
- **DEEP-SPEC oficial:** evaluado con el código exacto de `deep-spec-v1.mjs` y Book de rama → `SPIKE_REQUIRED`, 0 errores de esquema.
- **ART-DIRECTION oficial:** evaluado con código exacto de `art-direction-first-article-v1.mjs` → `FIRST_ARTICLE_REQUIRED`, 0 errores de esquema.
- **Cámara/geom. real:** proveniencia documentada, sin precisión métrica afirmada. Comparador 2D manual exporta JSON y no dice que hizo SfM, pose bundle adjustment ni reproyección intrínseca.

## Pruebas de aceptación y estados
| Gate definido **antes** de construir | Estado | Oráculo pendiente |
|---|---|---|
| Primer artículo: 3DGS visible, no iframe o sustituto geométrico | **NOT_RUN** | framebuffer, consola, binario en navegador |
| Primer frame 390 px y 1440 px | **NOT_RUN** | capturas reales e inspección de oclusión |
| Control táctil A/B y recorrido real | **NOT_RUN** | interacción Android y 2 vistas |
| Dos pares originales foto ⇄ reconstrucción | **BLOCKED** | no se publicaron JPG originales emparejados/intrínsecos para esta sesión |
| Medición de geometría / escala física | **NOT_RUN** | calibración dimensional independiente |
| Firma legal para la totalidad del material capturado | **PARTIAL** | MIT para software y documentación verificado; derechos asset separados por corroborar |
| Aprobación humana | **NO** | ninguna aprobación autoatribuida |

**Criterio de fallo:** un error HTTP, CORS, WebGL, fetch o decodificación muestra un estado explícito de fallo, no una habitación fabricada. El primer artículo no está aprobado. No publicar miniaturas falsas ni poner `DELIVERED/VERIFIED` como estado de calidad.

## Reproducción técnica
Abrir `index.html` desde servidor HTTPS o con `python3 -m http.server 8080`; requiere internet para librería Three/GaussianSplats3D y el splat real (11 MB aproximados según fuente). Si `https://raw.githubusercontent.com/Ahmedn1/roomsplat/9cee329a1cea3d6faaffb569eb826cca131b9359/docs/scene.splat` no tiene CORS, el fallo es **bloqueo real**. No funcionará offline. El inspector foto-vista necesita un fotograma original del mismo dataset y se mantiene opcional, jamás cargado automáticamente.

**Aspiración → decisión → resultado → brecha:** calidad de la captura de interior real → splat genuino + poses extrínsecas → visor fuente implementado y módulo de alineación lógica 8/8 → bytes/píxeles/interacción en navegador NO OBSERVADOS y pares fotográficos ausentes.

**Estado global:** `PARTIAL_DELIVERY · FIRST_ARTICLE_REQUIRED · VISUAL_NOT_RUN · HUMAN_APPROVED=false`.  
**QA registrado:** 2026-11-22T18:52:13.307Z.
