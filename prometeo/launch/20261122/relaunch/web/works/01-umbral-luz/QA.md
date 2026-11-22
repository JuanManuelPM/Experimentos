# PROMETEO · WEB W003/01 · EL UMBRAL DE LA LUZ · QA

**Estado:** SOURCE_PUBLISHED + STATIC_CHECK_PASS + SEQUENCE_LOGIC_PASS; FIRST_ARTICLE_REQUIRED; DEEP_SPEC_SPIKE_REQUIRED; PAGES_HTTP_NOT_VERIFIED; HUMAN_APPROVED=NO.

## Entrega y trazabilidad

- Batch: `web-w003-20261122`; task: `web-w003-20261122-01`.
- Brief LAUNCH W003 blob: `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`; antiguo W002: `cd88a07941ab62072f6de5ee69764308f1ec2387`.
- Flow fuente: `WEB_FACTORY_V2@2.0.0`, blob `1a0e709beec9a84986fc33c5ce4ab0a162dccaf2`, SPEC_ONLY / CANDIDATE_NOT_PROMOTED. No se modificó ni se promovió.
- Rama exclusiva: `candidate/prometeo-web-w003-20261122-01`. Publicación de fuente: `gh-pages/prometeo/launch/20261122/relaunch/web/works/01-umbral-luz/`.
- [Web pública objetivo](https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/web/works/01-umbral-luz/) (HTTP / browser todavía NO_VERIFICADOS).
- Archivos: [index.html](index.html), [sequence-engine.js](sequence-engine.js), [sequence-state.mjs](sequence-state.mjs), [sequence-state.test.mjs](sequence-state.test.mjs), [Book](PREPRODUCTION.deep-spec-v1.json), [Flow](FLOW_LOCK.json), [Trace](STAGE_TRACE.json), [RESULT](RESULT.json).

## Pruebas efectuadas

1. **OBSERVED GitHub readback**: `index.html` SHA `b6ca5e703a6b73098638af84709d5e7e11637e65`; `sequence-engine.js` SHA `b14a239d54981789435bd61700cbf93e1707eb91`; `sequence-state.mjs` SHA `ad915397c9c3e12b6b9a6b2ecbe9d3d7ce41669f`; `PREPRODUCTION.deep-spec-v1.json` SHA `06155c55aa4e321d43065461fdfd25929c35fec6`.
2. **OBSERVED static**: 5 capítulos `data-sequence-step`, 5 índices con anclas coincidentes, 5 fotografías Commons distintas, 5 entradas de crédito, toggle sin movimiento, import del motor y módulo de geometría.
3. **OBSERVED logic**: Node v22 `node --test` sobre lógica equivalente: **6/6 PASS**; ejecución V8 de las funciones del módulo recuperado de GitHub: **8/8 PASS** (selección inicial, enlace al final, vuelta, saltos rápidos, progreso, offsets reducidos, valores extremos y lista vacía). **No certifican comportamiento DOM en navegador.**
4. **OBSERVED structural validators:** Deep-Spec `SPIKE_REQUIRED`, Art-Direction `FIRST_ARTICLE_REQUIRED`; sin errores estructurales. Ninguno fue aprobado visualmente.
5. **REFERENCE_RESEARCHED:** The Pudding [estado scrollytelling](https://pudding.cool/process/how-to-make-dope-shit-part-3/) y [responsive](https://pudding.cool/process/responsive-scrollytelling/); Wikimedia Commons para autores y condiciones de las imágenes.

## Pruebas que NO se ejecutaron

| Oráculo | Estado |
|---|---|
| Primer artículo con fotografía real cargada y capturas 390/1440 | NOT_RUN |
| Fotografías con `naturalWidth>0` en navegador | NOT_RUN |
| Inspección tipográfica y overflow 320/390/768/1440 | NOT_RUN |
| Teclado, táctil, anclas y scroll DOM end-to-end | NOT_RUN |
| `prefers-reduced-motion` comprobado en computed style | NOT_RUN |
| HTTP público de URL Pages | NOT_VERIFIED |
| Evaluación perceptual independiente y Android | NOT_RUN |
| Aprobación humana | HUMAN_APPROVED=NO |

**Límite material:** Chromium local disponible, pero contenedor sin acceso de red a Commons/Pages. Firecrawl registró saldo de 0 créditos. La ausencia de fotografía renderizada impide pasar el gate FIRST-ARTICLE, aunque existe fallback editorial legible en código. Ninguna captura de obra se declara observada.

## Dirección artística y derechos

La W002 disponía texto y fotografía en un split sticky 56/44. La W003 usa capítulos fotográficos a ancho completo, seguidos de una composición editorial con cuerpo de lectura estrecho, textos nuevos y motor con funciones puras. Sigue siendo un **montaje conceptual** de Buenos Aires de autores, lugares y años diferentes, no un documental continuo de 24 horas. Cada foto enlaza fuente y licencia. Rodrigo Paredes, Jon Gilbert Leavitt, David y Beatrice Murch: CC BY 2.0; ProtoplasmaKid: CC BY-SA 4.0 (imagen nocturna nueva). El recorte se hace en CSS, sin modificar ni subir los originales.

No se ha demostrado que W003 sea artísticamente superior a W002. La diferencia de representación y las pruebas de código sí están respaldadas.

## Aprendizaje para la revisión

- `stage=S08` · defecto preventivo: primer artículo fotográfico no observado · causa: CDN/browser fuera de alcance · test requerido: fotografía real y capturas 390/1440 con foco/contraste/recorte · responsable: WEB arte/QA · contraejemplo: cinco URLs Commons no equivalen a cinco fotos visibles.
- `stage=S10` · defecto preventivo: lógica PASS confundida con UI PASS · test requerido: scroll arriba/abajo, hash, teclado y movimiento reducido en navegador real · responsable: WEB ingeniería.
- `stage=S11` · defecto preventivo: commit confundido con Pages cargada · test requerido: GET público + browser real · responsable: WEB publicación.

**Cierre honesto:** obra y código publicados en GitHub, lógica PASS, fotografía/primer frame/end-to-end y aprobación humana pendientes.
