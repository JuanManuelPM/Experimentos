# Antes de la tormenta · W003/09

**TaskId:** `video-w003-20261122-09` · **Room:** video · **Estado:** FIRST_ARTICLE_RENDERING, film final NOT_RUN, HUMAN_APPROVED=NO.

## Obra
14 s originales, faro y espigón, transición climática compartida con niebla, ráfagas, oleaje, cámara dolly, vegetación, cuerda, highlights húmedos, lluvia en profundidad, luz y sonido original sincronizado. Capa procedural estilizada, no captura fotográfica ni VFX fotorrealista.

[Ver la página](index.html) · [Render reproducible](render.py) · [Book](PREPRODUCTION.deep-spec-v1.json) · [Primer artículo](FIRST_ARTICLE_7-13.mp4) · [Prueba visual](FIRST_ARTICLE.contact.png).

## Diferencia real frente a W002
La auditoría candidata W002/09 detectó cámara casi fija y lluvia visualmente dominante. La nueva rama añade camera push-in 7.1%, tracking lateral, capa cercana independiente de cuerda/bolardo/juncos, reflejos dependientes de lluvia, densidad de gotas reducida y muestras cercanas al relámpago. Se conserva motor atmosférico como fundamento legible, sin reescribir ni reemplazar el original.

## Reproducción
```bash
python -m pip install "numpy<3" opencv-python-headless Pillow scipy
python render.py --output ANTES-DE-LA-TORMENTA-W003-09.mp4 --seconds 14 --width 800 --fps 24
ffprobe -v error -show_entries format=duration:stream=codec_name,codec_type -of json ANTES-DE-LA-TORMENTA-W003-09.mp4
```
Primera muestra crítica: `python render.py --output FIRST_ARTICLE_7-13.mp4 --seconds 6 --width 640 --fps 18 --article-start 7`.

## Integridad y límites
Brief W003 blob `0cc574528594731a3d1cf0c15a0d0e5a37e775b7`; W002 blob `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`. Contrato Q-LOOP/QBAR/DEEP-SPEC y ART-DIRECTION recuperados; flow de estudio en pruebas sigue con migración pendiente, no hay promoción fingida. Una ejecución estructural no mide calidad visual. Captura real del film, decodificación, escucha, navegador y juicio humano se reportan solamente tras observarse. Recursos visuales y sonido procedurales originales; ninguna licencia externa invocada para footage.
