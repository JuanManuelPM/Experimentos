# 🎬 PULSO EN LA MATERIA · video-w003-20261122-06

**ESTADO:** LOCAL_MP4_DECODE_PASS · BROWSER_SOURCE_PUBLISHED · REMOTE_MP4_MISSING · HUMAN_APPROVED=NO.

## Película original

Videoclip de **24 segundos** realizado para esta tarea: música electrónica inédita de 100 BPM, cinco movimientos de 4,8 s (germinación, fricción, fractura, vacío y resonancia), diez compases y montaje dirigido por cambios de frase musical, silencios y energía. La animación es arte abstracto procedimental, no metraje de actores ni archivo de terceros.

- **Máster local real:** MP4 H.264/AAC 640×360, 16fps, 384 fotogramas, 24s. SHA256: `83c0041a32966e02bb6c57f9c03f7c755eff7184cb6eb6b2712ee2a2a4c853b2`.
- **Mezcla original local:** WAV PCM16 44.1kHz estéreo, 24s. SHA256: `5fdb4ee11bf4a4a7732e09b54b62b414ae309c53cb3a928f2b58d29e0ff2ad4b`.
- **Fuente exacta del render:** `build.py` (17.126 bytes), SHA256: `f5fb0705fb378c99642423154eb1819a445375c46919b92725573ab9d1799362`.
- **Primer artículo local:** MP4 de 2,4s y tres frames, SHA256: `2dcc7cc49a4e68625f2156e2ed781adf5d34ba6616e4774423814bc7017159cb`.

Los archivos locales nombrados arriba se entregan en el paquete descargable de la conversación. **No se subieron a esta rama como binarios.** Se preserva expresamente ese límite para no repetir el falso 'video publicado' señalado en la auditoría W002.

## Obra reproducible y código en la rama

[Abrir interpretación audiovisual en HTML](index.html): Canvas + WebAudio con motivos/secciones del mismo encargo. Reproduce audio sintetizado en navegador y ofrece exportación WebM cuando MediaRecorder está disponible. **No es una copia bit a bit del MP4/WAV locales.** El código existe y es editable; QA real de navegador y Android: NOT_RUN.

[Planificador reutilizable](cut_planner.mjs) · [Secuencia editable](EDIT_SEQUENCE.json) · [Preproducción única (DEEP-SPEC + ART-1)](PREPRODUCTION.deep-spec-v1.json) · [QA técnica](MEDIA_QA.json) · [Traza real de etapas](STAGE_TRACE.json).

## QA y diferencias relevantes

- ffprobe validó video H264 y audio AAC con duraciones exactamente 24s y 384 frames; ffmpeg decodificó el archivo completo sin errores.
- RMS por movimiento: 0.12677 / 0.15898 / 0.18892 / 0.03646 / 0.14104. La ventana de pausa (17.72 a 17.94 s) registra RMS 0.00486. Pico PCM 0.7281, sin clipping.
- Se inspeccionaron diez imágenes genuinas del video. La representación inicial repetía un disco demasiado similar y se cambió por pliegues de metal, fractura y un solo filamento en el silencio.
- Referencia de aspiración: imágenes publicadas de *Repetition* (Max Cooper y Kevin McGloughlin), descripciones del proceso de *Maps* (Max Cooper), sistema *test pattern* (Ryoji Ikeda). Se inspeccionaron imágenes/textos públicos, NO los videos completos. No se usó ningún material protegido en la obra.
- El gate estructural de DeepSpec no certifica calidad. Capturas de navegador a 390/1440, escucha externa y aprobación humana: NOT_RUN. El grafo privado especializado de Video no se recuperó con versión/SHA verificable.

## Comparabilidad y licencia

oldBatchId `video-w002-20261122` (brief blob `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`); newBatchId `video-w003-20261122` (brief blob `0cc574528594731a3d1cf0c15a0d0e5a37e775b7`). Se preservan la tanda y trabajos históricos. La W002/06 tenía fuente y QA reportada, pero MP4 remoto faltante. Esta W003/06 agrega video local decodificable y cambia estrategia visual, sin declarar mejora artística causal demostrada.

El audio, los píxeles y el código se crearon para este encargo, sin samples ni footage externo. Publicación de código nuevo bajo CC0-1.0 hasta donde corresponda legalmente.
