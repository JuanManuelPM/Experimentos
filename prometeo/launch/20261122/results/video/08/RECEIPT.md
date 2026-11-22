# PROMETEO · VIDEO W002 / 08 · RECIBO DE ENTREGA

**Obra:** LA CIFRA INVISIBLE · `video-w002-20261122-08`  
**Tanda:** `video-w002-20261122` · **room:** `video` · **taskNumber:** `8`  
**Fecha:** 2026-11-22 · **Brief fijado:** `LAUNCH.md` blob `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`  
**Rama exclusiva:** `candidate/prometeo-video-w002-08-20261122` en `JuanManuelPM/Experimentos`

## Resultado real

- **Película MP4 H.264/AAC:** [LA_CIFRA_INVISIBLE.mp4](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/08/LA_CIFRA_INVISIBLE.mp4) · 22 s, 528 fotogramas, 960×540, 24fps, dos pistas; GitHub blob `24bc99d2625e788cbf0751382a4ee82d23a39e53`, tamaño `409413` bytes.
- **Reproductor público diseñado:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/video/w002/08/ · **acceso HTTP no confirmado al cierre** (intento externo devolvió HTTP 503). Consultar el MP4 en GitHub directamente si Pages no responde.
- **Fuente y motor reutilizable:** [DataToMotionCompiler](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/08/data_to_motion.py), [CSV NASA versionado](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/08/annual_nasa_gistemp_1880_2025.csv), [tests](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/08/qa_tests.py).
- **Preproducción:** [DEEP-SPEC-1](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/08/PREPRODUCTION.deep-spec-v1.json).
- **QA completo:** [QUALITY_REPORT.md](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/08/QUALITY_REPORT.md); [FFprobe binario](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/08/QA_FFPROBE.json).

## Fuente primaria, no espejo

NASA GISS GISTEMP v4, `Land-Ocean Temperature Index`, columna anual `J-D` de https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.txt, **captura de contenido 2026-11-10T00:00:00Z**. Los valores 1880–2025 son anomalías °C respecto a 1951–1980; 1880 = −0.17 °C; 2025 = +1.18 °C. NASA puede revisar centésimas después de la fecha de captura.

## Evidencia y estados

- **`DEEP_SPEC_READY_FOR_FIRST_SLICE`** mediante control lógico, no acreditación artística.
- **`NUMERIC_PASS`**: 146 años consecutivos; anclas NASA; escalas lineales no truncadas, cero visible, 2026 parcial fuera de rango.
- **`VIDEO_AUDIO_ENCODE_DECODE_PASS`**: FFprobe/FFmpeg completo; cinta de 22s 528 frames, H264 + AAC; registro de pruebas.
- **`GITHUB_ACTIONS_SUCCESS`**: [build 45044935020](https://github.com/JuanManuelPM/Experimentos/actions/runs/45044935020) en rama `gh-pages` publicó el MP4 genuino y evidencia.
- **`GITHUB_MP4_READBACK_PASS`**: GitHub listó el binario después del commit junto con `QA_FFPROBE.json`, el CSV y las fuentes; tamaño y SHA mencionados arriba.
- **`PAGES_HTTP_NOT_VERIFIED`**: la URL pública devolvió HTTP 503 durante la comprobación externa, aunque la rama y el objeto están publicados.
- **`LISTENING_CRITIQUE_NOT_RUN`**, **`MOBILE_ACCESSIBILITY_AUDIT_NOT_RUN`** y **`HUMAN_APPROVED_NO`**. No atribuir la aprobación al compilador.
- Motor reutilizable **solo para variantes de la misma serie anual**, no datos arbitrarios sin adaptación.

Este recibo no cambia otras obras, otros números, tandas previas ni el contrato maestro. El único resultado de este worker es `VIDEO W002 / 08`.
