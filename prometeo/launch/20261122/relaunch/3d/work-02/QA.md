# Casa entre patios · QA real / límites

**Trabajo** `3d-w7-20261122-02` · **HUMAN_APPROVED=NO**

## Primera pantalla observada en navegador

La prueba inicial en Chromium headless falló porque WebGL2 estaba inhabilitado en ese contenedor (`WEBGL_UNAVAILABLE`). Se activó ANGLE SwiftShader en Chromium headful bajo Xvfb y se inspeccionaron imágenes raster auténticas. Primer artículo inicial: el motor devolvía fondo sin arquitectura por `rotationZ()` de 11 entradas que generaba matrices `NaN`; el arreglo de 16 entradas hizo aparecer la escena, sin errores WebGL. Una primera prueba de oclusión falló 2/10 porque faltaba el tercer componente de `cross()` en `camera-controller.js`; reparado y vuelto a probar: **10/10 PASS**.

Las capturas no son ilustraciones generadas artificialmente; son screenshots del framebuffer WebGL bajo Chromium. No se publican como archivos de repositorio al cierre de este paquete, pero sí se incluyen en el ZIP de fuentes y pueden compararse byte a byte con los SHA. Se inspeccionaron la perspectiva y los marcos en formato horizontal y vertical. **El render es geométrico estilizado, no fotorrealista**; no equivale a PBR certificado por medición.

| Archivo local | SHA256 | Bytes |
|---|---|---|
| `index.html` | `7387d20c74c082ddf97d73652e510228fcc5a85190e065291fac7cec296da1e5` | 38732 |
| `engine.js` | `538e7ca24b39675b9ea0de73e9f87eb4dfa480b05fbb6187e33ac37d0ae4ded0` | 12794 |
| `scene.js` | `ea3b021e06dc94a2c7e3fba4aa47b419d6e7b67c3f27d42b2cdca31e2ff9fbb2` | 12535 |
| `camera-controller.js` | `1e73ac5ac4fb9677f1575df9a67d8f46737a599e2742a07547dad4cc54c2c7fd` | 4366 |
| `firstframe-final.png` | `93b02fcd7fd67edabef035b623792156f40f02a45d0ebd9617abf5ab4148c10f` | 436190 |
| `firstframe-mobile-final.png` | `6d22a26a074e8b3d1b525758ba99a9810d3e4e6ac0606accb22ca8b1561636ee` | 243261 |
| `test.mjs` | `56f67cb3604ddb4fa3403351c579787663bdfe686946e7148be7cc1fe27d5ac9` | 2570 |

## Pruebas y estados

- **10/10 PASS:** matrices finitas en 342 objetos, dimensiones, paredes AABB, nueve rayos y oclusión, colisiones, pitch, destinos, finalización de rutas y proyección.
- **RENDER OBSERVED (software):** primera pantalla real en Chrome a 390 y escritorio (capturas y WebGL error 0). Cambio de luz y navegación funcional observados en el runner previo con 4 destinos y modo nocturno; no inferimos revisión artística externa.
- **NO PUBLIC-GPU-TEST:** rendimiento en Android táctil, multitouch gestural, HDR o equivalencia con Blender: **NOT_RUN**.
- **NO REAL PHOTOMETRY:** roughness y metalness son parámetros del shader GGX de autor, no captura validada ni archivo HDR de iluminación.
- **NO GLB EXPORT:** fuentes y escena son editables JS parametrizados; export GLB: NOT_RUN.
- **HUMAN_APPROVED=NO**.

## Calidad perceptual y reparación pendiente

Los muros y el patio ahora forman una composición legible en las dos dimensiones. Se observan árboles de estilización geométrica y mobiliario modelado a mano; la apariencia no debe promocionarse como fotorrealismo. El sistema de oclusión por cobertura está testeado sintéticamente, pero su robustez en todos los giros/cuellos de botella de navegación móvil requiere observación directa en dispositivo. La regla de preproducción que previene la regresión es **tests de matriz y test de captura no vacía ANTES de poblar la escena**; para cámara, 9-ray screen-space con fixtures de pared transversal, no rayo único.

**Benchmark (leído, no copiado):** [Casa Patio / Juan Moujan](https://www.archdaily.com/1060270/courtyard-house-juan-moujan), [Catching Sun House](https://archup.net/catching-sun-house-courtyards-daylight-london/), [Three Courtyards House](https://www.archdaily.com/1027143/three-courtyards-house-balsa-crosetto-piazzi).
