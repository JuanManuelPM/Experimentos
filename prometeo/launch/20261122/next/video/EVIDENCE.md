# PROMETEO · VIDEO W002 · EVIDENCIA DE REDISEÑO Y GATES

**Fecha:** 2026-11-22 · **Rol:** diseño de la próxima tanda, no ejecución audiovisual.  
**Rama candidata exclusiva:** `candidate/prometeo-nextwave-video-20261122` en `JuanManuelPM/Experimentos`.  
**Identidad nueva:** `video-w002-20261122` (distinta de `video-w001-20261122`).  
**Salida:** diez briefs compactos, matriz de capacidades, comparación artística/técnica, riesgos, condiciones de integración ROOT.

## 1. Fuentes de verdad recuperadas y no modificadas

| Archivo consultado | Ref y blob SHA observados | Uso / límite |
|---|---|---|
| `JuanManuelPM/pruebas/sistemas/metodo/CONTRATO_COMPARTIDO.md` | `prometeo/control` · `8fa6052db2ee8c76984153dfd7771ac0550b0053` | Q-LOOP, QBAR, DEEP-SPEC, autoridad y prevención |
| `Experimentos/prometeo/launch/QUALITY_BAR.md` | `gh-pages` · `5653704d3267c339fe7405f2b36b8488dbb44be9` | referencias antes de diseño; no falsos benchmarks |
| `Experimentos/prometeo/launch/20261122/UNIVERSAL.md` | `gh-pages` · `7e0c3219d31f9b1cc67bfec7dc6c3c05e00f2120` | comando único, retorno, preservación de fuentes y ramas |
| `Experimentos/prometeo/launch/DEEP_SPEC.md` | `gh-pages` · `84f3f6ef8f7dd1cf39de630f2bf50bec352a3ee2` | adaptador Video y ficha interna |
| `Experimentos/prometeo/launch/deep-spec-v1.mjs` | `gh-pages` · `0536af26982d50dfc3c3689aca2677751bdee1fe` | código del validador existente; cuatro estados |
| `Experimentos/prometeo/launch/deep-spec-v1.test.mjs` | `gh-pages` · `8eada3c4946dd4686a16d371af404e148428a33c` | tests de regresión: fuente observable pero no ejecutados aquí |
| `Experimentos/prometeo/launch/20261122/DEEP_SPEC_TESTS.md` | `gh-pages` · `197e94c47e9b3e002702a7196f8d47a75a5f2c53` | informe histórico de 28 pruebas lógicas PASS in-memory, no video QA |
| `Experimentos/prometeo/root/BATCHES.json` | `gh-pages` · `5d1414698b4a7d0a954982e47ef5b647f31bb39d` | IDs históricos, registros de obras y no colisión de nuevo ID |
| `Experimentos/prometeo/launch/20261122/video/LAUNCH.md` | `gh-pages` · `92a57fab66fcdec863af7b85a76e64fcab725deb` | diez briefs W001 inmutables, alcance 8–15 s histórico |
| `pruebas/PROMETEO/spaces/video-studio/PROJECT.md` | `prometeo/control` · `fa110be05d4a4d4e5e9f8d19cc33540c3f0b41bf` | propietario del estudio; migración aún pendiente |
| `pruebas/.../video-studio/PROJECT_BOOTSTRAP.md` | `candidate/prometeo-video-studio-parallel-20261111` · `c1ea01fe4475c43e4affe6fbf4f475f93fc3d365` | flujo especializado y separación de 3D; status histórico, no motor probado |
| `pruebas/.../video-studio/campaign-001/MASTER.md` | misma rama · `48db022e993e011b22119c1417b830ca2430ac90` | siete líneas de investigación y dos spikes; arquitectura aspiracional |
| `pruebas/.../video-studio/campaign-001/DISPATCH.md` | misma rama · `015234d71b5cde7f6494a3cbadbfe4ac588f11b4` | nombres exactos V01–V07, X01–X02; no asumir que siguen inconclusos hoy |

**Rastreo adicional:** ramas `candidate/prometeo-video-plan-v01...` a V07, `candidate/prometeo-video-spike-x01-render-20261111`, `...x02-recipe`, y producciones W001 localizadas por búsqueda de ramas. **No se leyeron ni ensayaron aquí todos sus archivos de código y salidas**; el trabajador de cada N debe consultar resultados nuevos y fijar sus propios SHA antes de decidir el motor.

