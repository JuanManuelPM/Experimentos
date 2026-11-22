# VIDEO W003/08 · QA de la obra

## Observado

- La serie NASA pública **1880–2025** está congelada en CSV con Git blob comprobado `01c44c2b20156c2fe73cdc295e1324745411597c`, **mismo snapshot que W002**, no una cifra inventada de 2026.
- Numérico: 146 observaciones consecutivas, sin smoothing, sin extrapolar 2026. Anclas exactas 1880 `-0.17`, 2024 `1.28` y 2025 `1.18` °C.
- Gráfico: eje Y lineal fijo `[-0.6, +1.4]` °C en todos los cuadros y todos los formatos; cero y unidad rotulados. El paso temporal solo revela mediciones existentes.
- First article: el raster 16:9 cortaba los textos al reusarse en 390px. Se construyó render nativo 9:16 y se inspeccionó su captura de 390 px sin recortes del título; master horizontal inspeccionado a 960 y póster de 1440 reescalado, sin atribuirlo a una prueba de navegador.
- Ambos MP4 están realmente presentes, contienen audio AAC y video H.264, FFprobe informa **24,0 segundos** para ambos y FFmpeg decodificó el 100% sin errores. 576 frames 960×540 a 24 fps; 480 frames 540×960 a 20 fps.
- Contraste nominal de tipografía primaria, secundaria y acento contra fondo oscuro por ratio WCAG >=4.5 calculado; no implica una auditoría WCAG completa.

## Pendientes independientes

- Escucha crítica en parlantes / teléfono, comprensión por espectadores y edición periodística externa: **NOT_RUN**.
- Navegación en GitHub Pages y Android real: **NOT_RUN** hasta readback remoto. Que un HTML exista no demuestra el navegador.
- Revisión de legibilidad 390/1440 en navegador real, lector de pantalla y subtitulado semántico extendido: **NOT_RUN**. Se evaluaron raster y anchos tipográficos con Pillow, no lectores de pantalla.
- `HUMAN_APPROVED=NO`. El análisis lógico no acredita calidad audiovisual superior a W002.

## Evidencia y control de integridad

- H.264 horizontal `sha256 4d71a5330b91555fb352dff52633febe6f0990593aae3bf747497eb7a1a95d08` (Git blob `c314ebde8c2544dc98bf447ac2a4c88a0bc540e3`)
- H.264 vertical `sha256 e6190508b95ed4ae623c776c5eff17dbb8185ce67f749876d26d21ded32086fc` (Git blob `59c464cd1346c7ffeb2652949330b05e66814132`)
- Usar `python qa_tests.py` para repetir la inspección. No confundir bytes publicados con aprobación artística.
