# Asteroide Jardín · 3D W6 / 03

**Producto original:** mundo 3D esférico e interactivo con dos criaturas, tres rocíos, faro final y jardín que florece. **Estado:** código y fuentes publicados con readback SHA; WebGL, Android, HTTP de Pages y misión completa en navegador **NOT_RUN**, sin aprobación humana.

**Abrir:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/3d/w6/03/

**Código:** https://github.com/JuanManuelPM/Experimentos/tree/gh-pages/prometeo/previews/3d/w6/03

## Decisiones visibles en el código

- Geografía: relieve icosaédrico suavizado por función autoral, color de vértices, masas de piedra no cúbicas, hojas y flores orgánicas, rutas curvas y dos fuentes de luz.
- Actor: criatura no humana de perfil de revolución, alas hoja, antenas, mímica de ojos y movimiento radial. Habitantes Nima y Boro con siluetas y rutinas distintas.
- Mecánica: tangente y normal esféricas a cada frame; dirección basada en la cámara; colisiones de piedras con subdivisión de pasos. Biblioteca reutilizable en `planet-motion.mjs`.
- Relato: Nima inicia; tres rocíos repartidos por el mundo; Boro recuerda la palabra; el faro enciende el bosque y la nueva condición persiste al recargar.
- Interacción: WASD/flechas + E o joystick y botón grande; arrastrar en escena modifica cámara; reinicio con confirmación; partida propia en localStorage.

## Referencias externas observadas y decisiones no copiadas

1. **Nintendo, entrevista sobre Super Mario Galaxy**: el campo esférico y la gravedad como fundamento del diseño. Se tradujo a locomoción tangencial, orientación radial y recorrido en arcos. https://www.nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-Super-Mario-Galaxy/Volume-2-The-Developers/2-Benefits-of-a-Spherical-Field/2-Benefits-of-a-Spherical-Field-222607.html
2. **Adam Robinson-Yu, A Short Hike (entrevista PlayStation)**: libertad de desviarse, encuentros con personajes y escala compacta. Se adoptó un micro mundo de lectura clara con misión finita, sin replicar assets ni gráficos. https://blog.playstation.com/2021/08/05/crafting-a-tiny-open-world-a-look-behind-the-scenes-at-the-creation-of-a-short-hike/
3. **Bruno Simon, portfolio WebGL**: página con movimiento, cámara, controles táctiles y reinicio explícitos. Se ofrecieron áreas táctiles separadas; no se ejecutó la aplicación de referencia. https://bruno-simon.com/
4. **Three.js Raycaster, documentación**: revisión de interacción por intersección; se prefirió proximidad esférica como solución legible en joystick. https://threejs.org/docs/pages/Raycaster

## Verificación y brechas

DEEP-SPEC-1: **READY_FOR_FIRST_SLICE**, validador ejecutado sobre contenido exacto de GitHub. Ocho verificaciones de código y matemática: **8 PASS** sobre blobs leídos. Readback de `index.html` y `planet-motion.mjs` en `gh-pages`: **sha idéntico** al de candidata.

**NO confirmado:** render WebGL real, tamaño y belleza desde móvil, interacción física en dispositivo, FPS, calidad artística independiente, final de misión reproducido en navegador y carga HTTP externa desde esta herramienta. La herramienta de acceso HTTP no recuperó Pages, tampoco el portal ROOT conocido; eso no permite concluir si la página está accesible para usuarios. Esta obra es candidato publicable, no excelencia certificada.

**Aprendizaje preventivo:** spike inicial halló que comprobar solo el punto final de una caminata permite cruzar objetos. Se cambió a iteraciones discretas sobre la esfera y un test con obstáculo atravesando la trayectoria, no solo al destino.

**Dependencias:** Three.js 0.160.1 desde CDN jsDelivr (MIT); archivos restantes de elaboración original. Sin copias de arte, música o personajes ajenos. La partida se guarda solamente en almacenamiento local del navegador.

**Control de integridad:** `index.html` blob `63022ca61244e6ae02d9e89a1df7abf15223803c`; `planet-motion.mjs` blob `f70a605b2b064a0111b8c0ab060d638ac93c700b`; lanzador original `942c3ba8b851137886e959d2790771556e2d9f5d`. No se modificaron lanzadores, flujos ni obras históricas.
