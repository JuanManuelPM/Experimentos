# EL CORREDOR · video-w002-20261122-05

**Trabajo 05 exclusivamente.** Parte de [LAUNCH público](../../../LAUNCH.md) (blob SHA `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`) en `gh-pages`. `QBAR-1` + `DEEP-SPEC-1`.

## Identidad / estado

- `room=video`, `batchId=video-w002-20261122`, `taskNumber=5`, `taskId=video-w002-20261122-05`.
- Propietario de esta rama: `JuanManuelPM/Experimentos@candidate/prometeo-video-w002-05-20261122`.
- Estado: **DELIVERED_LOCAL / ENCODED_VERIFIED_LOCAL / GITHUB_SOURCES_PARTIAL / HUMAN_APPROVED=NO**.
- El MP4 fue generado como artefacto de la conversación y **no se ha subido a GitHub**. No afirmar que Pages aloja el video. El motor Python y el sonido WAV se conservan en el paquete de fuentes adjunto en el chat, no en esta rama.
- Formato observado: `EL_CORREDOR.mp4` · 14.000 s · 960×540 · 24 fps / 336 frames · H.264 + AAC · audio estéreo 48 kHz. Decodificación FFmpeg final `PASS`.
- SHA-256 del MP4 observado localmente: `bf850ab8a205bb3c9ee51c7cad10efe128e950ed214127d31e39bc3c2cfb1f76`.
- SHA-256 del motor fuente Python local: `b48e389ca871908829a0d713f7acad9f25f81f6d276dc36c7afb9f8896667253`.

## Intención de la obra

Cámara única de 14 segundos en un corredor nocturno habitado. Al principio, un objeto metálico alargado junto a una persona mayor sugiere peligro; un movimiento lateral revela una cuidadora que la sostiene y le ofrece su bastón. Se buscó acción silenciosa legible sin carteles, con un lenguaje 3D estilizado original, luz práctica cálida y ventana distante fría. **No se presenta como filmación real ni como actuación fotorrealista.**

La puesta de cámara se definió por seis claves y trayectoria de 8.31 m. El cálculo muestreó 300 posiciones y encontró velocidad máxima 1.335 m/s, aceleración máxima 2.545 m/s², recorrido interior sin atravesar muros. Foco planeado: 10.3 m a 4.15 m. **El exportador no implementó desenfoque óptico de profundidad**, por lo que sería incorrecto certificar la dirección de foco como efecto perceptual completo.

## Herramienta reusable entregada en esta rama

**[camera-blocking-planner.html](camera-blocking-planner.html)**: HTML independiente con planta métrica, dos intérpretes y tres muebles, ruta editable por arrastre, claves numeradas, scrub, reproducción temporal, distancia de foco, advertencias de velocidad/aceleración, importación y exportación JSON. Se abre como archivo HTML local y no requiere bibliotecas externas.

**[PREPRODUCTION.deep-spec-v1.json](PREPRODUCTION.deep-spec-v1.json)**: decisiones de cámara, acting, montaje no cortado, sonido, riesgos y links entre preguntas, decisiones, componentes y tests. La ficha local del paquete pasó el validador `DEEP-SPEC-1` en Node; este readback remoto todavía requiere gate independiente.

## Referentes revisados y diferencia

- [Paul Trillo, *At the End of the Cul-de-Sac* (Vimeo)](https://vimeo.com/blog/post/staff-pick-premiere-end-of-the-cul-de-sac): referencia de coreografía y compromiso del movimiento largo, no material reutilizado.
- [*Victoria* (European Film Academy)](https://www.europeanfilmawards.eu/efa-movie/victoria/): acción en toma única con control de múltiples espacios e intérpretes.
- [*Children of Men* (Los Angeles Times)](https://www.latimes.com/archives/la-xpm-2006-dec-29-et-children29-story.html): bloqueo y cámara en un espacio físicamente acotado.

Se consultó documentación de estos referentes, sin usar assets ni declarar reproducción íntegra de sus films. Brechas reales: la acción no ofrece rostros detallados, falta un test externo de interpretación narrativa y no hay simulación óptica de profundidad de campo. El MP4 adjunto **no alcanza por sí solo la exigencia artística profesional del brief**, aunque sí prueba un formato audiovisual real reproducible.

## QA

| Aspecto | Verificación | Estado |
|---|---|---|
| Identidad N=05, rama exclusiva, brief SHA | GitHub + readback | VERIFIED |
| Continuidad de cámara y límites de corredor | 300 muestras de trayectoria | LOGIC_PASS |
| Narración con actuación convincente | Observación de imágenes temprano/medio/tarde | NOT_HUMAN_APPROVED |
| MP4 real con 336 cuadros y pista de audio | ffprobe + decodificación FFmpeg | LOCAL_PASS |
| Plano único sin cortes ni empalmes ocultos | Un render continuo de un solo renderer/reloj | SOURCE_LOGIC_PASS |
| Foco óptico y DOF visual | No implementado en renderer | NOT_IMPLEMENTED |
| Módulo reusable en segunda producción | No se ejecutó segunda obra | NOT_RUN |
| Publicación remota del binario | Sin escritura binaria disponible desde el GitHub conectado | NOT_DONE |

## Seguridad y derechos

Geometría, personajes 3D, puesta y foley sintético originales. No se usaron archivos audiovisuales ajenos, voces reales, material personal, música protegida ni enlaces inventados. Los assets W001 y las otras nueve tareas W002 no se tocaron.

## Próxima mejora derivada del trabajo (sin alterar otros estudios)

Someter la versión a un espectador que no conozca la sinopsis: ¿entiende que el objeto es un bastón y que la escena revela ayuda? Si falla, mejorar la actuación de manos/cuerpo y disminuir el ocultamiento por el carrito antes de atribuirlo a un defecto del método compartido. Mantener la intervención en el propietario del Estudio Video.
