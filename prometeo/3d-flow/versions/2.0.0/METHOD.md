# PROMETEO · ESTUDIO 3D · FLUJO OPERATIVO 2.0.0

**Alcance exclusivo:** todas las producciones audiovisuales 3D del Estudio 3D, no el sistema de todos los chats ni otros estudios. **Fuente única:** `FLOW_INDEX.json` → `versions/2.0.0/flow.json`, hash canónico `27c96cac84056dd8b1f2a952cdb8f0f2f7f8136ef322280f34f510f24c239682`.
**Madurez:** código y grafo en prueba; no se han producido diez escenas con 2.0 ni se ha validado la calidad artística. El método ya está preparado como contrato reproducible.
**Objetivo humano:** producir la escena completa con la mejor calidad posible en una primera pasada, incluso con defectos, y **mostrarla** para que el usuario la evalúe. Aprender entre rondas, jamás ocultar el examen ni reducirlo a un canario.

## 0. Entrada mínima, recuperación y versión

1. Recuperar `JuanManuelPM/pruebas@prometeo/control`: `PROMETEO/START_HERE.md`, `system/CANON.md`, `system/registry/SPACES.generated.json`, `spaces/studio-3d/PROJECT.md`. Recuperar bootstrap en rama `candidate/prometeo-3d-studio-toolchain-spike-20261111`, ruta `cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/3d-studio/PROJECT_BOOTSTRAP.md`; luego cambios recientes, no asumir que el bootstrap sea actualidad.
2. Leer `FLOW_INDEX.json` **una vez** y fijar `flow.version`, `sha256Canonical` y `flow.json` durante la producción, aunque otros chats editen la versión CURRENT.
3. Recibir una descripción humana natural. Puede ser larga, corta o un alias de una palabra. `SCENE_INTENT_CATALOG.json` sólo resuelve nombres **del Estudio 3D**; `scene-compiler.mjs#resolveScene` no crea un router universal de Work. Si alias ambiguo, no adivinar; usar el brief explícito recibido. El catálogo de los diez es candidato, NO un conjunto de briefs congelados y aprobados.
4. Conservar `BRIEF.md` literal y `BRIEF_LOCK.json` con SHA-256 del texto UTF-8 exacto. No le agregues frases sobre Arcade, cámaras o modelos para «mejorarlo». Esas decisiones técnicas pertenecen al método. Los cambios al brief crean otro ID de ensayo.
5. `scene-compiler.mjs#compileSceneContract` transforma briefHash + flowHash + perfil de proyecto en `COMPILED_SCENE_CONTRACT.json`. El compilador determinista identifica cobertura/roles, no inventa renders ni reemplaza el razonamiento artístico del agente.
6. Crear rama de **un único escritor** y subárbol de escena bajo `JuanManuelPM/pruebas`; no escribir ramas de otros proyectos, FORJA, shared global ni el catálogo común.

## 1. Lectura eficiente del grafo

Se conservan 17 etapas y 269 nodos del historial, pero **cada nodo tiene un `procedureRef` que apunta a una de las 17 operaciones profundas** en `STAGE_OPERATIONS.json#/stages/N`. Así un agente lee el procedimiento de una etapa sólo una vez y lo aplica a todos los nodos de la misma etapa, en vez de consumir tokens repitiendo 269 instrucciones.

Para un encargo, cargar sólo: BRIEF y catálogo si hay alias; contrato compilado; `STAGE_OPERATIONS` para las etapas que intervienen; referencias de calidad por componente; y herramientas candidatas pertinentes. No volver a investigar 12 herramientas en cada turno si el mismo SHA/resultado ya está en el repo.

**Especialidades existentes, no duplicarlas:** los propietarios de fábricas `character:`, `vehicle:`, `environment:`, `prop:`, `material:`, `light:`, `vfx:`, `camera:`, `audio:`, `release:`, `qa:` se encuentran en el contrato de la rama `candidate/prometeo-3d-specialty-factories-v1-20261116`, ruta `cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/3d-studio/factories/v1/shared/OWNERSHIP_AND_INTERFACES.md`. La misma carpeta existe importada como referencia en el launchpack 3D. `RESEARCH_AND_GATES_CANDIDATE` NO significa que todas las fábricas estén instaladas/probadas en GPU.

