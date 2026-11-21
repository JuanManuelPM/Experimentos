# Galería fija · PROMETEO Estudio 3D
URL permanente: `https://juanmanuelpm.github.io/Experimentos/prometeo/3d-flow/galeria/`.

La galería muestra 30 lanzamientos de la ola 004, agrupados en Integradores, Personajes y Videojuegos; actualiza el estado comprobando la existencia de `index.html` en la ruta pública aislada declarada en `../w4/MANIFEST.json`. Si un integrador nuevo no tiene preview publicada, busca la versión de Ola 003, sin confundirla con la nueva. Los previews se abren en un iframe integrado o en pestaña aparte.

La **publicación del HTML no valida su comportamiento en WebGL, licencias, rendimiento ni aceptación artística**. No se añaden tests artísticos posteriores. Las revisiones humanas sirven para calibrar el método universal, no para parchear escenas.

Para futuras olas, el coordinador edita SOLO `SOURCES.json` para apuntar al nuevo manifiesto; no hace falta modificar esta URL, el código del visor, ni los 30 productores. Los chats productores publican en sus propias rutas sin editar la galería ni compartir una rama writable. Los cambios de Github Pages pueden tener latencia CDN; el botón Actualizar y refresco periódico permiten reconsultar.

No hay límite de diez chats impuesto por este panel; no coordina ni ejecuta conversaciones en segundo plano.
