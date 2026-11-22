# CATEDRAL DE ECO · PROMETEO MUSIC W003 / 03

Tema dub techno original: **122 BPM / 88 compases / 2:57.5 / 44,1 kHz estéreo**. Dos profundidades de eco filtrado, progresión de seis acordes y siete secciones con vacío central.

**Escucha pública (publicación de archivo fuente, HTTP sin verificar desde este entorno):** https://juanmanuelpm.github.io/Experimentos/prometeo/music/w003/03-catedral-de-eco/

**Máster:** `audio/MASTER.wav` PCM 24-bit estéreo, `audio/MASTER.mp3` 192 kb/s, `audio/MASTER_PUBLIC_96.mp3` 96 kb/s. **Stems reales:** `audio/STEMS/{drums,sub,chords,atmos,echo}.wav`. Se entregan en paquete del chat. GitHub almacena únicamente el MP3 público de 96kbps repartido en 24 piezas base64 de 120k caracteres; el navegador las recompone, y si falla usa re-síntesis WebAudio **marcada explícitamente como alternativa**. No presentar esa síntesis como el máster original.

**Reproducibilidad:** instalar `numpy scipy soundfile`, correr `python render.py --first-article` y después `python render.py --full`. La sesión/partitura y los parámetros de rack son editables en `SONGPROJECT.json`, `RACK.json` y `render.py`. El máster resulta de `0.92*tanh(2.1*sum(stems))`, no de suma lineal de archivos post-límite. Dependencias del MP3: ffmpeg u otro codificador, pero render.py por sí solo genera WAV.

**QA observado:** colas decaen, feedback primario 0.56/secundario 0.44; diferencia de nivel bajo 130 Hz del eco respecto del sub = -33.32 dB; sample peak -2.6700000762939453 dBFS, mono -2.7200000286102295 dBFS; paridad de suma de stems sobre mezcla previa al master máximo 0.0. Primera pieza de 8 compases renderizada antes del tema completo. Chromium DOM 390 y 1440 capturado, test de reconstrucción MP3 con rutas locales simuladas, Play/Stop, 0 errores JS. **No** hubo escucha perceptual independiente, ni true-peak, ni HTTP externo de Pages, ni aprobación humana.

**Referencias verificadas solo en texto:** [El Choop (Ableton)](https://www.ableton.com/en/blog/designing-dub-chords-in-ableton-live-with-el-chooppizza-hotline/), [cadena dub (iZotope)](https://www.izotope.com/community/blog/6-genres-and-the-effects-chains-that-define-them), [catálogo Basic Channel](https://www.basicchannel.com/label/Basic%2BChannel). No se usaron melodías ni audio de terceros.

**Control del trabajo:** batch `music-w003-20261122`, taskNumber `3`, LAUNCH blob `5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b`, Flow musical congelado `2.0.0` SHA256 `6826ce13f4bd1e0d81b8a89bd7e6728668b85c44c68185b79426b00a36b8f05f`. Comparación con W002 en RESULT.json. Históricos intactos.

**Estado:** `IMPLEMENTED + NUMERIC_QA_OBSERVED + LOCAL_BROWSER_OBSERVED`, `PERCEPTUAL_LISTENING_NOT_RUN`, `PAGES_HTTP_NOT_VERIFIED`, `HUMAN_APPROVED=false`.
