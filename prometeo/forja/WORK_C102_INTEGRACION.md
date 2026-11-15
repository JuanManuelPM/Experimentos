# WORK C102 · Integración candidata en FORJA real · 2026-11-14

**Producto dueño:** `JuanManuelPM/Experimentos/prometeo/forja/`.
**Rama de este trabajo:** `candidate/forja-work-c102-integracion-20261114`, basada en `candidate/prometeo-forja-mobile-ux-reentry-20261113`.
**Estado:** `SUCCESS_SELF_CHECKED / REVIEW_REQUIRED`. No cambio a `master`, ni GitHub Pages productivo, ni juicio de calidad artística humano. La integración Three.js/WebGL2 está **implementada en fuente, no ejercitada en runtime con GPU**.

## Cambios visibles
1. El editor original conserva `forge.mjs`, GLTFLoader, catalog.json fijado a commit, edición, selección, TransformControls, JSON/GLB, undo/redo, autopersistencia y layouts móviles.
2. `forge-cinema.mjs` adapta el `CameraRig` probado de C107 al canvas Three.js original: ÓRBITA nativa, SEGUIR modelo seleccionado o vehículo, PRIMERA PERSONA con WASD/flechas/touch, RECORRIDO de 20 s, pausa y captura PNG. No duplica escenas, no altera el formato `prometeo.forja.scene/v1` y no modifica las posiciones de los modelos.
3. Cuando WebGL2 no está disponible o el contexto se pierde, `forge-fallback.js` muestra la demo autónoma `ciudad-viva/index.html` en un iframe real, con rótulo **VISTA 2D · NO EDITABLE**. Nunca afirma que el fallback sea el editor 3D.
4. `tools/glb-inspect.mjs` y `tools/asset-cache.mjs` colocados junto al proyecto con sus pruebas. Son herramientas Node para el pipeline de assets, **no forman parte del runtime de navegador**.
5. Cámara y demos se conservan para reproducir regresiones en un solo repositorio. Todos los cambios son candidatos, sin gasto adicional.

## Evidencia
| Evidencia | Resultado |
|---|---|
| Tests Node.js nativos de C105+C106+C107, los mismos módulos incorporados al repo | **PASS 25/25**, duración local 248 ms |
| Reanálisis del catálogo `Hidencod/tge-assets@3ddcc695...` | **PASS 19 packs, 1.883 modelos**, `catalog.json` Git blob `b9821cf0e7064802ba29ec398d04f0fb68f70fb8` |
| 13 identificadores de modelos de presets comprobados contra catálogo | **PASS 13/13** |
| Demo C112 en Chromium canvas2D, tamaños 1365×768, 390×844 y 738×332 | **PASS 3/3**, 23 edificios, 10 vehículos, frame loop activo y sin JS errors; capturas con desviación de imagen medible |
| Demo C107 con cámara C107 en Chromium 390×844 | **PASS 4/4** modos, sin excepción JS |
| Adaptador `forge-cinema.mjs` con stubs de Three y DOM realista (V8) | **PASS**: sintaxis, 4 transiciones, tecla de avance, retorno al control orbital, creación de vista 2D si falla GPU |
| HTML: ids únicos / archivos existentes / import module / CSS / estado de fallback | **PASS** |
| WebGL2 y Three renderer con CDN/modelos desde navegador en esta sesión | **BLOCKED_ENV / NOT_RUN**: `canvas.getContext('webgl/webgl2')` retorna `null` incluso con SwiftShader |
| Android físico, calidad artística y verificador independiente | **NOT_RUN** |

**Cómo repetir el control Node:**
```bash
cd prometeo/forja
bash tests/run-regression.sh
```

## Advertencias que no hay que esconder
- `forge-cinema.mjs` no está certificado con GPU; solo su lógica de orquestación y geometría matemática. La integración final del renderer requiere QA real con WebGL2, modelos GLB y selección/drag.
- `ciudad-viva/index.html` es una demostración autocontenida; sus 23 edificios son geometría procedural propia. No se presenta como sustituto de los GLB de Kenney ni como escena FORJA editable.
- `tools/asset-cache.mjs` pasa pruebas HTTP mock y verificación SHA256 de fuente obtenida por GitHub, pero descarga directa con Node `raw.githubusercontent.com` no fue ejecutable en este contenedor por DNS.
- El trabajo `C101` de integración de loaders está reclamado por otra rama sin `RESULT` comprobado. Este C102 no lo suplanta ni permite marcar C103/C104 como terminados.
- Los tests usan navegadores emulados, no un teléfono Android físico. No afirmar producción ni publicación hasta completar puertas `C113`/`C114`.

## Siguiente secuencia operativa
1. Con WebGL2 real: cargar 9 GLB del preset Barrio, comprobar conteo/errores, rotar en los 4 modos, manipular transformaciones y descargar/abrir JSON+GLB.
2. Validar recorte y targets en Android vertical/horizontal y opción «sitio de escritorio».
3. Si pasa, revalidar C101 y recién entonces integrar C103 demo con modelos reales y mover la rama candidata mediante PR verificado; no adelantar `master`.
4. Ante fallo, guardar captura + consola + modelo/URL y corregir en la misma rama. No retornar al usuario una lista infinita de tareas.
