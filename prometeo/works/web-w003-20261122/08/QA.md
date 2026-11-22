# SECUENCIA · WEB W003 / 08 · Producción y QA
**Identidad:** web-w003-20261122-08 · web-w003-20261122 · taskNumber=8.
**Brief fijado:** [LAUNCH W003](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/relaunch/web/LAUNCH.md), blob `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`.
**Versión especialista:** `WEB_FACTORY_V2/FLOW.json` 2.0.0 SPEC_ONLY candidata, blob `1a0e709beec9a84986fc33c5ce4ab0a162dccaf2`. No promoción del flujo.

## Entrega observable
- [Editor original](index.html): portada editorial, storyboard, cuatro bloques (portada, texto, imagen, video), inspector, orden, duraciones de 2 a 30 s, tres animaciones y ninguna, formatos móvil/escritorio, media local, guardado, JSON y export HTML.
- [Historia genuinamente exportada](sample-story.html): cinco capítulos, imagen SVG de autoría original incrustada y video WebM real de prueba de FFmpeg `testsrc2` (2 s; 320×180), integrado como data URI. **El video es una señal de prueba técnica, no metraje cinematográfico.**
- [Modelo reutilizable](sample-project.json) y [renderer.mjs](renderer.mjs): esquema declarativo v2 y única función `makeStandalone`. No paquetes ni CDN necesarios en la historia.
- El editor permite cargar videos e imágenes propios o autorizados de hasta 3 MiB. El usuario debe contar con derechos para importar/publicar sus medios.

## Pruebas ejecutadas (18/18 PASS)
Chromium con Playwright hizo entrada visual 1440 y 390; no hubo scroll horizontal en 390; creación/edición y reordenamiento de escenas; carga de WebM real; comparación orden preview/export; clic real de «Exportar HTML» y captura del archivo descargado; ejecución de **esos bytes** en una segunda página/contexto Chromium con red deshabilitada; sin solicitudes HTTP; imagen SVG disponible; `video.readyState=4`, `videoWidth=320`, `videoHeight=180`; JSON descargado, reducción de movimiento, HTML/JS de entrada escapado, consola sin errores, export sin overflow a 390. Reproducible en el entorno de pruebas, no una captura fabricada.

**Límite preciso:** `file://` / `localhost` por `page.goto()` devolvió `ERR_BLOCKED_BY_ADMINISTRATOR` en este entorno. Para probar render se usó `page.set_content()` con los bytes reales descargados y un contexto sin red. Por tanto la prueba **no demuestra** apertura con doble clic en el navegador del sistema ni equivalencia exacta de origen file://. Tampoco se ejecutó navegador público de Pages ni Android físico. No marcar esos hechos PASS.
**Evidencia:** `qa/qa-results.json` reporta cada oráculo; capturas PNG originales de Chromium a 390/1440 y export a 390 guardadas como artefactos de ejecución local; no se afirma que screenshots estén publicados en GitHub. Aprobación artística humana: **NO**.

## Control de integridad de salida
- SHA256 editor final local: `2fecc1db559178e7e9063b9c95657b41179522ef59739a58819f48db37c243ed`
- SHA256 HTML exportado por GUI: `9478445b475610f606ee257b25c69a62170282653d0fbafab810cec520981422`
- SHA256 fuente WebM de prueba: `0ca0079206a45932f56733113e2a3db577a584bdfa5efc0283d85f7f4fe01224`
- La historia exportada contiene el video original generado para la prueba, no un video remoto. No confundir con footage autorizado de un tercero.

## Comparación vs W002
W002: motor editorial y 15 checks estáticos, ejecución real del export/browser NOT_RUN. W003: ejecución Chromium local aislada de la descarga desde interfaz, reordenamiento, multimedia decodificable y comparación de vista, 18 checks. El aumento del conteo no demuestra por sí mismo mayor calidad artística. La prueba `file://` sigue bloqueada y la validación de primer frame sólo es local.

## Gate y aprendizaje
**SOURCE_READBACK:** comprobar tras publicación. **LOCAL_BROWSER:** OBSERVED (Chromium `set_content`). **OFFLINE_EXPORT:** OBSERVED aislado; **FILE_URL_GOTO:** NOT_RUN; **LIVE_HTTP/PUBLIC_BROWSER:** NOT_RUN hasta comprobar; **HUMAN_APPROVED:** NO.
Causa W002: test puramente lógico no atravesaba export de la UI. Prevención W003: importar asset real, descargar GUI, cargar exactamente los bytes en contexto distinto con red deshabilitada y comparar. Próximo gate: publicar capturas reales y abrir Pages en navegador independiente, con acceso permitido. No alterar obras anteriores.
