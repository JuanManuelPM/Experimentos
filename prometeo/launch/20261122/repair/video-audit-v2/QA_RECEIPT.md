# QA RECEIPT · PROMETEO Video Audit V2 · 2026-11-22

Estado `CANDIDATE_NOT_PROMOTED` · rama `candidate/prometeo-video-audit-v2-20261122`.

## Ejecutado por auditor en entorno local
- Python `unittest`: **8 tests PASS**, incluyendo identidad, primer slice faltante, binario remoto inexistente, autoaprobación, procedencia, causalidad, `audioReview: NOT_RUN` y ausencia de export.
- Se comprobó con una **película sintética de prueba** de 1 s (FFmpeg local, video 160×90 12fps + AAC) que el gate parsea `ffprobe` y no declara aprobación artística. Esta película **no pertenece a W002** ni es una prueba de sus archivos. Resultó `TECHNICAL_EVIDENCE_READY_ART_NOT_CERTIFIED`, `qualityClaimAllowed=false`, `humanApproved=false`, advertencia `CRITICAL_LISTENING_NOT_RUN`.
- Fuente publicada y comprobada contra hash Git blob local: `video_quality_gate_v2.py` = `53aad048b25c34afcf25215b95800df0a0624686`; `test_video_quality_gate_v2.py` = `ebdd198aed5f6a98b0430ebba76fb19a48fe4a18`.
- Evidencia visual revisada por el auditor: JPG N03 a 2, 14, 22, 30, 46s; PNG N07 frame 420; contacto N09 con 4 tiempos. URLs y blob SHAs conservados en [AUDIT_W002.md](AUDIT_W002.md).
- Código N10 y fuentes/QA de N01..10 revisadas. MP4 originales **no descargados ni decodificados por este auditor**, listening/escucha de obra original **NOT_RUN**, navegador HTTP Pages **NOT_RUN**, prueba de espectador **NOT_RUN**.
- Las rutas de 02, 05 y 06 no incluyen binarios publicados; N01 no tiene película; N10 sí tiene editor publicado pero WebM de ejemplo es local al chat. Ver matriz.

## Protocolo de salida
```sh
cd prometeo/launch/20261122/repair/video-audit-v2
python -m unittest -v test_video_quality_gate_v2.py
python video_quality_gate_v2.py /ruta/al/manifest.json --root /carpeta/de/media
```
El estado del CLI es deliberadamente **insuficiente** para aprobar arte. `INCOMPLETE_NO_FILM` devuelve salida no cero. Los manifiestos de obra deberán producirse al usar este gate, no se rellenan retroactivamente con declaraciones inventadas.

## Readback y riesgos
Cualquier error que el CLI no pueda observar (pose, composición, sincronía perceptual, calidad de mezcla, lectura de referencia) queda en `NOT_RUN`, incluso si la estructura del JSON pasa. Este paquete no ejecuta una nueva tanda, no toca los MP4/SHAs históricos y no promueve el método a ROOT. Necesita integración controlada del propietario antes de ser vigente.
