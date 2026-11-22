# PUERTO DE CENIZA · W003 · WORK 08

**ID:** `images-w003-20261122-08`  
**owner:** `JuanManuelPM/Experimentos`, rama `candidate/prometeo-images-w003-20261122-08`  
**LAUNCH blob (fijado):** `a97b91ca103847ea75eeb9d1d2af10b6c9c0dddd`  
**Brief original W002 (mismo texto):** `2e0e5e8ca226d546005349dc44b31cd9abcf5dd1`  
**startedAt/recordedAt:** `2026-11-22T19:14:07Z`  
**humanApproved:** `NO`

## Obra producida (local, no simular publicación remota)

- Vista magistral genuina 1672 × 941 en `01-vista-magistral.png`. Render ImageGen original inspeccionado.
- Dos estudios de zonas `02-zona-darsena.png`, `03-zona-terrazas.png`. Son **recortes aumentados de la misma pintura**, no dos cámaras alternativas.
- Lámina de arquitectura `04-arquitectura.png`, vehículos `05-vehiculos.png` y flujo de cargas `06-rutas-y-economia.png`; dibujos raster propios, 2000 × 1240, fuente reproducible `render.py`.
- `WORLD_CANON.md`: nodos, rutas, módulo 6 × 12, materiales y modos de carga.
- `index.html`: presentación local sin overlays ni botones invasivos.

**Entrega local:** ZIP adjunto al chat originario; no hay aún URL pública GitHub con los seis PNG. El archivo HTML de esta rama, si se sube sin el raster, NO es un sitio listo en Pages.

## Test y límites

- Pillow decodificó los seis PNG y se calcularon SHA256 originales (`RASTER_MANIFEST.json`).
- `python -m unittest -v test_world`: **5/5 PASS**.
- Playwright Chromium con fuente real y JPEG derivados inline: pantalla de 390 y 1440 **OBSERVED_PASS**, ancho del documento idéntico al viewport, 6/6 imágenes decodificadas. **No** se probó carga de URL remota de imágenes.
- Se descartaron **dos** renders ajenos a la consigna que mostraban un tablero de PROMETEO. Este desvío motivó dibujar las láminas con otra familia técnica, no maquillarlas como vistas del puerto.
- Perspectiva multivista independiente, ingeniería de barcazas, prueba de impresión y crítica artística ciega: `NOT_RUN`.
- `ART_DIRECTION_FIRST_ARTICLE` tiene capturas reales locales pero carece de evidencias HTTPS para el validador de gate compartido: no se afirma `READY` estructural remoto.
- `VISITED_TRACE`: historial factual, **no** traza DAG validada por `visited-trace-v1.mjs`, cuyo FLOW_INDEX del flujo especializado no está disponible.

## Comparación W002/W003

| Aspecto | W002 | W003 08 |
|---|---|---|
| Brief | Mismo texto 08 | Conservado sin modificación |
| Flujo anterior | No recuperable como versión promotada por esta sesión | `candidate/prometeo-image-studio-unificado-20261117`, README blob `5726f13f840884f6c4984d88fa27e89f0be9e2bb` |
| Estrategia de imagen | Raster histórico no accesible en esta sesión | Hero generativo observado + módulos de dibujo determinista |
| Primer artículo | No hay evidencia transferible a este chat | Hero observado; dos desvíos generativos descartados |
| Continuidad | Comparación pixel-a-pixel W002: `NOT_RUN` | Misma imagen entre ambos estudios de sectores; cámara distinta `NOT_RUN` |
| Calidad superior | No demostrada | Tampoco: requiere comparación perceptual independiente |

**Siguiente mejora de método:** un escrows de imagen que permita subir/recuperar raster original a GitHub con SHA y readback, sin forzar a llamar a un crop una nueva cámara. El empaquetado local funciona; el último tramo de publicación aún es una brecha técnica.