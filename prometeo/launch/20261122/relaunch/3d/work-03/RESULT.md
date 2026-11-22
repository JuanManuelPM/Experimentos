# ASTEROIDE JARDÍN · W7/03 · segunda siembra

**Identidad:** `batchId=3d-w7-20261122` · `taskNumber=3` · `taskId=3d-w7-20261122-03`. Lanzador W7 bloqueado al blob SHA `58de659e2aa01c0746d59ca6f95c36bdc59f3030`. Antiguo W6 preservado.

**ESTADO REAL: SOURCE_PUBLISHED / LOGIC_VERIFIED / FIRST_ARTICLE_REQUIRED / WEBGL_NOT_RUN / HUMAN_APPROVED=NO.**

[Intentar abrir la experiencia](https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/3d/work-03/) · [Fuente publicada](https://github.com/JuanManuelPM/Experimentos/tree/gh-pages/prometeo/launch/20261122/relaunch/3d/work-03) · [Fuente candidata](https://github.com/JuanManuelPM/Experimentos/tree/candidate/prometeo-3d-w7-20261122-03/prometeo/launch/20261122/relaunch/3d/work-03).

## Obra nueva y alcance

Escena 3D de un planeta-jardín con la misma misión que exige el brief original, preservada para comparación entre tandas. El personaje se mueve en tangente a la esfera, mantiene su normal radial de orientación, evita obstáculos con barrido subdividido y puede saltar con aceleración hacia el centro. Hay dos habitantes con rutinas geodésicas y cambio de conducta después del final. Para completar la historia: hablar con Nima junto al faro → obtener los tres rocíos únicos → conversar con Boro → volver al faro. Al completarla, aparecen flores y aumenta la luz del faro; los habitantes convergen allí.

Los archivos son `index.html` (obra WebGL), `planet-motion.mjs` (física radial y locomoción reutilizable), `quest-state.mjs` (reducer de misión y save sanitizado), `garden-flora.mjs` (familia de vegetación de autor y animación sutil) y `test-logic.mjs` (13 tests Node sin librerías externas). Usa Three.js 0.160.1 por CDN, que necesita conexión y WebGL; las geometrías son originales. No se incorporaron assets de juegos referenciados.

Controles: WASD/flechas para caminar, espacio para saltar, E para interactuar, arrastrar para cámara; en móvil joystick izquierdo y botones de salto/acción a la derecha. Reiniciar borra únicamente la partida W7 de este experimento; W6 no comparte save key.

## Evidence, no aspiraciones

- **OBSERVED:** parser V8 aceptó las cuatro fuentes JS; 13/13 pruebas de estado, gravedad, obstáculo y wiring; los 5 archivos públicos tienen exactamente los mismos Git blob SHA que la rama candidata.
- **OBSERVED, requiere reparación de evidencia:** DEEP-SPEC-1 respondió `SPIKE_REQUIRED`, ART-DIRECTION/FIRST-ARTICLE-1 `FIRST_ARTICLE_REQUIRED`; las dos fuentes identifican que falta observar el primer árbol en pantalla.
- **TRACE:** `VISITED_TRACE.json` pasó la validación estructural como `STRUCTURE_PASS_MEDIA_NOT_VERIFIED`, con warnings por nodos sin identidad y etapa de cámara NOT_RUN. No es certificado de haber recorrido todo el grafo 2.3.0.
- **NOT_RUN:** test Node en checkout real (archivo creado, ejecución remota no realizada), render WebGL, screenshots 390/1440, hit targets, Android, recorrido físico y final observado en navegador.
- **PUBLIC_HTTP NOT_VERIFIED:** el lector web no pudo acceder al URL Pages; un navegador remoto alternativo no inició porque el proveedor agotó los créditos. Esto no demuestra caída del despliegue ni certifica que funcione.
- **HUMAN_APPROVED=NO.** Ninguna métrica de código reemplaza calidad estética y usabilidad percibida.

Ver [QA_RECEIPT.json](QA_RECEIPT.json), [Book preproducción](PREPRODUCTION.deep-spec-v1.json), [Trace](VISITED_TRACE.json) y [tests reproducibles](test-logic.mjs).

## Comparación controlada con la tanda W6

| Dimensión | W6 | W7/03 |
| --- | --- | --- |
| Brief | Inmutable `942c3ba8` | Inmutable `58de659e`, idéntico en texto 03 |
| Flujo | Especialidad 3D 2.3.0 | Mismo 2.3.0, sin promoción |
| Familia artística | Follaje plano, piedras y flores | Árbol botánico de capas, curvas y siluetas |
| Misión | Cambios directos dentro del render | Reducer puro, estado y pruebas independientes |
| Movimiento | Esfera + barrido | Esfera + barrido + salto radial |
| Fuente | `prometeo/previews/3d/w6/03` | Ruta nueva `prometeo/launch/20261122/relaunch/3d/work-03` |
| Prueba visual independiente | NOT_RUN | NOT_RUN |

La diferencia de estrategia y los checks son observables en código. **Todavía NO está demostrado que la segunda siembra sea visualmente mejor que W6.**

## Condición de cierre perceptual

Inspeccionar el primer grove con WebGL real a 390×844 y 1440×900. Si tiene mala silueta o bloqueo visual, cambiar a ilustración original Canvas/planos billboards en vez de sumar objetos a ciegas. Registrar screenshot real, comprobar puesta en escena y completar misión con joystick sin saltarse pasos. Solo después reemplazar `FIRST_ARTICLE_REQUIRED` y `NOT_RUN` por estados probados. El usuario conserva aprobación final.

**Aprendizaje para integrador 3D:** `first_article_and_qa / source passes but pixels unknown / require 390+1440 WebGL and Android full mission / 3D owner / 13 green tests ≠ visual quality`. No se alteró el método global ni obras anteriores.
