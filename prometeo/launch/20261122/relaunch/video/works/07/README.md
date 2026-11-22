# EL RELEVO · VIDEO W003 / 07

**taskId:** `video-w003-20261122-07` · **LAUNCH blob:** `0cc574528594731a3d1cf0c15a0d0e5a37e775b7` · **state:** `TECHNICAL_VIDEO_PASS · HUMAN_APPROVED=NO`

[▶ Reproducir película animada con sonido y exportación WebM](https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/video/works/07/)

## La obra

Corto animado original de **28 s de timeline**, ocho planos y **cero diálogos**. Una mujer mayor (Elsa) conserva un pájaro de papel rojo; se lo entrega a una joven (Ina), que después descubre a un niño solo (Leo) y se lo da. El final convierte al pájaro en símbolo de compañía bajo un paraguas. Los dos pases son planos macro continuos con contacto de manos; no hay carteles explicativos.

El player renderiza en Canvas 2D a 960×540 y compone lluvia, foley y una secuencia de notas originales mediante PCM sintetizado. **Exportar WebM** graba un stream audiovisual verdadero en el navegador. Un WebM local se transcodificó con FFmpeg a **MP4 H264/AAC**, 960×540, 557 cuadros, 27.85 s, 1,142,078 bytes. SHA256 `8f8a16e66f9f3d879fe846b41db221dcf3dcd001aa65086a2207eb81a2e534ea`.

**Distribución:** la película MP4 y el WebM preexportados están adjuntos en el chat de ejecución (no se publicaron como binarios de GitHub). El **reproductor/fuente completo**, capaz de generar y exportar WebM, sí está disponible en gh-pages. No confundir origen reproducible con almacenamiento público del binario. HTTP de GitHub Pages y reproducción en Android: **NOT_RUN**.

## Fuentes y utilidad reutilizable

- [index.html](index.html): escena, actuaciones por fotograma, cámara, composición sonora, controles y exportador integrado.
- [RACCORD_GRAPH.json](RACCORD_GRAPH.json): ocho nodos, siete aristas, dueños/estado emocional, cambios en `S04: ELSA→INA` y `S07: INA→LEO`, causalidad y dirección izquierda-derecha.
- [PREPRODUCTION.deep-spec-v1.json](PREPRODUCTION.deep-spec-v1.json): Book Q-LOOP/QBAR/DEEP-SPEC/ART-DIRECTION integrado.
- [QA.json](QA.json): export, FFprobe, decodificación, señal, Chrome 390/1440, evidencias y faltantes.
- [TRACE.json](TRACE.json): nodos realmente visitados, Flow (SHA de contratos) y skips. Sin fingir validación con trace propietario incompatible.

## Validación e insuficiencias

**PASS observado:** MP4 con dos streams decodificados completos; pico PCM 0.10071, RMS 0.01355; ocho planos contiguos, dos transferencias y cero saltos de dueño; navegador Chromium a 390×844 y 1440×900 sin error JS ni overflow. Hubo una **regresión real** en el plano final: el vehículo tapaba al niño. Se corrigió la profundidad de capas y se inspeccionó de nuevo en una captura de 26.2 s.

**NOT_RUN:** prueba ciega con espectadores que no conozcan la sinopsis; escucha crítica independiente; HTTP público/Android; publicación del binario MP4 en GitHub; aprobación humana. Los rostros/manos siguen siendo ilustración estilizada, no actuación fotorrealista. El primer artículo pasó la prueba acotada de continuidad de contacto, no una calificación cinematográfica. Los screenshots 390/1440 existen localmente, pero no están archivados remotamente; por lo tanto **ART-DIRECTION=FIRST_FRAME_CAPTURE_REQUIRED** y no `READY_TO_BUILD_NOT_ARTISTICALLY_APPROVED`.

## Comparación con W002

- **oldBatchId:** `video-w002-20261122` · brief blob antiguo `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`.
- **newBatchId:** `video-w003-20261122` · brief blob nuevo `0cc574528594731a3d1cf0c15a0d0e5a37e775b7`.
- W002 auditaba figuras cutout y actuación no demostrada a partir de **un único frame**, sin comprensión ciega. W003 fija transferencias causales, dos escenas macro, ritmo de miradas y audios sincronizados. **No existe A/B con espectadores ni comparabilidad de calidad certificada**.
- Benchmark visual realmente examinado: un still oficial de [Bao, Pixar](https://www.pixar.com/bao/) que demuestra la importancia de la mano y el contacto. Documentación oficial de [Paperman](https://www.disneyplus.com/browse/entity-a257e161-96eb-4e54-995f-0ead0bc65cdd) consultada; película completa no vista ni copiada.
- Flujo propietario especializado: `SHA_NOT_RESOLVED`; auditoría Video V2: **candidata, NO PROMOVIDA**. No se modificó ningún trabajo anterior ni se despacharon otros números.

## Licencias

Todos los dibujos, personajes, pájaro, música y efectos procedurales son originales para este encargo. No se incrustaron imágenes, audio, videos o personajes de terceros. `HUMAN_APPROVED=NO`.
