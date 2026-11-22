# FORJA Escena · 3D W6 / 09

Identidad: room=3d · batchId=3d-w6-20261122 · taskNumber=9 · taskId=3d-w6-20261122-09.

## Entrar y usar

Abrir index.html en un servidor web que sirva archivos ES module y tenga acceso a jsDelivr. El mismo directorio incluye editor.mjs, editor.css y scene-core.mjs. En GitHub Pages, el destino previsto es:

https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/next/3d/work-09/

1. El editor abre una escultura cinética original, con dos tracks de keyframes. Pulsar REPRODUCIR, elegir el aro, mover tiempo y modificar TRS en el inspector.
2. Añadir grupos, sólidos de estudio, cámaras o luces. Tocar una pieza en el canvas o su entrada en el árbol. W / E / R = mover, rotar, escalar. El inspector numérico modifica transformaciones locales. Ctrl+Z / Ctrl+Y deshace y rehace.
3. Para un GLB autorizado, pulsar + GLB y elegir un archivo local. Alternativamente, pulsar GLB CC0 para recuperar un árbol del catálogo público tge-assets fijado al commit 3ddcc695; editar el objeto o cualquiera de sus nodos internos.
4. Ir a 0 s, colocar el objeto y pulsar KEYFRAME. Ir a 8 s, cambiar posición, orientación o escala y pulsar de nuevo. La reproducción usa posiciones/escalas lineales y slerp de cuaterniones.
5. Pulsar PROYECTO: se descarga JSON v2 con todos los bytes GLB usados en base64, jerarquía, pivotes, transformaciones, cámara, luces y tracks. ABRIR recupera JSON v2 o intenta migrar FORJA v1 desde la fuente CC0. IDA/VUELTA reconstruye una copia y compara documentos del mismo editor; mostrar PASS no reemplaza la verificación externa.

Proyecto de ejemplo independiente: DEMO_PROJECT.json. Se puede abrir desde ABRIR. Los GLB importados no se suben a servidores por el editor, aunque el botón de ejemplo público sí descarga recursos CC0. Para archivos propios, el proyecto conserva la fuente binaria local.

## Arquitectura

- editor.mjs: editor de Three.js 0.181, escena autoral con jerarquía, selección por raycast, gizmo, inspector, cámara, luces y secuenciador.
- scene-core.mjs: módulo exportable sin Three.js con esquema v2, validación de topología/timestamps/assets, interpolador temporal, key upsert y comparación canónica.
- scene-core.test.mjs: doce pruebas mediante node --test scene-core.test.mjs; once casos de lógica ejecutados además en V8 del entorno durante esta producción, y validación de DEMO_PROJECT.json.
- PREPRODUCTION.deep-spec-v1.json: decisiones, observación de fuentes, límites y riesgo alto de WebGL.
- RESULT.md: evidencia, pruebas y brechas.

El editor antiguo de ../forja/ no se altera. La versión previa guarda prometeo.forja.scene/v1 como referencias al catálogo y normaliza alturas. La importación v1 se reconstruye desde la fuente pinned, normaliza de nuevo la altura y conserva posición, giro y escala de instancia; los clips originales GLB no se convierten automáticamente en nuevos tracks de keyframes. No hay fusión en producción histórica ni compatibilidad con OmniAtlas OBJ/MTL.

## Alcance y limitaciones

- La exportación principal es JSON portable; no es un exportador GLB final de escena. Los archivos GLB originales están embebidos dentro del proyecto JSON.
- El editor expone y preserva nodos interiores de GLB, pero impide su reparenting y borrado para no invalidar la estructura del archivo binario fuente. Grupos/objetos editoriales sí pueden cambiar de padre, conservando su transformación global.
- Se guardan y reproducen keys TRS de FORJA Escena. Los clips de animación preexistentes del GLB siguen preservados como bytes fuente pero NO se editan ni reproducen automáticamente con este nuevo secuenciador. Skins, morphs y materiales avanzados deben verificarse con modelos concretos.
- Límite de 24 MiB binarios incorporados en JSON, hasta 1.200 nodos, profundidad 40 y 500 keys por pista. Proyectos grandes pueden no caber en localStorage; exportación JSON manual obligatoria.
- El navegador requiere GPU/WebGL y acceso a los módulos externos CDN; un archivo cargado correctamente o 11 pruebas de lógica PASS no prueban el render en Android.
- La demo procedimental y el código editor son originales. Los GLB de terceros solo se aceptan con derechos verificables del titular. La opción GLB CC0 usa el repositorio público atribuido Hidencod/tge-assets en un SHA fijo; verificar restricciones concretas antes de republicar un modelo.

## Calidad y contraste

Benchmarks realmente consultados: código de FORJA original para persistencia, manual Three.js TransformControls para gizmo, especificación glTF de Khronos para TRS local, manual Theatre.js para secuencia. Se tomaron capacidades, no estética ni assets protegidos. Alcance de observación: fuente y documentación, no recorridos GPU de las referencias.

- Referente → capacidad: Theatre.js tiene timeline editable y playback; decisión: pistas simples con keyframes TRS ligados a UID; brecha: interpolación en curvas, tangentes, dope sheet multipista no implementados.
- Referente → capacidad: glTF conserva nodos/transformaciones locales; decisión: GLB original más overrides recursivos; brecha: casos complejos de meshes animados, skins y nodos con extensiones requieren QA con archivos reales.
- Referente → capacidad: FORJA histórica edita miles de recursos CC0; decisión: extensión aislada con reimportación v1; brecha: carga por catálogo puede fallar por red y límite de bytes.

Estado: IMPLEMENTED_SOURCE · LOGIC_OBSERVED · GPU_NOT_RUN · MOBILE_NOT_RUN · HUMAN_APPROVED_NO. Ver RESULT.md.
