# MATERIA / 008 · Montaje editorial original

**Encargo:** W001/08, "Creá un montaje editorial de dos o más materiales originales con cortes deliberados, montaje y export reproducible".

**Obra:** 12 segundos a 24 fps, 960×540. Ocho planos y siete cortes secos exactos, contraste entre dos **materiales originales independientes**: una placa de papel orgánico con curvas topográficas (PAPER) y una placa de acero técnico con rotor y graduaciones (METAL). El círculo funciona como *match cut* entre dos fuentes visuales distintas. Audio original sintetizado, con golpes alineados a cambios de plano. Ningún clip, foto, voz ni música de terceros.

**Reproducir:** [preview](https://juanmanuelpm.github.io/Experimentos/prometeo/previews/video/w001/08/) · [MP4](./MATERIA-008.mp4) · [receta editable](recipe.json) · [código de render](render.py) · [datos ffprobe](PROBE.json).

## Guion / shotlist

| Tiempo | Fuente | Plano | Razón del corte |
|---|---|---|---|
| 0.00–1.50 | PAPEL | LA MATERIA: textura y topografía | apertura del motivo circular |
| 1.50–3.00 | ACERO | LA MATERIA: rotor mecánico | match cut circular a material opuesto |
| 3.00–4.625 | PAPEL | FIBRA | salto a macro orgánico |
| 4.625–6.25 | ACERO | ACERO | contraplano técnico |
| 6.25–8.25 | PAPEL | ALGO CEDE | prolongar lectura de tensión |
| 8.25–10.00 | ACERO | ALGO RESISTE | respuesta material/semántica |
| 10.00–11.00 | PAPEL | DOS MATERIAS | aceleración de cierre |
| 11.00–12.00 | ACERO | MATERIA / 008 | marca final y resolución |

## Export reproducible

`python -m pip install Pillow numpy` y `python render.py` (necesita ffmpeg en PATH). Genera `MATERIA-008.mp4`, `poster.png`, `soundtrack.wav` y `PROBE.json`. Seed NumPy 808, reloj a cuadros, recortes definidos en `recipe.json`. La música y los cuadros se generan con el mismo tiempo de referencia, los ataques de sonido coinciden con los cortes. Codificación H.264/AAC con faststart.

**QA:** El script aborta si FFprobe no confirma 288 cuadros, 960×540, H.264, AAC y duración aproximada 12 s. La automatización `prometeo-video-w001-08.yml` ejecuta la exportación y publica el binario si obtiene permisos. Que el script esté publicado no demuestra por sí solo que el MP4 ya exista: comprobar `PROBE.json` y enlace binario. Revisión de estética humana: **pendiente**.

**Repositorio fuente aislado:** `JuanManuelPM/Experimentos@candidate/prometeo-video-w001-08-20261122:prometeo/previews/video/w001/08/`. Fuentes históricas del estudio: `JuanManuelPM/pruebas@candidate/prometeo-video-studio-parallel-20261111` y `pruebas@prometeo/control:PROMETEO/spaces/video-studio/PROJECT.md`. Ningún motor experimental anterior se declara homologado.
