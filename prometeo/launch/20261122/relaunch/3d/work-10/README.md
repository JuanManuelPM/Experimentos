# F/20 · Bicicleta plegable · WORK 10
Modelo y configurador 3D originales. Unidades: **metros**; concepto, no plano de fabricación ni certificado de resistencia.

**Abrir:** https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/3d/work-10/
**Fuente única:** https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/relaunch/3d/work-10/index.html

Al entrar aparece la bicicleta armada. El usuario rota con arrastre, hace zoom con rueda o pinza, y alterna ARMADA / PLEGADA / DESPIECE. Los tres colores cambian material PBR; CIUDAD / VELOZ reconstruye neumáticos y ancho del manillar. El despiece muestra los **14 conjuntos** reales del árbol de escena y permite guardar configuración+BOM JSON o el mesh actual como GLB (exportador no ensayado en navegador en esta sesión).

`mechanics.mjs`: dimensiones, BOM, invariantes de plegado, transformaciones reutilizables. `app.mjs`: escena tridimensional, geometría, animación, agrupación de piezas y render. `mechanics.test.mjs`: regresiones Node para cinemática y BOM. `spike.html`: primer artículo 3D de bisagra/ruedas anterior a la construcción completa. `PREPRODUCTION.deep-spec-v1.json`: Book+ART-DIRECTION; `STAGE_TRACE.json`: etapas visitadas; `QA_MANIFEST.json`: evidencia y límites.

**Dimensiones de concepto:** distancia entre ejes 1130 mm; radio de rueda 276 mm; bisagra vertical desplazada 90 mm de plano de ruedas; diferencia de planos de rueda 180 mm tras plegar 180°. Se requiere cálculo de tolerancias, fijación de cierre, ensayo estructural y estudio de interferencias continuo antes de fabricación.

**Verificación local a ejecutar:** `node mechanics.test.mjs`; `python -m http.server 8080` y abrir `http://localhost:8080` desde este directorio con red accesible a CDN. Capturar 390 y 1440, accionar tres modos, variar ambos materiales, exportar/reimportar GLB y revisar consola/colisiones. Esas pruebas de navegador **NOT_RUN** en esta ejecución por límite externo, no se han falsificado capturas.

**Benchmark observado como texto, no CAD inspeccionado:** Tern Verge X11 (bisagra OCL+), guía de plegables Brompton (compactación y clamps), manual oficial de Three.js (módulos/rendimiento). Sin reutilización de modelos ni logos de esas marcas. Geometría propia creada en JS; Three.js bajo MIT.

Identidad: `3d-w7-20261122-10`; launch blob `58de659e2aa01c0746d59ca6f95c36bdc59f3030`; flujo 3D `2.3.0` SHA256 `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`; estado `SOURCE_PUBLISHED · VISUAL_QA_NOT_RUN · HUMAN_APPROVED=NO`.
