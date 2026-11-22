# VÉRTICE L1 · OBJETO EN ESCENA

**PROMETEO / Video W002 / Nº 02** · taskId `video-w002-20261122-02`  
Brief de origen: [LAUNCH 02](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/video/LAUNCH.md#02--objeto-en-escena--anuncio-de-producto-cinematográfico)  
LAUNCH blob SHA: `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`

## Obra

Anuncio de producto original de una luminaria ficticia plegable de tres rótulas, con un único modelo geométrico, seis planos de producto, superficies metálicas y foley propio. Este repositorio conserva el renderizador, la receta reutilizable, la ficha de decisiones y el QA.

**Entrega real comprobada en la conversación:** `VERTICE_L1_FILM.mp4`, 16 s a 24 fps, 640×360, H.264 y AAC estéreo 48 kHz. SHA-256: `619588208417318f3d980d0a1d43e9c4b784d07a3bc17ff4b193b5ef53794d06`. Se verificaron decodificación completa y seis fotogramas diferentes. El binario MP4 está disponible como archivo de conversación, **no está alojado en GitHub**; no inventar URL de Pages.

## Reproducción

1. Instalar Python 3 con `vtk`, `numpy`, `scipy` y `Pillow`; tener FFmpeg en PATH.
2. Ejecutar `python film.py --out . --size 640x360`.
3. Revisar `VERTICE_L1_FILM.mp4`, `FOLEY.wav`, `PRODUCT_SHOTS.json` y los seis `frame-*.jpg` generados.

El script constituye el **sistema reutilizable de planos de producto**. Las cámaras consultan puntos del mismo modelo, no imágenes independientes, y el audio es original y se sintetiza sin muestras de terceros.

## Evidencia y honestidad

- [Preproducción profunda](PREPRODUCTION.deep-spec-v1.json): DEEP-SPEC-1, con preguntas y decisiones vinculadas a referentes y riesgos.
- [Plano de producción / parámetros](PRODUCT_SHOTS.json): dimensiones y shotlist parametrizados.
- [QA técnico](QA.json): exportación, códecs y límites.
- Referencias profesionales **estudiadas, no copiadas**: [Yakoub Grini / Mophie Gallery](https://www.yakoubgr.com/portfolio/mophie-gallery/), [Aputure / Projection Lighting](https://aputure.com/en-US/case-studies/building-a-beauty-editorial-with-projection-lighting) y [análisis externo de CGI de producto](https://quincemedia.com/2026/09/10/apple-3d-product-launch-videos/).

**Estado:** producción y prueba técnica local confirmadas; alojamiento público del MP4 no realizado; escucha perceptual humana, prueba en Android y aprobación artística `NOT_RUN`. CGI estilizado: no afirmar que iguala un anuncio fotorrealista premium.

La rama `candidate/prometeo-video-w002-02-20261122` es aislada y no modifica W001 ni los otros trabajos W002.
