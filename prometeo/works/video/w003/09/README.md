# Antes de la tormenta · W003/09

**TaskId:** `video-w003-20261122-09` · **Room:** video · **Estado:** DELIVERED_CANDIDATE, MP4 real publicado, QA técnica CI PASS, HUMAN_APPROVED=NO.

## Obra
14 s originales, faro y espigón, transición climática compartida con niebla, ráfagas, oleaje, cámara dolly, vegetación, cuerda, highlights húmedos, lluvia en profundidad, luz y sonido original sincronizado. Capa procedural estilizada, no captura fotográfica ni VFX fotorrealista.

[Ver la página](index.html) · [Render reproducible](render.py) · [Book](PREPRODUCTION.deep-spec-v1.json) · [Primer artículo](FIRST_ARTICLE_7-13.mp4) · [Prueba visual](FIRST_ARTICLE.contact.png).

## Diferencia real frente a W002
La auditoría candidata W002/09 detectó cámara casi fija y lluvia visualmente dominante. La nueva rama añade camera push-in 7.1%, tracking lateral, capa cercana independiente de cuerda/bolardo/juncos, reflejos dependientes de lluvia, densidad de gotas reducida y muestras cercanas al relámpago. Se conserva motor atmosférico como fundamento legible, sin reescribir ni reemplazar el original.

## Reproducción
```bash
python -m pip install "numpy<3" opencv-python-headless Pillow scipy
python render.py --output ANTES-DE-LA-TORMENTA-W003-09.mp4 --seconds 14 --width 800 --fps 24
ffprobe -v error -show_entries format=duration:stream=codec_name,codec_type -of json ANTES-DE-LA-TORMENTA-W003-09.mp4
```
Primera muestra crítica: `python render.py --output FIRST_ARTICLE_7-13.mp4 --seconds 6 --width 640 --fps 18 --article-start 7`.

## Integridad y límites
Brief W003 blob `0cc574528594731a3d1cf0c15a0d0e5a37e775b7`; W002 blob `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`. Contrato Q-LOOP/QBAR/DEEP-SPEC y ART-DIRECTION recuperados; flow de estudio en pruebas sigue con migración pendiente, no hay promoción fingida. Una ejecución estructural no mide calidad visual. Captura real del film, decodificación, escucha, navegador y juicio humano se reportan solamente tras observarse. Recursos visuales y sonido procedurales originales; ninguna licencia externa invocada para footage.

## Primera prueba rechazada y técnica alternativa
El primer artículo 7–13 s fue exportado y decodificado en CI, pero la inspección visual detectó lluvia dominante y faro esquemático. **FAILED_PERCEPTUAL**. La segunda técnica usa `volume.py`: integración óptica en 12 capas 3D, transmisión de Beer-Lambert, luz dispersada y lluvia en profundidad. No es un retoque de cantidad de partículas. La aprobación visual no se presupone.

## Entrega real W003/09 · resultado publicado
[Película MP4 de 14 segundos](ANTES-DE-LA-TORMENTA-W003-09.mp4) · [Primer fotograma](poster.jpg) · [Contact de fotogramas auténticos](FINAL.contact.png) · [QA e informe](QA.json) · [Captura Chromium 390](FIRST_SCREEN_390.png) · [Captura Chromium 1440](FIRST_SCREEN_1440.png) · [Segundo primer artículo](SECOND_ARTICLE_7-13.mp4).

Action de render: https://github.com/JuanManuelPM/Experimentos/actions/runs/45060077552 — SUCCESS; FFmpeg decodificó toda la película, FFprobe verificó exactamente 14 s, 336 frames, 800×450, H264 24fps y AAC estéreo 48kHz; SHA256 `df4baee1a1d29698e39ff5309254f337aacc736851bbd2e39343b9c30f472860` (CI). Archivo visible por GitHub Contents, blob `8906e853aee847ff2bd0d3e9da91c3114856af7f`, 1.214.162 bytes. Audio RMS temprano `0.0143`, tormenta `0.0707`, trueno `0.1183` (prueba numérica, no escucha artística). Capturas Chromium a 390 y 1440 abiertas e inspeccionadas, controles visibles. No se probó reproducción tocando Play en Android, Pages HTTP, ni hubo aprobación humana.

**Juicio artístico limitado:** el cambio de técnica eliminó la cortina densa de rayas diagonales del primer artículo, pero el faro aún se ve deliberadamente ilustrado y la cámara no alcanza nivel de cinematografía realista. No reclamar equivalencia con las referencias profesionales.
