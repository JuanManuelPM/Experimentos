# CONTRAPUNTO · W003 / 07 · QA de ejecución

**Task:** `web-w003-20261122-07` · **Batch:** `web-w003-20261122` · **Recorded:** 2026-11-22T19:19:23.763Z · **Autoría:** seis textos y tres láminas originales.
**Estado:** SOURCE_PUBLISHED + SOURCE_READBACK_PASS + BROWSER_INJECTED_PASS + FIRST_FRAME_CAPTURED; **PUBLIC_HTTP_404 / PUBLIC_BROWSER_NOT_VERIFIED**; **HUMAN_APPROVED=NO**.

## Producto entregado
- `index.html`: edición editorial en español con seis lecturas originales: ensayo de ciudad, entrevista de ficción explícita, columna, especial de tres láminas originales, crónica literaria de ficción y cuaderno de cinco notas.
- `styles.css`: sistema tipográfico y de retículas responsive, tokens, seis formatos editoriales, legibilidad, foco, reduced-motion y estados ocultos.
- `app.js`: índice/búsqueda por texto completo (con normalización de acentos), filtros, enlace directo por hash, estado vacío, navegación con foco y pestañas ARIA sin autoplay.
- `FIRST_ARTICLE.html`: spike editorial independiente; `PREPRODUCTION.deep-spec-v1.json`: Book único con arte, riesgos y decisiones; `evidence/first-frame-390.jpg` y `evidence/first-frame-1440.jpg`: capturas JPEG reales de Chromium.
- Fotografía documental Wikimedia Commons bajo licencia atribuidas junto a imagen: Sking CC BY-SA 3.0, Christian Haugen CC BY 2.0, Luis Argerich CC BY 2.0. Ninguna foto documenta una escena ficticia. Láminas SVG propias ilustran conceptos y no fingen series estadísticas.

## Evidencia ejecutada
1. **GitHub source readback:** los archivos de HTML/CSS/JS/Book y JPEG están almacenados en rutas exclusivas en la rama candidata y en `gh-pages`; se recuperaron HTML/CSS/JS vía API GitHub y su contenido fue ejecutado realmente dentro de Chromium. No hay cambios sobre W002.
2. **Primer artículo:** el primer intento de imagen Commons Special:FilePath devolvió HTTP **429**, y el masthead inicial desbordaba móvil. Se reemplazó la fuente por foto directa verificada HTTP 200 y se retocó la primera pantalla; dos JPEG genuinos de 390×844 y 1440×900. La portada final, ensamblada desde GitHub, cargó foto con `naturalWidth=1280`.
3. **Regresión y corrección:** `[hidden]{display:none!important}` responde al bug concreto de W002; el primer pase exhaustivo detectó que el nombre del footer desbordaba 10 px en 320, se corrigió la escala y se **repitió** la matriz.
4. **28/28 vistas PASS:** home + seis lecturas por 320/390/768/1440 CSS px en Chromium, verificando visibilidad y `document.documentElement.scrollWidth <= innerWidth`. Última matriz: **0 fallos**.
5. **Función PASS:** filtro Ideas → 2 resultados visibles; búsqueda de «ventana» dentro del texto completo → 1; búsqueda inexistente → estado vacío; limpiar → 6 resultados; enlace `#nota-atlas` → portada oculta/lectura visible; teclado ArrowRight → segundo tab `aria-selected=true` y panel visible.
6. **Assets:** tres URL de fotos consultadas individualmente por HTTP 200 y `image/jpeg` desde el navegador remoto. Solo primer hero verificado explícitamente como imagen decodificada en captura; imágenes secundarias no fueron auditadas píxel a píxel.
7. **Validadores canónicos ejecutados con código original recuperado:** `inspectDeepSpec` → `READY_FOR_FIRST_SLICE, errors:[]`; `inspectArtDirection` → `READY_TO_BUILD_NOT_ARTISTICALLY_APPROVED, errors:[]`. Es cumplimiento **estructural**, no auditoría de autoría, calidad ni derechos por tercero.

## Limitaciones y no-conformidades
- **Despliegue público GitHub Pages:** `https://juanmanuelpm.github.io/Experimentos/prometeo/works/20261122/web-w003-07/` respondió **HTTP 404** al probarlo después de publicar en `gh-pages`. La lectura del repositorio es PASS, pero el sitio **no está acreditado como navegable por HTTP público**. La matriz Chromium inyecta bytes de GitHub en `about:blank`, no visita la URL final servida. No convertirlo a PUBLIC_BROWSER_PASS.
- **Orden de persistencia:** el primer artículo se implementó/probó antes de escalar la edición, pero la ficha `PREPRODUCTION.deep-spec-v1.json` quedó escrita **después** de terminar y publicar la obra. El método de escritura preventiva no se cumplió cronológicamente; está reconocido en Book.
- **Accesibilidad:** tests de teclado/foco/ocultación y reduced-motion definidos, pero **auditoría WCAG completa, lector de pantalla y Android físico NOT_RUN**. Las capturas no validan todo el texto ni contraste en todos los dispositivos.
- **Flujo propietario:** se recuperó `WEB_FACTORY_V2/FLOW.json`, v2.0.0, sha blob `1a0e709beec9a84986fc33c5ce4ab0a162dccaf2`, de **rama candidata**, estado `SPEC_ONLY`; no se promovió ni se modificó. `TRACE.json` registra pasos observados en esta sesión, pero **validador de trace 2.3.0 NOT_RUN**.
- **Revisión independiente/artística:** calidad de referencia aspiracional; crítica humana **NOT_RUN**, `HUMAN_APPROVED=false`.

## Comparación sin confundir evidencia
`oldBatchId=web-w002-20261122` · `newBatchId=web-w003-20261122` · `oldLaunchBlob=cd88a07941ab62072f6de5ee69764308f1ec2387` · `newLaunchBlob=bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`.
W002 comunicó 6 piezas/8 HTML, 3 fotos y Chromium inyectado con bug hidden reparado. W003 usa una edición única con seis lecturas genuinas, tres SVG conceptuales originales, buscador por texto completo y pruebas de 28 vistas. Se añadieron capturas reales de apertura y cambio de imagen 429→200. **No se asegura mejora artística causal** ni se sustituye el historial. `flowBefore`: no se fijó sha propio verificable de W002 en este WORK; `flowAfter`: candidato 2.0.0 no promovido.

## Próximo gate objetivo
Verificar el despliegue real de GitHub Pages, comprobar los mismos 28 estados bajo HTTP público, hacer revisión visual/editorial independiente (incluido Android) y test de lector de pantalla. No reportar `HUMAN_APPROVED` hasta aprobación humana real.
