# FORJA W5/04 · Edición táctil
Rama: `candidate/3d-w5-forja-touch-20261121`
Ruta aislada: `prometeo/previews/w5/forja-touch/v1/`
Origen: `prometeo/forja` en `gh-pages`; blobs originales: 2c468256a9464ecf313de4ef60cfd75afd813795, 427f079b3d3bdd09ad0074b043bb53fd4ac20165, 2e9a55a9815578afd70beaf8e919ede353d4e2d7.
Activos: Hidencod/tge-assets CC0, commit 3ddcc695adbba9fb918cf31b7c139b3f95b76910. Catálogo GLB no alterado.

## Fricción prevenida
El código base de `select(uid)` abría automáticamente el inspector a <=800px, tapando el escenario. Se conserva visible el lienzo al seleccionar, aparece un pad contextual de ajustes X/Z/rotación/escala (misma instancia, mismo historial y schema JSON), y hay fondo táctil para cerrar paneles. El gesto multitouch se excluye del raycast de selección. No se replica la navegación universal.

## Evidencia
- CÓDIGO VERIFICADO: handlers y tipos de ajustes conectados; clamps y snapshots existentes; controles táctiles >=44 px.
- CÓDIGO VERIFICADO: eliminar apertura forzada del inspector tras seleccionar.
- NO PROBADO: render real WebGL2/GLB, pinch, órbita, 320/390px en navegador físico, calidad visual.
- NO APROBADO: evaluación humana del candidato.

## Criterios
En Android: abrir Biblioteca, agregar GLB, seleccionar sin ocultar escena, mover/rotar/escalar, pellizcar, orbitar, Propiedades, cerrar tocando fondo, deshacer, exportar JSON. Si CDN/WebGL falla, no declarar éxito.