**Integración DEEP-SPEC comprobada a nivel de referencias:** se leyó código del validador y el contrato; hay vínculos explícitos en los cinco lanzadores públicos (3D W5, Web W001, Music W001, Video W001, Images W001) y constancia de 28 tests lógicos en el informe. **No se comprobó E2E que un trabajador de Video haya rellenado y validado la ficha en la versión especializada más reciente ni se ejecutó Node/QA perceptual en esta calibración**. En términos de aceptación estricta, **gate de ejecución real: UNVERIFIED**. Si ROOT exige esa prueba antes de emitir los cincuenta prompts, conservar `PREPARED_PENDING_DEEP_SPEC`, no `READY_TO_LAUNCH`.

## 2. Referencias reales examinadas: arte vs tecnología

Se consultaron las páginas públicas y estudios de proceso de las fuentes siguientes. **`PAGE_READ` significa que se inspeccionó texto/proceso visible; NO significa que se reprodujo, midió o evaluó el metraje completo**. Por eso las referencias sirven para seleccionar decisiones y tests, pero aún no avalan calidad cinematográfica lograda.

| Ref | Fuente original / caso | Observación concreta recuperada | Tipo |
|---|---|---|---|
| R01 | [Pixar SparkShorts](https://www.pixar.com/sparkshorts) | programa de relatos cortos con búsqueda de técnicas y nuevos workflows; referencia a narración y decisiones propias, no plantilla fija | Arte, PAGE_READ |
| R02 | [BUCK, Thorne](https://buck.co/work/thorne) | primero auditó identidad y diseñó boards detallados, después llevó el film a sistema visual reutilizable | Arte, PAGE_READ |
| R03 | [Pixar, A Spark Story](https://www.pixar.com/a-spark-story) | documental de proceso que sitúa a sus creadores y su viaje narrativo como eje de la película | Arte documental, PAGE_READ |
| R04 | [SIGNIF, entrevista Motionographer](https://motionographer.com/2025/02/14/studio-stories-7-years-of-signif-inc-tokyo/) | tensión creada con tipografía dinámica, efectos y respiración de deportistas; CG de origami con irregularidades deliberadas | Arte, PAGE_READ |
| R05 | [Vimeo Staff Pick, At the End of the Cul-de-sac](https://vimeo.com/blog/post/staff-pick-premiere-end-of-the-cul-de-sac) | relato de plano único de 9 min y cámara dron en múltiples ejes; coreografía, cobertura y narración sostienen el plano | Arte, PAGE_READ |
| R06 | [Wednesday Studio, Ying & Yang / Motionographer](https://motionographer.com/2025/04/30/breakdown-ying-yang-by-wednesday-studio-a-motion-poem-to-duality-design/) | animatic planificado, vectores + animación manual, textura y contraste entre pulido y crudo; movimiento motivado | Arte, PAGE_READ |
| R07 | [Pixar, Kitbull](https://www.pixar.com/kitbull) | corto del catálogo SparkShorts: referencia para actuación y lenguaje sin explicación verbal | Arte, PAGE_DISCOVERED; video NOT_WATCHED |
| R08 | [Information is Beautiful Awards · motion infographics](https://www.informationisbeautifulawards.com/showcase?acategory=motion-infographic&page=1&type=awards) | casos públicos de movimiento aplicado a datos y relatos; sirven para comparar claridad de animación y cifras | Arte/datos, PAGE_READ |
| R09 | [Filmmakers Academy, trabajo de Dan Laustsen](https://www.filmmakersacademy.com/blog-lighting-shadows-darkness/) | iluminación de fuente práctica y respuesta a viento/fuego/lluvia afectan credibilidad de clima y escena | Fotografía, PAGE_READ |
| R10 | [Blackmagic, DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) | montaje, color, VFX/motion y audio conviven como disciplinas específicas; editor multipista no equivale a scrubber decorativo | Producto profesional, PAGE_READ |
| R11 | [Our World in Data, dataset de IA](https://ourworldindata.org/grapher/artificial-intelligence-number-training-datapoints) | advierte que unidades de dominios distintos no deben compararse directamente, conserva fuente y procesamiento | Datos, PAGE_READ |
| R12 | [BBC Archive Services, condiciones](https://archiveservices.test.tools.bbc.co.uk/terms/) | autorización editorial, copyright y permisos de terceros deben verificarse antes de reutilizar material | Licencias, PAGE_READ |

**Referencias técnicas, no benchmarks de belleza:** [Motion Canvas FFmpeg](https://motion-canvas.io/docs/rendering/video/) documenta export de video/audio con plugin pero advierte limitaciones; [Mediabunny codecs](https://mediabunny.dev/guide/supported-formats-and-codecs) expone chequeos `canEncode` dependientes del entorno; [WebCodecs/VideoEncoder MDN](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder) describe codificación desde `VideoFrame` pero no garantiza soporte universal; [ffprobe](https://ffmpeg.org/ffprobe.html) documenta inspección de pistas; [Remotion licencia](https://www.remotion.dev/docs/license/pricing) exige verificar elegibilidad y condiciones según el caso. No se adopta ninguna herramienta por haber leído solo su documentación.

## 3. Matriz de diez capacidades diferentes (ANTES de elegir briefs)

| N | Capacidad diferenciadora | Referencia concreta | Artefacto audiovisual ambicioso | Módulo reutilizable nuevo | Antiejemplo que se debe rechazar | Prueba perceptual + técnica |
|---:|---|---|---|---|---|---|
| 1 | Narración de ficción con actuación y cobertura | R01 + principios de continuidad | Thriller de guardia nocturna y secreto | `ActingContinuityKit` | siluetas genéricas con captions que cuentan la trama | raccord de ojos/eje + revisión de actuación, escucha y export |
| 2 | Cinematografía de producto y materiales consistentes | R02 | spot de luminaria plegable original | `ProductShotSystem` | cinco imágenes inconexas con zoom automático | verificar misma geometría entre vistas, movimiento y acabado |
| 3 | Documental con verificación y trazabilidad | R03 + R12 | microdocumental sobre ciudad y agua | `FrameProvenanceLedger` | archivo tomado sin licencia o reconstrucción usada como hecho | muestreo de claims y frame/rango temporal hasta fuente/licencia |
| 4 | Dramaturgia tipográfica editorial, no presets | R04 + R06 | manifiesto tipográfico de significado | `TemporalTypeComposer` | títulos que saltan o giran sin intención | legibilidad de cuadros clave, sincronía gráfica/sonora, export móvil |
| 5 | Plano secuencia motivado y complejo | R05 | cámara continua y revelación en corredor | `CameraBlockingPlanner` | cámara atravesando paredes o plano vacío interminable | inspección de trayecto, orientación, enfoque y continuidad frame a frame |
| 6 | Montaje musical sensible a estructura | R06 | videoclip con música original y desarrollo | `PhraseAwareEditPlanner` | corte mecánico en cada beat con el mismo loop | A/B de fraseo/ritmo, reloj de audio y video, calidad de mezcla |
| 7 | Storytelling puramente visual con emoción | R01 + R07 | relato de objeto que cambia de significado | `SilentContinuityGraph` | imágenes sueltas sin causalidad ni acting | reproducción muda a lector nuevo y mapa de continuidad/acting |
| 8 | Motion graphics cuantitativamente fieles | R08 + R11 | secuencia documental basada en datos reales | `DataToMotionCompiler` | barras exageradas y cifras sin denominador | test de valores/escala/fuente + lectura y contraste en móvil |
| 9 | Ambiente audiovisual con causas acopladas | R09 | progresión meteorológica con foco dramático | `CoupledAtmosphereCompositor` | partículas de lluvia sobre imagen fija sin reacción lumínica | lluvia/suelo/reflejos/viento/audio progresan coherentes; frames |
| 10 | Herramienta usable que exporta edición real | R10 + docs técnicas | editor web multipista + película producida en él | `MultitrackTimelineCore` | falso timeline estático y export de demo no editado | prueba E2E: importar → cortar → mezclar → persistir → exportar |

**Por qué esta tanda supera en diversidad a la anterior:** N1+7 prueban narrativa pero N1 exige actuación y cobertura, N7 comprensión sin diálogo; N2 identidad de producto y consistencia, N3 verdad documental, N4 gráfica autoral, N5 coreografía de plano, N6 música/montaje, N8 datos, N9 físicos/sonido, N10 herramienta de edición. No se duplican motores por cambiar tema/colores y no se convierte Video en otro Estudio 3D.

## 4. Selección de medios: disponibles, candidatos y pendientes

| Evidencia | Estado honesto |
|---|---|
| Documento histórico W001, diez encargos y registro ROOT | **OBSERVED** mediante GitHub |
| Registro W001 N8: archivo `MATERIA-008.mp4`, 12 s, H.264/AAC y FFprobe via Actions, según `BATCHES.json` | **REPORTED_IN_REPO**; no reejecutado ni reproducido en esta calibración; demuestra un caso mecánico, no toda la plataforma |
| Arquitectura VideoRecipe/Timeline/Layer/Renderer/Encoder en MASTER | **DOCUMENTED_DESIGN**, no prueba de editor de producción |
| Motion Canvas FFmpeg para 2D, FFmpeg/CI para export, Mediabunny/WebCodecs para navegador | **CANDIDATE_TECH**; compatibilidad real por tarea no probada |
| Remotion | **CANDIDATE_WITH_LICENSE_REVIEW**; no asumir elegibilidad ni costo cero para cualquier uso |
| generación fotorrealista de actores/rodajes/documental desde texto | **NOT_DEMONSTRATED**; si faltan medios legales, no simular rodaje con SVG o imágenes incongruentes |
| Audio/sincronía verificable y continuidad audiovisual artística en W002 | **NOT_RUN**; pruebas por tarea futuras |
| Licencias de materiales ajenos, voces y archivo | **REQUIRED_BEFORE_USE**; no presupuestar compras ni publicar sin derechos |
| Reproducción íntegra de 10 videos W002 y feedback humano | **NOT_RUN** (W002 solo diseñado) |

La prioridad de preproducción en Video no es más longitud de prompt, sino fijar **lo que debe permanecer consistente entre planos y pistas**: misma identidad de personaje/objeto, vector de acción, dirección de luz, progresión emocional, capa de sonido y reloj de export. Si el material disponible obliga a infringir estas invariantes, replantear representación o declarar bloqueo en lugar de bajar calidad discretamente.

## 5. Pruebas que deben correr quienes ejecuten cada N (todavía no corridas)

1. **Evidencia de origen y autorización:** registrar obra original, licencias, fuentes primarias, transformación y uso; publicar únicamente material permisible.
2. **Gate DEEP-SPEC:** ficha real específica de Video, comprobar referencias observadas y vínculos pregunta→decisión→componentes→test; ejecutar `node deep-spec-v1.mjs ...` cuando esté disponible. Riesgo alto `NOT_RUN` da `SPIKE_REQUIRED`; sin observación no se cambia a READY.
3. **Verificación de archivo:** `ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,avg_frame_rate,sample_rate -of json FINAL.mp4` (o WebM); validar también reproducción/decodificación íntegra y contenido real, no solo metadatos. Comparar timeline con duración y pistas.
4. **Revisión de tres regiones:** abrir primeros segundos, región media y final; inspeccionar planos de enlace, focos/oclusiones, tipografía móvil, mezcla, cortes y cierre. Si la herramienta no puede mirar o escuchar de verdad, escribir `NOT_RUN`.
5. **Oráculo específico:** N1/Raccord y actuación; N2/escala y superficies; N3/fuentes y verdad; N4/legibilidad; N5/recorrido; N6/frase y sincro; N7/relato sin texto; N8/proporción de datos; N9/coherencia física; N10/edición real de extremo a extremo.
6. **Valor reutilizable:** demostrar que el módulo nuevo sirve para una segunda variante sin reconstruir la obra y no genera regresiones; si no se puede, describir brecha sin etiquetar `REUSABLE_VERIFIED`.
7. **Evaluación independiente:** no confundir `LOGIC_PASS`/`ENCODED`/`SOURCE_READ` con `ART_APPROVED`. No transferir una nota numérica autoimpuesta a ROOT como criterio humano.

## 6. Readiness y restricciones de ROOT

- `10/10 PREPARED` se refiere **solamente** al diseño documentado de encargos.
- Rama candidate aislada; **no** se modificaron los diez briefs W001, BATCHES.json, ni la rama `gh-pages`.
- Gate estructural DEEP-SPEC: **REFERENCES_AND_VALIDATOR_VERIFIED**; conexiones comprobadas en cinco lanzadores.
- Gate operativo de Video: **UNVERIFIED**. No hay E2E de un trabajador real completando ficha sobre su flujo más reciente ni de todos los exports.
- **Estado conservador para auditoría global:** `PREPARED_PENDING_DEEP_SPEC` (no significa que falte el archivo; falta demostrar la conexión operativa dentro del trabajador y el criterio perceptual).
- **Bloqueos concretos antes de declarar READY_TO_LAUNCH:** (a) escoger y fijar un flujo especializado Video realmente actual y comprobar el gate en una ejecución controlada; (b) comprobar rutas reales de assets/producción y disponibilidad de encoder/runner por modalidad, sin asumir que un ejemplo de W001 vale para todas; (c) completar auditoría ROOT de las cinco ramas, enlaces de lanzamiento y roles de propietario.
- La rama de diseño puede aprobarse para promoción sin ejecutar los diez trabajos; cualquier ejecución de obra ocurre después y genera otra evidencia. La aprobación de arte de W002 permanece `NOT_RUN`.

**Rollback:** eliminar/revertir exclusivamente los commits de esta rama candidata si no supera revisión; W001 y `gh-pages` seguirán intactos. Este documento registra fuentes estudiadas para diseño, no prueba de éxito productivo.
