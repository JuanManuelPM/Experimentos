# PROMETEO · 3D W6-08 · Atlas de una cuenca

**Obra:** [Atlas de una cuenca: Grand Canyon](./index.html) · Subcuenca Grand Canyon del río Colorado, EE. UU. · WBD HUC8 `15010002`.

**Identidad:** `batchId=3d-w6-20261122`; `taskNumber=8`; `taskId=3d-w6-20261122-08` · [lanzador](../../../launch/20261122/next/3d/LAUNCH.md) blob SHA `942c3ba8b851137886e959d2790771556e2d9f5d`.

**Estado a la entrega:** Código y pruebas estructurales **IMPLEMENTED**; cargas de datos de servicios externos, render WebGL, experiencia móvil, precisión visual y criterio humano **NOT_RUN** desde este entorno. Publicación de HTML no prueba render 3D. La interfaz informa cada carga o error real, no inventa datos ni porcentajes.

## Objeto y tecnología

Atlas 3D original de la unidad hidrográfica real Grand Canyon, con vista regional y tres posiciones de observación, cámara 2D/3D, giro, zoom, escala gráfica, coordenadas geográficas, capa de límites HUC8 y red de ríos, basemap topográfico USGS, sombreado y control de exageración vertical. El panel recoge proyección, fecha y fuente; en móvil es plegable. La obra funciona **en línea** si los servicios públicos y el motor WebGL responden. No contiene datos falsos de elevación, líneas dibujadas a ojo ni claves privadas.

El componente reutilizable [`tile-data.mjs`](tile-data.mjs) encapsula generación de fuentes raster-dem Terrarium, construcción segura de URLs ArcGIS GeoJSON en EPSG:4326, consulta acotada y paginada con señales de cancelación, caché LRU y validación de polígono HUC8. `atlas.mjs` integra la representación y UI.

## Procedencia

| Capa | Fuente verificable | Fecha de fuente / consulta | CRS / escala |
|---|---|---|---|
| Relieve 3D | [Mapzen Terrain Tiles, AWS Open Data](https://registry.opendata.aws/terrain-tiles/) | Acceso documentado 22-11-2026; dataset con fuentes heterogéneas | Terrarium metros; teselas XYZ Web Mercator; detalle variable |
| Límite de subcuenca | [USGS WBD HUC8 / FeatureServer 4](https://hydro.nationalmap.gov/arcgis/rest/services/wbd/FeatureServer/4) | Refresco declarado octubre 2026 | Consulta GeoJSON 4326; mapa 3857 |
| Hidrografía | [USGS 3DHP Flowline / FeatureServer 50](https://3dhp.nationalmap.gov/arcgis/rest/services/usgs_3dhp_all/FeatureServer/50) | Refresco declarado 04-09-2026 | Consulta GeoJSON 4326; mapa 3857 |
| Carta base | [USGS The National Map topo](https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer) | Servicio remoto, temporalidad dinámica | XYZ Web Mercator; no offline |
| Lugar / puntos de interés | [NPS Desert View](https://www.nps.gov/planyourvisit/event-details.htm?id=50CB608B-E5AF-B9A0-514D50DC0E815734) y [Recreation.gov Grand Canyon](https://www.recreation.gov/gateways/2733) | Referencias consultadas 22-11-2026 | Lat/lon WGS84; Toroweap es aproximado, no punto topográfico certificado |

**Licencias y atribución:** servicios federales WBD/3DHP publican restricciones de uso «None» y agradecen cita USGS. Mapzen/AWS exige conservar atribuciones de los proveedores de elevación; consultar [metadatos de atribución Tilezen](https://github.com/tilezen/joerd/blob/master/docs/attribution.md). MapLibre GL JS usa licencia [BSD-3-Clause](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt). No distribuir teselas de terceros dentro del repositorio, ni exceder políticas de descarga de sus servicios.

**Límites cartográficos:** El HUC8 delimita una **subcuenca hidrográfica**, no el parque nacional completo. El DEM combina fuentes de resolución y datum vertical variables. MapLibre representa en EPSG:3857 y el GeoJSON se consulta en WGS84 EPSG:4326; hay distorsión de escala geográfica fuera de la medición local. `exaggeration=1` no modifica la precisión original del relieve. La red de ríos es una selección dependiente del zoom (`featuretype=1`, umbral de longitud en km) y de la extensión; su carga puede quedar truncada y se indica visualmente. Esto NO es un mapa legal, de navegación segura ni una simulación hidráulica de pendientes/caudales.

## Pruebas ejecutadas y pendientes

- **PASS:** `node --check atlas.mjs`, `node --check tile-data.mjs`.
- **PASS (8/8):** `node test.mjs`: fuentes y encoding, CRS y URL, bbox y paginación, invalidaciones explícitas, identidad HUC8, error HTTP, LRU, coordenadas.
- **QA pendiente `NOT_RUN`:** descarga real AWS Terrarium, respuesta GeoJSON USGS WBD y 3DHP en navegador y CORS, screenshot WebGL, verificación de superposición en 2D/3D, performance Android y accesorios accesibles, aprobación visual humana. El entorno Node/Chromium local no tiene salida a CDN ni al servicio de mapas; no fingir captura ni éxito visual.

## Brechas y aprendizaje preventivo

1. **Etapa:** fuentes → **causa posible:** servicio CORS, latencia, cuota o URL obsoleta → **gate:** probe real de AWS + ArcGIS al iniciar, caché local autorizado si caduca → **test:** 200+GeoJSON y teselas WebGL cargadas → **owner:** estudio 3D → **contraejemplo:** una URL indexada no demuestra descarga en el cliente.
2. **Etapa:** georreferenciación → **causa posible:** uso de un límite de parque en lugar de una unidad hidrográfica → **gate:** atributo `huc8` obligatorio y prueba de superposición por puntos → **test:** vértices en EPSG:4326 alineados en 2D y 3D → **owner:** 3D/atlas → **contraejemplo:** dibujar curvas estéticas sobre un cañón genérico.
3. **Etapa:** evaluación → **causa posible:** confundir test unitario con experiencia GPU móvil → **gate:** dos capturas regional/detalle y prueba táctil real antes de anunciar VERIFIED → **test:** navegación, zoom, capas, errores reales → **owner:** QA 3D → **contraejemplo:** declarar excelencia por pasar 8 asserts.

**Fase y aprobación:** `IMPLEMENTED · STRUCTURAL_QA_PASS · GPU_QA_NOT_RUN · HUMAN_APPROVED=false`.