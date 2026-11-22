# Reproducción del montaje

El ZIP entregado en el chat contiene `render.py` real y `CONTACT_SHEET_MASTER.png` (SHA256 en QA). En Linux con `python3`, `ffmpeg`, `Pillow`, `numpy`, `scipy`:

```bash
python3 render.py
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,nb_frames -of json ULTIMA_GUARDIA_W003_01.mp4
ffmpeg -v error -i ULTIMA_GUARDIA_W003_01.mp4 -f null -
sha256sum ULTIMA_GUARDIA_W003_01.mp4
```

Fuente visual: una sola hoja original 1536×1024 dividida en 3×3, nine shot frames crop a 16:9, color grade menor, push lento de 3%-8%; a 960×540/24 fps. Foley de aire, ruido filtrado, pasos, hojas y pestillo mediante ondas y ruido de numpy/scipy. No hay interpolación de actuación, solo movimiento de encuadre. Las duraciones y funciones de cada plano están en `CONTINUITY_KIT.json`.

**Limitación:** repositorio candidate registra Book, kit, QA, Trace y recetas, pero no binarios, dado que el conector de GitHub de este entorno sólo acepta carga de archivos textuales y no importó los bytes de MP4/PNG. No adjudicar `PUBLISHED_MEDIA`.
