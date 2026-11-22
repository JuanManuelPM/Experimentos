# PROMETEO · Web W002 · 05 · OBJETO CERO
**Task:** `web-w002-20261122-05` · **Brief SHA:** `cd88a07941ab62072f6de5ee69764308f1ec2387` · **Quality:** QBAR-1 · **Preproduction:** DEEP-SPEC-1

## Obra realmente producida

**NÓDO 01 — La forma de la luz**, publicación original de una luminaria de escritorio enteramente ficticia. La web incluye portada editorial, explicación de la idea, detalle de diseño, selector de tres acabados y bolsa de demostración. HTML semántico, CSS responsive, dos módulos ES nativos, archivo WebP fotográfico original 1536×1024 y pruebas de cálculo.

- **Materiales:** Metal natural, Grafito oscuro, Arcilla cálida.
- **Importes inventados:** $189.000 / $198.000 / $205.000 ARS. Diferentes SKU y correspondencia con cada panel del mismo tríptico fotográfico.
- **Carrito reutilizable:** `cart-core.js` exporta catálogo, saneamiento de almacenamiento, reducer de cantidades, formateador de dinero y cálculo de subtotales/totales. `app.js` gestiona DOM, selección, localStorage, URL `?acabado=...`, diálogo nativo y operaciones de demostración.
- **No comercial:** checkout sin pagos, pedidos, cuentas, API ni datos transmitidos. Etiquetas visibles en ficha, bolsa y pie. No es un negocio ni una representación de productos existentes.
- **Fotografía:** tríptico conceptual generado originalmente para este encargo, tres paneles del mismo objeto; raster optimizado WebP. No se reutilizan imágenes de las marcas referentes.

**Ruta prevista en GitHub Pages:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/web/w002/05/

## Referencias efectivamente examinadas

| Referente y observación textual | Intención adoptada | Decisión/artefacto | Brecha |
|---|---|---|---|
| Apple Store · Buy iPhone: secciones Finish/Color y variantes de producto observadas en web pública | El acabado seleccionado debe corresponder a una imagen del objeto | Un único modelo de tres SKU y selección sincronizada a paneles | No hay auditoría visual de referencia píxel a píxel |
| Teenage Engineering · PO-33: página comercial centrada en vistas reales del objeto | Hacer del producto la pieza editorial central | Fotografía original protagoniza la portada y sección de detalles | Las imágenes son conceptuales, no fotos de un objeto físico fabricado |
| Nothing · Phone (3): URL comercial registra un valor `Colour` | Permitir compartir la elección sin backend | `?acabado=natural|grafito|arcilla` reemplazado en History API | No se verificó navegación por URL en navegador |

Referencias públicas: https://www.apple.com/shop/buy-iphone/iphone-17 · https://teenage.engineering/store/po-33/ · https://us.nothing.tech/products/phone-3?Capacity=12%2B256GB&Colour=Black . Sus obras, código, marcas y fotos no se copiaron.

## QA realmente ejecutada

| Comprobación | Estado | Evidencia |
|---|---|---|
| Node `npm test` reducer/cart | **OBSERVED PASS** | 10 invariantes de SKU, precios enteros, totales multivariante, cantidades, eliminación, validación y límites 99 |
| `node --check` de módulos | **OBSERVED PASS** | Sin error sintáctico |
| Auditoría estática de IDs y anclas | **OBSERVED PASS** | Sin IDs duplicados y rutas ancla completas |
| Auditoría de red del código de compra | **OBSERVED PASS (estática)** | Sin fetch/XMLHttpRequest/sendBeacon/PaymentRequest; no hay pago |
| Responsive CSS y reduced motion | **IMPLEMENTED / NOT_RUN in-browser** | Breakpoints 1000/700/360, `prefers-reduced-motion` presente |
| Chromium localhost / file | **BLOCKED** | `net::ERR_BLOCKED_BY_ADMINISTRATOR` en ambas rutas; política administrada `URLBlocklist=["*"]` |
| Capturas reales / táctil / teclado / 320, 768, 1440 / almacenamiento real | **NOT_RUN** | El entorno bloqueó la navegación del navegador; no inventar QA visual |
| Arte/calidad profesional evaluada por humano | **NOT_RUN** | Ninguna aprobación implícita |

**Estado honesto:** `IMPLEMENTED_SOURCE` + `NODE_TESTED` + `BROWSER_NOT_RUN`. Una página publicada y un test de cálculo no prueban experiencia perceptual ni calidad profesional.

## Aprendizaje preventivo para el estudio WEB

1. `stage=media-architecture`; `cause=variant-photo-divergence`; `preventive_gate=single-source-asset-plus-SKU-map`; `test=all finishes change visual and SKU together`; `owner=web`; `counterexample=three unrelated generated lamps`.
2. `stage=commerce-state`; `cause=state-render-drift`; `preventive_gate=pure-cart-reducer-and-validated-storage`; `test=multi-SKU total + reload + malformed storage`; `owner=web`; `counterexample=hardcoded cart price`.
3. `stage=acceptance`; `cause=browser-runner-restricted`; `preventive_gate=detect-URLBlocklist-before-claiming-browser-QA`; `test=real navigation/screenshots where authorized`; `owner=web`; `counterexample=source rendered claimed visually verified without browser`.

## Propietarios e integridad

Rama exclusiva: `candidate/prometeo-web-w002-05-20261122`. La obra vive bajo `prometeo/previews/web/w002/05/`. Ficha interna `prometeo/launch/20261122/next/web/results/05/PREPRODUCTION.deep-spec-v1.json`. El conjunto histórico W001 y demás números W002 no se modificaron. Retorno a ROOT solo mediante mensaje `room=web` propio y CAS por SHA.
