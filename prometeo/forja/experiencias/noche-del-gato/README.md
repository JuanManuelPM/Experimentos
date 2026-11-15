# LA NOCHE DEL GATO · CINE 001

**Estado:** SOURCE_ONLY · candidato experimental separado de FORJA. No está publicado en GitHub Pages ni validado con GPU real. Nació del nuevo NORTE CREATIVO del 15-11-2026, para convertir WORK en obras visibles.

## Contenido construido
- HTML autónomo con Three.js r181 servido por CDN y escena 3D procedimental original (sin modelos de terceros).
- Gato modelado con mallas, orejas, bigotes y cola animada, sofá y cojines, mesa con pizza, TV con textura animada, habitación nocturna y dos luces de color.
- Corto de 30 segundos con cinco encuadres: salón, gato, pizza, televisión y final.
- Controles de reproducción, timeline, salto entre planos, fullscreen, sonido propio sintetizado y grabación WebM con MediaRecorder/captureStream cuando el navegador lo permita.
- Fallback **expresamente identificado como 2D** si WebGL o CDN no están disponibles; la exportación se deshabilita en fallback.

## Ejecutar
Abrir `index.html` en un servidor estático con conexión a jsDelivr. La importación ES module usa HTTPS. En GitHub, el enlace a `blob` **muestra código**, no ejecuta la experiencia. No anunciar URL de preview pública hasta una publicación con pruebas.

## Pruebas hechas
- Parse V8 de todo el módulo: PASS.
- DOM ids básicos, 5 planos, implementación WebGL+MediaRecorder, fallback, fuente original sin assets externos: PASS estructural.
- Chromium real/WebGL2, grabación de video real, prueba Android/UX y juicio visual artístico: **NOT_RUN**. Un botón de exportación no prueba un video exportado.

## Criterio siguiente
1. Ejecutar en navegador real con WebGL2 y capturar imagen de cada plano; revisar gato/sofá/pizza/TV, iluminación, perspectiva y rendimiento.
2. Probar audio on/off, seek, record de 30 segundos; comprobar codec, tamaño y reproducción del WebM.
3. Después de QA real, publicar como preview aislada bajo una ruta nueva sin reemplazar FORJA. A continuación integrar escenas a una galería y probar en Android.
