# ARCHIVO ABIERTO · Web W003 / 03 · QA y evaluación

**Identidad:** `web-w003-20261122-03` · **HUMAN_APPROVED=NO** · **Estado:** SOURCE_PUBLISHED / DEEP_SPEC_SPIKE_REQUIRED / FIRST_ARTICLE_REQUIRED / BROWSER_NOT_VERIFIED.

## Obra entregada

Portfolio de la artista **ficticia** Nadia Arocena, con seis obras digitales originales y cuatro familias de técnica de dibujo: cianotipo botánico, estratos minerales, dibujo arquitectónico y pintura gestual. No hay fotografías ajenas ni objetos físicos reales atribuidos falsamente a la artista. Los motores generan rasters originales a 620 píxeles de ancho en el índice y a 2100 o 2600 píxeles en la ficha, sin estirar una miniatura. En el primer artículo se pide 1600×2064. Los rasters se generan **en el navegador**; en el repositorio están publicadas las fuentes deterministas, no PNG de alta resolución prerenderizados. Esto es una limitación importante para rendimiento, almacenamiento y archivo offline.

**Superficie:** https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/web/works/03/

**Primer artículo:** https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/web/works/03/first-article.html

**Tests navegador:** https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/web/works/03/qa-tests.html

**Código reutilizable:** `art.js` (datos/metadatos y generador original) y `viewer.js` (zoom, pan, teclado, puntero, pinch).

## Observado realmente

- GitHub Contents devuelve `index.html`, `art.js`, `viewer.js`, `style.css`, `app.js` y `first-article.html` de `gh-pages`. SOURCE_READBACK PASS.
- Rama exclusiva `candidate/prometeo-web-w003-20261122-03` creada tras búsqueda sin colisión. Archivos anteriores W002 intactos.
- Benchmarks externos examinados documentalmente: Rijksmuseum Collection Online (menciona zoom/detalle) y documentación OpenSeadragon para uso de teclado; API del Art Institute para esquema separado de imagen/metadatos. No se copiaron assets ni se declara inspección pixel-perfect de esas interfaces.
- Validadores oficiales ejecutados contra `PREPRODUCTION.deep-spec-v1.json`: `inspectDeepSpec → SPIKE_REQUIRED (0 errores estructurales)`; `inspectArtDirection → FIRST_ARTICLE_REQUIRED (0 errores estructurales)`. **No son PASS artísticos.**
- Consulta externa a `GitHub Pages` respondió HTTP **404** para esta ruta mientras la acción `pages build and deployment` continuaba en cola o progreso, con otros pushes concurrentes. GitHub Contents y Pages son oráculos distintos.

## No ejecutado / no demostrado

| Comprobación | Estado | Criterio |
|---|---|---|
| Browser en la URL pública, ancho 390 y 1440 | **NOT_RUN** | Capturas reales, obra visible y sin overflow |
| Primer artículo: inspección del raster 1600px | **NOT_RUN** | Canvas pintado a resolución declarada, detalle perceptual |
| Calidad artística contra museo digital | **NOT_RUN** | Revisión humana comparativa de la obra visual |
| Filtros / búsqueda / apertura / enlaces directos / Back | **NOT_RUN** | Suite `qa-tests.html` desde mismo origen con JS |
| Zoom +/- / arrastre / pellizco / teclado / foco | **NOT_RUN** | Playwright/Chrome en móvil y escritorio, dispositivo real para pinch |
| Descarga raster 2600px | **NOT_RUN** | Archivo decodificado y medidas reales |
| Pages HTTP y render de la app completa | **404 / PENDING_DEPLOY** | GET 200 y captura DOM+canvas desde origen |
| Lector de pantalla | **NOT_RUN** | Recorrido con tecnología de asistencia |
| Aprobación humana | **NO** | Juicio del autor/director humano |

## Comparación controlada con W002

- **oldBatchId:** `web-w002-20261122`; **oldBriefSHA:** `cd88a07941ab62072f6de5ee69764308f1ec2387`.
- **newBatchId:** `web-w003-20261122`; **newBriefSHA:** `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`.
- **flowBefore / flowAfter:** WEB_FACTORY_V2 `2.0.0`, Git blob `1a0e709beec9a84986fc33c5ce4ab0a162dccaf2`, rama **candidata no promovida**. No afirmamos cambiar ni actualizar un flujo propietario.
- **W002:** ocho SVG con generador homogéneo, zoom vectorial; autor anterior reportó Chromium local, pero auditor no lo reprodujo.
- **W003:** seis trabajos estructurados sobre cuatro familias de raster original y primer artículo explícito antes de completar el sitio. Cambia la **familia de producción visual**, no sólo parámetros de una plantilla. Sin observación en navegador, **no** afirmamos mejora artística o rendimiento demostrados.
- **Brecha frente a Rijksmuseum:** existen ficha contextual, detalle y navegación implementados en fuente; no existe inspección pública ni comparación cualitativa. El raster procedural no equivale a una reproducción física de museo.

## Aprendizaje dirigido

`stage=PREPRODUCTION/QA`; `cause=W002 tenía ocho SVG homogéneos y falta de gran raster`; `preventive_gate=un primer artículo nativo y una comparación de 3+ familias`; `test=capturas 390/1440, zoom >200%, tabla de autoría y dimensiones nativas`; `owner=web-design`; `counterexample=imágenes nominalmente grandes sin detalle ni variedad`.

## Derechos, entorno y rollback

Autoría original de código, composiciones y textos; artista y dimensiones físicas son ficción declarada. Sin bibliotecas, tipografías web, fotos o texturas externas. Pueden faltar capacidades de gestos/tacto en lectores reales, y los grandes canvas pueden consumir memoria en teléfonos pequeños. **Rollback seguro:** desindexar esta ruta nueva sin tocar W001/W002, ramas ajenas ni lanzadores.

**No declarar VERIFICADO ni HUMAN_APPROVED hasta ver una página real renderizada en navegador y recibir evaluación humana.**
