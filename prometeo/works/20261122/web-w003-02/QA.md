# CASA MATERIAL · WEB W003/02 · QA y evidencia

- Fecha UTC de cierre local: `2026-11-22T19:11:05Z`
- Identidad: `web-w003-20261122-02` · `batchId=web-w003-20261122` · `taskNumber=2`
- Rama: `candidate/prometeo-web-w003-20261122-02` (exclusiva)
- Brief W003 SHA: `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`; brief histórico W002 SHA: `cd88a07941ab62072f6de5ee69764308f1ec2387`.
- Flow especializado consultado: WEB_FACTORY_V2 `2.0.0`, blob `1a0e709beec9a84986fc33c5ce4ab0a162dccaf2`, rama candidata no promovida. No se ejecutó la fábrica automatizada completa ni sus 316 nodos.
- QBAR-1, DEEP-SPEC-1, ART-DIRECTION / FIRST-ARTICLE-1. `HUMAN_APPROVED=NO`.

## Originalidad y procedencia
**CASA MATERIAL**: cuatro escenas de una misma generación visual original, recortadas a WebP locales. No hay fotos de stock ni dependencias externas. Las piezas son propuestas imaginadas. **No** representan objetos fabricados ni fotografías documentales.

## Primer artículo antes de obra completa
Se produjo `first-article/index.html` usando una sola composición y titular. Se capturó por Chromium headless en 390 y 1440 px mediante `page.set_content` con imagen embebida; ambos sin overflow, imagen descodificada 627 px. **Render real inyectado**, NO `BROWSER_SERVED`, NO `PAGES_VERIFIED`. La familia de representación se mantuvo; fallback descrito en Book, no ejecutado porque este corte funcionó en la evaluación instrumental.

## QA ejecutado (sobre HTML inyectado, no URL pública)

| Criterio | Resultado | Límite |
| --- | --- | --- |
| 320 / 390 / 768 / 1440 CSS px | **4/4 PASS** sin scroll horizontal | Chromium `set_content`, no URL servida |
| Assets raster (6 elementos img de página) | **6/6 decoded**, naturalWidth 627 | Data URI inyectado; HTTP `NOT_RUN` |
| Filtro `VASIJAS` | **PASS** 1 pieza visible y `aria-pressed` correcto | Chromium inyectado |
| Diálogo de Raíz, contenido correcto | **PASS** | Chromium inyectado; historia URL real `NOT_RUN` |
| Cierre Escape y retorno de foco | **PASS** | Chromium inyectado |
| Errores JavaScript de escenario | **0 observados** | Escenario acotado |
| `node --check site.js` | **PASS** | Sintaxis solamente |
| Reduced motion | Declarado en CSS, contexto emulado | Auditoría AT real `NOT_RUN` |
| URL pública / GitHub Pages / navegación servidor | **NOT_RUN** | Bloqueo de navegación de Chromium, rama candidata no publicada en gh-pages |
| Auditoría humana de calidad visual | **NOT_RUN** | `HUMAN_APPROVED=NO` |

Screenshots **genuinos de Chromium**, pero inyectados: QA_CAPTURES.html#qa-320, #qa-390, #qa-768, #qa-1440 (capturas WebP embebidas). Los originales PNG se conservan en la copia local / ZIP de entrega. No son capturas de Pages. 

## Comparación responsable W002 → W003
- W002 N02: fotos externas Unsplash de distintos autores, 6 imágenes de referencia; navegador NOT_RUN. W003 N02: una dirección de fotografía conceptual generada propia y cuatro crops en WebP local, reduciendo heterogeneidad y dependencia CDN.
- W002: código y controles declarados con chequeos estáticos. W003: capturas Chromium inyectadas en cuatro anchos + filtro, modal, Escape y foco ejercitados. No afirmar que se verificó Pages o acceso público.
- La dirección visual y la editorialidad han cambiado, pero no hay evaluador humano independiente; superioridad artística `UNVERIFIED`.
- Retroceso: borrar/revertir sólo rama W003/02; conservar W002.

## Contraejemplos y aprendizaje candidato WEB
- `stage=S02-media`, `cause=stock-suggests-inventory`, `preventive_gate=local-original-concept-images-and-disclaimer`, `test=asset-provenance-and-caption-inspection`, `owner=web`, `counterexample=fictional-product-backed-by-real-third-party-object-photo`.
- `stage=S08-first-slice`, `cause=template-hero-before-art`, `preventive_gate=first-article-at-two-widths-before-full-build`, `test=real-headless-screenshot-and-image-decode`, `owner=web`, `counterexample=compile-pass-with-empty-hero-image`.
- `stage=S10-QA`, `cause=lazy-images-skipped-in-fullpage-captures`, `preventive_gate=force-image-decode-then-screenshot`, `test=all-naturalWidth-nonzero`, `owner=web`, `counterexample=blank-gallery-in-fullpage-report`.

**Conclusión:** CODE+CHROMIUM_INJECTED_CAPTURE_PASS · FUNCTIONAL_INJECTED_PASS · PAGES_HTTP_NOT_RUN · ACCESSIBILITY_FULL_NOT_RUN · HUMAN_APPROVED_NO.
