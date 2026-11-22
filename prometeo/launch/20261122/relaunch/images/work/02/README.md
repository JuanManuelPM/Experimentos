# PATIO DE INVIERNO · images-w003-20261122-02

**Estado: PARTIAL_GEOMETRY_PROVEN_PHOTO_BLOCKED**. Entrega individual de WORK 02 de la tanda W003. Rama aislada `candidate/prometeo-images-w003-20261122-02`. Brief inmutable: [LAUNCH](../../LAUNCH.md) blob `a97b91ca103847ea75eeb9d1d2af10b6c9c0dddd`.

## Resultado real

- **Un raster arquitectónico** 1536×1024 desde ingreso fue generado y observado. La composición del patio, lucernario, olivo, cantero, banco y carpintería es coherente visualmente; **no** es un render derivado del modelo 3D.
- La segunda generación de vista **falló** y produjo una imagen de PROMETEO sin relación con el patio. Se descartó; no se llamó “diagonal”.
- Se cambió de técnica y se implementó un mundo de 7,20×6,00×3,40 m en VTK 9.6, con tres cámaras efectivamente distintas sobre **una sola geometría**, y planta técnica dimensional. Los tres renders 1440×960 fueron inspeccionados localmente.
- **NO** se han conseguido tres vistas fotorrealistas de un mismo modelo. Los renders VTK son estudios geométricos de continuidad, con vegetación faceteada, PBR insuficiente y luz no calibrada. No confundir el primer raster conceptual con un render del mismo rig.
- No hay aprobación humana, screenshots 390/1440 de sitio público ni escrow remoto de los PNG. No se declara FINAL ni calidad profesional.

## Evidencia y límites

Los PNG originales, la planta, el comparador, el código reproducible `scene.py` y el Book completo están en el paquete adjunto del chat que ejecutó W003/02. **La documentación GitHub no contiene los binarios** y no sustituye una publicación de media real. Esta rama registra el trabajo sin tocar W002 ni otros números.

[QA](QA.md) · [Scene manifest](SCENE_CANON.json) · [Book / Deep-Spec](PREPRODUCTION.deep-spec-v1.json) · [Estado](STATUS.json) · [Traza documental](TRACE.md)

## Test primero

1. Definir un espacio y posiciones únicas antes de cualquier vista.
2. Exigir que toda vista fotográfica venga de un solo rig reproducible, no de recortes ni prompts independientes.
3. Probar primer artículo; al perder semántica o identidad espacial cambiar de familia de técnica.
4. Separar tres tipos de prueba: continuidad geométrica, apariencia perceptual y publicación remota.
5. Solo declarar DELIVERED cuando las tres aprueben.

**Recibo ROOT:** `room=images`, `batchId=images-w003-20261122`, `taskNumber=2`, `taskId=images-w003-20261122-02`, `state=PARTIAL_GEOMETRY_PROVEN_PHOTO_BLOCKED`, `HUMAN_APPROVED=NO`. Registrar mediante CAS sin pisar mensajes de otros workers.
