# PROMETEO · Video Studio · Art Direction + First Slice Gate V2 (CANDIDATE)

**Autoridad:** delta de especialidad, no sustituye `QBAR-1`, `DEEP-SPEC-1` ni `CONTRATO_COMPARTIDO`. La invocación humana sigue siendo `WORK LAUNCH N`. Propietario: Video Studio. **No promovido**.

## El problema operativo
La tanda W002 contiene clips tecnológicamente válidos con distancia artística visible y varias entregas locales inaccesibles a ROOT. Una preproducción estructural `READY_FOR_FIRST_SLICE` fue interpretada en algunos resúmenes como si habilitara proclamar producto terminado. La acción no es aumentar checklists: **cambiar la estrategia cuando el primer componente real no da el nivel**.

## Secuencia nueva, con límites de tiempo proporcionales
1. **Director de arte, antes de producción:** identificar el efecto humano específico (revelación, emoción, información, atmósfera) y la **unidad audiovisual irreductible** (actuación de una mano, bisagra consistente en macro, gesto de cámara, evento sonoro + reacción, gráfica con dato). Fijar 1 referencia pertinente realmente examinada y 1 alternativa técnica viable. Excluir atajo concreto del mismo brief.
2. **Productor/ingeniería:** comprobar derechos, codecs, renderizador, fuentes de assets y si la técnica prevista puede producir la unidad sin promesas pagas/inaccesibles. Si la ruta falla, `ENVIRONMENT_LIMIT` y alternativa legal, jamás simular una película con tarjetas.
3. **FIRST-SLICE ART GATE:** producir el fragmento **más difícil** (no un logo fácil) antes del render completo. Guardar 3 cuadros de tiempos diferentes, clip temporal con sonido cuando sea necesario, observaciones de arte, evidencia de contacto/continuidad/legibilidad y contraejemplo. Si la primera representación parece muñeco/slide/overlay, **cambiar de técnica/asset/puesta**, no añadir partículas, sombras ni el texto 'cinemático'.
4. **Secuencia y sonido:** continuidad de espacio/miradas/objetos en al menos tres beats narrativos; en formatos gráficos, que cada pantalla haga avanzar significado y no sólo mueva letras. Audio con función narrativa y escucha directa. Diseñar silencio; no forzar corte por beat.
5. **Export real + verificación:** el binario se comprueba mediante ffprobe, decodificación completa y captura auténtica de inicio/medio/final; comparación de duración de timeline vs media y sonidos relevantes. Si un archivo final sólo vive en un chat, status `LOCAL_UNAVAILABLE_TO_ROOT`. Si en GitHub, almacenar URL, blob SHA, tamaño y prueba de lectura pública; `GITHUB_CONTENTS_READBACK` no prueba HTTP Pages.
6. **Cierre epistemológico:** `FIRST_SLICE_OBSERVED`, `TECHNICAL_PASS`, `VISUAL_OBSERVED`, `LISTENING_OBSERVED`, `EXTERNAL_VIEWER_TEST`, `PAGES_HTTP_VERIFIED`, `HUMAN_APPROVED` independientes. Ninguna de las primeras cinco implica la sexta.

## Gates por especialidad con fallas de ejemplo

| Encargo | Evidencia a producir antes del completo | Rechazar cuando... | Salida viable |
|---|---|---|---|
| Ficción 01 / Historia sin diálogo 07 | 3 poses de transferencia mano-objeto, mirada-reacción, clip corto con Foley y lectura ciega | personaje hecho de formas inconexas, pose no explica causalidad | acting 2D rig/poses, stop motion o captura autorizada; simplificar el plano antes que fingir actor |
| Producto 02 | macro, bisagra abierta/cerrada, reverso, misma escala/material | el objeto cambia identidad entre planos, juntas se atraviesan, reflejos falsos | modelar CAD/Blender con un solo asset y lighting rig consistente |
| Documental 03 | archivo contextual + dato + contraste + procedencia por tramo | montaje atribuye a 2019 un video sin fecha | ledger a nivel plano, lower thirds discretos, narración y montaje de archivo legal |
| Tipográfico 04 | tres variaciones semánticas con lectura horizontal y vertical cronometrada | preset de entrada/salida no cambia significado o tapa la lectura | composición editorial a escala óptica y ensayo con distintos tempos |
| Plano secuencia 05 | animatic acción/revelación y cámara a través de obstáculos; DOF real si prometido | se mantiene ruta correcta pero el espectador no entiende la revelación | blocking con actores/props antes de mover cámara |
| Videoclip 06 | cuatro muestras de relación música/imagen con densidades diferentes | cambia color pero no emoción/motivo ni frase musical | storyboard por secciones y mezcla auditiva funcional |
| Datos 08 | comprobación de anclas/eje + corte móvil con pausa | año, unidad, fuente u origen ilegibles o escalas engañosas | visualización editorial enlazada a datos versionados, voz o subtítulos |
| Tormenta 09 | prueba simultánea cielo/objeto/agua/sombra/sonido con evento identificable | lluvia sólo tapa un decorado, relámpago no cambia reflejos | composición por capas físicas con lógica común `weather(t)`, parallax y color |
| Editor 10 | importar/editar/guardar/recargar/exportar dos versiones en navegador real | MediaRecorder pierde audio, duración deriva o persistencia usa shim | timeline interoperable OTIO, AudioWorklet/WebAudio, FFmpeg sidecar export de referencia |

## Puertas técnicas verificables
- `video_quality_gate_v2.py`: manifest JSON con identidad, intención, ruta técnica, atajo rechazado, first slice observado, prueba causal/procedencia cuando aplica, archivo real; el CLI **nunca** aprueba el arte. No acepta `humanApproved: true` autodeclarado.
- Registrar un `FFPROBE_PASS` no sustituye revisar 3 fotogramas auténticos o escuchar audio; el CLI sólo constata que esos campos se llenaron, y lo dice expresamente.
- Para calidad profesional, revisión perceptual humana o de referente independiente sin conocer sinopsis: **no se declara en ausencia**.
- `humanApproved` queda a cargo del usuario; cualquier equipo puede proponer correcciones sin apropiarse esa autoridad.

## Plan de prueba comparativa para la próxima tanda
Elegir tres slices preproducción y un editor roundtrip (uno con acting, uno con objeto, uno de atmósfera, uno E2E). Comparar el resultado contra W002 usando **mismo tipo de defecto**, evidencia visual/sonora y juicio independiente. Si la selección de técnicas no mejora, revertir V2. **No producir diez nuevas obras durante esta calibración**.

## Rollback y riesgos
- Rollback: descartar rama `candidate/prometeo-video-audit-v2-20261122`; archivos de W002 permanecen intactos.
- Riesgos: falso `FIRST_SLICE_OBSERVED` escrito por el propio productor; complejidad añadida; forzar reglas dramáticas inaplicables a gráficos; confundir `PUBLIC` con visualizado. Mitigar con rutas de archivo, metadatos/sha, artefactos reales y `NOT_RUN` explícito.
