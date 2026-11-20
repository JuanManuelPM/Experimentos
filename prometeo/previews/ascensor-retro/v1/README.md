# ASCENSOR RETRO · V1

Escena cinematográfica de 22.7 s en primera persona, 100% web con mallas 3D reales. **Estado SOURCE_ONLY / primer candidato técnico:** se publicó código reproducible pero no existe aprobación artística ni test GPU/WebGL real.

## Reproducir
Abre `index.html` a través de HTTP (módulos ES) desde la ruta pública aislada `/prometeo/previews/ascensor-retro/v1/`; pulsar Play activa WebAudio original y la secuencia. El navegador carga Three.js MIT 0.160.1 desde CDN. Mute, pausa y scrubbing son opcionales. No hay video como sustituto de rendering.

## Estructura
- `scene.json`: escena, cue de 22.7s, cámara, pisos, paleta, fechas/intervalos de las dos puertas.
- `source/door-kit.mjs`: puerta real configurable con 2 hojas y relieves, 196 piezas malla, material CanvasTexture y holguras.
- `source/camera-timeline.mjs`: math pure para camera rail, piso, door, vibración, D42.
- `source/synth-audio.mjs`: sonido propio en WebAudio (sin archivo de música externo).
- `first-article/`: canario publicable de una puerta desde la fachada, 0/50/100.
- `tests/source-qa.test.mjs`: tests Node sin GPU que no autorizan arte aprobado.

## Dirección y trucaje declarado
Se diseñó una transición de sets mediante puertas cerradas, cambio de indicador, vibración y audio; **no existe traslado mecánico de una cabina a otro piso real**. El cambio de espacios se percibe al abrir la segunda puerta, jamás se disfraza con una captura.

## QA
D39 PASS, D40 PASS (fuente / instancia / fit), D42 PASS (continuidad y cruce), D41 NOT_RUN en navegador. Se produjeron 6 PNG reales con VTK independiente sobre el mecanismo 0/50/100, pero no prueban la textura Three.js ni WebGL. Ver `QA_RECEIPT.json`. Renders finales, Android, FORJA y aprobación humana pendientes.

## Aislamiento
Esta versión es `ascensor-retro@V1`; no modificar rama base, FORJA, portfolio general ni otras nueve obras. Método fijado `prometeo-3d-production@1.2.0`, hash `4b3f6076c7f38b3e999b259e63ed78ae52af30ac99f70f41a972bc45d92e4c84`.
