# PROMETEO · Música W002 · Investigación, matriz y auditoría de preparación

**batchId:** `music-w002-20261122` · **Estado:** `PREPARED_PENDING_DEEP_SPEC` · **Corte:** 2026-11-22.
**Artefacto canónico candidato:** [LAUNCH.md](LAUNCH.md) · **Obras ejecutadas en W002:** 0 · **Cantidad:** 10/10.
**Auditoría final y lanzamiento:** exclusivamente ROOT; no mutar `prometeo/root/BATCHES.json`.

## Fuentes y procedencia: qué se examinó realmente

### Casos y prácticas artísticas (referencias aspiracionales, no reproducciones analizadas por oído)

- **Brendon Moeller, cambio hacia 170 BPM** · https://www.ableton.com/en/blog/brendon-moeller-life-begins-at-170/ — entrevista examinada; describe breaks cortados y tocados, bajo, atmósferas y el riesgo de copiar fórmulas del dub techno. Sirve a N1/N4, no autoriza usar sus samples sin comprobar licencia.
- **Flava D, evolución desde UK garage a drum and bass** · https://www.ableton.com/en/blog/flava-d-evolution-of-a-producer-interview/ — perfil profesional identificado, pertinente a N2 y N4; benchmark de intención y proceso, **no** se analizó espectro ni un track en este diseño.
- **El Choop / Pizza Hotline, acordes dub** · https://www.ableton.com/en/blog/designing-dub-chords-in-ableton-live-with-el-chooppizza-hotline/ — técnica publicada de acordes con filtros, modulaciones, delay y eco; N3. Comparación sonora efectiva pendiente.
- **Paradox, dominio del breakbeat** · https://www.ableton.com/en/blog/paradox-breakbeat-mastery/ — artículo examinado: ghost hits móviles y edición compleja de breaks, no mero time stretch; N4.
- **Jon Hopkins, Ritual** · https://www.ableton.com/en/blog/jon-hopkins/ — entrevista examinada, describe desarrollo de una pieza de larga duración a partir de una instalación, selección de material y construcción de arco; N5/N9.
- **Caterina Barbieri, minimalismo y modular** · https://www.ableton.com/zh-cn/blog/caterina-barbieri-minimalism-modular-and-live/ — entrevista examinada, cadenas de delay, síntesis modular y generación controlada; N6.
- **James Holden y Wacław Zimpel, Processing Transcendence** · https://www.ableton.com/en/blog/james-holden-waclaw-zimpel/ — entrevista examinada, integración de clarinete y electrónica con software propio y lógica de instrumento/patch; N7.
- **Max Cooper, Yearning for the Infinite** · https://www.ableton.com/es/blog/composing-infinity-max-cooper-his-new-album/ — investigación de música con diseño detallado, estructura y desarrollo conceptual, caso de N5/N9.
- **Basic Channel, catálogo oficial** · https://www.basicchannel.com/label/Basic%2BChannel — discografía examinada (incluye Quadrant Dub y Phylyps Trak), **solo identificación de obras**, no escucha/medición; contexto histórico para N1/N3.
- **Christopher Tignor, violín y procesado** · https://www.ableton.com/en/blog/input-output-christopher-tignor/ — entrevista identificada de interpretación con arco y respuesta procesada; N7.

### Documentación técnica contrastada (no benchmarks de excelencia artística)

- **Ableton Live 12 / Using Grooves** · https://www.ableton.com/en/live-manual/12/using-grooves/ — fuente examinada: groove afecta timing y velocity, y en audio requiere tratamiento de warping; N2.
- **Ableton / UK beats** · https://www.ableton.com/en/blog/freshly-chopped-program-modern-uk-beats-in-live/ — tutorial examinado sobre groove, choke, patch rítmico y procesamiento de bus; N2.
- **Bitwig / Unified Modulation** · https://www.bitwig.com/userguide/latest/the_unified_modulation_system/ — moduladores/dispositivos profesionales, **referencia de arquitectura, no dependencia instalada**; N3/N6.
- **FMOD / Studio Concepts** · https://www.fmod.com/docs/2.04/studio/fmod-studio-concepts.html — documentación examinada: parámetros, timeline sheets y lógica musical dependiente de estado/tiempo; N8.
- **EBU R128** · https://tech.ebu.ch/publications/r128/ — referencia normativa de medición loudness/true peak para difusión; **-23 LUFS es contexto broadcast, NO objetivo obligatorio de un master club**; N10.
- **FabFilter Pro-Q 4 / Dynamic EQ** · https://www.fabfilter.com/help/pro-q/using/dynamic-eq — documentación de ecualización dinámica avanzada; comparación de criterio, **no se verificó plugin instalado**; N10.
- **Sound On Sound / Level-matched mastering** · https://www.soundonsound.com/techniques/digital-performer-multi-song-mastering-project — artículo indexado sobre A/B y nivelación, sin acceso confirmado al artículo completo; N10.

