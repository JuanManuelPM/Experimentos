# ARCHIVO DE LLUVIA · Caso 09 · W5 continuidad

**Vertical slice jugable 3D.** Conserva la escena, sus cinco pruebas, las tres hipótesis, la apertura física de la rejilla y la cinta recuperable de W4. No altera sus fuentes ni sus decisiones artísticas.

## Cómo jugar
1. ENTRAR AL ARCHIVO. Arrastrar el mundo para mirar; pellizcar o rueda para zoom.
2. Tocar un marcador 01–05 y **AGREGAR AL CUADERNO**. El cuaderno permite localizar en la escena las pruebas aún no descubiertas, sin recolectarlas automáticamente.
3. Con cinco pistas, tocar **DEDUCIR**, elegir la hipótesis y leer las contradicciones si es errónea.
4. Tras acertar, la cámara sigue la rejilla 04; tocar la cinta en el mundo 3D para cerrar el expediente. **VOLVER A INVESTIGAR** reinicia.

**Teclado:** 1–5 enfoca pistas; Enter inspecciona la enfocada; N abre cuaderno; D deduce si hay cinco pruebas; R restaura cámara; flechas rotan; C encuadra la cinta tras resolver; Enter recupera la cinta enfocada; Escape cierra paneles. El ratón y toque siguen seleccionando objetos mediante raycast real.

## Continuidad y prevención
Fuente: W4 ola004 videojuego 9; mismo brief literal SHA256 `d0c61d671e12ae417da821a4280d6a63f2a033be0021bf75b3829ba7dc644704`, método 3D 2.3.0 `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`. Dos rutas originales comparadas en W4: escena diorama Three.js vs collage 2.5D. Se conserva la primera; el cambio es jugabilidad y control, no reconstrucción visual. Arte original, Three.js 0.161.0 con licencia MIT desde jsDelivr; requiere Internet para la librería.

## QA y límites
- **PASS_SOURCE_ASSERTIONS:** se verificaron anclajes únicos en los tres archivos de ejecución; permanece el contador 5, el bloqueo de deducción, la selección por raycast, los estados de victoria/reinicio y el objetivo de recuperación.
- **NOT_RUN:** navegador WebGL, simulación real de clics y gestos táctiles Android, estética con captura auténtica y accesibilidad con lector de pantalla. Estas comprobaciones no se pueden sustituir por inspección estática.
- **CANDIDATE**: juego publicado para revisión humana, no aprobado.

**Fuente histórica conservada:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/wave004/videojuegos/investigacion-noir/v1/

**W5:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/noir/v1/
