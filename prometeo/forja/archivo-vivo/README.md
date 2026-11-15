# C101 · Archivo Vivo, escena real GLB + OBJ/MTL

Entrega privada **CANDIDATA** y parcialmente comprobada. Se reutilizan recursos ya existentes: Quaternius Fox.glb con rig esquelético y 12 clips, Kenney Oak.glb y Chair.glb, y KayKit anvil.obj, anvil.mtl y block_bits_texture.png, con licencias CC0. Los modelos son Git blobs físicos en esta rama, **no solo referencias**. No se han recreado personajes usando primitivas. El piso y la iluminación de presentación sí son geometría de escena.

### Ejecución cuando se clone la rama privada
En `sistemas/work/receipts/C101`, ejecutar `python3 -m http.server 8000` y abrir `http://localhost:8000`. Requiere conexión externa a Three.js 0.166.1 y sus loaders en jsDelivr; los modelos son locales, sin API de pago.

Controles: arrastrar/zoom táctil con OrbitControls; Idle/Walk/Gallop seleccionan clips reales de Fox.glb y AnimationMixer; pausas/cámara. Estado de fallas de cada carga mostrado en pantalla. MTLLoader apunta a la textura local.

### Pruebas y límites
- PASS: clonación física de siete blobs (3 GLB, 2 archivos OBJ/MTL, textura PNG, LICENSE) por SHA; cuatro blobs KayKit creados en este repo con SHA idéntico a fuente pública.
- PASS: comprobación de sintaxis V8 del JS sin los imports y controles esenciales HTML; los detalles se documentan en RESULT.
- PASS previo (W023): un rig Fox con 51 joints y 12 clips embebidos; esto no reemplaza prueba de mixer runtime.
- NOT_RUN: Node nativo con rama privada y sus assets; apertura real de escena WebGL, inspección estética, interacción móvil, respuesta de CDN/CORS y textura del OBJ.
- No afirmar que se publicó una URL navegable o se aprobó visualmente. Si el entorno no accede a CDN, evaluar empaquetado local de dependencias en otra candidata en lugar de llamar al fallo artístico.

### Próximo paso
El job C113 debe hacer una prueba visual WebGL independiente de C101 y, si funciona, comprobar 4/4 assets, que Fox realmente cambia de pose al pulsar Walk, las texturas OBJ y la legibilidad móvil. C103 queda bloqueado hasta verificación apropiada. Nunca marcar SUCCESS canónico por haber guardado HTML.

### Seguridad
Todo escrito bajo `work/claims/C101:sistemas/work/receipts/C101/` del repo privado pruebas; FORJA y el 3D productor no fueron modificados. Licencia KayKit original en `assets/LICENSE.txt`. Fuente y repos originales en `assets.json`.
