# PROMETEO · Video W001 / 10 · TIDAL // SEÑAL

**Tipo:** obra audiovisual programática original · rama aislada
**Batch:** `video-w001-20261122`
**TaskNumber:** `10`
**Brief literal:** crear una escena de video parametrizada con dos variantes visuales reales a partir de una misma receta y export comparable.

## Obra
Una escultura orbital de señal en un único plano de 12 s, 960 × 540, 24 FPS, sin audio deliberadamente. Una receta JSON con trayectorias, cortes temporales y parámetros comunes. Dos direcciones artísticas originales: **NOCTURNE** (marino/turquesa, anillos acuáticos) y **SOLSTICE** (ocre/coral, rayos solares).

## Guion / shotlist compartido
- 00:00–00:03 · Surge la escultura y empiezan pulsos concéntricos.
- 00:03–00:06 · La fuente lumínica se desplaza por la órbita.
- 00:06–00:09 · El campo orbital se estabiliza y aparece la señal.
- 00:09–00:12 · Desvanecimiento simétrico a negro.

La duración, cámara, recorrido, velocidades, textos y número de fotogramas son iguales. Cambian paleta, campo atmosférico y material luminoso. Es una prueba de paramétricas visuales, no una comparación científica de codificadores.

## Fuentes y verificación
- `recipe.json`: fuente de parámetros para ambas variantes.
- `render.py`: generador de fotogramas y codificador FFmpeg/libx264 a MP4.
- `index.html`: vista comparativa 01/02/ambas; si faltan MP4 utiliza vista Canvas y lo indica explícitamente.
- `evidence.json`: se produce por el render y contiene hash SHA-256, `ffprobe`, duración, frames, tamaño y codec para cada archivo.
- `.github/workflows/prometeo-video-w001-10.yml`: exporta las dos variantes por CI y publica medios autorizados a una ruta nueva en `gh-pages` cuando la ejecución da PASS.

**Antes de una ejecución exitosa de CI:** CODE_IMPLEMENTED; MP4_ENCODED=NOT_RUN; BROWSER_UI=NOT_RUN; ART_APPROVED=NO. Nunca confundir Canvas con archivo MP4. El código no utiliza material de terceros.

**Al validar medios en GitHub:** verificar `nocturne.mp4`, `solstice.mp4`, `evidence.json`, ambos `nb_frames=288` y 12 s. La aprobación estética requiere revisión humana. No crear un mensaje de DELIVERED hasta confirmar la publicación.

**Publicación prevista:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/video/w001/10/
