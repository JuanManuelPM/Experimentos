# Islas de papel · W4 Videojuegos 01

**Vertical slice jugable** de plataformas 3D del Estudio 3D. Cinco islas flotantes, protagonista Sori, física de salto y caída, controles táctiles y teclado, dos riesgos móviles, estrellas opcionales, portal objetivo, derrota y reinicio.

- Público: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/wave004/videojuegos/plataformas-3d/v1/
- Página autónoma sin peticiones externas: [standalone.html](./standalone.html).
- Archivos fuente editables: [index.html](./index.html), [style.css](./style.css), [game.js](./game.js), [sori.svg](./sori.svg).
- Requisitos: navegador con WebGL2. No descargar bibliotecas externas. No hay audios, imágenes ni fuentes de terceros integrados.
- Método fijado: **prometeo-3d-production 2.3.0** · SHA256 canónico **53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f** (verificado calculando SHA256 de JSON con claves ordenadas y sin campo sha256Canonical).
- Brief inmutable: «Quiero una vertical slice jugable de plataformas 3D: un personaje controlable, recorrido compacto, salto, contacto, obstáculos, objetivo, fallo, reinicio y cámara táctil adecuada.» SHA256 **2028bc078da89faeaeb2d11094ea933fe30c95a3b7375f9d71ec07611fbee5ad**.

## Decisión artística ANTES de producir

1. Ruta elegida: ilustración vectorial original a mano como actor 2.5D en escenarios WebGL2 de geometría 3D verdadera. Permite silueta, rostro y ropa legibles a escala móvil, textura editable, motion bob/tilt y colliders no dependientes del dibujo. Bytes del SVG originales entregados. Ningún humanoide de primitivas.
2. Ruta alternativa genuinamente diferente y realizable: modelado tridimensional custom con malla de triángulos, rig simple y color vertex para un animal estilizado. Requiere más autoría facial UV y riesgos de aspecto genérico al tamaño de pantalla previsto; no seleccionada para esta pieza.
3. Externo investigado, NO importado ni usado: Kenney Assets CC0 https://kenney.nl/support y https://kenney.nl/assets/mini-characters. No se afirma adquisición de sus bytes ni reutilización de su licencia en Sori.
4. Motor elegido: WebGL2 API sin runtime ni CDN, según https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext. SVG como imagen según https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image.

## Uso y límites reales

En PC: WASD/flechas para avanzar y moverse lateralmente, Espacio para saltar y arrastrar sobre la pantalla para orbitar. En móvil: palanca izquierda, SALTO derecha y arrastrar en la escena para girar la cámara; pinza para acercar/alejar. '↺' recentra. El recorrido empieza en la primera isla y termina al tocar el portal. Al caer fuera o tocar una centinela aparece un reinicio explícito. El movimiento corre sobre ejes del recorrido, deliberadamente estable pese a los cambios de cámara.

QA: JavaScript `node --check` PASS; smoke de estado/controles en runtime V8 simulado PASS; SVG renderizado a PNG local PASS; navegador/GPU/WebGL real NOT_RUN (Chromium del entorno no inicializó GL); teléfono Android NOT_RUN; aprobación artística humana NOT_RUN. La simulación **no** certifica visual, rendimiento ni interacción real en teléfono. Se entrega candidato íntegro, no aprobado.

No se modificaron flujo, catálogo, briefs históricos, otras ramas ni otras rutas públicas.
