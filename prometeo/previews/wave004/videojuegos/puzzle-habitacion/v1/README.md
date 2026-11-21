# OBSERVATORIO 07 · La última constelación

**Estudio 3D · Videojuegos 3 · Ola 004 · V1**

Brief literal: Quiero una habitación jugable 3D con un puzle de varios pasos: pistas, objetos manipulables, mecanismo de salida, estados coherentes y reinicio, con interacción móvil.

Brief SHA256: `56339146b3adbb5ab7f7f8b40bc9e14d7156c2ff529b575e50565382e1c0979a`  
Método fijado: `2.3.0` · `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`

## Obra
Experiencia 3D navegable con un único puzle ambiental. Acciones en orden: leer diario, ordenar tres sellos (Luna / Estrella / Sol), recuperar cristal del cajón, colocarlo en pedestal, orientar reflectores I=3 y II=2, abrir la puerta. Todos los pasos permanecen en un mismo estado lógico y admiten reinicio.

**Controles:** toque directo sobre objetos, arrastre para orbitar, gesto de pinza o rueda para acercar; menú *Objetos* para acceso alternativo a cada interacción y menú *Pista* para ayuda gradual. Es una demo vertical, no un videojuego completo.

**Arte y recursos:** geometría y láminas CanvasTexture originales, sin fotografías ni modelos importados. Se evaluaron dos rutas preventivas: importar glTFs CC0 heterogéneos o autoría original de mobiliario y maquinaria. Se eligió la segunda por identidad visual y acoplamiento directo al puzle. Three.js 0.160.1 se sirve desde jsDelivr, licencia MIT; la primera carga requiere conexión.

**Honestidad técnica:** archivos y código publicados; WebGL en Android físico, calidad artística percibida y jugabilidad en dispositivo final no verificados en este entorno. El usuario evalúa la obra para ajustar el flujo compartido en una ronda posterior.

**Aislamiento:** el método, los demás previews y los lanzadores no se modifican. Ver `PRODUCTION_RECEIPT.json` para las 17 decisiones de etapa.
