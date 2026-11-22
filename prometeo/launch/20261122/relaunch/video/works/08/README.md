# LA CIFRA INVISIBLE / VIDEO W003 · 08

**taskId:** `video-w003-20261122-08` · **batchId:** `video-w003-20261122` · **taskNumber:** `8` · **HUMAN_APPROVED:** `NO`.

## Película real

Documental de periodismo de datos original de **24 s**, dos masters diferentes, no un video CSS ni una captura de pantalla:

- `LA_CIFRA_INVISIBLE_W003_08.mp4`: **960 × 540, 24 fps, 576 frames, H.264 + AAC**, 519 893 bytes.
- `LA_CIFRA_INVISIBLE_W003_08_VERTICAL.mp4`: **540 × 960, 20 fps, 480 frames, H.264 + AAC**, 488 991 bytes.
- `poster_desktop_1440.jpg` y `poster_mobile_390.jpg`: fotogramas de la película, redimensionados al ancho indicado y observados. El segundo es un **layout propio**, no crop del 16:9.
- `index.html`: reproductor y ensayo explicativo accesible, con selección de formato, descargas y fuente. El video no usa una obra ajena ni un collage especulativo.

**Fuente primaria**: NASA GISS GISTEMP v4, tabla Land–Ocean Temperature Index, columna anual J-D de `GLB.Ts+dSST.txt`, base **1951–1980**. [Descargas oficiales](https://data.giss.nasa.gov/gistemp/data_v4.html) y [método NASA](https://data.giss.nasa.gov/gistemp/). CSV reproducible `nasa_gistemp_20261110_snapshot.csv`, snapshot **2026-11-10** previamente conservado por W002 con Git blob `01c44c2b20156c2fe73cdc295e1324745411597c`. Se reutiliza exactamente el archivo para comparabilidad, **no** se presenta como nuevo download de NASA en 22/11. Los datos se revisan periódicamente: no mezclar valores de fuentes tomadas en fechas distintas. 1880 `-0.17 °C`, 2024 `+1.28 °C`, 2025 `+1.18 °C`. Son anomalías, no temperaturas absolutas.

## Compilador reutilizable

`data_to_motion_v3.py` toma un CSV anual con los campos `year,anomaly_c`, verifica continuidad de 1880–2025 y anclas de control, transforma cada año a un eje constante `[-0.6, +1.4] °C` y produce frames dibujados por Pillow con línea anual **sin smoothing**, puntuación editorial y dos masters nativos. El soundtrack generativo es original y **no sonifica datos**. La edición temporal está programada, se puede cambiar estructura o colores preservando tests.

```
python -m pip install 'Pillow>=10,<13' 'numpy>=1.25,<3'
python data_to_motion_v3.py --out LA_CIFRA_INVISIBLE_W003_08.mp4
python data_to_motion_v3.py --width 540 --height 960 --fps 20 --out LA_CIFRA_INVISIBLE_W003_08_VERTICAL.mp4
python qa_tests.py
```

Requiere `ffmpeg`, `ffprobe` y fuentes Lato instaladas (fallback DejaVu). Licencia de los gráficos, programa y banda sonora: creación original de este WORK para el usuario. Los datos NASA son información pública, reproducida con atribución. No se redistribuyen las tipografías ni gráficos de terceros.

## QBAR y decisión de primer artículo

1. [NASA SVS 5603](https://svs.gsfc.nasa.gov/5603/): fuente primaria de narrativa temporal, baseline y visualización de calentamiento; **sitio/documentación observados**, película de referencia íntegra **NOT_RUN**.
2. [NASA GISTEMP v4](https://data.giss.nasa.gov/gistemp/data_v4.html): datos fechados y columna de anomalía; **documentación y snapshot existentes observados**.
3. [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor): seleccionar el tipo de gráfico en función de una relación temporal, no por espectacularidad; **documentación observada**.

**Falla real:** el primer diseño horizontal recortaba título y leyenda al ajustarlo a pantalla de 390 px. **Corrección de representación:** un master vertical con composición propia, título partido en dos líneas, etiqueta científica mayor y cifras ancla separadas; screenshot 390 px observado y regla de longitud tipográfica probada. No se agregó una capa decorativa para tapar el defecto. El benchmark es una aspiración, no una certificación de calidad profesional.

**Estructura comparada con W002:** mismo snapshot NASA y mismo dominio numérico; W002 22 s solo 16:9; W003 24 s, masters 16:9/9:16, dos pósters reales, eje y cero persistentes, narrativa por tres revelaciones y test nominal de contraste. La comparación visual directa de las dos películas con espectadores es **NOT_RUN**. No afirmar mejora artística causal.

**QA y pendientes**: `QA_RESULTS.json`, `qa_tests.py`, `QA.md`, `PREPRODUCTION.deep-spec-v1.json`, `STAGE_TRACE.json`. Tests de datos, geometría, contraste nominal, encoding y decodificación completa **PASS**. Revisión humana de significado, escucha multisistema, Android físico y aceptación estética **NOT_RUN / HUMAN_APPROVED=NO**.
