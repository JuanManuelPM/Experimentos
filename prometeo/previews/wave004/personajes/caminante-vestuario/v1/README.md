# CAMINANTE Y VESTUARIO · W004 / PERSONAJES 02
**Brief literal SHA256:** `b862eb4912544a0bc220196edcf27c58efe990a8c0535b51954cad11e3262345`. **Método fijo:** `2.3.0`, identidad declarada `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`. No modificar el método ni otros briefs.

## Obra
Visor de personaje de cuerpo entero con cuatro acciones (caminar, frenar, giro de 90°, observar), cámara libre y cuatro vistas dirigidas. La caminata se mueve realmente por un recorrido breve, tiene cambio de dirección con giro sobre punto de apoyo y anclaje de tobillo/pie mientras un pie queda más bajo. El giro es una actuación runtime, no una animación original del GLB. Al no disponerse de WebGL de navegador verificable en este ambiente, el comportamiento se entrega como **candidato**, no como prueba de inexistencia de deslizamiento.

## Decisión preventiva antes del modelado
- Vía A (elegida): **GLB riggeado real** de una senderista con chaqueta técnica bicolor, pantalones, botas y mochila; 56 huesos, ~28k triángulos y acciones idle/walk/look_around. Frente nativo +Z, origen entre los pies, 1.7m. Se usa el GLB, NO un muñeco armado con primitivas.
- Vía B: modelado original de ropa/anatomía en Blender/MPFB, retopo y rig propio. Mejor control de silueta, pero no existe Blender en este runtime y sería incorrecto afirmar modelado/editabilidad realizados.
- Vía C: collage 2D/2.5D articulado. Estética potencial, pero no satisface las vistas 360° libres del brief.

## Recurso y derechos
- Fuente de licencia y ficha oficial: https://tevy.dev/models/hiker
- **CC0 1.0** publicada por tevy, versión 1 de 2026-10-26.
- Recurso GLB fijado: https://tevy.dev/models/hiker/v1/lod0.glb
- Imagen de degradación: https://tevy.dev/models/hiker/v1/preview.webp
- Three.js desde jsDelivr con versión exacta 0.170.0. **Dependencia externa**: internet y CORS para GLB; el modelo no está embebido en GitHub. No se aparenta exportación artística modificada.

## Interacción y criterio de pie
El mezclador interpola `walk` y `idle`. El controlador determina el pie de apoyo por su menor altura de tobillo, conserva un anclaje horizontal mientras ese pie es el más bajo y compensa traslación de root. Para giros, mantiene el punto de apoyo durante rotación. Si los huesos no están identificables, la interfaz indica SIN HUESOS y no finge anclaje. **No se observó movimiento ni se ha acreditado deslizamiento cero**: queda para revisión humana del artefacto.

## Estados reales
Fuente escrita / 3D loader implementado: sí. Página y bytes remotos WebGL vistos en navegador: **NOT_RUN**. Android: **NOT_RUN**. Corrección artística posterior obligatoria: no. Aprobación humana: pendiente. No modificar carpeta de otro proyecto.