**Límite explícito de observación:** fuente web leída no equivale a oír, copiar, descargar, disponer de licencia ni certificar la producción citada. `SOURCE_READ` para artículos/documentación accesibles; `AUDIO_LISTEN`, `BENCHMARK_LOUDNESS_MEASURED` y `HUMAN_APPROVED` = `NOT_RUN` en W002.

## Matriz de diez diferencias reales

| N | Capacidad / referencia concreta | Artefacto ambicioso | Reutilizable propuesto | Atajo rechazado y riesgo | Prueba específica |
|---:|---|---|---|---|---|
| 01 | Dinámica de club original; Moeller y catálogo Basic Channel | Techno extendido, secciones con función DJ y stems | Automatización de frases | Loop fijo y falsa tensión a base de volumen | Tres secciones a igual nivel + mezcla de entrada/salida |
| 02 | Microtiming por voz; Flava D y Ableton Grooves | UKG con batería, bajo e interpretación editables | Motor groove por pista | Swing global, clicks y rigidez por cuantización | A/B timing/velocity sobre armonía idéntica |
| 03 | Espacio de acordes dub; El Choop y Basic Channel | Dub techno con eco estable y profundidad en mezcla | Rack delay feedback filtrado | Eco que invade el subgrave o entra en feedback runaway | Mono/estéreo, colas, pico máximo y EQ por sección |
| 04 | Breaks interpretados; Paradox y Moeller | Liquid DnB con densidades variables y subgrave definido | Slice/variación de breaks con trazabilidad | Copiar bucle ajeno o repetir sample sin arreglo | Tres intensidades + transitorios/licencias |
| 05 | Arco sin beat; Jon Hopkins y Max Cooper | Ambient larga de varios movimientos | Transformador de motivos/texturas | Un solo pad infinito, ruido aleatorio, saltos bruscos | Escucha comparativa entre movimientos, inicio/fin y transiciones |
| 06 | Patching musical; Barbieri y Bitwig | Electro con sintetizadores y automatización reconstruibles | Patch graph serializable | Oscilador básico disfrazado de instrumento final | Reapertura + render equivalente y A/B parámetros |
| 07 | Articulación real; Holden/Zimpel y Tignor | Híbrido acústico-electrónico expresivo | Articulación→FX mapping | MIDI de plástico o grabaciones sin derechos | A/B toma seca/procesada + permisos auditables |
| 08 | Música por estados; FMOD | Tres estados con stems, transiciones y reproductor real | Transiciones cuantizadas entre estados | Fades arbitrarios o reproductor falso | Cambios rápidos en medio de frase sin desfasaje |
| 09 | Arreglo progresivo; Jon Hopkins y Max Cooper | Club extendido con intro/outro y clímax | Mapa de energía/secciones y automatizaciones | Riser/ruido blanco y LUFS como falsa evolución | Escucha íntegra, puntos DJ, progresión y retorno |
| 10 | Juicio comparativo de mezcla; EBU / FabFilter / SOS | Una obra multitrack + mix A/B + master y stems | Cadena de análisis, nivelación y export | Master “mejor” solo porque está más fuerte | A/B level-matched, peak, mono, fase y stem parity |

**Antiejemplos descartados:** 10 canciones con la misma plantilla; 10 filtros sobre el mismo oscilador; repetir rasgos de techno de W001 como nueva capacidad; recurrir a un reproductor estático como sustituto del sonido; prometer MP3/WAV sin bytes reales; publicar bibliotecas ajenas con derechos no acreditados. La diversidad es de **sistema musical**, no de títulos.

## Estado de capacidades en PROMETEO: demostrado frente a pendiente

