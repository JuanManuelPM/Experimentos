# QA / LÚMINA W003-01

- **Arte original real:** ImageGen 1536×1024, inspeccionado; AI-ILLUSTRATION, no fotografía de objeto físico.
- **Formatos raster:** maestro + 3 piezas + atlas, todos JPEG originales del trabajo; generados y decodificados con Pillow.
- **Nueve checks locales:** PASS (apertura, RGB, dimensiones, variación tonal). No se confunden con juicio artístico independiente.
- **Relación gráfica:** PASS visual local. Misma escultura, contraste cálido/frío, tipografía de doble registro.
- **Primer artículo:** sí existe, fue inspeccionado en la conversación y su JPEG quedó depositado en GitHub candidato. Validador estructural aún exige captures de 390/1440 para declarar READY_TO_BUILD_NOT_ARTISTICALLY_APPROVED.
- **Responsive 390/1440:** NOT_RUN. Chromium devuelve `net::ERR_BLOCKED_BY_ADMINISTRATOR` para `file://` y `http://127.0.0.1`.
- **Impresión óptica:** NO 300dpi nativos de A2/A1. Archivo de campaña 3000×2000 no inventa detalle en la fuente 1536×1024. Separación de CMYK e ICC: NOT_RUN.
- **Ciego comparativo y evaluación humana:** NOT_RUN; HUMAN_APPROVED=NO.
- **GitHub binarios:** 5 JPEG publicados en rama candidata y `gh-pages`, lectura por ruta y SHA coincidente comprobada. La carpeta ZIP además contiene PNG original y JPEG de calidad 91; el repositorio aloja JPEG optimizados de calidad 82.
- **Aprendizaje preventivo:** publicar bytes de raster, no sólo JSON y HTML. Aún faltan test real de navegador/impresión y criterio humano; un JPEG accesible no certifica dirección artística.
