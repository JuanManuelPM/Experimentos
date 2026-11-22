# PROMETEO · AUDITORÍA ARTÍSTICA AUTÓNOMA · UNA TANDA ENTERA POR ESTUDIO

## Invocación

**Un chat nuevo por estudio** con el mismo enlace a este archivo más el código exacto `3d`, `web`, `music`, `video` o `images`. Este comando **no produce otras diez obras**: inspecciona profundamente las diez de la tanda recién ejecutada y produce correcciones candidatas al **método que las generó**. La crítica no exige audios, capturas, opiniones o validaciones adicionales del humano.

**Tandas a revisar**:
- `3d` → `3d-w6-20261122` (10 números).
- `web` → `web-w002-20261122`.
- `music` → `music-w002-20261122`.
- `video` → `video-w002-20261122`.
- `images` → `images-w002-20261122`.

## EVIDENCIA HUMANA INICIAL QUE OBLIGA A CORREGIR EL MÉTODO

El 22/11/2026, en capturas reales de pantalla de Android, se observaron:

- **3D 01 («Interlocutora»):** cabeza construida como un collage de volúmenes reconocibles; ojos y pupilas desproporcionados, nariz prominente como pieza pegada, mejillas y labios con formas apiladas, pelo de tiras verticales, vestuario rígido y anatomía incoherente. Buena iluminación por sí sola no hace creíble al actor. El resultado se percibe como muñeco improvisado/meme, no como actor de calidad profesional ni como una estilización intencional coherente. También había textos tipográficos que se **superponían en móvil** (título y diálogo sobre contenido y controles).
- **3D 02 («Casa entre patios»):** en una vista real una pared beige ocupa la mayor parte de la pantalla y oculta la sala; el área visual importante es marginal. Falla **composición de cámara / visibilidad y oclusión contextual**, no se arregla sumando más mobiliario. Detectar condiciones de pantalla angosta, cámara cerca de pared, foco fuera de vista y la lógica de ocultar/cortar techos o paredes.
- **ROOT Obras:** pantalla oscura con tarjetas gigantes prácticamente vacías, texto como único contenido y obras W001 mostradas en lugar de priorizar las tandas nuevas; esto va a la auditoría de UI, **no a una reparación local del estudio**.

No recibir estas capturas dentro del nuevo chat NO autoriza a ignorar sus observaciones: están transcritas en esta instrucción. Aun así, cualquier otra conclusión sobre las otras obras exige **inspección de sus artefactos**, no extrapolación.

## Fase A · Recuperación exhaustiva y evidencia real

1. Recuperar `JuanManuelPM/pruebas@prometeo/control:sistemas/metodo/CONTRATO_COMPARTIDO.md`, `Experimentos@gh-pages:prometeo/launch/{QUALITY_BAR.md,DEEP_SPEC.md,deep-spec-v1.mjs}`, el flujo especializado real, el launcher `prometeo/launch/20261122/next/<studio>/LAUNCH.md`, `EVIDENCE.md`, `prometeo/root/{BATCHES.json,ROOM_MESSAGES.json}`, versiones y resultados en GitHub.
2. Enumerar explícitamente **N=01..10**. Encontrar por `(batchId, taskNumber)` las entregas públicas e igualmente buscar por ramas/rutas de trabajo si el mensaje ROOT no existe. Si no hay obra, registrar `MISSING` con ruta intentada; no fingir inspección. En el último corte 3D 10 e Imágenes 3 no tenían retorno público, pero pueden haber aparecido después: **recomprobar**.
3. En cada N recuperar **artefacto ejecutable o media auténtica**, componentes reutilizables que prometió, código fuente, prueba de resultados, licencias, README, `PREPRODUCTION.deep-spec-v1.json`, QA_RECEIPT y citas internas. Un reporte de otro modelo no sustituye una obra vista/escuchada.
4. **Producir capturas/observaciones de primera mano.** Para Web y 3D, ejecutar en navegador real/headless Playwright/Chromium (si hace falta, implementar un runner GitHub Actions manual/CI seguro y probarlo, sin cron), esperar a carga y tomar capturas reales de cada obra en móvil 390 CSS px y escritorio 1440. En 3D variar cámara/estado y obtener retrato y perfil cuando corresponda; para video usar ffmpeg/ffprobe o navegador, exportar frames auténticos representativos del inicio/medio/final; para imágenes cargar PNG/JPEG/WebP final a resolución real y ver al 100% y tamaño de uso; para Música recuperar y analizar WAV/MP3/FLAC efectivamente publicado, estructura/secciones, transitorios, niveles y stems, **y escuchar cuando la herramienta lo permita**. Identificar ausencia de herramienta como `NOT_RUN`, no como comprobación. Jamás usar imagen generada para hacer pasar por captura.
5. Guardar evidencia recuperable `QA/screens/<NN>/...`, `QA/media/<NN>/...` (cuando autoría y licencia lo permitan), manifiesto de URL/bytes/commit y fecha; si no se puede guardar bytes, mostrar URL y hash de fuente. **Hacer readback**, no declarar éxito por escribir un informe.

