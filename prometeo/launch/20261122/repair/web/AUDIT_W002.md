# PROMETEO · WEB W002 · AUDITORÍA 10/10

**Estado:** CANDIDATE_NOT_PROMOTED · **Fecha:** 2026-11-22 · **batchId:** web-w002-20261122 · HUMAN_APPROVED=NO.

## Alcance y límites

Leí el protocolo STUDIO_AUTOCritica_V2, el lanzador WEB, diez entradas ROOT, diez archivos index.html de gh-pages y sus recibos. Los SHAs abajo son blobs inspeccionados de GitHub, no capturas. **Capturas nuevas de las obras en esta auditoría: 0/10.** Chromium local existe, pero no tiene salida a Pages; el servicio remoto de navegador no ejecutó por falta de créditos. Las observaciones locales de N03/N07 y el spike de N10 constan en recibos de sus respectivos autores, no fueron reproducidos aquí. No se inventan juicios de píxeles, tipografía, sonido o acceso público.

## Censo de fuente directa y causas preventivas

### 01 · EL UMBRAL DE LA LUZ

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/web/works/01-umbral-luz/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/web/works/01-umbral-luz/QA_RECEIPT.md) · blob c5e5556e4cc1d011f0eee95135d9b9ad40cd4e6d.

**Evidencia y límite:** 5 capítulos y 5 fotos Commons acreditadas; fotos heterogéneas, no secuencia real de un mismo lugar. Browser/fotos cargadas NOT_RUN.

**Causa/gate siguiente producción:** Storyboard de continuidad o montaje declarado y primer capítulo visual 390/1440; comprobar ida y vuelta de scroll.

### 02 · CASA MATERIAL

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/web-w002-20261122-02/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/web-w002-20261122-02/EVIDENCE.md) · blob a013ea45165670dc93949c48ef3bd9a7451f6cb2.

**Evidencia y límite:** Marca conceptual, filtros y 6 fotos Unsplash de referencia, no producción del taller. Navegador/CDN NOT_RUN.

**Causa/gate siguiente producción:** Media de portada y ficha deben compartir lenguaje visual, autoría/rol honestos; stock no equivale a foto de producto propio.

### 03 · ARCHIVO ABIERTO

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/web-w002-20261122/03/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/web-w002-20261122/03/QA.md) · blob 5d7a1e329af103b170a1e41d9886e9064b66a632.

**Evidencia y límite:** 8 SVG 3000×3800 nominales y visor. Recibo documenta Chromium local 320/768/1440. El propio autor identifica uniformidad de ocho obras del mismo generador; SVG escalable no demuestra detalle raster.

**Causa/gate siguiente producción:** Antes de hacer serie de 6+, probar 3 lenguajes visuales genuinos con muestras, detalle y comparación; considerar raster/IIIF propio cuando corresponda.

### 04 · TIPO VIVO

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/web/results/04/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/web/results/04/REPORT.md) · blob 55f681cd1266560f16c2889ffddcac37e965d4a8.

**Evidencia y límite:** Recursive OFL con cinco ejes; recibo declara 14 pruebas lógicas y 8 DOM-stub. Render de glifos/carga real de fuente y motion NOT_RUN.

**Causa/gate siguiente producción:** Prototipo con fuente cargada, extremos de ejes, fallbacks y reduced motion medidos en navegador.

### 05 · OBJETO CERO

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/web/w002/05/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/web/results/05/REPORT.md) · blob 3cea1d65cd78daafdb3544877929e3a649445a51.

**Evidencia y límite:** NÓDO01, product-triptych.webp, 3 acabados y carrito demo; pruebas Node de invariantes reportadas. Browser/carrito visible/Pages NOT_RUN.

**Causa/gate siguiente producción:** Prueba visual de correspondencia variante→foto→total; recargar carrito en navegador verdadero.

### 06 · MAPA DEL CALOR

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/works/web-w002-06/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/works/web-w002-06/RECEIPT.md) · blob 50a61534403fd25c71dba74dd8a34ecde9cc2f69.

**Evidencia y límite:** Datos ERA5-Land, 27.393 días y 75 agregados reconciliados según recibo; gráficos y tabla. Experiencia visual y chart responsive NOT_RUN.

**Causa/gate siguiente producción:** Gate doble: reconciliar cifras y leer valores/unidades/anotaciones en 320/390/768/1440; no inferir isla de calor a partir de grilla.

### 07 · CONTRAPUNTO

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/20261122/web-w002-07/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/20261122/web-w002-07/QA.md) · blob e15877fb142063fc910b76e19ddf0f8de58829c7.

**Evidencia y límite:** 8 HTML, 6 publicaciones, 3 WebP. Recibo acredita Chromium local inyectado, encontró display:grid anulando [hidden], reparó y reprobó. Capturas no reobservadas; Pages no verificado.

**Causa/gate siguiente producción:** Reutilizar test de visibilidad computada, navegación y 3 viewports; validar URL realmente servida, no confundir set_content con Pages.

### 08 · SECUENCIA

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/web-w002-20261122/08/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/works/web-w002-20261122/08/QA.md) · blob acd35abd550709dd2248e248175e3765708c9912.

**Evidencia y límite:** Editor y motor único de preview/export; recibo declara 15 checks PASS, gate SPIKE_REQUIRED. HTML exportado sin red y video reales NOT_RUN.

**Causa/gate siguiente producción:** Crear dentro del editor→exportar→cerrar editor→abrir HTML autónomo sin red→comparar UI y controles.

### 09 · ESCENA ABIERTA

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/web-w002-09-escena-abierta/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/web-w002-09-escena-abierta/REPORT.md) · blob c61771a310c92bbe2228c53d7284ad5d06fd9893.

