# SECUENCIA · WEB W002 / 08 · Recibo de producción y QA

**Identidad:** batchId=web-w002-20261122 · taskNumber=8 · taskId=web-w002-20261122-08  
**Brief:** Experimentos @ gh-pages: prometeo/launch/20261122/next/web/LAUNCH.md (blob cd88a07941ab62072f6de5ee69764308f1ec2387)  
**Rama dueña:** candidate/prometeo-web-w002-08-20261122  
**Estado:** IMPLEMENTED · GITHUB_READBACK_VERIFIED · STATIC_LOGIC_PASS; BROWSER_VISUAL_NOT_RUN · VIDEO_PLAYBACK_NOT_RUN · PAGES_HTTP_NOT_CONFIRMED · HUMAN_APPROVED_NO.

## Obra observable

- Editor index.html con storyboard, inserción de escenas portada / texto / imagen / video, edición de contenidos, drag y botones de orden, tiempo en segundos, efectos, fondo, preview escritorio/móvil, importación/exportación JSON, persistencia local y exportación de HTML autónomo.
- Motor reutilizable engine.js: makeStandalone(scene) crea exactamente el mismo HTML para el iframe de previsualización y para la descarga final. storyRuntime interpreta escenas, navega, reproduce según duración y respeta movimiento reducido.
- Muestra sample-story.html: archivo estático autónomo de cuatro escenas originales con una imagen de ciudad ilustrada en SVG original embebido; no depende del editor ni de CDNs.
- Archivos complementarios: editor.js, editor.css, PREPRODUCTION.deep-spec-v1.json y verify.mjs.
- Multimedia adicional solo cargando archivo autorizado de hasta 4 MB, incrustado como data URI; imágenes y videos remotos no se importan automáticamente ni se empaquetan sin permiso.

## Accesos

Editor previsto en Pages: https://juanmanuelpm.github.io/Experimentos/prometeo/works/web-w002-20261122/08/

Historia exportada prevista: https://juanmanuelpm.github.io/Experimentos/prometeo/works/web-w002-20261122/08/sample-story.html

Ruta del código verificada por API GitHub: https://github.com/JuanManuelPM/Experimentos/tree/gh-pages/prometeo/works/web-w002-20261122/08

**Nota:** La publicación en rama gh-pages quedó verificada por lectura posterior con SHA de blob idéntico para cinco archivos web. Disponibilidad HTTP y visual en el servidor Pages no comprobada con navegador.

## Referentes realmente observados en documentación pública

1. Webflow Interactions timeline: https://help.webflow.com/hc/en-us/articles/42861689104531-Timeline-in-Interactions-with-GSAP · Observación: acciones en tracks, previsualización y duración; aplicación: duración y reproducción ordenada por escena; brecha: sin timeline de keyframes.
2. GrapesJS Components: https://grapesjs.com/docs/modules/Components · Observación: modelo de componentes fuente de verdad del export; aplicación: escena JSON + renderer único; brecha: sin composición libre de capas.
3. Google Web Stories editor: https://wp.stories.google/docs/getting-started/editor/ · Observación: insertar, estilo, documento, reorganización y checklist; aplicación: storyboard + inspector; brecha: sin checklist editorial completo.
4. Webflow Code Export: https://help.webflow.com/hc/en-us/articles/33961386739347-How-do-I-export-my-Webflow-site-code · Observación: las funciones con backend no se exportan necesariamente; aplicación: cero servicios externos y data URIs; brecha: video real no probado.

Referencias observadas como texto/documentación original, no como inspección estética visual. No se copiaron obras, marcas ni código ajenos.

## Evidencia ejecutada

**15 de 15 controles lógicos PASS** con V8 sobre archivos recuperados del repositorio:
- editor JavaScript compila; muestra igual a output exacto de export; SVG embebido; cero dependencias remotas; mismo renderer para preview/export;
- reglas mobile y reduced-motion presentes; etiquetas accesibles, validación MIME y 4 MB, compatibilidad con data URL SVG;
- texto malicioso con cierre de script neutralizado; título HTML escapado;
- DOM simulado construye cuatro capítulos, elemento imagen, texto exacto;
- ficha de preproducción conserva cuatro referencias examinadas.

El validador oficial DEEP-SPEC-1 devolvió **SPIKE_REQUIRED** sin errores estructurales: sigue pendiente el riesgo alto de ejecutar HTML exportado bajo file:// y verificarlo en navegador. 15 tests lógicos NO equivalen a QA visual ni a aprobación.

**No ejecutado:** Playwright/Chromium real, capturas en 320/768/1440, controles táctiles, descarga real desde UI, reproducción de video con contenido audiovisual autorizado, auditoría de accesibilidad, lectura HTTP pública de Pages y aprobación humana. El navegador remoto conectado rechazó la sesión por falta de créditos. Estos estados siguen NOT_RUN.

## Aprendizaje transferible

| stage | cause | preventive_gate | test | owner | counterexample |
| --- | --- | --- | --- | --- | --- |
| Serialización | Una data URI SVG con charset fallaba al reimportar JSON | Aceptar parámetros MIME válidos | Regex corregida para charset | web-studio | Preview renderizada no prueba reimportación |
| Export | Dos renderers pueden divergir entre autoría y publicación | Generar documento desde una única función | Muestra exportada = string exacto del motor | web-studio | Dos HTML parecidos pero diferentes |
| Seguridad | El contenido puede traer cierres de script/title | Escapar JSON y texto según contexto HTML | Inyección de delimitadores neutralizada | web-studio | Testear solo textos simples |
| Evaluación | Compilar JS no prueba navegador ni video | Gate browser/perceptual independiente | Abrir export real sin red en Chromium y contrastar | web-studio | 15/15 lógica no equivale a producto verificado |

Próxima evaluación: usar navegador real, construir pieza dentro del editor con video original autorizado, exportar, abrir fuera con red desactivada, probar 320/768/1440, teclado, tacto, reduced-motion y video. No afirmar HUMAN_APPROVED.
