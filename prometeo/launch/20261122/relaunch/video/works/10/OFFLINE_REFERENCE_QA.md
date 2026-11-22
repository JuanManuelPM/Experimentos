# QA DE RENDER DE REFERENCIA OFFLINE · VIDEO W003 / 10

**Evidencia obtenida en la misma ejecución W003, después de publicar el editor.** Este render NO se produjo mediante el `MediaRecorder` de `index.html`; se creó con un renderizador Python+OpenCV+FFmpeg independiente que interpreta el mismo modelo EDL de cuatro clips `start/in/out/fade/opacity/volume/trackId`, con tres imágenes animadas y audio original. El código y los binarios de ejemplo existen **en el paquete adjunto a la conversación WORK**, pero **no fueron subidos a GitHub**. Por eso `PUBLIC_WEBM_VERIFIED=NO` y `BROWSER_EXPORT_VERIFIED=NO`.

## Comparación de archivos y mediciones

| Referencia | EDL | Contenedor FFprobe | Streams | SHA256 |
|---|---:|---:|---|---|
| `SALA-DE-MONTAJE-W003-reference-original.webm` | 6.25 s | 6.258 s | VP8 640×360 + Opus 48kHz | `693790f157ec49f214f5ef8538131289eaa471ca8ae6f04b5ab00a202d996b9e` |
| `SALA-DE-MONTAJE-W003-reference-edited.webm` | 5.25 s | 5.258 s | VP8 640×360 + Opus 48kHz | `6c999731404a8b78eddeb19e841672d87da189eb9f027a91e389e518093c0a9b` |
| `SALA-DE-MONTAJE-W003-reference-original.mp4` | 6.25 s | NOT_RECORDED (sin lectura FFprobe aparte) | H264/AAC solicitados en FFmpeg, no inspección stream separada | NOT_RECORDED |

La transformación offline acortó en 1.0 segundos la salida del último clip `V1`, desde `out=2.35` a `out=1.35`. Ambos WebM fueron inspeccionados con FFprobe, que devolvió VP8 y Opus, y sus hashes difieren. La señal de audio del original se midió con FFmpeg `volumedetect`: media `-26.7 dB`, pico `-17.8 dB`; no sustituye escucha humana. Se extrajeron e inspeccionaron visualmente cuadros de `0.3, 1.5, 2.6, 4.25, 5.6 s` en una hoja de contacto.

## Diferencia de método

- W002: reporte de export navegador con shim y sin persistencia real comprobada.
- W003: editor fuente publicado con ZIP portable, unidad ZIP V8 comprobada; export/browser E2E sigue `NOT_RUN`.
- W003 complemento offline: dos archivos WebM reales y un MP4 generados desde el mismo EDL, **no** equivalen a comprobar un export dentro del editor.
- First article para el riesgo principal sigue `FIRST_ARTICLE_REQUIRED`. No hay promoción del flujo de Video ni `HUMAN_APPROVED`.

No se enlazan URLs públicas de medios inexistentes: los archivos del paquete de chat son locales a la conversación y no están alojados en GitHub Pages.
