# QA técnico · SALA DE CONTROL

- Primer artículo: 5.4154 s, 48 kHz, RMS=0.1261, true peak lineal 4x=0.6573, mono RMS=0.1247. Sin silencio ni clipping digital. Escucha perceptual NOT_RUN.
- Sesión completa: 24 compases / 104 BPM / 56.185 segundos, 48kHz PCM24, 5 stems procesables, 3 versiones, OGG Opus 112kbps para distribución. Archivo WAV/OGG decodificable probado con `soundfile` y `ffmpeg` local.
- Comparación A vs B: 0.10 LU entre -17.03 y -16.93 LUFS. B muestra centro sub L/R mejorado de 0.31 a 0.00 dB; balance timbral y dinámica alterados de forma no equivalente a simple suma de ganancia.
- Máster derivado de la mezcla B: -14.05 LUFS, -2.35 dBTP, crest 13.07 dB. La compresión no debe presentarse como transparencia comprobada por oído.
- Todos PCM <= -1 dBTP; ninguna cancelación total en mono; no clips de muestra, `METRICS.json` adjunto.
- Limitaciones: monitoreo humano, benchmark musical escuchado, Android/WebAudio manual, screenshot real de apertura no ejecutados. Chromium headless se agotó al intentar 390/1440. No se inventan capturas.
- Gate ART-DIRECTION: primer artículo técnico PASS; captura de primera pantalla `FIRST_FRAME_CAPTURE_REQUIRED`, juicio artístico `NOT_RUN`; ninguna acreditación humana.
- Diferencia W002→W003: se añade obra PCM/OGG con A/B nivelado y métricas, y se dejan pendientes las pruebas perceptuales. W002 no fue alterado.
