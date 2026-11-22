# FORJA Escena · W7 / 09

Editor 3D aislado. Este trabajo NO modifica `/prometeo/forja/` ni FORJA Escena W6. Construido a partir de la interfaz/serializador de W6, ahora con un activo glTF 2.0 **binario original** incrustado en la demo. Este experimento es una **candidata técnica**, no un producto aprobado.

## Abrir y usar

Página prevista una vez publicada en `gh-pages`: https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/3d/works/09/

La primera escena se abre con una instalación cinética y una órbita GLB original. En **JERARQUÍA** seleccioná un nodo o un hijo GLB y editá su posición, giro, escala, luz o material según corresponda. **W/E/R** cambian el gizmo. **◆ KEYFRAME** agrega una pose en el tiempo; **▶ REPRODUCIR** y el control de tiempo permiten verla. **↶ / ↷** deshacen o rehacen cambios. **↓ PROYECTO** descarga un JSON con el GLB binario base64 y el árbol de jerarquías, pistas y pivotes. **↑ ABRIR** carga el JSON de vuelta; **✓ IDA/VUELTA** realiza reconstrucción en memoria desde ese JSON y compara estados, bytes y tiempos. **✦ GLB ORIGINAL** agrega otro activo original generado localmente. **＋ GLB** carga archivos locales autorizados. El archivo importado no se sube a ningún servidor.

## El activo real de prueba

`fixture-glb.mjs` genera un GLB 2.0 de **19.740 bytes**, con **4 nodos fuente, 2 mallas trianguladas paramétricas con normales y materiales PBR, un pivote anidado y 1 clip glTF nativo**. `DEMO_PROJECT.json` contiene exactamente esos bytes y representa **13 nodos de edición, 1 activo GLB y 3 tracks**. El generador y el proyecto son originales, aptos para reutilización sin activos de terceros. La aplicación utiliza Three.js 0.181.0 desde jsDelivr; el primer inicio necesita red y WebGL.

Se diferencia de la W6, cuyo proyecto de demostración contenía `assets: {}`. La conservación de bytes fue cotejada en V8 antes de ofrecer el editor como candidato. El GLB incrustado no es una miniatura ni un enlace vacío.

## Validación reproducible y límites

Desde esta carpeta con Node 22+, ejecutar `node --test scene-core.test.mjs` para las 20 pruebas de lógica. Esta sesión **sí ejecutó sus 20 funciones** sobre la fuente y los bytes reales en V8 (20/20 PASS); **no** ejecutó el comando Node 22 sobre un checkout. Hay que probar aparte la experiencia WebGL: abrir el canvas, seleccionar el GLB y su pivote, editar y guardar, cerrar/abrir el JSON, usar reproducción y comparar antes/después. Tomar capturas auténticas en 390 y 1440 px. Probar arrastre táctil en Android. Hasta disponer de eso, `FIRST_ARTICLE_REQUIRED`, `SPIKE_REQUIRED`, `WEBGL_NOT_RUN`, `ANDROID_NOT_RUN`, `HUMAN_APPROVED_NO`.

La demo propia conserva activos originales; cualquier GLB externo que cargue un usuario requiere autorización. El botón alternativo **GLB CC0** usa un catálogo de terceros fijado al commit señalado en `editor.mjs`, no se redistribuye por este trabajo. FORJA v1 puede migrarse según catálogo original si la red responde. Cambios complejos en materiales o rigs externos no están acreditados por las pruebas de núcleo.

## Archivos

`index.html`, `editor.css`, `editor.mjs`: editor visual; `fixture-glb.mjs`: GLB original; `scene-core.mjs`: validador, serializador y timeline reutilizable; `DEMO_PROJECT.json`: archivo independiente con bytes reales; `scene-core.test.mjs`: tests; `PREPRODUCTION.deep-spec-v1.json`: Book + ART-DIRECTION; `FLOW_LOCK.json`: versiones/SHA; `STAGE_TRACE.visited-v1.json`: eventos efectivamente registrados y límites; `QA_RECEIPT.json`, `RESULT.md`: QA y resultado.

La rama de origen es `candidate/prometeo-3d-w7-20261122-09`. Estados de aceptación conservan el bloqueo visual sin modificar el arte anterior.
