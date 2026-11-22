# QA · Atlas de una cuenca · 3D W7-08

Identidad: `3d-w7-20261122-08`. Brief SHA `58de659e2aa01c0746d59ca6f95c36bdc59f3030`; flow 3D v2.3.0, SHA256 `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`.

## Antes de implementar: cuatro oráculos

1. **Terreno**: `raster-dem` Mapzen/AWS y una tesela Terrarium 256×256 realmente decodificada; no noise procedural.
2. **Fuente y CRS**: polígono WBD identificado por `huc8=15010002` y red USGS 3DHP; GeoJSON EPSG:4326, render EPSG:3857; dos vistas geográficas reales.
3. **Primer frame**: a 390 y 1440 px, mapa protagonista, panel no invasivo y sin desborde horizontal.
4. **Uso**: del mapa regional a South Rim, Desert View y Toroweap, con 2D/3D, carga cancelable y estados explícitos.

## Ejecuciones y limitaciones

- **PASS (10/10)**: `node test.mjs` ejecutado localmente; coordenadas XYZ, URL sin token, bbox, paginación con **fixtures**, filtro HUC8, capas independientes, cache LRU, errores 503, formato de puntos y prueba de decodificador simulada.
- **PASS código**: `node --check atlas.mjs`, `node --check geo-loader.mjs` y `node --check test.mjs`.
- **PASS shell-only**: Playwright `page.set_content` de HTML sin acceso a CDN, vista 390×844 y 1440×900; `scrollWidth === innerWidth` en ambos. Las capturas locales son **interfaz sin raster WebGL**.
- **NOT_RUN datos reales**: solicitud externa de tesela Terrarium, consulta GeoJSON WBD y consulta 3DHP. Las fuentes oficiales fueron examinadas mediante sus metadatos pero se bloquearon las descargas directas en el entorno.
- **NOT_RUN visual**: screenshot de terreno 3D real, overlay georreferenciado contra relieve, recorridos táctiles, velocidad en Android y comparación multiescala.
- **FIRST_ARTICLE=BLOCKED**: el riesgo máximo es una tesela y dos capas auténticas visibles juntas; sin bytes de origen no se certifica un primer artículo. La salida del validador artístico está pendiente; expediente estructural no equivale a belleza.
- **HUMAN_APPROVED=false**: no existe aprobación humana.

## QA de navegador pendiente (sin sustituciones ficticias)

Abrir enlace Pages con WebGL y conectividad real. Confirmar decoding Terrarium 256×256, WBD HUC8 exacta y 3DHP al zoom z≥9, visitar tres puntos y comparar dos escalas en 2D/3D. Capturar 390 y 1440 con **mapa renderizado**, no solo interfaz; probar panel, gestos y estado FAILED cuando se niega acceso a fuentes.

**Dictamen:** `IMPLEMENTED_CANDIDATE · LOCAL_TESTS_10/10_PASS · SHELL_LAYOUT_PASS · REMOTE_HTTP_NOT_RUN · WEBGL_RENDER_NOT_RUN · HUMAN_APPROVED_NO`.

El prototipo W6 anterior continúa inalterado. No se sostiene que W7 sea artísticamente superior sin imágenes de terreno observadas.
