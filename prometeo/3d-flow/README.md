# PROMETEO · Flujo maestro 3D

**Versión de flujo:** `1.0.0` · **Fecha:** `2026-11-19` · **Alcance:** exclusivamente Estudio 3D · **Estado:** `CURRENT_CANDIDATE` como método, no certificado para todas las producciones.

## Abrir el diagrama

https://juanmanuelpm.github.io/Experimentos/prometeo/3d-flow/

- Visor accesible con 17 etapas, 224 nodos, 288 conexiones, zoom, pan, búsqueda, navegación por etapa y ficha de cada nodo.
- Secciones Creaciones y Versiones. La creación Cocina Umbría tiene cuatro errores **observados**: caminar de espaldas, sillas mal orientadas, habitación sin techo, falta de gate visual. Se destacan los nodos afectados. FORJA V2 figura como *QA técnica parcial, visual pendiente*, y ambas creaciones conservan `flowVersionUsed:null`: esta versión no existía cuando fueron producidas.
- La documentación de 4.600 palabras tiene un encabezado por ID de nodo, además de ejemplos de registro, instrucciones de migración y referencias a QA.
- Sin servicios/CDN externos. El visor lee los datos JSON publicados junto con el archivo HTML desde la misma ruta. `offline.html` incluye todos los recursos en un solo archivo para inspección local sin servidor.

## Arquitectura versionada

```
FLOW_INDEX.json                versión actual + sha256Canonical
versions/1.0.0/flow.json       copia inmutable de 224 nodos / 288 conexiones
FLOW_3D_MASTER.json            alias de lectura actual
FLOW_3D_MASTER.md              documentación de procedimientos por ID
CREATIONS.json                 registros por creación, estado y fallos
CREATION_RECORD.example.json   contrato de creación futura
CHANGELOG.md                   historia de versiones
flow.test.mjs                  tests de estructura/reachability/integridad
index.html + style.css + app.js visor público
```

Para **nueva producción**, leer `FLOW_INDEX.json`, fijar `flowId`, `flowVersionUsed`, `flowSha256`, y guardar por nodo el resultado PASS/FAIL/NOT_RUN, evidencia, fuentes exactas, commit, resultado y referencia a parent/versión de la obra. Una actualización del flujo genera una carpeta **nueva** en `versions/`, conserva la vieja, registra el motivo y permite comparar solo pruebas equivalentes. No atribuir un flujo nuevo a productos históricos.

## QA
- `node --check app.js` y `node --test flow.test.mjs` **PASS (6/6)**.
- Playwright Chromium local con JSON real interceptado (no servido por GitHub Pages): **224 nodos, 288 enlaces, 2 registros y 1 versión**, sin errores JS, pantalla 1440x900 y Android emulado 390x844. Navegación a errores, fichas y pestañas funcionando. 
- **Publicación en `gh-pages` y HTTP externo:** verificar después de la escritura y registrar limitación si el entorno impide inspección de la URL externa.
- No se corrigieron objetos ni se generó escena nueva: herramienta documental/operativa, no validación cinematográfica.

## Derechos y límites

La biblioteca pública solo incluye nodos, texto explicativo, hashes/referencias a archivos públicos, estados de QA. **No redistribuye archivos privados, fotografías del usuario, capturas de chats ni modelos comerciales.** El diagnóstico técnico completo privado sigue en `JuanManuelPM/pruebas@candidate/prometeo-3d-orientation-scene-qa-20261119`.

No se cambia FORJA, Atlas, las nueve PR de FORJA ni catálogos globales. La entrada desde la página Estudio 3D y el explorador de proyectos son enlaces de navegación, no merges de fábricas.