## 2. El criterio de calidad: componente por componente

`COMPONENT_REFERENCE_MATRIX.json` es una matriz de observaciones **humanas** y código inspeccionado, no un ranking de escenas global. Usar la función `selectPositiveReferences`, que excluye explícitamente componentes criticados.

| Proyecto | Componentes que SÍ aprender | Componentes que NO copiar |
| --- | --- | --- |
| Arcade V1 | gabinete de silueta extruida, atlas UV, acabados, CRT curva interactiva, detalles y luz de acento | entorno escaso, cámara limitada, sólo un gabinete |
| Cruce V1 | peatón GLB, locomoción aparente, HUD, datos de tráfico separados | calle pobre, fachadas de bloque, cámara sin control libre |
| Ascensor V1 | atmósfera nogal/latón, contraste luminoso, transiciones y espacialidad | formas desacertadas en algunos objetos, sin prueba de humanos |
| Ventilador V2 | ensamble/despiece y utilidad didáctica | no se observó gran mejora estética V1→V2 |
| Entrevista V1 | referencia NEGATIVA: cara no convence y actuación incompleta | el código sí importa Quaternius GLB: **no afirmar** que la cara era de esferas sin análisis de píxeles |
| Submarino V1 | atmósfera de base | gradiente/fondo plano que arruina profundidad de desplazamiento |
| Estación V1 | problema de arranque que hay que evitar | no sabemos causa exacta del navegador del usuario |

**Regla:** cada proyecto elige su propia dirección artística para HERO, SET, ACTOR, MATERIAL, CAMERA, INTERACTION y MOBILE. Una buena máquina NO demuestra buen salón, un buen peatón NO demuestra buena calle. Para trasplantar una técnica, fijar fuente, SHA, licencia y test de **segundo consumidor** antes de promocionarla al catálogo compartido.

## 3. Cómo convertir el objetivo en una obra COMPLETA

`compileSceneContract` determina `requiredCoverage` y `qualityTargets` desde el brief y/o perfil de nombre corto. Si se pide «salón arcade», debe existir sala, varias máquinas distintas, pantallas con estado y controles, ambiente, cámara y recorrido; un solo gabinete es **falta de alcance**. «Cruce urbano» implica calle, aceras, edificios, peatones y vehículos múltiples, semáforos, comportamiento y cámara para inspeccionar. Para briefs nuevos el agente debe inferir igualmente elementos de cobertura; no está permitido favorecer sólo los diez nombres del catálogo.

El plan interno puede definir distancias de cámara, nivel de fidelidad, LOD, licencias, fuentes y riesgos. Nada de esto altera el texto original humano. **Trabajar por capas:** (A) presencia y silueta de héroes, (B) arquitectura y profundidad del conjunto, (C) movimiento y efectos, (D) cámara/navegación, (E) empaquetado y publicación. La prioridad es completar A–E en la primera pasada, sin concentrar toda la capacidad en A.

`auditFullScope` usa entregables reales para distinguir `COVERAGE_EVIDENCED` de `DELIVERED_WITH_GAPS` y detalla qué falta; **ambos siguen siendo visibles**, no se prohíbe publicar una obra imperfecta.

## 4. Modelado y representación, antes de construir

- **Humano protagonista:** preferir malla real con UV, rig y proporciones coherentes a distancia de toma; seleccionar expresiones/blend shapes/actuación real si hay closeups. Un modelo GLB cualquiera no garantiza calidad. Una persona «hecha de pelotas» jamás sirve como solución final del protagonista.
- **Prop protagonista:** perfil reconocible y topología propia, materiales asociados a superficie, bevels, atlas UV pintado/curado; comprobar silueta por tres cuartos y frontal. La máquina de Arcade puede inspirar extrusión con detalle, pero no todos los objetos deben parecer gabinetes de arcade.
- **Arquitectura/soporte:** cubos, planos y cilindros SON válidos si sus dimensiones, materiales, patrones, encaje y composición son intencionales, como en el Ascensor. Está prohibido dejarlos como placeholders visibles sin identidad cuando el plano los convierte en protagonistas.
- **Mecanismos:** geometría paramétrica o piezas reales con ejes, despeje y despiece explicable; decir «esquema no fabricable» si no hay precisión física real.
- **Fondo 2D:** se permite como matte o impostor de cámara fija. Para cámara libre o travel profundo se necesitan capas espaciales/parallax o geometría real; no confundir shader de gradiente con volumen 3D.
- **Multitudes/objetos repetidos:** InstancedMesh cuando comparten geometría/material; variar atlas, transform, accesorios y distancias, conservar IDs. No clonar nueve pasajeros idénticos a coste cero de arte.