| Evidencia | Estado | Observación / límite |
|---|---|---|
| `JuanManuelPM/pruebas@candidate/prometeo-music-flow-v2-wave001-20261121:.../versions/2.0.0/FLOW.json` | `SOURCE_READ` | Hay M00–M11, política de timbres, primer loop audible, mezcla, corrección y persistencia; `FROZEN_CANDIDATE`; SHA esperado `6826ce13f4bd1e0d81b8a89bd7e6728668b85c44c68185b79426b00a36b8f05f`. No se modificó. |
| `.../studio-v2/index.html` de la misma rama | `SOURCE_READ` | El HTML contiene transportes Play/Pause/Stop, timeline, controles de notas, botones WAV/STEM/JSON y scripts de motores `sample`, `race`, `techno`, `velvet`. **Solo se comprobó código de marcado**, no ejecución real, render profesional ni DAW externo. |
| `Experimentos@gh-pages:prometeo/launch/DEEP_SPEC.md` | `SOURCE_READ` | Gate único transversal con adaptador Música y ubicación antes del primer corte. |
| `Experimentos@gh-pages:prometeo/launch/deep-spec-v1.mjs` | `SOURCE_READ` | Existe validador con estados `INVALID`, `SPIKE_REQUIRED`, `BLOCKED`, `READY_FOR_FIRST_SLICE`. La lógica estructural **no oye audio**. |
| `.../deep-spec-v1.test.mjs`, `.../20261122/DEEP_SPEC_TESTS.md` | `TEST_REPORTED_BY_SOURCE` | Documentan 28 tests lógicos in-memory previos, sin Node local ni pruebas sonoras. **No reejecutados en esta preparación**. |
| `CONTRATO_COMPARTIDO.md`, `START_HERE.md`, `QUALITY_BAR.md`, `UNIVERSAL.md`, lanzador W001 | `SOURCE_READ` | Las entradas apuntan a DEEP-SPEC-1. El flujo 2.0.0 musical fijado de W001 no incorpora la etapa como Mxx interna; conexión efectiva por futuros WORK/runner **no demostrada**. |
| Patching avanzado, grabación acústica, gestión licencias, slicing, render adaptativo y comparador A/B profesional | `CAPABILITY_PENDING` | Investigar y construir en la producción de cada obra si es viable, con spikes y pruebas; no importar a la lista de funciones comprobadas. |
| Benchmarks y los diez artefactos W002, QA auditivo/artístico de usuario | `NOT_RUN` | No se produjeron ni escucharon piezas nuevas, no hubo sesiones iniciadas, no hay aprobación. |

**Gate de preproducción: `UNVERIFIED` para una ejecución W002 completa.** Evidencia de especificación + validador + conexiones documentales existe, pero la **invocación efectiva**, persistencia de ficha en un trabajo musical nuevo y aplicación del gate antes del render NO están probadas. Estado de tanda = `PREPARED_PENDING_DEEP_SPEC`, y no `READY_TO_LAUNCH`. Esto no contradice que el contrato universal llame “vigente” a DEEP-SPEC para nuevos WORK: vigencia textual ≠ conexión operativa comprobada.

## Decisiones, verificación y bloqueos para auditoría ROOT

- **Unicidad:** nueva identidad `music-w002-20261122`, diez números 1–10 y una sola URL de ejecución; W001 `music-w001-20261122` preservada, con sus `WAVE.json`, `BRIEFS.json`, SHA y obras existentes. No tocar `BATCHES.json`.
- **Rama de esta preproducción:** `candidate/prometeo-nextwave-music-20261122` en `JuanManuelPM/Experimentos`; no compartir con otros estudios. Las futuras diez ramas en `pruebas` son **nombres propuestos**, no creados ni ocupados en esta operación.
- **Bloqueo A, DEEP-SPEC:** ejecutar un WORK de prueba controlado SOLO tras la auditoría ROOT, verificar que la ficha se escribe/valida antes del primer audio real y que una ficha incompleta bloquea. No basta con que un enlace exista.
- **Bloqueo B, motor:** confirmar que `studio-v2` efectivamente reproduce y exporta máster/stems coherentes y cuáles capacidades nuevos módulos permiten. La UI observada no acredita funciones avanzadas ni fidelidad audible.
- **Bloqueo C, licencias/recursos:** no usar samples, grabaciones de terceros ni presets comerciales sin permiso explícito documentado; priorizar síntesis original o material autorizado. El diseño no implica gasto ni suscripciones.
- **Bloqueo D, calidad:** los A/B, escuchas, análisis de stems, QA de transitions, plugin/DAW y juicio musical externo siguen `NOT_RUN`. Prohibido autoproclamar calidad de estudio o igualar referentes por métricas.

### Criterios verificables de cierre de esta preproducción

1. GitHub readback de `LAUNCH.md` y `EVIDENCE.md` en rama candidata, con diez números, IDs distintos y una única orden universal: **pendiente de relectura tras commit**.
2. Confirmar W001 y `BATCHES.json` intactos tras estas escrituras: **pendiente de relectura tras commit**.
3. No ejecutar ni publicar audio, ni registrar `STARTED` en ROOT: **cumplido por alcance**.
4. Promoción/ejecución solo tras una auditoría ROOT de cinco tandas: **pendiente de humano/ROOT**.
