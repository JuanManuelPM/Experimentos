> **Nota de auditoría ROOT:** esta evidencia fue registrada cuando la tanda aún esperaba revisión. Su estado PREPARED_PENDING_ROOT_REVIEW es histórico. El lanzador público `LAUNCH.md` se encuentra habilitado para empezar trabajos numerados manualmente; calidad final y producción todavía NO están demostradas. La aprobación del método estructural no sustituye QA de obra.

# PROMETEO · Estudio 3D W6 · EVIDENCE / selección y restricciones

**Resultado de diseño:** `10/10 PREPARED` · `CANDIDATE_AWAITING_ROOT_REVIEW` · no ejecutado. Propietario del lanzador: `JuanManuelPM/Experimentos` rama `candidate/prometeo-nextwave-3d-20261122`.
**Comando único:** `WORK · https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-nextwave-3d-20261122/prometeo/launch/20261122/next/3d/LAUNCH.md · N`.

## Recuperación verificable y precedencia

- Contrato compartido: `JuanManuelPM/pruebas@prometeo/control:sistemas/metodo/CONTRATO_COMPARTIDO.md`, leído con blob SHA `8fa6052db2ee8c76984153dfd7771ac0550b0053`.
- QBAR-1: `JuanManuelPM/Experimentos@gh-pages:prometeo/launch/QUALITY_BAR.md` blob `5653704d3267c339fe7405f2b36b8488dbb44be9`.
- UNIVERSAL: `prometeo/launch/20261122/UNIVERSAL.md` blob `7e0c3219d31f9b1cc67bfec7dc6c3c05e00f2120`.
- DEEP-SPEC-1: `prometeo/launch/DEEP_SPEC.md` blob `84f3f6ef8f7dd1cf39de630f2bf50bec352a3ee2`; validador `prometeo/launch/deep-spec-v1.mjs` blob `0536af26982d50dfc3c3689aca2677751bdee1fe`.
- Evidencia de test de método: `prometeo/launch/20261122/DEEP_SPEC_TESTS.md`: **28 pruebas lógicas in-memory reportadas**, no corrida Node, no producción real, no QA perceptual de los diez trabajos.
- Flujo 3D: `prometeo/3d-flow/FLOW_INDEX.json` blob `cb809bc55a66791680f9c6c76969e154e67023b6` → 2.3.0 `flow.json` hash SHA256 canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`, `METHOD.md` blob `c7eb1ec9179271622a4411ece202c6ffe696ce98`. Es `CURRENT_CANDIDATE` según el índice, NO se promociona ni se altera.
- W5 histórica: `prometeo/3d-flow/w5/LAUNCH.md` blob `1dca62e9bdec5ca20e1a26f0c1dfa73db7e48d1d`; BATCHES.json registra `3d-w5-20261121`, diez tareas. W6 **no es W5 reescrita** ni usa sus ramas.

## Matriz de selección: diez avances distintos

| N | Capacidad diferenciadora | Referente concreto (ID) | Artefacto y capacidad reusable | Atajo mediocre a impedir | Oráculo perceptual + técnico |
|---|---|---|---|---|---|
| 01 | Rostro, rig, actuación y diálogo ramificado | MetaHuman Animator; Blender Studio Spring (R1 R2) | Escena conversable; rig/retarget/lip-sync reutilizable | Muñeco de primitivas; boca sin fonemas; mezcla de clips rígida | Front/side/close-up, labios-audio, dos estados emocionales y elección |
| 02 | Arquitectura y luz material | Unreal Interior Visualization; glTF PBR (R3 R4) | Casa explorable; oclusión inteligente por cámara | Paredes ocultando objeto; luces irreales; muebles sin escala | Recorrido de 3 ambientes en móvil, dos luces, sombra/contacto |
| 03 | Jugabilidad espacial completa | Bruno Simon portfolio, experiencia y controles reales (R5 R6) | Planeta de autor; locomoción/gravedad/NPC/estado reutilizable | Planeta hueco decorativo, NPC que patinan, misión sin final | Completar ciclo; dos NPC; contacto y cámara en táctil |
| 04 | Dirección y secuenciación cinematográfica | Blender Spring; Theatre.js secuencias (documentación) (R2 R7) | Dos actores; timeline; secuenciador exportable | Timeline decorativa o MP4 inexistente | Cambio de planos; continuidad; playback y archivo real |
| 05 | Física articulada y ensamblajes | Rapier joints; ingeniería de mecanismos (R8 R9) | Leva y seguidor; motor de constraints reusable | Engranajes girando sin interacción ni eje | Ciclo, bloqueo/reinicio, deformación y penetraciones |
| 06 | Entorno natural y optimización | Blender Spring; Blender Geometry Nodes (R2 R10) | Bosque de estaciones; vegetación/LOD/clima | Cilindros como árboles, agua plana, recolor estacional | Dos estaciones y cambio de calidad con FPS/memoria observados |
| 07 | Captura verídica y alineación | Polycam capture; PlayCanvas SuperSplat (R11 R12) | Espacio escaneado; visor y comparación foto/3D | Fotos proyectadas sobre cajas; splat presentado como mesh | Calibración de puntos y capturas iguales; derechos comprobados |
| 08 | Datos geográficos, escala y proyecciones | CesiumJS / terreno y GeoJSON (R13 R14) | Atlas multiescala con capas de datos | Altura inventada; mapas como textura sin georreferenciar | Geoposiciones, dos capas verificadas y zoom consistente |
| 09 | Editor funcional de creación | FORJA existente; Theatre.js Studio; SuperSplat (R7 R12 R15) | Editor de escenas; undo/redo, serialización, keyframes | Controles sin efecto; export que pierde transforms | Guardar/recargar y reabrir GLB con estados idénticos |
| 10 | Producto industrial, detalles y despiece | model-viewer glTF; NASA 3D como referencia de recursos reales (R16 R17) | Bicicleta original; BOM/variants/exploded assembly | Piezas flotantes; escalas distintas; falsa ingeniería | Plegado/despiece y relación pieza-BOM/encastre |

**Criterio de elección:** diez categorías no intercambiables. 01 actúa, 02 compone arquitectura, 03 juega, 04 dirige, 05 simula mecanismos, 06 gestiona ecosistema, 07 representa captura real, 08 navega datos geográficos, 09 crea/edit/exporta, 10 comunica ingeniería de producto. 05 no repite 10: una estudia dinámica física, la otra fidelidad de producto/ensamblaje. 03 no repite 06: una es misión con NPC y navegación, la otra ecosistema/LOD. No diez juegos ni diez demos de cubos.

## Referencias públicas revisadas (sin exagerar observación)

Las fuentes se consultaron durante la preparación mediante páginas indexadas/documentación pública. En Bruno Simon se pudo inspeccionar la estructura web, instrucciones táctiles y stack publicado, **no** completar la experiencia real en GPU. MetaHuman, Rapier, Cesium, SuperSplat y Blender se estudian como **capacidad demostrada por sus creadores/documentación**, no como herramientas ya integradas en PROMETEO. El worker de cada N deberá hacer su selección y observación especializada antes de producir.

- **R1** [Fuente](https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-animator). MetaHuman Animator: captura/animación facial y corporal. Referencia de capacidades, no herramienta probada ni licencia de personaje.
- **R2** [Fuente](https://www.blender.org/press/spring-open-movie/). Spring (Blender Studio): corto original de producción 3D; referencia de actuación, ambiente, composición y materiales.
- **R3** [Fuente](https://dev.epicgames.com/community/learning/tutorials/DdRE/unreal-engine-real-time-interior-visualization-starter-guide). Guía oficial de visualización arquitectónica, no prueba de Unreal instalado.
- **R4** [Fuente](https://www.khronos.org/gltf/pbr). Khronos glTF PBR: metalness/roughness y relaciones de luz y material, benchmark técnico.
- **R5** [Fuente](https://bruno-simon.com/). Portfolio interactivo de Bruno Simon: exploración con vehículo, controles táctiles, referencias a Three.js y Rapier y código, recursos y atribuciones declarados por el autor; calidad artística no inspeccionada en sesión GPU.
- **R6** [Fuente](https://threejs.org/examples/). Ejemplos Three.js: render, animación, retargeting, interacción, materiales; capacidad de librería, no resultado artístico automático.
- **R7** [Fuente](https://www.theatrejs.com/docs/latest/manual/sequences). Theatre.js: documentación de secuenciación, edición de keyframes y playback; integración y export reales en FORJA todavía no comprobados.
- **R8** [Fuente](https://rapier.rs/docs/user_guides/javascript/joints/). Rapier 3D: fixed/prismatic/revolute/spherical y constraints, documentación técnica inspeccionada.
- **R9** [Fuente](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/). Rapier rigid bodies: contactos, fuerzas y cuerpos cinemáticos, documentación técnica.
- **R10** [Fuente](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/introduction.html). Blender Geometry Nodes: composición procedural de vegetación/variantes, no arte 3D generado en esta preparación.
- **R11** [Fuente](https://learn.poly.cam/hc/en-us/articles/34419168797972-Which-Devices-Are-Supported-by-Polycam). Limitación decisiva: en Android Polycam admite Object Mode, no captura Gaussian Splat; no prometer esa captura en el teléfono.
- **R12** [Fuente](https://github.com/playcanvas/supersplat). SuperSplat Editor: visor/editor abierto de Gaussian splats en navegador, con import/export y preparación de datos; no prueba de captura por sí solo.
- **R13** [Fuente](https://cesium.com/platform/cesiumjs/). CesiumJS: globo WGS84, terreno/imaginería, 3D Tiles, datos GeoJSON/KML y tiempo, documentación oficial examinada.
- **R14** [Fuente](https://cesium.com/learn/cesiumjs-learn/cesiumjs-terrain/). Cesium Terrain: fuentes de terreno, streaming, resolución y proveedor; verificar acceso/token.
- **R15** [Fuente](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/forja/index.html). FORJA original en repositorio: integración real debe leerse y probarse; no se presupone API completa.
- **R16** [Fuente](https://developers.google.com/ar/develop/webxr/model-viewer). model-viewer: visualización de GLB/glTF y AR condicionado a compatibilidad del dispositivo.
- **R17** [Fuente](https://science.nasa.gov/3d-resources/). NASA 3D Resources: archivos reales para inspeccionar estándares de assets; cada archivo conserva su condición de uso.

## Referentes profesionales complementarios por problema

Estos son **ejemplos reales rastreables a las páginas de sus autores, estudios o distribuidores**, no un certificado de calidad ni reproducciones renderizadas aquí. La investigación de cada trabajador debe examinar los detalles pertinentes de 3–5 referencias antes de elegir estrategia, y no copiar assets ajenos.

| Obra o sistema real | Lo diferenciador que interesa estudiar | Aplicación a W6 | Estado de observación en esta preparación |
|---|---|---|---|
| [Unity Enemies](https://unity.com/demos/enemies) | Ojos, piel, pelo, deformación y actuación digital en tiempo real | 01 | Ficha y documentación de autor consultada; demo GPU NOT_RUN |
| [Unity The Heretic](https://unity.com/the-heretic) | Cortometraje de tiempo real con pipeline de ser humano digital y fotografía | 01, 04 | Fuente de estudio consultada; reproducción directa NOT_RUN |
| [Unreal Archviz Interior Starter](https://dev.epicgames.com/community/learning/tutorials/DdRE/unreal-engine-real-time-interior-visualization-starter-guide) | Diseño interior, materialidad, iluminación y libre navegación | 02 | Guía oficial localizada; interior interactivo NOT_RUN |
| [Bruno Simon, Bruno's](https://bruno-simon.com/) | Mundo original de vehículo con controles táctiles, físicas y puntos de interacción | 03 | Texto del sitio, controles y stack inspeccionados; gameplay propio NOT_RUN |
| [Outer Wilds](https://annapurnainteractive.com/games/outer-wilds) | Sistema de mundos pequeños con aventura, causalidad y exploración | 03 | Ficha del distribuidor consultada; partida NOT_RUN |
| [Blender Spring](https://www.blender.org/press/spring-open-movie/) | Dirección de personajes y ambiente en corto original | 04, 06 | Descripción y datos de producción consultados; reproducción NOT_RUN |
| [Besiege](https://store.steampowered.com/app/346010/Besiege/) | Construcción de máquinas articuladas y pruebas físicas | 05 | Ficha del distribuidor consultada; simulación jugada NOT_RUN |
| [Electric Dreams, Unreal](https://www.unrealengine.com/electric-dreams-environment) | Bosque y generación procedural con reglas, materiales y vegetación | 06 | Documentación de proyecto oficial consultada; render local NOT_RUN |
| [Smithsonian 3D Digitization](https://3d.si.edu/explore/) | Escaneo/documentación de objetos reales y acceso a contenido 3D | 07 | Colecciones y filtros públicos encontrados; dataset del encargo NO SELECCIONADO |
| [Google Earth](https://www.google.com/earth/about/versions/) | Relieve y navegación geográfica multi-escala con imágenes reales | 08 | Capacidades publicadas consultadas; navegación en vivo NOT_RUN |
| [PlayCanvas SuperSplat](https://github.com/playcanvas/supersplat) | Edición, optimización, publicación y manejo de vistas de splats | 07, 09 | Repositorio/documentación leídos; integración NOT_RUN |
| [Theatre.js Studio](https://www.theatrejs.com/docs/latest/manual/sequences) | Sequencer, keyframes y playback sobre objetos | 04, 09 | Manual indexado y estudiado; FORJA integrado NOT_RUN |
| [Porsche Car Configurator](https://models.porsche.com/es-AR/model-start) | Variantes, configurador visual e identidad de producto | 10 | Página oficial localizada; funcionalidad de 3D no inspeccionada |
| [LEGO Builder 3D](https://www.lego.com/en-ca/service/help-topics/article/how-to-download-building-instructions-online) | Secuencias de ensamblaje en 3D, zoom y rotación por pasos | 10 | Guía oficial consultada; app no instalada |

**Confrontación:** ni la propiedad industrial de Porsche ni el motor de Unreal/Unity se trasladan a PROMETEO por citar una URL. Estas obras muestran expectativas de acabado, narrativa, navegación y mecanismos; se buscarán soluciones compatibles con el entorno y derechos reales. Si el producto no se puede observar con el dispositivo/herramientas disponibles, declarar la brecha en vez de reproducirlo con primitivas.
## Capacidad efectiva contra aspiración

| Capacidad | Lo comprobado ahora | Condición antes del primer corte |
|---|---|---|
| Flujo 3D 2.3.0, FORJA, demos W5, recuperación en GitHub | Fuentes y rutas existentes; no prueba de render de W6 | Fijar hash del flujo y auditar assets/versiones al iniciar N |
| DEEP-SPEC-1 en raíz + validador | Enlaces y código disponibles; pruebas lógicas documentadas | Validar ficha en rama de obra; correr Node si disponible; spike de riesgo alto |
| Three.js/WebGL y controles móviles | Ejemplos y trabajo anterior documentados; sin prueba en móvil en esta sesión | Arranque en navegador/Android, control táctil, FPS, memoria y context loss |
| Rig/retarget/lip-sync profesional | Documentación MetaHuman externa, no instalación/credenciales propias demostradas | Confirmar rig/licencia/bytes y usar herramienta realmente accesible; original si no |
| Rapier física y Theatre.js timeline | APIs públicas documentadas; integración PROMETEO todavía no verificada | Spike motor + import/export + captura/reproducción de duración real |
| Splat/Polycam/captura real | Viewer abierto documentado; Android Polycam sin modo captura splat | Comprobar fuente autorizada, formato, acceso, plataforma y permisos |
| Cesium terreno/datos | Biblioteca y formatos documentados; clave/tiles/datasets no acreditados | Probar acceso a terreno, fuentes libres y precisión geográfica |
| Export real de corto y QA artístico | No observado en W6 | Archivo audiovisual reproducible o `NOT_RUN`, nunca mockup aprobado |

## Gate y límites explícitos

- **Gate de existencia/conexión de preproducción:** `VERIFIED_LINKAGE` para referencias en CONTRATO/QUALITY_BAR/UNIVERSAL/DEEP_SPEC y validador. **Gate de ejecución de un nuevo trabajador:** `UNVERIFIED_RUNTIME` hasta que exista la primera ficha válida y spike/readback de ese N; no utilizar `READY_TO_LAUNCH` como afirmación de evaluación ROOT.
- **Lanzamiento:** `CANDIDATE_AWAITING_ROOT_REVIEW`; cero trabajos W6 ejecutados, cero escenas nuevas renderizadas, cero aprobaciones humanas. La decisión de activar/promover queda reservada a ROOT.
- **Atribución:** referencias artísticas inspiran lenguaje, mecánica y nivel de acabado, sin copiar meshes, voces, personajes, fotografía, música o layouts identificables. Los assets externos requieren permiso individual documentado, checksum y fuente original; no asumir que todo lo visible online es CC0.
- **No se imponen Unreal/MetaHuman/Cesium/Rapier/Blender como dependencias obligatorias para TODOS los briefs.** Si una tecnología no está disponible, el trabajador investiga alternativa equiparable con prueba de riesgo, informa el límite y no usa una imitación engañosa.
- **Evidencia artística:** render real y uso táctil/no-táctil de la propia obra, más inspección humana posterior; el validador JSON es estructural. Tests, inspección en GPU y dispositivos: `NOT_RUN` durante el diseño de W6.

## Auditoría de emisión de la W6

- Identidad nueva y única `3d-w6-20261122`, no incluida en `BATCHES.json` estable.
- Diez índices `01..10`, diez briefs concretos breves, una sola URL de ejecución + entero N.
- Fuente de verdad y SHA/version de 3D fijables, con vinculación explícita de DEEP-SPEC y QA.
- Todos los futuros productores escriben en rama y ruta independientes; ningún WORK ejecutado al generar esta documentación.
- W5 y gh-pages no se mutan; el control ROOT revisará la activación.