## 5. Herramientas y arquitectura de conexiones

`TOOLCHAIN_ROUTING.json` contiene 12 rutas investigadas. `ADAPTER_INTERFACES.json` describe 12 tipos de contrato (assets, autoría, composición, render, cámara, animación, material, media surface, web, publicación, QA, aprendizaje), conectados por 13 flujos de datos. **Una interfaz diseñada NO equivale a herramienta instalada.**

`adapter-routing.mjs` selecciona sólo herramientas marcadas conectadas y realmente probadas para ese entorno; si faltan, informa y mantiene el mandato de producción con recursos viables. `verifyAcquiredAsset` impide presentar un simple enlace a Poly Haven como un GLB importado: exige hash de bytes, fuente y una instancia runtime identificable. Es una verificación de manifiesto, no inspección real de archivos binarios sin acceso a ellos.

Fuentes verificadas para consultar cuando el trabajo lo requiera:
- Blender background: https://docs.blender.org/manual/en/latest/advanced/command_line/render.html
- Three WebGLRenderer: https://threejs.org/docs/pages/WebGLRenderer (desde **r163 WebGL2 obligatorio**, no asumir WebGL1)
- glTF Transform: https://gltf-transform.dev/cli (optimización ≠ arte ni mejora directa FPS)
- Three InstancedMesh: https://threejs.org/docs/pages/InstancedMesh.html (mallas/materiales compartidos)
- Three KTX2Loader: https://threejs.org/docs/pages/KTX2Loader.html (se debe configurar transcoder y `detectSupport`)
- Poly Haven assets CC0: https://polyhaven.com/license (licencia del asset de esa fuente, no licencia universal)
- MDN webglcontextcreationerror: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextcreationerror_event
- Estudio previo T001–T006 y fábricas de materiales/entornos/cámara/personajes se recuperan desde las ramas de origen, nunca copiando reglas huérfanas.

**Términos de búsqueda operativos** en `TOOLCHAIN_ROUTING.json#searchTemplates`: buscar asset con rol + tipo de cuerpo + texturas UV + licencia + formato; comparar dos rutas sólo cuando cambia el resultado visual. No convertir «investigar más» en otra salida para evitar producir.

## 6. Cámara, FX e interacción

- Elegir `CINEMATIC_GUIDED`, `FREE_LOOK`, `HYBRID`, `STATIC_INSPECTION` por uso del usuario, no por conveniencia del autor. Cruce necesita inspección si el usuario quiere rotar. Una secuencia de cine puede mantener travelling y motivar pausas/cortes.
- Usar tiempo en frames enteros y FPS racional cuando hay video; en interactivo integrar `requestAnimationFrame`, entrada táctil, reset y time scrub cuando hay timeline. Un modo híbrido puede reproducir la escena y liberar la cámara.
- Iluminación profesional es combinación de silueta, material, contraste, key/fill/rim, sombras y exposición. ACES no salva UV mal elegida. Una pantalla viva debe ser **textura aplicada a un prop del mundo** con estado/input, no un screenshot pegado.
- Mantener control de fill rate, luces/transparencias y densidad con LOD/instancias/atlas. No ahorrar GPU cancelando la película o eliminando el conjunto.

## 7. Runtime web y detección de errores

`browser-boot.mjs` implementa detection **WebGL2**, boot por fases, errores específicos y lost/restored context. `browser-check.mjs` identifica loader comprimido único, Blob URL e inicio WebGL2 exclusivo. **Three r163+ NO puede simplemente activar WebGL1**; cambiar de motor/versión/renderizador es un proyecto técnico diferente.

