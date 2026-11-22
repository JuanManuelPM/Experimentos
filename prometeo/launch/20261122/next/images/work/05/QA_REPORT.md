# MAREA DE VIDRIO · QA del W002-05

| Criterio | Evidencia | Estado |
|---|---|---|
| 5 medios principales | JPG 3900² (tres), 2400×3600 y 3840×2160 medidos localmente | OBSERVED LOCAL |
| Reducción a 96px | Miniatura de tapa generada e inspeccionada | OBSERVED LOCAL |
| Continuidad visual | Contact sheet del mismo máster, no cinco obras sin canon | OBSERVED LOCAL |
| Exactitud tipográfica | Letras compuestas con Pillow, no raster de generador | OBSERVED LOCAL |
| Convierte a CMYK | TIFF LZW 3900² con cuatro canales, sin ICC de imprenta | OBSERVED / PREVIEW ONLY |
| Res. real de fuente | Máster 1254² ampliado a 3900² | FAILED FOR NATIVE 300PPI |
| Arte publicado en GitHub | No se consiguió escritura binaria de los rasters con los conectores accesibles | NOT_RUN |
| Impresión física | No hay taller, perfil, plantilla o pliego validado | NOT_RUN |
| Aprobación humana | No recibida | NOT_RUN |

**Veredicto honesto:** producción raster final descargable en esta conversación, diseño reutilizable en ZIP, y evidencia textual en la rama exclusiva. No afirmar `VERIFIED_PUBLIC_MEDIA`, `PRINT_READY` ni `HUMAN_APPROVED`.

**Riesgo estratégico:** el reescalado no crea detalle fotográfico adicional. Para impresión premium, primero nueva fuente nativa o tratamiento de superresolución inspeccionado sobre detalles, luego preprensa con un taller real.

**Originalidad:** ningún archivo de Bedow, Maimon, Monotype o terceros fue incorporado. Las referencias se usaron para extraer criterios, no para copiar elementos.
