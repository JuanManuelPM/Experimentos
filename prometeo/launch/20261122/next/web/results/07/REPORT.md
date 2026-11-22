# WEB W002 · 07 · CONTRAPUNTO

**room:** web · **batchId:** web-w002-20261122 · **taskNumber:** 7 · **taskId:** web-w002-20261122-07

**Obra:** revista digital original «CONTRAPUNTO», edición 01. Seis publicaciones originales: ensayo, entrevista de ficción, columna, especial visual interactivo, crónica de ficción y cuaderno editorial. Páginas de lectura con composición diferente por género, archivo temático, búsqueda local, teclado y reduced motion; tres escenas WebP creadas para esta obra. Enlace directo al contenido usando hash y versión de HTML autónomo publicable.

## Estado verificable

- **IMPLEMENTED:** sí, páginas, sistema editorial CSS, componentes JS, índice JSON y script de compilación en ruta propia.
- **STATIC_QA_PASS:** 8 archivos HTML del paquete fuente, 6 publicaciones, rutas locales y landmarks validados.
- **CHROMIUM_DOM_PASS:** 320/768/1440 CSS px, filtros, búsqueda, estados vacíos, teclado en tablist, scrollWidth y capturas. Se usó set_content e inyección de contenido real por restricciones de navegación local.
- **SOURCE_READBACK_PASS:** árbol publicado en gh-pages, index.html leído de nuevo (blob e15877fb142063fc910b76e19ddf0f8de58829c7).
- **PAGES_HTTP_NOT_VERIFIED:** el servicio web externo no fue accesible desde el instrumento de verificación; no confundir commit publicado con HTTP observable.
- **SCREENREADER_NOT_RUN / HUMAN_APPROVED_NO.**
- **DEEP-SPEC-1:** ficha estructurada en la rama de obra; la secuencia preventiva se aplicó tardíamente, error de orden documentado. Validación formal de CLI pendiente.

## Enlaces

- [Archivos y obra en gh-pages](https://github.com/JuanManuelPM/Experimentos/tree/gh-pages/prometeo/works/20261122/web-w002-07)
- [Index HTML autónomo](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/20261122/web-w002-07/index.html)
- [QA / límites](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/20261122/web-w002-07/QA.md)
- [DEEP-SPEC](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/20261122/web-w002-07/PREPRODUCTION.deep-spec-v1.json)
- [Ruta de GitHub Pages, aún NO_VERIFIED](https://juanmanuelpm.github.io/Experimentos/prometeo/works/20261122/web-w002-07/)

## Referente → intención → decisión → artefacto → brecha

The Pudding (narrativas visuales diferenciadas, inspección textual) → formatos distintos → seis géneros con composición propia → publicaciones HTML originales → falta crítica visual humana.

It's Nice That (archivo con temas y contenidos diversos) → descubrimiento editorial → filtros/búsqueda combinados → Playwright DOM PASS → corpus todavía pequeño.

A List Apart + GOV.UK Design System (arquitectura de lectura y patrones accesibles, inspección textual/técnica) → lectura no bloqueada por JS y control por teclado → páginas estáticas + tablist ARIA → pruebas DOM PASS → falta lector de pantalla y navegación HTTP pública.

## Cambio de flujo de especialidad

stage=CSS/search; cause=`display:grid` de autor sobreescribía `[hidden]` nativo; preventive_gate=verificar visibilidad computada, no solo atributo; test=`locator('[data-article]:visible').count()`; owner=Web; counterexample=seis artículos visibles con `hidden=true`.

**No se modifica W001 ni se atribuye aprobación humana.**
