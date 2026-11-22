# SALA DE MONTAJE · PROMETEO VIDEO W002 / 10

**Task:** `video-w002-20261122-10` · **Launch:** `prometeo/launch/20261122/next/video/LAUNCH.md` · **SHA fijado:** `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d` · **Estado:** entregable experimental con QA parcial, NO HUMAN_APPROVED.

## Usar

1. Abrí `index.html` en Chrome o Chromium con origen que permita IndexedDB. También se publica en GitHub Pages bajo `prometeo/launch/20261122/next/video/works/10/`.
2. Tocá **Crear medios de demostración** (se generan tres archivos WebM audiovisuales originales). Para usar medios propios, **Importar video / audio**; arrastrá desde la biblioteca a pistas V1/V2/A1/A2, o pulsá un clip para sumarlo a la pista predeterminada.
3. Seleccioná un clip y arrastralo para moverlo; los bordes para recortar; cambiá inicio, in/out, volumen, opacidad y fundidos en Inspector. Dividí en la posición del cabezal, deshacé/rehacé.
4. Exportá a **WebM** con video compuesto y audio mezclado en tiempo real. Los archivos son locales: el servicio no recibe subidas. Guardá **sesión JSON** y los **medios** para portabilidad; reimportar archivos de igual nombre reconecta la sesión cuando falta un blob.

## Proyecto editable entregado

- `index.html`: código completo de interfaz, modelo temporal, reproducción, mezcla y export. No hay dependencias externas.
- `SALA-DE-MONTAJE.session.json`: sesión original de 4 clips y 3 medios; `SALA-DE-MONTAJE-edited.session.json`: versión recortada; los medios referenciados son `MOVIMIENTO.webm`, `RITMO.webm`, `LUZ.webm`.
- `original.webm`: export inicial real ~6,25 s; `SALA-DE-MONTAJE-edited.webm`: reexport después de reducir la salida de un clip, ~5,2 s; `SALA-DE-MONTAJE-demo.mp4`: conversión offline H.264/AAC de prueba adicional.
- `PREPRODUCTION.deep-spec-v1.json`, `QA.md`, `test_full.py`, `deep-spec-v1.mjs`: diseño y oráculos; los tests Playwright son de laboratorio, no un reemplazo de pruebas reales en todas las plataformas.

## Decisiones

La API `MediaRecorder` ofrece WebM local sin suponer codificador MP4 en el navegador. Un reloj compartido `AudioContext.currentTime` gobierna las pistas. El fotograma final viene del mismo canvas que el monitor, y la pista audio de `MediaStreamDestination`. Se corrige una condición encontrada en QA: detener la pista de audio compartida luego de exportar impedía audio en segundo export. El código ahora detiene únicamente el video capturado de esa exportación.

## Propiedad intelectual y privacidad

Clips de demostración: composición procedural original generada por `synth()` dentro de `index.html`; tonos de sintetizador propios. No se usan imágenes, videos ni audios de terceros. El usuario es responsable de autorizar material que importe. Los blobs se guardan en IndexedDB local. El archivo JSON no incorpora binarios; para transportarlo se adjuntan medios por nombre.

## Referencias examinadas, no copiadas

- Blackmagic DaVinci Resolve Edit: separación de pistas, recorte y transiciones: https://www.blackmagicdesign.com/products/davinciresolve/edit
- Shotcut timeline: solapamiento y montaje por pistas: https://forum.shotcut.org/t/about-the-timeline/12952
- MDN Canvas capture: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
- MDN MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

## Brechas abiertas

La vista 390px y el arrastre táctil sostenido, persistencia IndexedDB sin shim, latencia de audio en dispositivos externos y compatibilidad Safari/Firefox no se verificaron. La exportación es en tiempo real y no garantiza calidad de editor profesional, precisión subframe ni formatos arbitrarios. Ninguna prueba automatizada constituye aprobación humana.