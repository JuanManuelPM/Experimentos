# LA CIUDAD BAJO EL AGUA · W003/03 · Venecia: el agua tiene fecha

- **Identidad:** `room=video` · `batchId=video-w003-20261122` · `taskNumber=3` · `taskId=video-w003-20261122-03`.
- **LAUNCH fijado:** `0cc574528594731a3d1cf0c15a0d0e5a37e775b7` (Git blob) · brief idéntico al W002, blob anterior `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`.
- **Rama exclusiva:** `candidate/prometeo-video-w003-20261122-03`.
- **Estado al preparar las fuentes:** SOURCE_PUBLISHED; primer artículo con metraje real, película, QA remota, vista 390/1440 y escucha: NOT_RUN hasta informe de GitHub Actions y readback. HUMAN_APPROVED=NO.
- **Obra propuesta:** film de 48s, H264/AAC 1280x720 24fps, con dos clips originales Pexels con licencia, imagen satelital NOAA del 14-XI-2019, voz sintética y gráfica MOSE declarada como esquema. La imagen y los videos no fingen ser tomas del pico del 12-XI.
- **Técnica elegida:** edición de footage licenciado y lower-third reducido; alternativa representacional genuina: ilustración editorial reconstruida etiquetada, **no** archivo falso. Se incluyó un esquema solamente para explicar el mecanismo de las barreras.
- **Observación del precedente W002:** auditoría `candidate/prometeo-video-audit-v2-20261122`, señala rótulos dominantes y demasiada cartela; la hipótesis W003 es dar prioridad a imagen real sin perder origen.
- **Fuente de hechos primaria:** Comune di Venezia: 187cm CPSM Punta Salute, 22:50 12-XI-2019, no es profundidad en la calle. ISPRA documenta 3 y 15-X-2020 como operación inicial de MOSE; el mismo ISPRA publica 189cm según *otro referente mareográfico*: no mezclar 187/189.
- **Fuentes de media:** Linda Tripaldi (contexto canal Pexels), Marius Nacu (contexto inundación Pexels), NOAA NESDIS 14-XI-2019 (satélite), gráfico MOSE propio. Créditos y derechos por secuencia en `PROVENANCE.json`.
- **Benchmark editorial:** [FRONTLINE / PBS Guidelines](https://www.pbs.org/wgbh/frontline/about-us/journalistic-guidelines/) investigado en texto sobre comprobación de imágenes, guion y fuente; **no** se afirma haber visto una película de FRONTLINE. NOAA visual auténtica observada a modo de benchmark factual. Meta de lenguaje cinematográfico sigue abierta.

## Producción reproducible

```bash
sudo apt-get install -y ffmpeg espeak python3-pil fonts-dejavu-core
python3 render.py
python3 verify_ledger.py PROVENANCE.json
ffprobe -v error -show_streams -show_format VENECIA-EL-AGUA-TIENE-FECHA.mp4
ffmpeg -v error -xerror -i VENECIA-EL-AGUA-TIENE-FECHA.mp4 -f null -
```

No usar `PROBE.json` ni `DEEP-SPEC READY` como aprobación artística. El primer artículo descarga un clip real, codifica H264/AAC y conserva un frame; si falla, aborta sin publicar. GitHub Actions crea el film con archivos originales recuperados y publica aislado en `prometeo/previews/video/w003/03/` mediante rebase y readback. Conservar W002 y los otros números. Verificar que el workflow realmente se ejecute antes de declarar DELIVERED.

## Contrato de pruebas y diferencias W002 → W003

| Oráculo | Exigencia | Estado inicial |
|---|---|---|
| Derechos | Pexels y NOAA rastreables, fecha de rodaje desconocida declarada | RESEARCHED, descarga W003 NOT_RUN |
| Primer artículo | Clip verdadero en MP4, frame real, codec y audio decodificados | NOT_RUN |
| Película | H264/AAC, 1152 frames, 48s y vídeo real descargado | NOT_RUN |
| Proveniencia | 8 segmentos contiguos, tipos y fuentes, claims contra fuente primaria | NOT_RUN |
| 390/1440 | Primer frame y subtítulos distinguibles, fachada/agua protagonista | NOT_RUN |
| Escucha | Voz sintética claramente identificada, tono y sincronización | NOT_RUN |
| Aprobación | Juicio artístico y editorial humano | NO |

**Comparación controlada:** viejo batch `video-w002-20261122`, nuevo `video-w003-20261122`; conserva metraje contextual autorizado y caso factual, cambia uso de rótulos, inserta una explicación MOSE señalizada y aumenta protagonismo del footage. No afirmar *mejor calidad* sin examen perceptual independiente. Fuentes originales, cortes y pruebas están versionados aquí, nunca en la ruta W002.
