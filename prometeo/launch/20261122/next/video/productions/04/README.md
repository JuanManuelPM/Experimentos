# 🎬 W002 · 04 · UNA PALABRA CAMBIA TODO

**Identidad inmutable:** `batchId=video-w002-20261122`, `taskNumber=4`, `taskId=video-w002-20261122-04`. Lanzador: [LAUNCH.md](../../LAUNCH.md); blob SHA leído `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`. Contratos `QBAR-1` y `DEEP-SPEC-1`.

## La obra

Película editorial original de 23 s / 24 fps basada en la **misma frase**: «NO PASA NADA.» Su ortografía permanece inmutable al pasar por tres puestas: (1) consuelo después de un susto; (2) negación en un informe; (3) amenaza del otro lado de una puerta. Epílogo: «LAS LETRAS NO CAMBIARON. EL CONTEXTO SÍ.». Los recursos son texto, gráfica procedimental y audio sintético propio. No se incluyen films, música, voces, fotos o assets de referencias.

Secuencia: `portada 0–2` · `alivio 2–6.5` · `negación 6.5–11` · `amenaza 11–15.5` · `tesis 15.5–18.8` · `cierre 18.8–23`. La partitura y el compositor son deterministas; cada orientación recompone el layout, nunca recorta una versión.

## Archivos

- [Motor temporal Python](temporal_type_engine.py): frame renderer para 16:9 y 9:16 y sintetizador sonoro original.
- [Ficha DEEP-SPEC-1](PREPRODUCTION.deep-spec-v1.json): alternativas, preguntas, 4 referencias inspeccionadas como **páginas textuales** (no metraje íntegro), decisiones, riesgos y pruebas.
- [Eventos sonoros](SOUND_EVENTS.json): tiempos en segundos de las acciones principales.
- [Informe de QA](QA_REPORT.md): evidencia, límites y resultados medibles.

Los masters locales entregados en la conversación son `UNA_PALABRA_CAMBIA_TODO_16x9.mp4` (1280×720) y `UNA_PALABRA_CAMBIA_TODO_9x16.mp4` (720×1280), ambos H.264/AAC, 23 s. **PUBLIC MEDIA VERIFIED:** la ejecución GitHub Actions [#45044560131](https://github.com/JuanManuelPM/Experimentos/actions/runs/45044560131) terminó SUCCESS y publicó [MP4 horizontal](UNA_PALABRA_CAMBIA_TODO_16x9.mp4), [MP4 vertical](UNA_PALABRA_CAMBIA_TODO_9x16.mp4), [WAV original](ORIGINAL_SOUND.wav) y [hashes de CI](CHECKSUMS.txt) en esta rama. Los dos MP4 y el WAV recibieron readback por la API de GitHub. Los archivos CI tienen hashes de MP4 propios, diferentes de los archivos del contenedor local, y sonido WAV con el mismo SHA-256.

## Reproducción / regeneración

Requiere Python 3, Pillow, numpy, FFmpeg, fonts-inter y fonts-noto-core instalados por el sistema. No distribuir las fuentes de terceros.

```bash
python temporal_type_engine.py --spike
python temporal_type_engine.py --render
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height -of json UNA_PALABRA_CAMBIA_TODO_16x9.mp4
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height -of json UNA_PALABRA_CAMBIA_TODO_9x16.mp4
ffmpeg -v error -i UNA_PALABRA_CAMBIA_TODO_16x9.mp4 -f null -
```

Validar la ficha con el validador canónico: `node ../../../../../deep-spec-v1.mjs PREPRODUCTION.deep-spec-v1.json` si se ha ajustado la ruta correctamente al árbol local, o desde la raíz: `node prometeo/launch/deep-spec-v1.mjs prometeo/launch/20261122/next/video/productions/04/PREPRODUCTION.deep-spec-v1.json`.

## Benchmark y brecha

1. [Studio Dumbar / DEMO 2025](https://studiodumbar.com/work/demo-2025): tipografía como sistema y sonido diseñado en respuesta al motion, apto para distintas pantallas. Decisión: compositor adaptativo y partitura común.
2. [Saul Bass / North by Northwest, Art of the Title](https://www.artofthetitle.com/title/north-by-northwest/): composición tipográfica y grilla al servicio de una progresión narrativa de tres ambientes. Decisión: una frase que conserva identidad y cambia de entorno.
3. [BUCK / Illumina](https://buck.co/work/illumina): motion vinculado a propósito narrativo y sonido, no transiciones por plantilla. Decisión: seis movimientos semánticos.
4. [Walker Art Center / Conditioning](https://www.walkerart.org/reader/conditioning-typography-and-moving-image/): tipografía que condiciona la interpretación emocional. Decisión: contraste de aire, control y amenaza.

**Evidencia no equivale a excelencia certificada:** se verificó codificación real y decodificación íntegra de ambos archivos producidos en el entorno local. La escucha crítica externa, la prueba con espectadores y la aprobación humana **no se realizaron**. El rendimiento y las fuentes disponibles pueden variar en CI.

## Estado

`LOCAL_VIDEO_ENCODED` + `AUDIO_PRESENT` + `FRAME_QA_OBSERVED` + `SOURCE_PUBLISHED_IN_CANDIDATE`. `HUMAN_APPROVED=NOT_RUN`, `PUBLIC_MP4=GITHUB_READBACK_VERIFIED`, `GITHUB_CI=SUCCESS`. La reproducción en dispositivo humano sigue NOT_RUN. No sobrescribir W001 ni otros números. Esta rama es exclusivamente el encargo 04.
