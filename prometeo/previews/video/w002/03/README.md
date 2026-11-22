# PROMETEO · VIDEO W002/03 · LA CIUDAD BAJO EL AGUA

**Identidad:** room=video · batchId=video-w002-20261122 · taskNumber=3 · taskId=video-w002-20261122-03.
**Brief SHA fijado:** d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d (LAUNCH público; sólo encargo 03).
**Artefactos:** LA-CIUDAD-BAJO-EL-AGUA.mp4 (48 s, H264/AAC 1280×720 24fps), index.html, PROVENANCE.json, PREPRODUCTION.deep-spec-v1.json, PROBE.json, poster.jpg, cinco frames de muestreo, render.py, verify_ledger.py.

## Fuentes de hecho (primarias)

- 12 noviembre 2019 a las 22:50: 187 cm de Punta Salute según registro municipal CPSM; 4 noviembre 1966: 194 cm. https://www.comune.venezia.it/it/content/le-acque-alte-eccezionali/
- ISPRA cita 189 cm sobre Zero Mareografico di Punta della Salute para 2019 y operación inicial del sistema MOSE en octubre 2020. **No confundir 187 con 189: la referencia instrumental del dato importa.** https://www.isprambiente.gov.it/it/archivio/notizie-e-novita-normative/notizie-ispra/2020/11/12-novembre-2019-2013-un-anno-dall2019acqua-alta-eccezionale-a-venezia

## Archivo legal y fecha de toma

- **VENICE_CONTEXT:** metraje de Linda Tripaldi, licencia gratuita Pexels, fecha de rodaje sin verificar (publicado 14-XII-2019). Contexto solamente, nunca se presenta como registro de la inundación ni de MOSE. https://www.pexels.com/video/traveling-the-grand-canal-waterways-of-venice-italy-3381844/
- **SATELLITE_2019_14:** imagen NOAA-20/VIIRS auténtica del 14-XI-2019, dominio público federal, dos días después del pico, no del 12-XI. https://www.nesdis.noaa.gov/news/rising-sea-levels-and-sirocco-winds-worsen-flooding-venice
- **FLOOD_CONTEXT:** clip Pexels de Marius Nacu publicado 24-X-2022, fecha real de filmación no verificada, licencia Pexels. No representa el temporal de 2019. https://www.pexels.com/video/flood-in-venice-14159923/
- Adaptaciones: color, encuadre, zoom y rótulos. Ambiente sonoro y narración español con espeak sintetizados; **NO** corresponden a entrevistas ni grabaciones originales del evento. Elementos editoriales originales: CC BY 4.0 sin anular créditos individuales de archivo.

## Dirección editorial

Montaje de material auténtico con data graphic claramente rotulado, cine de archivo (Rialto como contexto y no prueba de la catástrofe), voz sintética explícita y método reusable de origen audiovisual. Referencia aspiracional de enfoque documental: Pixar, A Spark Story, https://www.pixar.com/a-spark-story; no se copia la obra. El archivo documental se impone a crear imágenes más espectaculares pero falsas. La voz es una limitación estética no resuelta: un TTS local NO reemplaza una locución profesional.

## Producir / comprobar

Requiere Python + Pillow, ffmpeg, ffprobe, espeak, Node.

1. Instalar Pillow.
2. Ejecutar python3 prometeo/previews/video/w002/03/render.py
3. Ejecutar python3 prometeo/previews/video/w002/03/verify_ledger.py prometeo/previews/video/w002/03/PROVENANCE.json
4. ffprobe -v error -show_format -show_streams prometeo/previews/video/w002/03/LA-CIUDAD-BAJO-EL-AGUA.mp4
5. ffmpeg -v error -xerror -i prometeo/previews/video/w002/03/LA-CIUDAD-BAJO-EL-AGUA.mp4 -f null -

El render primero descarga y verifica los tres originales, comprueba un spike H264/AAC de un segundo y valida DEEP-SPEC-1. Descarga fallida = BLOCKED. Después codifica ocho tramos, hace mux A/V, verifica 1152 frames, decodifica la película completa y guarda frames de control en segundos 2/14/22/30/46.

El verificador independiente audita rangos de fotogramas, fecha de captura, autor, licencia, fuente primaria y tipos de evidencia. Las pruebas lógicas y de codec NO certifican percepción, fidelidad narrativa, mezcla profesional ni aprobación humana.

## Publicación

Rama de producción exclusiva candidate/prometeo-video-w002-03-20261122; GitHub Actions exclusivo de este número publica la salida aprobada por QA mecánico en gh-pages bajo prometeo/previews/video/w002/03/ con rebase ante concurrencia. No toca W001 ni otros nueve números. El estado DELIVERED exige readback del MP4; ningún README significa por sí solo video exportado.

### Recuperación de incidente real

El primer intento de Actions (run 45044386071) fue bloqueado por HTTP 429 en Wikimedia. El segundo intenta Pexels como video de contexto con rodaje no fechado, y imagen oficial NOAA de dominio público (autor y licencia no cambian). No equivale a export hasta que los archivos lleguen y el codec se verifique.

**Segundo intento de Actions (45044818076):** video Pexels descargado y validado, pero proxy de Commons devolvió HTTP 404. Sustituido por imagen histórica oficial NOAA 14-XI-2019 y segundo video Pexels rotulado explícitamente como contexto sin fecha de rodaje.
