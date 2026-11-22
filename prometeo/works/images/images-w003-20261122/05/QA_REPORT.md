# QA · MAREA DE VIDRIO · W003-05

**Local 2026-11-22:** cinco PNG generados, decodificados e inspeccionados. Los SHA256 que se listan en MANIFEST.json son de los archivos locales, no hashes de un commit GitHub.

- Primer artículo: escultura fotográfica original ImageGen `1254x1254`. Observación visual **LOCAL_PASS**.
- Fuente sin upscaling: fotografía pegada como máximo en `1254x1254`; salida editorial base `3600x3600`, fuente 1254/300=4.18 pulgadas a 300ppi. **LOCAL_PASS**.
- Primer frame: miniatura de tapa `96x96` y `320x320`, se lee el nombre; contacto de 5 piezas revisado. **LOCAL_PASS**, revisión humana ciega **NOT_RUN**.
- Corregidos errores reales: solapamiento MAREA/DE VIDRIO en póster y banner y pie de tapa demasiado próximo a título; rerender y nuevo contacto. **LOCAL_PASS**.
- 5 modos RGB y dimensiones más checksum: **LOCAL_PASS**, ver manifiesto.
- JPEG/PNG fullres publicados en GitHub: **NOT_RUN**. Los originales se entregan en ZIP local de esta conversación, con código completo y fuente.
- Proof físico / tolerancia de guillotina / perfiles ICC CMYK / plantilla de 12 pulgadas: **NOT_RUN**. **PRINT_READY=NO**.
- Capturas de navegador 390/1440: **NOT_RUN**. Imágenes son arte raster estático, no UI; prueba de thumbnail sí realizada.
- Validación pública de art direction / visited trace canónica: **NOT_RUN**, al faltar enlace público a todos los raster y contraste de versión privada.
- `HUMAN_APPROVED=false`.

**Comparación W002 → W003:** W002 tomó 1254px a full bleed de 3900px (≈101ppi a 12.375in). W003 no amplía foto y prefiere foto de 4.18in en soporte 12in tipográfico generado a resolución final. El cambio medible es la corrección del error de escala; la superioridad estética requiere juicio humano.

**Aprendizaje:** stage=FIRST_ARTICLE; cause=UPSCALING_PHOTO_VS_TRUE_DETAIL; preventive_gate=NATIVE_PLACED_PIXELS_AND_THUMBNAIL; test=SOURCE_WIDTH_VS_PLACED_WIDTH_AND_96PX_READ; owner=IMAGES; rollback=W002_UNTOUCHED.
