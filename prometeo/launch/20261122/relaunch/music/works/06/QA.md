# QA / WORK 06 W003 — 2026-11-22

- **Trabajo:** MÁQUINA IMPERFECTA, music-w003-20261122-06.
- **Primero se renderizó:** FIRST_ARTICLE.wav, 4 compases, 8.592 s, 44.1kHz/24-bit stereo; pico 0.90; coherencia de stems en memoria: error máximo 3.725e-9.
- **Después se renderizó:** 64 compases, 124 BPM, 124.721 s. MASTER.wav PCM24, MASTER.flac FLAC24, MASTER.mp3 192kbps, 6 stems FLAC24 y AB_BASE.wav / AB_DARK_SEQUENCE.wav.
- **Pruebas:** 6 tests Python PASS; reapertura por importlib.reload + re-render: SHA256 de audio PCM igual; efecto de parámetros distinto de cero.
- **Paridad:** suma FLAC24 de seis stems vs master FLAC24 max absolute difference 3.5762786865234375e-07. True peak FFmpeg -0.9 dBTP. Integrado -15.5 LUFS, LRA 3.5 LU. Máximo sample peak 0.90.
- **Estructura comprobada por RMS:** ACTIVATION -16.5 dBFS; CIRCUIT A -15.27; BROWNOUT -19.30; CIRCUIT B -15.04; GHOST SIGNAL -17.05; POWER DOWN -17.05.
- **A/B**: misma sección y notas, sólo secuencia más oscura; RMS igualado a 0.000001 dB de diferencia.
- **Pendiente/NOT_RUN:** escucha humana integral o A/B perceptual, screenshots de apertura 390/1440 por Chromium bloqueado, media binaria GitHub readback, verdadero player remoto en Pages.
- **No fingir:** GitHub publicando texto fuente NO equivale a audio público. El paquete binario auténtico existe en la entrega del chat y puede recrearse en un entorno Python. HUMAN_APPROVED=NO.
- **Comparación W002:** esta versión usa 44.1kHz, no 24kHz, y documenta pruebas nuevas. No se hicieron escuchas a ambos masters ni se puede inferir superioridad artística.
