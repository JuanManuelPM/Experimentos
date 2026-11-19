# FORJA V2 · Integración cinematográfica candidata
**Fecha:** 2026-11-18 · **Estado:** código y control de escritorio/móvil probados localmente con DOM/actores simulados. No hay render WebGL final aprobado.
**Abrir código:** `JuanManuelPM/Experimentos@candidate/forja-v2-pilot-integracion-20261118:prometeo/forja-v2-pilot/`.
**No está publicado en GitHub Pages.** `gh-pages:prometeo/forja/` original conserva funciones, datos locales y URL sin modificaciones.

## Qué se desarrolló REALMENTE
Fork aislado de la FORJA existente (mismos `forge.css`, inspector, gizmos, catálogo, undo/redo, edición de transformaciones, serialización JSON), con extensión `pilot.mjs` y lógica cinematográfica verificable `pilot-core.mjs`, sin crear otro editor.
- Dos GLB NPC civiles auténticos del mismo repositorio público, anclados al commit `01e585a57e19c56443c63eaea69bd498236b703b`. Se valida SHA-256 con `crypto.subtle` **antes** de `GLTFLoader.parseAsync`, sin crear un actor de reemplazo si no cargan. Referencias: `SCENE_LOCK.json`.
- Preset de cocina hecho de objetos de furniture-kit Kenney verdaderos (13 props + actor), con posición/altura nominal. **No es la cocina hero GLB final del owner**, que sigue faltando como URL pública verificada. El piso de FORJA es el piso del editor.
- Timeline determinista de 20 segundos: idle, caminar, giro, aproximación, parada, investigación de objeto y cierre; 5 tomas, control de play/pausa, seek, cámara automática o libre, eje frontal seleccionable para CALIBRAR (validez artística **no inferida**).
- Animación: se busca clip real Walk y se detiene la locomoción si no existe. Los gestos de mano/IK se declaran pendientes si faltan clips compatibles, **nunca** se toma un corte de cámara como prueba de agarre.
- Preservación de editor: mover/rotar/escalar, inspector, biblioteca, guardado/importación v1 con campo opcional `cinema`, historia y dos skins. El piloto usa nueva clave localStorage: `prometeo.forja.v2.pilot.scene.v1` para no pisar el editor estable.
- Bloqueo explícito de exportación GLB cuando hay actor con rig: el exporter actual no conserva clips garantizados. Guardar JSON sí conserva referencias, transformaciones y timeline.
- Si una escena no importa todos los GLB, se rechaza antes de guardarla en historial, en lugar de declarar éxito parcial.
## Reproducir con servidor y red
Este candidato está en la rama, no desplegado. Checkout de `candidate/forja-v2-pilot-integracion-20261118` y servir raíz de repo:
```sh
python -m http.server 8000
# navegador: http://localhost:8000/prometeo/forja-v2-pilot/
# ?empty=1 omite autoload para comparar la FORJA original
```
Requiere WebGL2 y conexión a CDN Three.js + GitHub Raw para el Atlas; si no funcionan se debe declarar bloqueo, no pantalla negra silenciosa. Se diseñó para modo móvil, pero QA Android físico sigue pendiente.
## QA
`node --check prometeo/forja-v2-pilot/{forge,pilot,pilot-core}.mjs` (ejecutar individualmente, no usar llave si entorno no expande).
`node --test prometeo/forja-v2-pilot/pilot-core.test.mjs`.
Se ejecutaron 9 pruebas Node en local sobre el motor semántico y 17 chequeos V8 del código exacto recuperado de GitHub. Chromium local con actores simulados: panel+timeline+swap de actor en 1280 y 390px PASS. **No se verificaron los píxeles reales de los GLB**; el probe de WebGL2 devolvió false y no había acceso de red al CDN/modelos. `QA_RECEIPT.json` distingue niveles.
## FORJA PR #4–#12
Todas son abiertas, DRAFT y sin merge. #4 cámara sobre base mobile UX; #5/#6/#7 derivan de #4; #9 converge cambios desde loading-start-v5 pero unstable; #8/#10 desde esa base; #11 depende de #7; #12 de #10. **No se fusionaron ni se copió código incongruente.** Este piloto es un fork aditivo del `gh-pages` actual y tiene la obligación de reexaminar esas PR antes de cutover.
## Próxima operación
Ejecución con navegador/servidor WebGL real en entorno conectado: comprobar que los GLB cargan, elegir frente verdadero del civil, medir foot slip y ropa, verificar cámara/escena y captura de 5 frames; sustituir kit por hero GLB si se puede recuperar y distribuir con derechos. Corregir defectos y sólo después considerar URL pública/PR controlada.

## Integración efectiva con la cámara original (corrección de duplicación)
El piloto dejó de calcular sus planos con una implementación paralela: importa y utiliza el **mismo módulo original** `3d/cinema/semantic-director@0.1.0` MIT (Git blob exacto `43b8138bf9d0a8b9181bebd61c7c2730ca9f10b0`) en `vendor/semantic-director.mjs`. El `OWNER_SHOTLIST` ahora se valida con `validateShotlist` y cada plano se obtiene con `sampleFrame` y `semanticAnchors` originales (480 cuadros, 24 FPS, 20 segundos, 5 tomas), sin modificar el módulo dueño. `FRAME_SAMPLES.json` fue regenerado con la nueva implementación.

También se corrigió que el modo **cámara libre** preserve la reproducción del timeline y se rechazó tratar un clip de saludar/hablar como agarre de objeto. La última verificación de fuente ejecutó **15/15 checks V8** sobre los bytes exactos de GitHub. Los **11 tests nativos Node** actualizados están escritos pero NO se ejecutaron después del cambio de módulo en un checkout completo; los 9/9 Native Node anteriores corresponden a la primera versión del controlador. No hay WebGL ni actuación visual aprobada.