**Evidencia y límite:** Festival ficticio, 24 eventos y fotos Unsplash de ambiente; 9 checks V8 en recibo. Agenda, fotografía y filtros en browser NOT_RUN.

**Causa/gate siguiente producción:** Diferenciar atmósfera acreditada de retrato de artista; prueba filtros, intervalos, agenda persistente y estética en móvil.

### 10 · LUPA

[Obra: código fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/web/releases/w002-10-lupa/index.html) · [Recibo original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/web/releases/w002-10-lupa/RECEIPT.md) · blob 7af02b08518801aa6901653c19d9b75b04985715.

**Evidencia y límite:** Herramienta A/B y runner. Spike Chromium real de 6 PNG de fixtures en 320/768/1440; CLI Node/UX de la propia app/IndexedDB NOT_RUN.

**Causa/gate siguiente producción:** No confundir captura de fixture con E2E del producto; exigir par de fuente, hashes, cambios en UI e historial tras recarga.

## Cinco causas transversales y alternativas viables

| Evidencia → defecto | Etapa causal | Gate y técnica candidata | Responsable |
|---|---|---|---|
| 7/10 sin prueba Chromium local de su página; N10 sólo fixtures | QA perceptual demasiado tardío | **S08 FIRST_SLICE:** dos referencias visuales realmente observadas, dos direcciones distintas, captura de primer componente en 390/1440, revisor diferente y tarea P0. Sin pruebas, SPIKE_REQUIRED, no PASSED. | WEB arte/QA |
| N03 serie de 8 SVG del mismo procedimiento | selección de técnica y arte | Para series artísticas ≥6, tres lenguajes con muestras, prueba de detalle del medio a escala de uso; raster/IIIF u otra autoría cuando la intención lo requiere. Un SVG no es malo por naturaleza. | WEB arte |
| N01/02/09 fotografía heterogénea o stock conceptual | adquisición/semántica de media | Inventario autor/licencia/origen/rol, storyboard por escena, no anunciar producto de stock como propio. | WEB media |
| N04/05/08/09/10 lógica reportada sin cerrar browser E2E | oráculo de función equivocado | Prueba tipológica real: fuente interpolada, carrito recargado, export autónomo, agenda visual, diff+historial. | WEB ingeniería |
| Código publicado pero Pages sin browser público verificado | publicación | SOURCE_READBACK, BROWSER_LOCAL, LIVE_HTTP, PUBLIC_BROWSER y HUMAN_APPROVED son cinco hechos distintos; no promocionar por commit. | WEB/ROOT |

**Aciertos:** N07 encontró y corrigió visibilidad computada tras test real; N03 examinó visor local en tres viewports; N10 generó PNG instrumentales genuinos; N06 explicitó límite de inferencias estadísticas. No imponer un estilo único, ni vetar por reflejo SVG, gráficos, fotografías licenciadas o grillas cuando son apropiados.

## Dirección artística vs ingeniería

La dirección artística rechaza sustituir una obra por un conteo de imágenes, SVG y secciones. La ingeniería exige que esa crítica tenga caso reproducible, screenshots y prueba de los estados. La solución conjunta es decidir **representación, recursos y composición ANTES de la producción completa**, y permitir pivotar en S05/S08 cuando el primer componente no da la calidad buscada. Un gate de código no puede evaluar buen gusto: siempre se requiere inspección visual con referente.

## Reparación candidata y pruebas

[Flujo especializado en rama candidata privada](https://github.com/JuanManuelPM/pruebas/tree/candidate/prometeo-web-art-gate-w002-20261122/cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/web-design-studio/workflows/WEB_FACTORY_V2). Cambios: WEB_ART_GATE.mjs, WEB_ART_GATE.test.mjs, WEB_CAPTURE.py y revisiones a FLOW.json, VALIDATE.mjs, VALIDATE.test.mjs, GATES_QA.md. **S08 PASSED** exige FIRST_SLICE en run.artProof; **S10 PASSED** exige FINAL_QA, con 320/390/768/1440 de URL servida, imágenes y consola sin errores y prueba funcional propia. No se reescribieron las diez obras.

**Pruebas observadas en esta sesión:** 10/10 contraejemplos del validador pasaron en Node 22 local. WEB_CAPTURE.py produjo 4 PNG reales a 320/390/768/1440 de un **fixture sintético**, todos sin scroll horizontal. No son capturas de ninguna obra. La suite integrada VALIDATE.test.mjs del checkout remoto, accesos HTTP y crítica visual de obras todavía NOT_RUN; exigidos antes de promoción. El validador examina estructura de un manifiesto autorreportado y no confirma automáticamente existencia/autenticidad de bytes ni excelencia perceptual: el integrador debe hacer readback real de imágenes y revisar composición.

**Riesgos y rollback:** metadatos de capturas potencialmente inventados, diferencias raster por sistema operativo, media CDN no disponible, bloqueo de runners. Mantener estado SPIKE_REQUIRED/NOT_RUN, nunca PASS ficticio. Revertir descartando ramas candidatas sin tocar W001/W002, medios históricos ni contrato común.

**ROOT aparte:** el menú Obras (tarjetas enormes, W001 antes de lo nuevo) es incidencia de portal ROOT observada por el humano, no fallo de cada web. Se devuelve a ROOT, no se muta desde esta rama.

**Cierre:** 10/10 SOURCE_INSPECTED · 0/10 NEW_WORK_SCREENSHOTS · BROWSER_PUBLIC_NOT_RUN · CANDIDATE_NOT_PROMOTED · HUMAN_APPROVED=NO.
