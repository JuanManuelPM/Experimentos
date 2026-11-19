# Cocina Umbría 002 · candidato aislado

La escena incorpora una cocina cerrada con techo físico, ventana y puerta volumétricas, 16 instancias de GLB Kenney CC0 y un civil riggeado de Quaternius/PROMETEO. Ninguna caja es sustituto del actor ni del mobiliario. Las piezas arquitectónicas son mallas físicas propias del escenario.

## Estado
El código y el JSON están en rama candidata; **no se publicó Pages** ni se aprobó arte. La orientación de actor se infiere en ejecución desde bones de dedos/pies o desde la geometría de los ojos; es preliminar hasta fotos frontales/perfil/espalda. Las sillas usan una inferencia de respaldo por vértices y se orientan hacia la mesa. Ninguna inferencia equivale a certificación visual.

La escena verifica SHA-256 de cada GLB vía `crypto.subtle` antes de cargarlo. Se niega a dibujar un sustituto si el archivo falla. La interacción se reproduce solo si existe clip `pick/grab/interact/reach`; en caso contrario se mantiene idle sin fingir contacto.

El `forja/` es un fork **copiado sin reconstrucción** del piloto FORJA V2; `FORJA_SCENE.json` lleva los IDs y transformaciones para edición. La cinematografía utiliza el director original MIT (`semantic-director.mjs`, mismo blob de origen). La edición de clips y GLB rigged export aún no están garantizadas por FORJA.

No debe publicarse en `gh-pages` hasta QA real WebGL en escritorio/móvil, cierre, eje frontal y clipping; además hace falta aceptación artística. La escena V1 no fue modificada.
