# UNA PALABRA CAMBIA TODO · W003 / 04
**Identidad fija:** `video-w003-20261122-04` · `taskNumber=4` · `room=video` · LAUNCH blob `0cc574528594731a3d1cf0c15a0d0e5a37e775b7`.

Película original sobre el cambio de significado de una misma frase: **«TE ESPERO.»** La puesta cambia de una promesa cálida («A LA SALIDA»), a una duda («DESPUÉS DE TODO»), y finalmente a una advertencia («NO TENÉS ELECCIÓN»). La puntuación y el movimiento cambian función con el contexto; no es una sucesión de entradas de texto con un preset único.

**Ver el motor audiovisual público:** https://juanmanuelpm.github.io/Experimentos/prometeo/works/video/w003/04/

## Producto y sistema reusable
- `index.html`: película Canvas con composición vectorial determinista `renderAt(t)`, dos superficies 960×540 / 540×960, línea de tiempo declarativa, reloj de 26 segundos, síntesis Web Audio, exportación WebM con MediaRecorder.
- `render.py`: renderiza cuadros reales del mismo Canvas con Playwright y FFmpeg (24fps, 624 fotogramas por orientación).
- `score.py`: partitura sonora original reproducible en WAV 44.1 kHz estéreo; fases acústicas por significado y pausas.
- `PREPRODUCTION.deep-spec-v1.json`: Book DEEP-SPEC+FIRST-ARTICLE.
- `QA.md`: pruebas, pruebas no realizadas, comparación W002/W003, fuentes de referencia y licencias.
- `FLOW.json` y `TRACE.json`: identidad/flujo y eventos observados.
- Los dos master MP4 reales también quedaron publicados y leídos remotamente en esta rama mediante el workflow GitHub Actions. El render remoto tiene hashes distintos del local y el archivo QA_CI.json fija el hash y los streams de la ejecución CI. Los MP4 locales se entregan además como archivos de conversación.

## Reproducir/exportar
Abrir `index.html`, botón reproducir, cambiar aspecto y descargar WebM. Para dos MP4 reproducibles localmente: `python -m pip install playwright numpy scipy`; `python -m playwright install chromium`; `python render.py && python score.py`; por cada orientación ejecutar `ffmpeg -i UNA_PALABRA_CAMBIA_TODO_16x9_SILENT.mp4 -i SCORE_ORIGINAL.wav -c:v libx264 -crf 19 -c:a aac -b:a 160k -shortest UNA_PALABRA_CAMBIA_TODO_16x9.mp4` (sustituir 9x16 para el otro formato).

**Licencias:** texto, diseño, curvas, composición y audio creados en esta ejecución. Sin fotografía de archivo, música, voces ni material protegido de terceros. Usa la fuente de sistema cuando Inter no está presente; las instancias de Inter disponibles localmente tienen licencia OFL, pero no se redistribuyen archivos de fuente.

**Estado:** local y remoto H264/AAC decodificables, export GitHub Actions y readback de 2/2 MP4 **PASS**, fotogramas 390/1440 revisados localmente; prueba de audiencia independiente, escucha artística y aprobación humana **NOT_RUN**. La versión W002 permanece intacta.
