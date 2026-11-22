# PROMETEO · MUSIC · 05 · CARTOGRAFÍA DEL SUEÑO

**taskId:** `music-w002-20261122-05` · **Fecha:** 22/11/2026  
**Lanzador:** [W002 MUSIC](../../next/music/LAUNCH.md) · SHA bloqueado `1045f4950c9f7ae11b455523ca664e087ec1b30d`  
**Flujo musical:** versión `2.0.0` candidata (SHA de blob `1423f13e08b743f418c42052613a6808b214d622`).

## Obra entregada

Se compuso y renderizó un máster ambient **real de 04:12**, en cinco movimientos sin percusión: I Niebla (0–49 s); II Geografías (49–103 s); III Umbral (103–154 s); IV Luz oblicua (154–207 s); V Regreso (207–252 s). Motivo original de cinco notas, con cinco retornos transformados por transposición, duración, dirección y timbre. Todas las texturas son síntesis original, sin samples externos.

**Entregados como archivos descargables en el chat del trabajador 05, no en GitHub:**

- `MASTER.wav`: PCM 24 bit, 32 000 Hz, 2 canales, SHA256 `07462ed4f31fc84485c27e29b4c27ec657cc21638c9d000fdf6e55cbd08fd2df`.
- `MASTER.mp3`: MP3 256 kb/s, SHA256 `f53dfdc5412d889464a3581736168bd29d05689520eb81ad72969200e672f63a`.
- `Cartografia_del_sueno_05_proyecto.zip`: fuente Python `render.py`, editor de eventos `SONGPROJECT.json`, 5 stems FLAC, QA y spike; SHA256 `8d4316783f0e2fe4a8694eff1b339c7e90aa203096408fc217d9261cf49dce1e`.

## Vista pública, con distinción explícita

[Visor Web Audio original, sintetizado en vivo](index.html) es una **interpretación alternativa** del arreglo. No es el máster WAV exportado: los timbres y la cadena de efectos cambian. El código existe en `index.html` y fue releído de GitHub; reproducción HTTP, móvil y audición independiente: **NOT_RUN**. No debe usarse para adjudicar QA al máster.

## QA del máster realmente ejecutado

| Propiedad | Observación |
|---|---|
| Duración | 252 s |
| Formato | WAV 24 bit PCM, estéreo, 32 kHz |
| Peak del máster | -1,60 dBFS |
| RMS global | -19,13 dBFS |
| RMS de movimientos I → V | -18,83 / -17,59 / -22,33 / -16,50 / -19,96 dBFS |
| Max error suma de stems, premaster | 1,49 × 10^-7 |
| Error RMS suma FLAC versus WAV exportado | -140,17 dBFS |
| Máx. salto entre muestras en fronteras 49/103/154/207 | 0,033 / 0,029 / 0,024 / 0,030 |
| RMS primer y último segundo | -84,04 / -84,67 dBFS |
| Escucha humana, A/B contra referentes, juicio estético | **NOT_RUN** |
| HUMAN_APPROVED | **NO** |

La continuidad numérica, el fade y la paridad de stems pasaron; no prueban por sí solos que el sonido no tenga defectos perceptivos.

## Investigación verificable

- [Jon Hopkins, entrevista sobre Ritual](https://www.ableton.com/en/blog/jon-hopkins/): forma extensa, capas y reverberación.
- [Max Cooper, Yearning for the Infinite](https://maxcooper.net/yearning-for-the-infinite-album): capas emergentes y motivos en evolución.
- [Brian Eno, AURUM](https://music.apple.com/us/album/aurum/1802013049): composición centrada en textura.

Referencias **examinadas en texto**, no comparadas musicalmente por escucha A/B. No se copian sus sonidos ni composiciones.

## Propietario y aprendizaje

Ficha de especificación antes del primer render: [rama privada exclusiva W002 #05](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-music-w002-05-20261122/PROMETEO/spaces/music-studio/production-universal/waves/W002/music-w002-20261122-05/PREPRODUCTION.deep-spec-v1.json).

**stage/cause/preventive_gate/test/owner/counterexample:** publicación / imposibilidad de transferir binarios locales a GitHub en esta ruta de herramienta / exigir lectura posterior del WAV y playback HTTP para afirmar publicación de audio / SHA256 del archivo servido / MUSIC / página HTML con sintetizador no es máster WAV publicado. El máster y los stems están disponibles únicamente en los adjuntos del chat; su URL GitHub no se inventa.

**Estado:** AUDIO_RENDERED · STEM_PARITY_PASS · SOURCE_DELIVERED_IN_CHAT · WEB_PREVIEW_SOURCE_PUBLISHED · REMOTE_MASTER_NOT_UPLOADED · HUMAN_LISTEN_NOT_RUN.
