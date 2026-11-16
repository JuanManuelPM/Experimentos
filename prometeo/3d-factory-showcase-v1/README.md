# PROMETEO 3D · Laboratorio FM01 + FE01 + FC01

**Abrir la página:** https://juanmanuelpm.github.io/Experimentos/prometeo/3d-factory-showcase-v1/

**Fecha:** 2026-11-16. **Entrega:** página pública de experimentos, reutilizando assets 3D reales, **NO** película completa ni aprobación estética.

## Qué se puede hacer

**FM01 · Materiales:** comparación A/B sobre dos mitades de la misma calzada y con idénticas luces. A usa la textura fotográfica **Asphalt 01 Diffuse 1K** CC0 de Poly Haven, descargada en el navegador. Si su carga falla, la A muestra PBR neutro y el panel de diagnóstico lo reconoce como `PHOTO_UNAVAILABLE_PBR_FALLBACK`. B utiliza un atlas autoral reproducible dibujado por código con parches, juntas de reparación y desgaste ubicado. Ambas se pueden examinar con la cámara orbital.

**FE01 · Esquina urbana:** 15 instancias **GLB de Kenney**, incluidas seis fachadas distintas, dos automóviles, farolas, señalización, árbol, semáforo y contenedor. Edificios y props son geometría de autor procedente de un repositorio CC0 con commit inmutable; sólo se han creado suelo, bordes, marcas viales y señalética como elementos de composición. Los assets están enumerados en [scene-manifest.json](scene-manifest.json). El paso de referencia al World se normaliza por altura `Box3`, y sus materiales se conservan. No se alteraron los modelos originales.

**FC01 · 9 cámaras:** 9 planos, cada uno de 48 fotogramas a 24 FPS (432 frames, 18 s). Cámara por `frame` sin acumular desplazamientos; ver [shotlist.json](shotlist.json). Botones Play/Pausa, Anterior, Siguiente y slider. Para inspeccionar un fotograma exacto, usar `?mode=cameras&frame=120`. Los modelos no cambian para justificar un encuadre.

## Evidencia y límites

- [test-report.json](test-report.json): 23 comprobaciones de fuente y consistencia, **23/23 PASS**. Verifican rutas exactas de GLB contra el catálogo de Kenney, nombres, tamaños, 9 cámaras, archivos y UI.
- Código publicado: [app.mjs](app.mjs), [index.html](index.html). No se ha empaquetado ni modificado Three.js; se importa desde jsDelivr, igual que el Atlas 3D existente.
- Se comprobó HTTP público de la página mediante extracción web. El navegador de revisión disponible carece de WebGL2 y **no permite certificar la imagen GPU**. Esa limitación deja `BROWSER_RENDER_NOT_VERIFIED` y `ANDROID_PHYSICAL_NOT_RUN` explícitos; no se declara calidad visual aprobada.
- El modelo que no cargue por conectividad/CORS aparece en `ESTADO REAL` con su ID. Sin WebGL2 se muestran **miniaturas reales del catálogo original**, claramente rotuladas como referencias y NO fotogramas renderizados.
- No se ha corregido un NPC, un film anterior, ni se ha cambiado el canon universal. Tres fábricas estudiadas quedan en candidato.

## Fuentes y licencias

- **Kenney** (modelos/vehículos/props CC0 1.0), espejados/catalogados por Hidencod: https://github.com/Hidencod/tge-assets ; `3ddcc695adbba9fb918cf31b7c139b3f95b76910`.
- **Poly Haven, Asphalt 01** CC0: https://polyhaven.com/a/asphalt_01 ; textura JPG `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_01/asphalt_01_diff_1k.jpg`.
- **Three.js** MIT, runtime `0.181.0`: https://threejs.org/
- Repo original de aprendizaje: `JuanManuelPM/pruebas` (privado), `learning/3d-studio/factories/v1/` en rama `candidate/prometeo-3d-specialty-factories-v1-20261116`.
- **No** son materiales de GTA ni archivos de Rockstar; PS1/PS2 es sólo dirección estética, no identificación de IP.

## Reproducibilidad

Página estática sin servidor/API ni coste obligatorio. Red requerida para Three.js CDN, Poly Haven y los GLB desde GitHub Raw. La experiencia necesita WebGL2, que se verifica al abrir. Estado real exponible con `window.__PROMETEO_QA__()`: fuentes, asset loaded/failed, WebGL, modo, fotograma y fallos. El nivel de QA válido es **source pass / HTTP accessible / GPU not verified / art not approved**.

## Próximo paso técnico, ya separado del producto

Un revisor con GPU debe abrir `?mode=cameras&frame=0`, `?frame=100`, `?frame=300`, capturar fotogramas reales y verificar que las fachadas, el taxi y los rótulos se ven. Si falla, corregir el artefacto exacto, sin otra película nueva. Una prueba directa en Android confirma rendimiento/gestos y lectura.
