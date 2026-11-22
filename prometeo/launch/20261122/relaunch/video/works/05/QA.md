# EL CORREDOR · W003/05 · QA y comparación

**ID:** `video-w003-20261122-05` · **rama:** `candidate/prometeo-video-w003-20261122-05`.
**LAUNCH SHA:** `0cc574528594731a3d1cf0c15a0d0e5a37e775b7` · **brief W002:** `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`.
**Capturado:** 2026-11-22T19:12:28.248Z · **HUMAN_APPROVED:** NO.

## Resultado observado y límites

- **VIDEO_EXPORT_LOCAL_PASS:** `EL_CORREDOR.mp4` se renderizó localmente; 14.000 s, 960×540, H264, 24fps, 336 cuadros, audio AAC estéreo. Archivo de 4.687.476 bytes, SHA256 `c13dc36c8c8800bf1c0380e7fe3b75fb2b228187d6b09640b08163fd9f04e5be`.
- **VIDEO_DECODE_LOCAL_PASS:** FFprobe y FFmpeg `-f null -` sin errores; fuente render `render.py` local SHA256 `1e794db1f65d895cd0c84e2ad651d49921a1d8e864c055ee1c499b4af396c6be`.
- **PRIMER ARTÍCULO OBSERVADO → PERCEPTUAL_FAIL:** fotogramas 1.2s, 7.0s y 11.7s inspeccionados directamente; oclusión y continuidad presentes, pero siluetas de personas no satisfacen actuación realista. No se certifica lectura del giro narrativo.
- **STRATEGY CHANGE:** W002 reportó 3D de primitivos y falta de foco/renderer público; W003 usa ilustración 2D con parallax y foley originales, MP4 decodificado. La modificación de técnica no implica incremento de calidad.
- **FOCUS_OPTICAL:** NOT_IMPLEMENTED; distancia en planner es guion, no profundidad de campo real.
- **REPRE­SENTATION_GATE:** SWITCH_REPRESENTATION. Para obra final con actuación es necesario rodaje con intérpretes cedidos o recurso audiovisual profesional legal.
- **BROWSER_390_1440, TEST_CIEGO, AUDIT_SYNC_LISTEN:** NOT_RUN.
- **REMOTE_MP4:** MISSING. El binario quedó como adjunto local de la conversación, no se subió a GitHub ni Pages; nunca mostrar enlace falso a video público.
- **PLANIFICADOR REMOTO:** archivo HTML publicado en rama candidata exclusiva; readback y ejecución de navegador pendientes.

## Estado y comparación

`oldBatchId=video-w002-20261122`, `newBatchId=video-w003-20261122`.
Antes: 14s 960×540, MP4 local, planner HTML, 3D de geometría simple, foco no implementado, binario remoto faltante.
Después: 14s 960×540 24fps, MP4 nuevo local decodificado, foley original, arte de silueta 2D; se sigue sin alcanzar el acting solicitado y no hay publicación remota del binario. **No hay evidencia de mejora artística.**

## Autoría/licencias

Código e ilustración dibujados desde cero y síntesis de sonido original. Ninguna toma real ajena o grabación personal fue usada. La versión anterior y las otras tareas W003 no se modificaron.
