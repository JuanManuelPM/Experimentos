# QA · EL CALOR OCULTO · W003/09

## Oráculos definidos y evidencia

| Oráculo | Resultado | Evidencia |
| --- | --- | --- |
| Misma calle y cámara, única variación árbol/sombra | **PASS local** | `base_scene()` se invoca una vez; `tree_scene()` copia el fondo. Test de cinco hitos del edificio sin cambios. |
| Dos raster genuinos, formatos nativos | **PASS** | A4 `2480×3508`, mobile `780×4100`, PNG RGB y WebP. |
| Lectura real a 390/1440 | **PASS local** | Chromium con mismos WebP incrustados, `naturalWidth=780/2480`, `scrollWidth=innerWidth=390/1440`. Capturas remotas `QA_browser_390.webp`, `QA_browser_1440.webp`. |
| Tabla de procedencia y unidades | **PASS fuente** | EPA 308 estudios/1,6 °C; Montevideo tres calles/>2× **proporción** de confort declarado. |
| Cuatro tests de regresión `unittest` | **PASS local** | `python test_heat.py` (en entorno con Pillow/Inter y los PNG en `/mnt/data`). |
| Integridad de WebP en GitHub | **PASS metadata** | blob SHA1 coincide con GitHub y tamaño real; no es imagen simulada ni enlace a un archivo inexistente. |
| Contraste editorial normal >=4.5:1 | **PARTIAL** | Tinta verde sobre blanco 4,88:1; terracota sobre marfil aprox. 3,39:1 para algunas leyendas pequeñas, pendiente corrección de paleta. |
| Impresión física / ICC / prueba de lectores | **NOT_RUN** | Ninguna imprenta, perfíl CMYK ni lectores externos. |
| Pages público vía GET desde el navegador | **NOT_RUN** | Sólo Chromium local y GitHub SHA/metadata; no se presume HTTP público de Pages. |
| Revisión artística independiente / humano | **NOT_RUN** | No existe aprobación humana. |

## Integridad de los rasters tras corrección semántica

Los blobs finales de los cuatro WebP se insertaron por contenido **base64 auténtico** (no HTML ni placeholders). GitHub reporta exactamente sus tamaños y SHA. Los PNG maestros sin pérdida están disponibles en el turno del chat que generó esta obra; en GitHub el formato raster de entrega es WebP por transporte y peso de archivo.

La vista 390 observada contiene título y el primer panel; la 1440 observada muestra el título y la comparación completa en la primera pantalla. El responsive usa `<picture>`, no una segunda interfaz de botones. El HTML observado fue una reproducción local con imágenes de datos incrustadas, no un GET remoto del archivo alojado.

## Primera pieza y reemplazo de estrategia

**FALLÓ:** generador pictórico sin restricción espacial produjo arquitectura no comparativa. **CAMBIO DE FAMILIA:** ilustración raster geométricamente determinada en Pillow. Las marcas del rostro, ventanas, camino, horizonte y sol parten de la misma función. El resultado se comprobó con inspección ocular local y tests de pixeles. El dibujo tiene limitación artística: composición editorial clara pero ilustración sencilla, no iguala el benchmark de SCMP.

## Estado metodológico

QBAR-1 + DEEP-SPEC-1 + ART-DIRECTION FIRST-ARTICLE-1 aplicados a la ficha. La validación lógica de estructura no acredita calidad percibida; la topología privada exacta de nodos no se inventa. `HUMAN_APPROVED=NO`. Sin sobrescritura de W001/W002 ni promoción del flujo propietario.

## Dimensiones y SHA tras el último render

- Póster A4: `el_calor_oculto_A4_300dpi.webp`: 2480×3508.
- Móvil: `el_calor_oculto_mobile.webp`: 780×4100.
- Capturas Chromium: `QA_browser_390.webp` (390×844); `QA_browser_1440.webp` (1440×900).
- Escena base compartida: `base_scene()`; superposición: `tree_scene()` en `render_heat.py`.
