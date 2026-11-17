# Inspección de capturas reales del canario 2026-11-17

Fuente: `JuanManuelPM/Experimentos` GitHub Actions run `44150178247` (Chromium WebGL2). Archivos de salida `evidence/final/remote/`.

- `01-before.png`: rostro original claro, sin sticker, bajo iluminación estable.
- `02-after.png`: etiqueta original `UV / P2` visible y espacialmente localizada en rostro (pasa por nariz y mejillas), no mero color uniforme. Vista UV con frente y espalda proyectadas y borde de capa en la zona frontal.
- `03-face-and-uv.png`: detalle simultáneo de malla facial y atlas.
- `04-mobile320.png`: 320px CSS, WebGL contiene personaje, atlas legible, botones visibles, no se ve pantalla negra ni overflow horizontal; no es prueba en teléfono Android físico.
- `05-reimported-baked-face.png`: archivo binario GLB derivado por Python (`db185749e...`) reimportado con Three.js en navegador, etiqueta visible sobre la cara.

**No aprobación artística:** la etiqueta horizontal cruza nariz y ojos como canario funcional, no es maquillaje final. Proyección front/back tiene áreas superpuestas y posible estiramiento/artefactos en facetas, requiere revisión de costuras, vistas laterales y variación de 24 clips antes de uso cinematográfico.