## Fase B · Crítica profesional de las diez obras, no diez documentos

Para cada número, responder concisamente, con evidencia concreta:
- ¿Qué prometió el brief? ¿Qué se entregó realmente y qué se pudo ver/escuchar/hacer?
- ¿Qué es profesional en esta obra y qué es mediocre? **Describir elementos, relaciones y efectos concretos**, no «más detalle», «mejor UI», «más artístico». Dar prioridad a defectos que arruinan la experiencia (por ejemplo cara de piezas pegadas, cámara inutilizable, tipografía que tapa escena, bucle de cuatro compases sin evolución, video solo de tarjetas animadas, raster artificial).
- ¿Cuál es el referente externo excelente y pertinente, realmente examinado, que expone la brecha? No autoriza copiar su estética/bytes.
- ¿Por qué ocurrió? Localizar la **etapa causal**: selección del brief/referencia → diseño artístico → elección de técnica y recursos → adquisición/modelado/rig/síntesis/montaje → ensamblaje/interacción → verificación perceptual → publicación. Indicar si QBAR/DEEP-SPEC no se ejecutó, se llenó de manera formalista o no tenía una **prueba que obligara a cambiar técnica**.
- ¿Qué alternativa viable produciría un salto material? ¿Qué especialidad, librería, método, modelo/asset legal, técnica de autoría o proceso profesional hay que investigar e incorporar, con evidencia de viabilidad? Evitar la consigna circular «hacerlo mejor».
- ¿Qué **gate preventivo** previo a la producción habría obligado a rechazar la representación pobre? Especificar condición observable, contraejemplo, prueba y dueño. No esperar a última hora para poner un «FAIL» estético sin salida.
- **Distinguir** `NOT_RUN`, fallo demostrado, defecto artístico observado, acierto real, y `HUMAN_APPROVED=NO`. No confundir pasa unit test con nivel cinematográfico/premiado.

La revisión debe cubrir **10/10 posiciones** o registrar explícitamente cuáles no pudieron inspeccionarse. No gastar el tiempo diseñando un dashboard de métricas ficticias ni crear más de una copia del mismo informe.

## Fase C · Discutir la causa de fondo e implementar reparaciones candidatas

1. Enfrentar perspectiva de **director artístico exigente** y **ingeniero/productor experto**. Ambos deben basarse en obras y pruebas, debatir técnica apropiada y rechazar parches superficiales. Sin teatro ni comentarios generales repetidos.
2. Agrupar defectos por **causa transversal** (ROOT/QBAR/DEEP-SPEC y adquisición de medios), **especialidad**, **obra local**, o **evidencia insuficiente**. No promover 100 reglas duplicadas. Examinar si el flujo puede orientar la selección de herramientas desde fuentes profesionales, si no proponer una capa real de `ART-DIRECTION GATE`, lista de alternativas y pruebas de primer componente.
3. Implementar en **rama candidata propia** las mejoras del flujo del medio y/o herramientas de QA que sí se puedan demostrar, con tests y contraejemplos. La retroalimentación de una obra no ordena rehacerla; preferir mejorar las próximas diez para comparar el resultado. Preservar W6/W002, assets y SHAs históricos.
4. Guardar informe por 01..10, galería/capturas reales y síntesis con columnas `evidencia → fallo → causa → gate → implementación candidata → prueba → efecto/limitación → dueño` en repo del propietario correspondiente (si el propietario es privado, publicar al ROOT solo resumen y links seguros). No afirmar que se promovió antes de que ROOT lo integre y compruebe.
5. Publicar un **recibo de especialidad** a ROOT, trazable, con batchId y URLs, comprobando CAS/lectura de `ROOM_MESSAGES.json`, para que el integrador global encuentre cinco auditorías sin necesitar chats antiguos.
6. Si un medio no puede renderizarse/escucharse por falta de herramientas, **no detenerse** en el primer obstáculo: obtener evidencias accesibles, instalar/usar runner apropiado cuando esté permitido y producir el máximo examen legítimo. Separar claramente tareas auditadas con captura propia de tareas con evidencia documental.

