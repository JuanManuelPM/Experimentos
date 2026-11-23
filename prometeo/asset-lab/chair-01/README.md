# PROMETEO · ARC CHAIR 01

Primer activo procedural original fabricado en Three.js y mantenido como prototipo **sin aprobación artística**.

## Ver la pieza

https://juanmanuelpm.github.io/Experimentos/prometeo/asset-lab/chair-01/

Se abre fullscreen. La silla rota sola, sin título, HUD, paneles o botones permanentes. Cada cierto tiempo cambia de acabado sin intervención. Un toque revela acciones discretas durante unos segundos; arrastrar permite girarla y luego regresa a la demostración. Doble toque y tecla L marcan favorito local, V cambia material y espacio pausa.

## Geometría reusable

- geometry.mjs: generador puro de superficies por mallas indexadas; asiento curvado, respaldo escultórico, patas mediante perfiles barridos, travesaños y uniones. Unidades en metros.
- chair.mjs: consumidor Three.js que crea BufferGeometry, materiales físicos, textura de veta original y tres variantes; incluye exportador OBJ real.
- app.mjs: cámara, luces, WebGL y demo automática. Three.js 0.181.0 fijado mediante CDN; no hay modelos externos.
- test.mjs: pruebas mecánicas sin paquetes externos. Node test.mjs valida tres dimensiones, triángulos, piezas, determinismo y exportación.

## Calidad y límites

El índice maestro y este asset son dos cosas distintas. La existencia de código y 5.516 triángulos no demuestra que la silla sea bonita ni superior al gabinete Arcade. El objeto es un primer artículo para inspección. **WebGL en Chrome Android, captura real del render, QA artístico humano y rendimiento todavía pendientes** hasta ejecutar esos ensayos. El Like guarda solamente en localStorage; el botón Copiar prepara una referencia para que el humano autorice guardar/aprobar una versión en GitHub desde el coordinador. No existe backend de aprobación y no se inventó uno.

Estados: SOURCE_PUBLISHED, GEOMETRY_VALIDATED, ART_REVIEW_NOT_RUN, HUMAN_APPROVED_NO. No sobrescribir esta versión tras la revisión; publicar v0.2.0 si hay cambios.

## Criterios de revisión de la primera pieza

Comparar silueta 3/4, lateral y posterior; espesor real del asiento y respaldo, uniones limpias, pies apoyados, escalas, veta y material, luz/sombra, contacto con el suelo y encuadre móvil. Si se ve como un ensamblaje barato, mejorar la técnica antes de clonar la silla en habitaciones.
