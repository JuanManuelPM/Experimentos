# PROMETEO · Acting Lab V1 · receta de reuso

**Entrada:** `index.html` + `app.mjs` + `logic.mjs` + `vendor/director.mjs` + cuatro JSON, `assets/lunchbox_{oxblood,sage}.glb` (assets originales congelados). Servir por HTTPS o localhost con acceso a Three.js 0.181.2; la dependencia CDN exige red. Prohibido `file://` por CORS. No requiere Blender ni GPU para leer o editar el código, pero sí WebGL para renderizar.

**Prueba local:** `node --check app.mjs && node --check logic.mjs && node --check vendor/director.mjs && node --test tests/*.test.mjs`. Luego servir `python3 -m http.server 8000` y verificar en un navegador con WebGL real los seis planos, dos skins y 3D cargado. Las pruebas de Node **no** reemplazan la prueba visual. Si la plataforma no soporta WebGL, se presenta un overlay explícito, no se suplanta por una imagen plana.

**Procedimiento IA:** editar `ACTION_TIMELINE.json` para tomas y `LAB_STAGE.json` para metadatos; modificar `logic.mjs` para ruta. `SCENE_LOCK.json` contiene versiones/hashes y no se sobreescribe al importar otro actor. Agregar familia en `RIG_ADAPTER.json` sólo después de constatar nombres de huesos, clip tracks, eje frontal y sockets en el GLB. El adaptador no retargetea mágicamente animaciones entre esqueletos. API web `window.PROMETEO_LAB.seek(frame)`, `.setVariant('azul'|'granate')`, `.setView('director'|'front'|'side'|'free')`, `.config()`, `.diagnostics()`, `.loadConfig(json)`; selector de clip para el rig cargado.

**Interacción:** la lonchera genuina tiene `LID_PIVOT` y `SOCKET_grip`, ambos inspeccionados previamente en sus GLB originales. Un brazo real del esqueleto intenta CCD hasta el socket; la tapa sólo abre si la distancia final al socket es menor a 3,5 cm y la toma marca interacción. Sin prueba WebGL esto es **código implementado, acción NO VERIFICADA**. No se simula el agarre acercando la cámara. Falta cierre de dedos, oclusión/contacto visual, validador físico y comprobación de alcance.

**Seguridad:** el navegador verifica los SHA256 originales antes de cargar; los recursos públicos externos viven en el repositorio dueño. No se descargan modelos comerciales ni se toca la fábrica anatómica V2 en desarrollo. La librería cámara viene de `camera:semantic-director@0.1.0` MIT y el NPC Quaternius y la lonchera tienen procedencia CC0 declarada.

**Reversión:** borrar rama candidata/paquete experimental sin modificar ninguno de los recursos fuentes; no fusionar ni publicar como obra artística sin QA WebGL y revisión humana.
