# QA REPORT · VIDEO W002 · 04

**Producción técnica observada en contenedor local; sin declaración de aprobación artística.** Fecha: 2026-11-22.

| Prueba | 16:9 | 9:16 |
|---|---|---|
| Archivo final | `UNA_PALABRA_CAMBIA_TODO_16x9.mp4` | `UNA_PALABRA_CAMBIA_TODO_9x16.mp4` |
| Dimensión | 1280×720 | 720×1280 |
| Duración / fps | 23.000 s / 24 fps | 23.000 s / 24 fps |
| Video | H.264 | H.264 |
| Audio | AAC / 48 kHz | AAC / 48 kHz |
| Decodificación completa | PASS (`ffmpeg -f null -`) | PASS (`ffmpeg -f null -`) |
| Inspección de frames | 1, 3.5, 8.5, 13, 17 y 20.9 s | mismos seis tiempos |
| Estado perceptual | OBSERVACIÓN DE FRAMES, NO JURADO | OBSERVACIÓN DE FRAMES, NO JURADO |
| SHA-256 local | `971a6a14f7ceb64564dca38ba6ffd6edf143952acbcd7e99492350ae9e0eeb44` | `c92901f7b2086a929089f27f66bd5478bd6ae3e058701da08dbb40e1845e38da` |

### Gates

- `DEEP-SPEC-1`: READY_FOR_FIRST_SLICE, cero errores, ejecutado con el código del validador público.
- `EXPORT_SPIKE`: PASS, MP4 H.264 640×360 + audio AAC, 1.000 s reales.
- `SOURCE_MATCH`: escenario, función de render y mezcla usan un reloj en segundos y cortes a 2.0, 6.5, 11, 15.5, 18.8, 23.
- `PHRASE_INVARIANT`: `NO PASA NADA.` en los tres contextos.
- `AUDIO_PEAK`: WAV sintético original 48 kHz estéreo, volumen máximo medido -7.3 dBFS; sin sample terceros.
- `SCREEN_RECOMPOSITION`: 2 frames/canvas independientes, sin crop.
- `FULL_AUDITORY_LISTEN`: NOT_RUN, no confundir análisis de señal con evaluación auditiva humana.
- `EXTERNAL_PUBLIC_ASSET`: NOT_VERIFIED hasta lectura desde GitHub; no confundir commit de fuentes con vídeo público.
- `HUMAN_ART_APPROVAL`: NOT_RUN.

### Defectos y próximos gates especializados

- Metadatos pequeños en la previsualización reducida. Gate: lectura en pantalla real de teléfono, no declarada.
- La semántica de 'negación' depende de un marco secundario y de sonido: test de comprensión sin explicación con espectadores externos, aún NO EJECUTADO.
- El rigor sonoro es temporal, pero la expresividad de la mezcla necesita escucha crítica independiente.
- Ninguna comparación con premios o estudios externos demuestra paridad de dirección artística.
