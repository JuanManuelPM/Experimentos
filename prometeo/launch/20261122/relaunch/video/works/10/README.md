# SALA DE MONTAJE · VIDEO W003 / 10

**Task:** `video-w003-20261122-10`  
**LAUNCH Git blob:** `0cc574528594731a3d1cf0c15a0d0e5a37e775b7`  
**Anterior:** `video-w002-20261122`, blob `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`  
**Propietario:** `candidate/prometeo-video-w003-20261122-10`  
**Estado:** `IMPLEMENTED_SOURCE_READBACK`, no `AUDIOVISUAL_VERIFIED`, no `HUMAN_APPROVED`.

## Abrir y operar

[Editor multipista W003](index.html). Se requiere un origen web seguro para almacenamiento y compatibilidad del navegador con Canvas, Web Audio, MediaRecorder e IndexedDB.

1. **Crear medios de demostración** crea tres nuevos WebM originales desde `synth()` en el navegador y configura cuatro clips (V1 x3, V2 x1). También se pueden importar archivos locales con autorización. Se aceptan archivos audiovisuales cuya decodificación esté soportada por el navegador, no cualquier códec existente.
2. Cada pieza puede moverse a una pista del mismo tipo, recortarse de los bordes, dividirse en el cabezal, eliminarse, deshacerse o ajustarse desde Inspector. Se dispone de cuatro pistas: V1, V2, A1 y A2, fundidos de opacidad y audio, controles de tiempo, atajos y zoom.
3. **Exportar WebM** graba en tiempo real el canvas del monitor junto a un destino de mezcla de Web Audio. El botón descarga un archivo binario al dispositivo, no una captura estática. El archivo depende del soporte de MediaRecorder y del rendimiento del navegador; MP4 no se promete.
4. **Guardar paquete ZIP** exporta `session.json` más cada fuente local, con CRC32. **Abrir paquete** restaura a IndexedDB y vuelve a cargar la sesión. Este camino resuelve el problema W002 del JSON que no contenía los videos. Es un ZIP sin compresión de hasta ~350 MB para limitar consumo de memoria.
5. **Guardar sesión JSON** sigue disponible, pero **ese archivo NO incluye medios**. El archivo [SALA-DE-MONTAJE.session.json](SALA-DE-MONTAJE.session.json) contiene una muestra editable de cuatro clips con tres descriptores; los videos se generan al pulsar «Crear medios de demostración» y no se publican en este paquete fuente.

## Núcleo temporal / export reutilizable

El modelo `clip={id,mediaId,trackId,start,in,out,volume,opacity,fadeIn,fadeOut}` separa posición de montaje de intervalos de la fuente. `start` es el inicio absoluto en timeline y `in/out` son coordenadas del recurso. `duration = out-in` y `end = start+duration`. El reloj compartido `AudioContext.currentTime` gobierna reproducción y export; `sync()` actualiza los elementos de medios, los fades y ganancias, y `paint()` dibuja capas de video activas. WebM se obtiene de `canvas.captureStream(30)` y de la pista de `MediaStreamDestination`.

W003 reusa **con atribución a la iteración propia anterior** el compositor de W002, no modifica sus archivos, y añade persistencia portable ZIP, validación CRC y varios ajustes: base IndexedDB independiente, cambio explícito de versión, audio de demostración más audible, comportamiento de contexto de audio que evita reanudar en hidratación inicial, y retención en memoria del último Blob para QA.

## Referentes examinados

- [DaVinci Resolve Edit](https://www.blackmagicdesign.com/products/davinciresolve/edit): recorte asimétrico, edición multipista y transiciones. Aspiración, no equivalencia.
- [Shotcut Timeline](https://forum.shotcut.org/t/about-the-timeline/12952): decisiones de clips en tracks y recortes.
- [MDN Canvas captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream), [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), [AudioContext media stream destination](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination): límites reales de export y mezcla.

## Evidencia y límites

`PREPRODUCTION.deep-spec-v1.json` contiene el núcleo ART-DIRECTION/FIRST-ARTICLE. `QA.md` registra pruebas observadas y no realizadas. La sintaxis de ambos scripts y el roundtrip ZIP (incluida detección CRC) se ejecutaron en V8 sobre bytes recuperados del archivo publicado en la rama. **No se realizó un render de video W003 ni se decodificó MP4/WebM W003; no se probó el editor en un navegador con origen real ni se comprobó touchscreen o escucha.** El video del W002 reportado en su QA no es un nuevo export W003.

La demostración procedural no sustituye imágenes filmadas, actuación ni música profesional: acá la obra es la **herramienta de edición**. Cualquier publicación en Pages debe confirmar readback del HTML y probar compatibilidad de navegador aparte.
