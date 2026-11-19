# FORJA V2 · control real de pausa y scrubbing del esqueleto

Se detectó en el candidato anterior que el controlador pausaba la raíz, pero el render loop de FORJA seguía llamando `mixer.update(dt)` sobre el NPC. El esqueleto continuaba caminando con la raíz quieta. Además, hacer seek modificaba la raíz sin seleccionar de forma determinista el momento del clip.

Este candidato, aislado de la versión publicada, deshabilita el reloj de la animación del actor durante la pausa cinematográfica, conserva otros mixers (props) y evalúa la pose del actor al mover el slider de la secuencia. Los cortes normales conservan sus transiciones y no se toca el NPC fuente. El módulo de cámaras original mantiene su hash.

`pilot-core.test.mjs`: 11 tests originales + 2 regresiones. Se ejecutaron **13/13 tests en V8** contra el código actual leído desde GitHub mediante harness que ejecutó literalmente los cuerpos de los tests. `node --test` nativo y WebGL real todavía **NOT_RUN** en este cambio, no confundir. Ver `TIMELINE_SKELETON_QA.json`.

Pendiente: ejecutar `node --test` en un checkout con acceso, inspeccionar el skinning al seek y fading de clips en WebGL, verificar frente/pies/prop/cámaras y publicar únicamente tras pruebas efectivas. Se conservan `prometeo/forja/` estable, FORJA PR #4..12, Atlas y WORK.