La Estación original dependía de `DecompressionStream('gzip')` + Blob `import()`; varios fallos distintos terminaban en mensaje «No se pudo iniciar WebGL2». Ese diseño es un riesgo conocido y tiene tres alertas estáticas, pero **no está demostrado** que haya causado el error exacto del teléfono. El flujo nuevo exige usar módulos ES ordinarios siempre que sea posible, clasificar `NETWORK_FETCH / DECOMPRESSION / MODULE_IMPORT / WEBGL_CONTEXT / SHADER_COMPILE / ASSET_LOAD / CONTEXT_LOST / RUNTIME`, mostrar mensaje accionable, y fallback **2D explícito** cuando hay recurso real. Ningún backend falso ni test GPU inventado.

## 8. Entrega íntegra, no censura estética

En una ejecución:
- **ANTES de construir:** elegir la mejor estrategia y evitar contraejemplos; esto reduce errores y no es una excusa para no empezar.
- **DURANTE el trabajo:** terminar la escena pedida. Reparar un error técnico fatal de carga antes de entregar está permitido y es deseable; no entrar en un loop interminable de rehacer la dirección de arte o de reescribir el mismo examen a posteriori.
- **DESPUÉS:** guardar fuente, preview técnica, cobertura real, QA factual y traza de 17 etapas, **sin autorrechazar**. Si el resultado es malo se muestra igual. Falta de WebGL/Android prueba se marca `NOT_RUN`, no se presenta como PASS.
- **ENTRE tandas:** sólo con la devolución humana, comparar componentes, mapear etapas, aprender patrones en varios proyectos y versionar flujo nuevo. No modificar el brief humano para mejorar artificialmente un benchmark.

Excepciones auténticas: derechos, seguridad/privacidad, imposibilidad física de publicación o acceso de herramienta. En tales casos preservar código/artefactos reales; nunca falsear pantalla renderizada.

## 9. Evidencia durable y escalabilidad

Cada ejecución independiente conserva:
```
<project-id>/<version>/BRIEF.md
<project-id>/<version>/BRIEF_LOCK.json
<project-id>/<version>/COMPILED_SCENE_CONTRACT.json
<project-id>/<version>/source/
<project-id>/<version>/ASSET_MANIFEST.json
<project-id>/<version>/SCENE_RELEASE.json
<project-id>/<version>/COVERAGE_REPORT.json
<project-id>/<version>/STAGE_TRACE.json
<project-id>/<version>/COMPONENT_REVIEW.json
```
Registrar versión/sha del flujo, commit de obra y URL sólo si existe; CAS para GitHub Pages. Cada fichero tendrá un dueño, otros consumen por ID/version/hash. Sólo promover herramientas al catálogo compartido tras verificar consumo real en otro proyecto. No tocar otros proyectos, ramas ajenas ni el control global.

**Trazabilidad sin burocracia:** `validate-trace.mjs` valida 17 etapas y el SHA real del brief; una evidencia de código no se presenta como screenshot. Las etapas se registran en unas pocas frases al cerrar, no sustituyen la obra.

## 10. Cómo verificar que el método está listo para competir

Ejecutar pruebas reproducibles:
```sh
node --test versions/2.0.0/*.test.mjs
```
`flow-audit.mjs` inspecciona grafo completo, enlaces de procedimientos, aliases, no-abort y transferencias; `scene-compiler.test.mjs` cubre diez perfiles, prompt de una palabra y un brief nuevo fuera del catálogo; `browser-boot.test.mjs` prueba fallos y fallback; `adapter-routing.test.mjs` inspecciona conexiones e integridad de manifiestos; `validate-trace.test.mjs` protege brief. Guardar `QA_2_0_0.json` con pruebas *reales* y pendientes.

**Un test de JS NO demuestra que diez escenas se vean bien.** La validación final será una nueva tanda con brief fijo y observaciones humanas por componente. El método se entrega terminado como **paquete operativo candidato**, no como milagro garantizado.
