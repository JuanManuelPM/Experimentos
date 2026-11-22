# Casa entre patios · QA real / límites

**Trabajo** `3d-w7-20261122-02` · **HUMAN_APPROVED=NO**

## Primera pantalla observada en navegador

La prueba inicial en Chromium headless falló porque WebGL2 estaba inhabilitado en ese contenedor (`WEBGL_UNAVAILABLE`). Se activó ANGLE SwiftShader en Chromium headful bajo Xvfb y se inspeccionaron imágenes raster auténticas. Primer artículo inicial: el motor devolvía fondo sin arquitectura por `rotationZ()` de 11 entradas que generaba matrices `NaN`; el arreglo de 16 entradas hizo aparecer la escena, sin errores WebGL. Una primera prueba de oclusión falló 2/10 porque faltaba el tercer componente de `cross()` en `camera-controller.js`; reparado y vuelto a probar: **12/12 PASS**.

Las capturas no son ilustraciones generadas artificialmente; son screenshots del framebuffer WebGL bajo Chromium. No se publican como archivos de repositorio al cierre de este paquete, pero sí se incluyen en el ZIP de fuentes y pueden compararse byte a byte con los SHA. Se inspeccionaron la perspectiva y los marcos en formato horizontal y vertical. **El render es geométrico estilizado, no fotorrealista**; no equivale a PBR certificado por medición.

| Archivo local | SHA256 | Bytes |
|---|---|---|
| `index.html` | `cae02d61d633181ea3d8322cd5d770febb732ec5ccb00a86cbd0e59d54937e81` | 39242 |
| `engine.js` | `538e7ca24b39675b9ea0de73e9f87eb4dfa480b05fbb6187e33ac37d0ae4ded0` | 12794 |
| `scene.js` | `ea3b021e06dc94a2c7e3fba4aa47b419d6e7b67c3f27d42b2cdca31e2ff9fbb2` | 12535 |
| `camera-controller.js` | `58a5d6a04f6895a0edcd39c77820e6ac125c7e1253659066136385e82be93593` | 4570 |
| `firstframe-final.png` | `93b02fcd7fd67edabef035b623792156f40f02a45d0ebd9617abf5ab4148c10f` | 436190 |
| `firstframe-mobile-final.png` | `6d22a26a074e8b3d1b525758ba99a9810d3e4e6ac0606accb22ca8b1561636ee` | 243261 |
| `test.mjs` | `334cdf0d326d5328a2ffda1cabb5df318268517c92525c5ff2ed5af73a3f6387` | 3180 |

## Pruebas y estados

- **12/12 PASS:** matrices finitas en 342 objetos, dimensiones, paredes AABB, nueve rayos y oclusión, colisiones, pitch, destinos, finalización de rutas y proyección.
- **RENDER OBSERVED (software):** primera pantalla real en Chrome a 390 y escritorio (capturas y WebGL error 0). Cambio de luz y navegación funcional observados en el runner previo con 4 destinos y modo nocturno; no inferimos revisión artística externa.
- **NO PUBLIC-GPU-TEST:** rendimiento en Android táctil, multitouch gestural, HDR o equivalencia con Blender: **NOT_RUN**.
- **NO REAL PHOTOMETRY:** roughness y metalness son parámetros del shader GGX de autor, no captura validada ni archivo HDR de iluminación.
- **NO GLB EXPORT:** fuentes y escena son editables JS parametrizados; export GLB: NOT_RUN.
- **HUMAN_APPROVED=NO**.

## Calidad perceptual y reparación pendiente

Los muros y el patio ahora forman una composición legible en las dos dimensiones. Se observan árboles de estilización geométrica y mobiliario modelado a mano; la apariencia no debe promocionarse como fotorrealismo. El sistema de oclusión por cobertura está testeado sintéticamente, pero su robustez en todos los giros/cuellos de botella de navegación móvil requiere observación directa en dispositivo. La regla de preproducción que previene la regresión es **tests de matriz y test de captura no vacía ANTES de poblar la escena**; para cámara, 9-ray screen-space con fixtures de pared transversal, no rayo único.

**Benchmark (leído, no copiado):** [Casa Patio / Juan Moujan](https://www.archdaily.com/1060270/courtyard-house-juan-moujan), [Catching Sun House](https://archup.net/catching-sun-house-courtyards-daylight-london/), [Three Courtyards House](https://www.archdaily.com/1027143/three-courtyards-house-balsa-crosetto-piazzi).

## Matriz de render posterior a corrección · seis vistas realmente capturadas

La cámara centra el objetivo activo, no la sala anterior; cada destino termina de orientar la mirada antes de detenerse. Las seis capturas se renderizaron con **el mismo build y viewport 880×576** bajo Chromium WebGL2 / SwiftShader. Se inspeccionaron sala, comedor, estudio, día/noche; WebGL `glError=0` en todos. `hidden` fue 0 para sala/comedor y 1 para estudio. El shader GGX es original y estilizado, no una simulación fotométrica medida.

| Vista | SHA256 del PNG | Bytes |
| --- | --- | ---: |
| `matrix-sala-dia.png` | `74ddb6b83f5ca531c671665bb68aae780faa3ad93250776cb8558f32867d72d6` | 316394 |
| `matrix-sala-noche.png` | `4440a8db1054780d26029366057de05e9e905453613f1a6eb6142edd9e859d90` | 332303 |
| `matrix-comedor-dia.png` | `8c19151d7f16fa8db53bb53a45db26a334b1dea284535e4ba0e4f060e776f794` | 364489 |
| `matrix-comedor-noche.png` | `58d38310a524700258b3ef21080d1995c713be6f9c46433927b2432a43bb91db` | 384182 |
| `matrix-estudio-dia.png` | `d2824f4549a0efa2acbd23edd4fb0ddc9e8d1b04b5fe8a89c7e6d161e3a4f284` | 299877 |
| `matrix-estudio-noche.png` | `459ad142867671258b4b295a363d8cb97a998cd01c48563924f739e626d47372` | 308056 |

El paquete contiene también `MATRIZ_3x2.png` para comparación visual directa, sin ilustraciones artificiales. Existe screenshot real adicional de **1440×900** (`firstframe-1440-final.png`) y de **390×844** (`firstframe-mobile-final.png`). El mapa de cámara de nueve rayos sigue necesitando pruebas táctiles de dispositivo físico y de transiciones durante la marcha.

**Correcciones detectadas por tests preventivos:** (1) matriz de rotación inválida que daba canvas vacío; (2) producto vectorial incompleto y 8/10 inicial; (3) selección de focal incorrecta al cambiar de habitación; (4) cámara alcanzaba destino sin terminar de girar, ocultando el escritorio. Resultado local final: **12/12 PASS** + seis primeras vistas observadas.