## Especialización obligatoria por medio

### 3d
Revisar rostro/cuerpo anatómicos, pelo y ropa, rig/deformación/acting, asset quality, material PBR, mapas normales, escala/cotas, tangencias y penetraciones, contacto con piso, geometría, iluminación/física del ambiente, sombreado, oclusión de objetos, UI táctil, cámaras de interior y libertad de movimiento. **Prueba de representación previa obligatoria:** si el objetivo es un personaje cinematográfico, no apilar esferas/cápsulas para la nariz/cara; buscar técnicas y modelos adecuados (autoría especializada, GLB rig legal, 2.5D de alta dirección cuando corresponda). Una estilización real intencional es válida si el conjunto es coherente; geometría básica no es pecado por sí sola. **Inspección prioritaria en N01 y N02** por evidencia humana; también N03..N10 y regresiones del mismo defecto.

### web
Auditar fotografía/video genuinos, identidad visual, fuentes y retículas, composición editorial, transiciones scroll, responsive real 320/390/768/1440, legibilidad, navegación/teclado, accesibilidad y funcionalidad prometida (carrito, export estático, filtros, vistas). Rechazar sitios con collage de SVG, tarjetas clonadas, dummy copy, botones falsos o pantallas de «manual» donde debería haber producto real. Comparar con obras reconocidas de dirección de arte, como Dropbox Brand/Exat/The Pudding, **cuando las fuentes sean recuperables**.

### music
No confundir «WAV exportado» con música bien producida. Auditar **las diez** a través de duración, composición, movimiento armónico, forma, instrumentación, groove, timbre, percusión/bajo, silencios, dinámica, mezcla, mono, espacio, master y diferencias reales entre canciones. Analizar audio real y escuchar por secciones cuando sea posible; identificar loops de calidad MIDI básica, sintetizadores planos, generadores de sonido a una onda, uniformidad tímbrica entre todos los géneros, mala mezcla/master y arreglos sin evolución. Proponer mejoras reproducibles de síntesis, muestras legales, instrumentos, articulación, secuenciación y escucha de referencia. Si no se escuchó, **no** afirmar que la mezcla suena profesional.

### video
Examinar MP4/WebM real, duración, decodificación, sincronía sonido-imagen, frames por secuencia, dirección de cámara, continuidad de espacio, actuación, montaje, gradación, iluminación y movimiento. Rechazar slides animados, textos volando, una escena vacía o transiciones simples como sustituto de cine premium. Revisar N01..N10 y proponer herramientas/librerías/pipelines accesibles para crear material audiovisual genuino, con atribución; no fingir performances ni export.

### images
Inspeccionar raster finales y variantes reales: composición, escala, silueta, geometría si interviene, anatomía, perspectiva, luz, textura, tipografía, coherencia multivista y originales. Rechazar SVGs y collages pobres presentados como imagen profesional, estilos inconsistentes entre vistas, errores técnicos de materiales, anatomía o textos. Evaluar herramientas reales de generación/edición, fuentes, coherencia y formatos de salida. El estudio no puede aprobarse con HTML que muestre un dibujo de relleno.

## Entrega mínima por chat

- Resumen 10/10 con enlaces de obras inspeccionadas y **capturas reales/frames/audio** cuando existan; toda incapacidad señalada.
- **Top de cinco causas** que degradaron la tanda y técnicas alternativas seleccionadas con pruebas.
- Cambios candidatos del flujo de especialidad, gates preventivos probados, SHA, tests, riesgos y rollback.
- Recibo ROOT verificable, con estado `CANDIDATE_NOT_PROMOTED` hasta integración, sin pedir al humano diez críticas ni audios.

**Esta instrucción no autoriza a reescribir las diez obras anteriores ni a afirmar que un flujo ya está corregido. Se prepara una ronda siguiente comparable usando una versión nueva.**
