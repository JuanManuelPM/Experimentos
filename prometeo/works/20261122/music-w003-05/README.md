# CARTOGRAFÍA DEL SUEÑO · PROMETEO MUSIC W003 · 05

**Cuatro movimientos originales de ambient, 3:12 sin percusión.** Una frase de cuatro notas cruza un viaje de acordes extendidos, aire sintético y reflejos, reaparece invertida, retrógrada, y una octava abajo. Identidad: music-w003-20261122-05. No se alteraron W001/W002 ni trabajos de otros números.

## Escucha
- index.html muestra título, reproductor nativo y las cuatro etapas, sin UI de monitorización.
- MASTER.mp3 es el máster audible. Debe existir en esta ruta después del build binario; el HTML no maquilla su ausencia.
- master/MASTER.flac contiene máster lossless; master/STEM_harmony.flac, STEM_memory.flac, STEM_glass.flac y STEM_air.flac son pistas reales exportadas del mismo buffer.
- first_article/MASTER.flac conserva el render inicial de 24 segundos.

## Movimientos
0:00 Umbral | 0:48 Archipiélago | 1:36 Niebla sin orillas | 2:24 Regreso alterado.

## Proyecto editable / reusable
score.json = melodía y cronograma; motif_transform.py = motor reutilizable puro; render.py = instrumentos, timbres, textura, espacio, mezcla/export; qa_tests.py = regresiones sobre audio real. Dependencias Python numpy/scipy/soundfile y ffmpeg. Ejecutar en esta carpeta:

    python -m pip install numpy scipy soundfile
    python render.py --first-article --out first_article
    python render.py --full --out master
    ffmpeg -y -i master/MASTER.flac -codec:a libmp3lame -q:a 2 MASTER.mp3
    python qa_tests.py

GitHub Actions cuenta con workflow limitado a archivos exclusivos de esta obra; el render remoto puede quedar pendiente si GitHub no ejecuta workflows de esta rama. PREPRODUCTION.deep-spec-v1.json guarda Book y ART DIRECTION; STAGE_TRACE.json guarda etapas observadas. QA.md distingue decodificación y calidad perceptual.

## Proveído / límites
La composición y los instrumentos son originales generados por código, sin terceros. Pruebas locales reales: FLAC decodificado, pico -4.7dBFS, suma de stems compatible, transformaciones de frase, fronteras temporales y dos screenshots desde Chromium con HTML inyectado. Audición perceptual y reproducción pública HTTP aún NOT_RUN; HUMAN_APPROVED=NO. No declarar entrega públicamente audible hasta readback de MASTER.mp3 desde gh-pages.
