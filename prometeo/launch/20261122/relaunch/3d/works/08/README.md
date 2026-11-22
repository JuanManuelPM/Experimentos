# Atlas de una cuenca · Grand Canyon · W7-08

**Abrir obra:** https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/3d/works/08/

Atlas navegable 3D de **la subcuenca Grand Canyon del río Colorado (Arizona, Estados Unidos), WBD HUC8 15010002**, no del contorno del Parque Nacional. Usa **elevación Terrarium Mapzen/AWS**, capa **USGS WBD HUC8**, capa **USGS 3D Hydrography Program Flowline** y carta base USGS Topo. No hay mallas geográficas inventadas ni claves privadas en el código.

**Datos:** las capas reales se consultan en vivo cuando la red y WebGL están disponibles; cada fallo se muestra. GeoJSON usa WGS84 **EPSG:4326** y la visualización MapLibre Web Mercator **EPSG:3857**. Las elevaciones se expresan en metros y conservan la heterogeneidad de datums de origen. La escala gráfica cambia con el zoom; las fechas de consulta aparecen en el diagnóstico cuando hay respuestas.

**Interacción:** arrastre, giro y zoom de mapa, perspectiva 2D/3D, cuatro encuadres (regional, South Rim, Desert View, Toroweap), capa de límite, hidrografía, mapa base, hillshade, exageración vertical y panel oculto por defecto en el primer frame. La vista está planteada para móvil 390 y escritorio 1440.

**Módulo reusable:** [geo-loader.mjs](geo-loader.mjs) implementa URLs XYZ Mercator, construcción segura ArcGIS GeoJSON, comprobación de HUC8, paginación, caché LRU y comprobación de imagen Terrarium. [atlas.mjs](atlas.mjs) es el render/recorrido WebGL y [index.html](index.html) la superficie limpia.

**Tests:** ejecutar `node test.mjs` para 10 tests lógicos con fixtures explícitos. Para el atlas usar un servidor HTTP local y un navegador con acceso a CDN, tiles DEM y FeatureServer; sin red no se puede ver el terreno. [QA.md](QA.md) identifica resultados observados vs NOT_RUN. [PREPRODUCTION.deep-spec-v1.json](PREPRODUCTION.deep-spec-v1.json) es el Book; [TRACE.json](TRACE.json) registra trabajo efectivamente realizado, no un flujo 316 nodos imaginado.

**Atribuciones y permisos:** [USGS WBD](https://hydro.nationalmap.gov/arcgis/rest/services/wbd/FeatureServer/4) · [USGS 3DHP](https://3dhp.nationalmap.gov/arcgis/rest/services/usgs_3dhp_all/FeatureServer/50) · [Mapzen/AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) · [attribution Tilezen](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) · [USGS Topo](https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer) · MapLibre GL JS BSD-3-Clause. No se redistribuyen teselas de terceros, se citan proveedores y fuentes. Mapa exploratorio, no válido para navegación ni cálculo hidráulico.

**Comparabilidad:** oldBatch `3d-w6-20261122` (briefSHA `942c3ba8b851137886e959d2790771556e2d9f5d`) vs newBatch `3d-w7-20261122` (briefSHA `58de659e2aa01c0746d59ca6f95c36bdc59f3030`). Se conserva W6. W7 agrega controles de primer frame, probe de DEM y diagnósticos preventivos; **no se atribuye una mejora perceptual observada**.
