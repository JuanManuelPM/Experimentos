# RECIBO · WEB W002-01 · EL UMBRAL DE LA LUZ

**Identidad:** `batchId=web-w002-20261122`, `taskNumber=1`, `taskId=web-w002-20261122-01`.
**Brief fijado:** `gh-pages/prometeo/launch/20261122/next/web/LAUNCH.md` blob `cd88a07941ab62072f6de5ee69764308f1ec2387`.
**Propietario:** `JuanManuelPM/Experimentos`; rama aislada `candidate/prometeo-web-w002-01-20261122`.
**Ruta de publicación:** `gh-pages/prometeo/launch/20261122/next/web/works/01-umbral-luz/`.
**URL objetivo de Pages:** https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/next/web/works/01-umbral-luz/

## Entrega

- `index.html`: reportaje completo de 5 capítulos con texto original en español argentino, 5 fotografías documentales auténticas CC BY 2.0, créditos/obras originales enlazadas, índice por anclas, epílogo y notas de método.
- `sequence-engine.js`: módulo ESM `SequenceDirector` exportado y reutilizable con estado por escena, progreso, desplazamiento fotográfico ligero vinculado al scroll y reducción de movimiento. No interfiere con rueda, anclas ni teclas.
- `PREPRODUCTION.deep-spec-v1.json`: preguntas de producción, cuatro referencias examinadas, decisiones, vínculos, licencias y riesgos.
- Publicado en rama `gh-pages` por archivos nuevos aislados, sin reescribir índices, briefs, obras históricas ni otras tareas. PR de rama aislada #21 no se fusionó por cambios simultáneos de base.

## Observaciones verificadas

- **OBSERVED · SOURCE READBACK**: tres archivos leídos exitosamente desde `gh-pages` con los SHA de blob esperados:
  - `index.html` `c5e5556e4cc1d011f0eee95135d9b9ad40cd4e6d`
  - `sequence-engine.js` `46be7b7db757de934d6a0624f6c8f9d99cc099a1`
  - `PREPRODUCTION.deep-spec-v1.json` `127c5bbddc14cc6ef2c646966a6bbf8bd2c3f2e7`
- **OBSERVED · STATIC_CHECK**: 5 secciones con `data-sequence-step`, 5 ids únicos con enlace directo en índice, 5 fotos con atribución explícita, detector de `prefers-reduced-motion`, controlador exportable con progresión fotográfica y hash del brief inmutado. Inspección de texto/código solamente.
- **OBSERVED · LICENSING DOCUMENTS**: fichas Wikimedia Commons de fotos enlazadas de Rodrigo Paredes, Jon Gilbert Leavitt, David, Beatrice Murch con RainbowUnicorn y Luis Argerich. Todas indican CC BY 2.0, con los recortes declarados.
- **REFERENCE_RESEARCHED**: The Pudding (proceso de scrollytelling y recuperación de estado), ensayo National Geographic Day to Night (dirección narrativa; fotos no reutilizadas) y documentación Commons de autoría/licencias. Observaciones textuales, no auditadas visualmente contra screenshots.

## Pruebas pendientes, no realizadas

| Prueba | Estado | Motivo |
|---|---|---|
| HTML y JS presentes en rama pública | OBSERVED | Readback API GitHub de contenido y SHA |
| Apertura de URL final en GitHub Pages | NOT_RUN | Apertura HTTP externa no confirmada en este entorno |
| Render visible 320 / 768 / 1440 CSS px | NOT_RUN | No hay navegador conectado con acceso web; Firecrawl informó falta de créditos |
| Navegación por teclado y touch | NOT_RUN | No se ejecutó sesión interactiva real |
| Ciclo de ida y vuelta / anclas / reduced motion | NOT_RUN | La implementación existe, sin verificación en navegador |
| Carga efectiva de las cinco fotografías | NOT_RUN | URLs y licencias verificadas por documentación; red/render no verificados |
| Aprobación de calidad artística externa | NOT_RUN | HUMAN_APPROVED no otorgado |

## Comparación con aspiración

**Referencia → intención → decisión → artefacto → brecha.**
The Pudding exige que el relato mantenga estado al saltar pasos; se eligió artículo semántico con progresión visual opcional; los cinco capítulos y motor están publicados como fuente. No se ha observado si la transición resulta fluida o legible en teléfonos reales.
La fotografía temporal de National Geographic inspira una secuencia visual, pero aquí no existe captura continua del mismo día. La obra lo declara expresamente y mantiene fechas/autores y créditos; la consistencia cromática todavía necesita revisión perceptual.

## Aprendizaje transferible para la revisión del estudio

- `stage=publication`; `cause=base branch gh-pages modified concurrently`; `preventive_gate=use exclusive path and verify each created blob by SHA`; `test=postwrite readback on target branch`; `owner=web/root publication`; `counterexample=PR merge failure does not imply files were deployed`.
- `stage=web QA`; `cause=external browser runner unavailable by credits`; `preventive_gate=separate source readback from rendered-browser verification`; `test=real 320/768/1440 browser with image network and reduced-motion checks`; `owner=web QA`; `counterexample=HTML with working anchors cannot alone certify smooth navigation or image loading`.

**Estado de cierre:** `DELIVERED_SOURCE` + `PUBLISHED_REPOSITORY_VERIFIED`; `BROWSER_QA_NOT_RUN`; `LIVE_PAGES_NOT_VERIFIED`; `HUMAN_APPROVED=false`.
