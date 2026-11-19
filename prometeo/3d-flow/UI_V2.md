# PROMETEO · Flujo 3D · Interfaz V2
**2026-11-19. Interfaz 2.0.0, proceso original 1.0.0 inalterado.**
Diseño orientado a comprender el proceso, no a exhibir estadísticas. Ruta vertical principal, cuatro especialidades como ramas paralelas, corrección como retorno a QA. Las vistas son **Ruta, Errores, Mapa, Versiones**. Al entrar desde una creación registrada, `?project=cocina-umbria-001` presenta sus errores. Cada nodo abre una ficha con conexiones y enlaces a la documentación canónica original. La vista **Mapa** ofrece general de 17 etapas, 17 grafos navegables por capítulo o el atlas integral de 224 nodos/288 aristas en `∞`.

**Persistencia:** `FLOW_3D_MASTER.json`, `CREATIONS.json`, `FLOW_INDEX.json`, `FLOW_3D_MASTER.md` y `versions/1.0.0` no se modifican ni se les atribuye retroactivamente el flujo a obras históricas. El código nuevo es una interfaz, no una revisión de las reglas.

**QA:** capturas y pruebas reales de DOM/SVG en Chromium headless a 390×844 y 1440×900 con datos JSON canónicos suministrados por fetch de prueba; el navegador local bloqueó HTTP. 224 nodos, 288 aristas, apertura de stage, error, ficha y pantalla completa: PASS, sin errores JavaScript. GitHub Pages HTTP vivo y Android físico: NOT_RUN. La interfaz no certifica calidad artística de las escenas. `UI_V2_QA.json` guarda recibo.

**Integración**: el menú flotante existente de escenas, desde `project-explorer/launcher.js`, expone la entrada `Flujo` con contexto de creación si la URL lo identifica. El portal `estudios/3d/` enlaza al visor. No modificar FORJA ni las escenas.
