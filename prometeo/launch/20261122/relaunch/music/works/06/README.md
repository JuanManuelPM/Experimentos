# MÁQUINA IMPERFECTA · PROMETEO MUSIC W003 / 06

64 compases originales de electro, 124 BPM, 2:04.72, E dórico, seis movimientos y seis stems sintetizados: KICK, SNARE, METAL, BASS, SEQUENCE y STABS.

**Estado: FUENTES PUBLICADAS EN RAMA EXCLUSIVA, AUDIO ORIGINAL RENDERIZADO Y VERIFICADO LOCALMENTE.** Los bytes WAV/FLAC/MP3 y los stems se entregan como ZIP adjunto en el chat del WORK; **no están en esta rama ni se debe presentar este enlace como master escuchable público**. El conector disponible permite escritura de fuentes de texto, no se verificó una subida binaria.

## Reproducir el trabajo completo desde las fuentes

Instalar Python y las dependencias, ejecutar en el directorio que contiene estos archivos:

~~~bash
python -m pip install -r requirements.txt
python synth.py --first-article
python synth.py --render --ab
python -m pytest -q tests/test_audio.py
~~~

El motor genera FIRST_ARTICLE.wav (8.592 s), MASTER.wav, MASTER.flac, seis stems FLAC24 en stems/, y los dos A/B WAV nivelados (para MP3 usar FFmpeg: ffmpeg -i MASTER.wav -b:a 192k MASTER.mp3). Los instrumentos se describen en project.json; modulation.py es un módulo reutilizable que calcula fuentes sine, triangle, step y sample_hold según beat absoluto.

El proyecto es editable como código y JSON; **no** es una sesión de Ableton/Bitwig ni requiere sample packs. La ruta conserva identidad music-w003-20261122-06. Flujo histórico congelado v2.0.0: blob 1423f13e08b743f418c42052613a6808b214d622. LAUNCH w003: blob 5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b.

## Evaluación separada

- PCM24 FLAC 44.1kHz / dos canales / 124.721s; 6/6 tests fuente PASS en entorno local.
- Paridad entre suma de 6 stems y master decodificado: máximo error 3.5762787e-7 por cuantización.
- Medidas FFmpeg ebur128: -15.5 LUFS, 3.5 LU LRA, -0.9 dBTP.
- A/B secuencia variando brillo, mismas notas, RMS a ~1e-6 dB.
- Artículo de 4 compases renderizado antes del master completo; backend del audio observado.
- NOT_RUN: escucha artística independiente, render de Chromium a 390/1440 (hang observado), acceso HTTP a un máster publicado, prueba remota de descarga audio, aprobación humana.
- HUMAN_APPROVED=NO, y LOCAL_AUDIO_ONLY; un test numérico no mide la excelencia artística.

Referencias técnicas observadas: [Bitwig modulation](https://www.bitwig.com/userguide/latest/the_unified_modulation_system/), [Barbieri / Ableton](https://www.ableton.com/es/blog/caterina-barbieri-minimalism-modular-and-live/), [808 synthesis / Sonic State](https://sonicstate.com/news/2021/03/16/synthesizing-a-tr-808-drum-kit/). Se leyeron las referencias; no se escucharon discos ajenos para alegar comparabilidad artística. Sonido 100% procedural original, sin samples de terceros.

Ver QA.md, PREPRODUCTION.deep-spec-v1.json y TRACE.json. No se modificó ninguna obra ni lanzador anterior.
