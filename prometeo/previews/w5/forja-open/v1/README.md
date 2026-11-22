# FORJA · W5 / 03 · Abrir escena pública

**Fuente:** `prometeo/forja/` de `gh-pages`. **Formato:** `prometeo.forja.scene/v1`.
**Código aislado:** `prometeo/previews/w5/forja-open/v1/`, no modificar FORJA original ni ROOT.

- Editor: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/forja-open/v1/
- Abrir demostración: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/forja-open/v1/?project=.%2Fdemo-project.json
- JSON de demostración: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/forja-open/v1/demo-project.json

Admite `?project=<URL>` para archivos `.json` públicos HTTPS de `juanmanuelpm.github.io/Experimentos/prometeo/` o `raw.githubusercontent.com/JuanManuelPM/Experimentos/gh-pages/prometeo/`, además de rutas relativas dentro de Pages. Rechaza query, redirecciones, credenciales y destinos fuera de esos orígenes. Descarga sin credenciales, timeout 15 s, máximo 2 MB. Valida el schema exacto y todos los IDs contra el catálogo fijado de 1.883 GLB. Pide confirmación antes de sustituir una escena local distinta; el enlace sólo declara éxito si todos los modelos cargan. Mantiene importación JSON local, guardado, edición, animación e historial. No convierte Cocina Umbría ni proyectos ajenos.

**Verificación local sugerida:** `node --test project-link.test.mjs`. **Pendiente real:** GPU/WebGL2, CORS de GLB, estética, Android 320/390, restauración si falla un GLB. Sin promesa de QA visual pasada. Rollback: retirar sólo esta ruta aislada.
