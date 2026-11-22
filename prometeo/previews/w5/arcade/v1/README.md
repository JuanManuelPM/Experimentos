# VECTOR RANGE · W5 Arcade V2

Continuación **incremental** de W4/videojuegos/8, sin alterar la versión V1.

## Usar

- Vista pública candidata: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/arcade/v1/
- V1 histórica: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/wave004/videojuegos/arcade-objetivos/v1/
- En móvil: arrastrar la mira, tocar un blanco o pulsar **FUEGO**, y reiniciar desde el botón ↺ grande en el extremo inferior izquierdo. En teclado: clic/espacio y R.

## Cambios implementados

1. El único botón original de reinicio pasa a una zona táctil circular de 76 px en dispositivos de puntero grueso; no se agregan botones redundantes.
2. Cada impacto puntúa como antes y cada ronda completada otorga bonificación de tiempo visible. El reinicio vuelve a puntuación cero, primera ronda, temporizador inicial, mira al centro, sin efectos ni transiciones pendientes.
3. Se muestra y conserva la mejor puntuación local, si el navegador admite localStorage. No hay servidor ni información personal.
4. Se conserva el juego original: Three.js 0.180.0, geometría WebGL, FX, audio sintetizado, controles y diseño industrial; sin assets de terceros agregados.

## QA preventivo

Se recuperó la comparación original entre Canvas 2.5D y WebGL real y se conservó WebGL porque el arte 3D y el raycasting ya estaban construidos y tenían fuente editable. Riesgos principales considerados antes de modificar: pérdida accidental de V1, superposición de botones en 320/390 px, repetición de puntuación tras terminar la ronda y persistencia bloqueada. Se eligieron cambios locales, un solo botón de reinicio, bloqueo de disparo durante transición y almacenamiento tolerante a fallos.

## Estado de evidencia

Código y anclajes revisados sobre la fuente de V1; **navegador/WebGL físico y Android todavía NO_RUN** hasta una observación real. No confundir publicación con aceptación visual. La respuesta en ROOT debe conservar esa distinción.

Método fijado: 2.3.0 · hash canónico 53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f.
Brief original inmutable: e3c585c73dd98768792bf92f0d46068dd2081d36894fd421100f904d959fc06e.
