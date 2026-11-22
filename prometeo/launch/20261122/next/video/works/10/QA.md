# QA · VIDEO W002 / 10 · 2026-11-22

**Evaluación:** `DELIVERED` (prototipo con export demostrable); no `VERIFIED` global ni `HUMAN_APPROVED`. `DEEP-SPEC-1` dio `READY_FOR_FIRST_SLICE` sin errores, que verifica estructura y no excelencia.

| Prueba | Estado | Evidencia |
|---|---|---|
| Captura canvas y audio antes de construir | OBSERVED | Chromium spike 0,55 s; WebM VP8/Opus 12.975 bytes |
| Crear 3 clips de demo audiovisuales | OBSERVED | 3 archivos WebM originales guardados, clips editables 4 en total |
| Exportar primera línea de tiempo | OBSERVED | `original.webm`, 6,25 s según reloj del proyecto, VP8/Opus y 640x360 ffprobe |
| Modificar duración de clip seleccionado y reexportar | OBSERVED | `SALA-DE-MONTAJE-edited.webm`, 5,2 s en proyecto, bytes y SHA diferentes, VP8/Opus persistentes |
| Reimportar la primera exportación WebM | OBSERVED | Importador aceptó metadatos recuperados por seek para WebM de MediaRecorder |
| Cortar clip con cabezal | OBSERVED | pasó de 4 a 5 clips, sin excepciones JS |
| Tres fotogramas y nivel audio | OBSERVED en primera export | PNG 1, 3 y 5 s; audio detectado por ffmpeg `volumedetect`, media cerca de -39,8 dB |
| Simulación de interacción navegador de escritorio | OBSERVED, limitada | Playwright Chromium 1360px, página inyectada y shims para almacenamiento por bloqueo de navegación local |
| Arrastre multitáctil y ajuste de handles por pointer | NOT_RUN | Requiere prueba real de interacción; el código incluye handles y listeners |
| IndexedDB real tras recarga / múltiples dispositivos | NOT_RUN | El entorno de automatización bloqueó localhost; un shim no es prueba de persistencia real |
| Reproducción A/V humana en teléfono / Safari / Firefox | NOT_RUN | Depende de codecs, energía, autoplay y soporte MediaRecorder |
| Verificación de publicación servida por Pages | NOT_RUN | Readback GitHub gh-pages sí, HTTP público no comprobado en esta sesión |

**Fallo detectado y solucionado:** en segundo export el contenedor tenía solo VP8 porque la rutina finalizaba *también* el track de `recordDest`, que es compartido entre exportaciones. Se cambió el cierre para detener solo el track de video capturado. Regresión E2E: dos archivos VP8+Opus.

**Segundo fallo detectado y solucionado:** una previsualización pausada podía quedar negra después de seek; se añadió `loadeddata`/`seeked` con repintado y `load()` explícito. Captura 1360px mostrando frame en t=1s.

**Limitaciones adicionales:** las grabaciones MediaRecorder pueden omitir metadatos duration a nivel contenedor. El editor recupera la duración por seek; para el MP4 de muestra se remuxó/codificó offline con FFmpeg y duración 6.514333 s. El tiempo del proyecto no es exactamente igual a la duración del contenedor por arranque/cierre del codificador.