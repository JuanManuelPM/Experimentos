# Casa entre patios · PROMETEO 3D W6/02

Recorrido arquitectónico interactivo original. **Estado honesto:** fuente publicada; WebGL/Android/capturas reales aún no observados por este productor.

## Ejecutar

- Vista pública esperada: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/3d/w6/02/
- Servir el directorio por HTTP (no abrir index.html con `file://`), con acceso a los ES Modules de Three.js 0.163.0 por CDN.
- Elegir **Estar / Comedor / Estudio**. **Recorrer** cambia entre vista cinematográfica y paseo.
- Teclado: WASD o flechas para caminar; arrastrar para mirar; espacio para alternar cámara. En móvil: joystick izquierdo y deslizar en el lienzo a la derecha.
- **Luz nocturna** alterna fuentes en la escena 3D; **Fotografía** guarda un PNG de la vista actual; **Comparar 3 × 2** genera una única imagen con tres ambientes por dos luces.

## Geometría y recursos

Planta interior conceptual de 15,6 × 5,4 m y 3,4 m de alto, tres crujías sucesivas, puertas de 1,58 m, radio humano 0,24 m. Dos patios al norte/sur del comedor. Mobiliario diseñado en código con bordes suavizados, tapicería, bronce, cristal, paramento de cal, madera de roble y piedra. Texturas procedurales de autor editables. Sin fotografías ni modelos de arquitectura de terceros.

El componente reusable `occlusion-camera.mjs` calcula superficies de muros/techos entre cámara y foco mediante raycast, y maneja opacidad individual sin contaminar materiales compartidos. `slidePlayer` aplica colisión de piso y cruces de vanos.

## Evidencia y límites

- `PREPRODUCTION.deep-spec-v1.json`: referencias verdaderamente consultadas, relaciones, decisiones y riesgos. Gate estructural: `SPIKE_REQUIRED` por render no observado.
- `QA_RECEIPT.json`: tests lógicos y sintácticos PASADOS, QA visual y móvil `NOT_RUN`.
- `index.html`, `scene.mjs` y `occlusion-camera.mjs`: editables y versionados.
- No certificar profesionalismo o aprobación humana sin revisión real. Las capturas de la herramienta se generan por el navegador al hacer clic, no se adjuntan PNG ficticios.

## Identidad

`3d-w6-20261122-02`, brief publicado blob `942c3ba8b851137886e959d2790771556e2d9f5d`. Flujo 3D `2.3.0` SHA256 `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`. QBAR-1 y DEEP-SPEC-1. Escenas históricas y otras ramas intactas.
