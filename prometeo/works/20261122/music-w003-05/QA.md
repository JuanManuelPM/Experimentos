# QA · MUSIC W003 · 05 · Cartografía del sueño
Task: music-w003-20261122-05. Flow 2.0.0 FROZEN_CANDIDATE (blob 1423f13e08b743f418c42052613a6808b214d622). LAUNCH blob 5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b.

## Primer artículo antes de multiplicar
Render Python de 24 segundos. FLAC 44.1 kHz / 2 canales; peak 0.5800; RMS -15.35/-15.79 dBFS, delta máximo 0.0666/0.0802, error máximo al sumar stems 2.38e-7. Decode y comparación de muestras: PASS. Escucha humana: NOT_RUN. El spike técnico habilitó ampliar la forma sin afirmar calidad artística.

## Obra completa, pruebas locales ejecutadas
- MASTER.flac real, 192 s, 44.1kHz, 24-bit stereo. SHA256 local cc908936c22a7c6c3c789a47cfee788d6a97b99726ec1814dfde92772bf4b60b.
- MASTER.mp3 local, SHA256 2198c69c56f184ef2787d8cfb795c73c6cb23aec7a7be4d11ea898f5afe719db. No se presupone identidad de SHA con re-render CI.
- Peak lineal 0.58000 (~ -4.73dBFS). RMS L/R -18.489/-18.598 dBFS.
- Delta muestra-muestra máximo L/R 0.07773/0.10645 (bajo límite programático 0.2).
- Máster versus suma decodificada de cuatro stems FLAC: error máximo 2.38e-7 (bajo 1e-5).
- RMS de movimientos en dBFS: -19.26, -18.12, -18.93, -17.83. Son diferencias medibles, no juicio artístico.
- Score / retrogradación / inversión / curvas suaves / bordes en segundos 48, 96, 144 / fade de cierre: PASS.
- Procedencia: generador de síntesis propia y ruido filtrado con seed 2905. Sin fuentes externas de audio.

## Primera pantalla
Chromium con HTML inyectado: screenshots locales reales en 390 y 1440 px, título visible, 1 audio, no overflow horizontal: PASS. El navegador bloqueó file:// y localhost, por lo que las capturas no probaron reproducción. En set_content el player mostró 0:00/0:00 debido a fuente no cargada. HTTP Pages y playback remoto: NOT_RUN.

## Límites y estados
- Escucha crítica integral/A-B con W002: NOT_RUN.
- Ausencia de clics: medición objetiva y fades realizados; evaluación perceptual: NOT_RUN.
- True peak entre muestras, audición independiente, auriculares, juicio de calidad profesional: NOT_RUN.
- HUMAN_APPROVED=NO.
- ART-DIRECTION requiere captura HTTP accesible antes de READY_TO_BUILD, no inventar prueba de navegador remoto.
- Código publicado no significa MP3 publicado: verificar assets en commit y destino web.

## Reproducir el render
Instalar Python con numpy, scipy, soundfile y ffmpeg.
1. python render.py --first-article --out first_article
2. python render.py --full --out master
3. ffmpeg -i master/MASTER.flac -codec:a libmp3lame -q:a 2 MASTER.mp3
4. python qa_tests.py

Score editable en score.json, motor en motif_transform.py y mezcla determinista en render.py.
