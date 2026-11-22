# 3D W7 · 02 · CASA ENTRE PATIOS

**ID** `3d-w7-20261122-02` · **room** `3d` · **status** `SOURCE_PUBLISHED_RENDER_OBSERVED / MOBILE_GPU_NOT_RUN / HUMAN_APPROVED_NO`

Exploración original de una casa interior de tres ambientes (sala, comedor, estudio) y dos patios, con un rendering 3D WebGL2, materiales GGX procedurales y luz día/noche. Motor sin servicios externos en vivo. Programa arquitectónico a escala de metros (altura libre 3.12 m), mobiliario original, vegetación, pavimento, pergola y agua. Rutas de cámara con colisión independiente y oclusión de nueve muestras reutilizable `camera-controller.js`.

**Fuentes editables:** `engine.js`, `scene.js`, `camera-controller.js`, `index.html` autónomo. **QA:** `test.mjs`, `QA.md`, `PREPRODUCTION.deep-spec-v1.json`, `FLOW_LOCK.json`, `STAGE_TRACE.json` y capturas locales de primer frame. El HTML completo ejecuta sin API ni token.

**Resultado local observado:** 342 objetos, WebGL2 compiló con `glError=0` bajo Chromium/ANGLE SwiftShader; se capturó el primer frame de escritorio y móvil y se revisó visualmente. Se corrigieron dos bugs encontrados por pruebas previas (matrices y controlador). Doce pruebas lógicas finales aprobadas. Rendimiento real Android, fotometría real, GLB export y revisión humana: **NOT_RUN**. PBR es shader GGX básico, no una validación fotométrica.

**Comparativa W6→W7:** se reemplaza dependencia de un raycast central por 9 rayos y colisiones separadas; el producto usa geometría original con first article render inspeccionado antes de llenar el escenario. No se puede concluir calidad superior a W6 sin comparación de capturas homologables.

## Entrega pública y readback

**Código y fuente:** https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/relaunch/3d/work-02/index.html (publicado en `gh-pages`, con readback de los diez ficheros originales). **Experiencia Pages:** https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/3d/work-02/ (la carga final desde cliente público no pudo verificarse con el navegador externo). **ROOT:** `prometeo/root/ROOM_MESSAGES.json` ID `3d-w7-20261122-02-casa-entre-patios-webgl2`, indexado en `BATCHES.json`. **Capturas QA:** seis raster WebGL2 de tres ambientes × día/noche a 880×576 y primer frame independiente 390×844 / 1440×900; en ZIP de fuentes. Captura real en Chrome/SwiftShader, no test de GPU móvil ni certificación artística. HUMAN_APPROVED=NO.

No tocar obras y lanzadores anteriores.
