# QA · EL CALOR OCULTO · 09

**Observado:** render de píxeles y hoja de contacto, sin OCR automatizado. La escena original tiene continuidad semántica entre mitades; es conceptual y no prueba geometría física exacta ni termografía. Se corrigió un título móvil que se desbordaba durante inspección.

| Criterio | Evidencia | Estado |
|---|---|---|
| PNG A4 300 dpi | 2480 × 3508 px, metadata DPI y lectura Pillow | OBSERVED |
| Raster móvil | 3 × PNG, 1080 × 1920 | OBSERVED |
| Fuente 11–25 °C | EPA Ambiental Benefits, °F convertido por fuente a °C | OBSERVED |
| Fuente > 2× | Cruz et al. 2024, encuestas en tres calles | OBSERVED |
| Variable térmica | Se rotula SUPERFICIES, no temperatura del aire; nota NASA | OBSERVED |
| Cuadro mecanismo | Tres vías: sombra, pavimento y evapotranspiración; pictogramas propios | OBSERVED |
| Etiquetado redundante | «CALLE ARBOLADA» / «SIN SOMBRA» y descriptores, no solo color | OBSERVED |
| Texto mobile/print | Render tipográfico real e inspección de contacto | OBSERVED, prueba externa NOT_RUN |
| Accesibilidad WCAG | Colores principales evaluados por contraste | OBSERVED técnico, no auditoría completa |
| Lectura real por desconocidos | No hay sesión de lectores externos | NOT_RUN |
| Prueba de impresión en papel | No hay impresora conectada | NOT_RUN |
| Calificación profesional externa | No hay crítico independiente | NOT_RUN |

**Brechas:** legibilidad de referencias muy pequeñas en miniatura impresa; teléfono físico no probado; efecto visual puede sugerir causalidad universal si se ignoran las notas. Prioridad futura: validar tres preguntas de comprensión con lectores externos, comprobar lectura a ancho 360 CSS px y realizar impresión con carta de prueba.

**Aprendizaje de método:** `stage=layout`, `cause=long mobile title overflow`, `preventive_gate=measure text bbox against available width`, `test=thumbnail screenshot + line width`, `owner=images`, `counterexample=primer título “UNA CALLE, DOS SOMBRAS” cortado en ancho móvil`. Corregido en el trabajo 09.

**Publicación:** la rama exclusiva contiene los archivos permitidos y evidencia. No interpretar validación estructural de DEEP-SPEC como aprobación artística.

**Gate estructural ejecutado:** `node deep-spec-v1.mjs PREPRODUCTION.deep-spec-v1.json` => `READY_FOR_FIRST_SLICE`, `errors: []`. Esto no certifica excelencia artística. Readback de JPEG de impresión y PNGs móviles confirmado por SHA de blob GitHub; PNG A4 completo disponible como adjunto local, no subido por límite de transporte de la API.