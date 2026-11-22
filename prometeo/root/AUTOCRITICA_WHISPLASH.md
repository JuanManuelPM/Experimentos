# PROMETEO · Autocrítica transversal · dos voces · ciclos de mejora

**Comando principal (manual, idéntico en todos los chats que produjeron una obra):**
`WORK · https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/root/AUTOCRITICA_WHISPLASH.md · ESTE_CHAT`

**ESTE_CHAT tiene prioridad sobre ALL o el batchId.** Es una ejecución única, inmediata, en el MISMO chat donde se produjo la obra: no necesita que el humano adjunte observaciones, dicte un audio, copie el número o identifique el estudio. Recuperar el pedido original, el resultado, código, recursos, rama, commit, herramientas y decisiones de **este hilo**. Resolver la identidad `batchId/taskNumber` contra GitHub cuando exista; si no existe vínculo público, inferirlo solo desde evidencias inequívocas de este hilo y registrar la ausencia de vínculo. Nunca sustituir el proyecto actual por el más reciente de ROOT.

**Otros modos para un chat coordinador, no necesarios para revisar una obra:** sustituir `ESTE_CHAT` por un `batchId` exacto, `music`, `video`, `web`, `images`, `3d` o `ALL`. En esos modos hay que identificar cada artefacto y no fingir que se visitaron chats ajenos.

## Operación autónoma dentro de una única respuesta (no programada)

1. **Sin feedback humano** es la ruta NORMAL: al pegar solo el comando, iniciar inmediatamente la crítica independiente de la obra producida en este chat. Si el humano añade audio o texto, incorporar también sus observaciones separadas de las detectadas automáticamente. **No pedir críticas adicionales, aprobaciones intermedias, ni otro mensaje para seguir.**
2. Recuperar los artefactos reales y el flujo fijado del encargo, comprobar qué se entregó y probar lo accesible; si el resultado quedó solo en un chat pero el archivo no existe en GitHub, no afirmar que se guardó. Separar `NO_RESULT`, `INSPECTED`, `NOT_INSPECTED` y `BLOCKED` por aspecto.
3. Ejecutar el diálogo adversarial descrito abajo entre **PROFESOR** y **ALUMNO**, priorizando hasta los cinco defectos de mayor impacto según evidencias, con alternativas y pruebas. Sin insultos, conformismo, autocalificación ni dictámenes que sustituyan escucha/visión inexistente.
4. **Corregir y aprender:** donde exista autoridad y herramientas, arreglar defectos del **proceso o flujo** con prototipos/pruebas en rama candidata propia, sin reescribir el brief ni la obra histórica. Si el problema es la interfaz del estudio o de ROOT, dirigirlo a su propietario en lugar de regenerar la obra. Una corrección del resultado específico solo se hace cuando el usuario lo autoriza explícitamente.
5. Convertir cada defecto importante en una regla preventiva reproducible: etapa causante, disparador, nuevo control, test ejecutable o medible, costo/riesgo, contraejemplo, respaldo y rollback. **Es obligatorio proponer cómo evitar el defecto en obras futuras**. No basta con un diálogo brillante ni una lista abstracta de recomendaciones.
6. Guardar una entrada duradera por hallazgo o conjunto estrechamente relacionado en el inbox autorizado del flujo correspondiente (o una rama candidata exclusiva), con referencia a ESTE_CHAT, `batchId/taskNumber`, SHA y pruebas. Releer el commit. Dejar recibo público seguro asociado al trabajo cuando sea posible. Informar `NO_GUARDADO` si no se pudo persistir.
7. Responder **brevemente en ese mismo chat** con cantidad de problemas verificados, propuestas guardadas, pruebas realizadas, bloqueos y enlace al recibo. No afirmar `FLOW_PROMOTED` si solo hubo `FLOW_CANDIDATE`.
8. **Terminar.** Sin agendar, crear, activar ni modificar automatizaciones, cron, GitHub Actions recurrentes, recordatorios, daemons o revisiones futuras. Cada ejecución ocurre solo cuando el humano pega un mensaje nuevo. Se pueden usar las pruebas técnicas ya existentes, pero no dejar procesos recurrentes.

## El paso posterior único en ROOT

Después de pegar el comando en los chats que se quieran revisar, ejecutar **una sola vez** desde ROOT:
`WORK · https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/FLOW_REVIEW.md`

Ese ejecutor recupera los recibos y propuestas de todas las obras, consolida cambios universales vs específicos del estudio, produce y prueba versiones nuevas sin duplicar causas, promueve solo con autoridad y riesgo aceptable, y prepara las tandas de comparación con los mismos briefs originales. **No necesita que el usuario reenvíe las críticas desde cada chat.**

**Estado:** contrato de **revisión a pedido**, no programada. Publicar el archivo NO evalúa obras; pegar el comando en un chat inicia una ejecución finita que debe producir pruebas y recibos. No requiere audio humano.

## Antecedente Whisplash / Whiplash

El usuario recuperó en conversaciones previas el método de diálogo **profesor muy exigente ↔ alumno excepcional** inspirado en Whiplash. Su evolución referida: primera versión con 17 etapas (144 nodos/169 conexiones), después V3 con 24 etapas (203 nodos/231 conexiones) y secuencia `RECUPERAR → RECONSTRUIR → RECORDAR NORMAS → CONFRONTAR → DIVERGIR → REINVENTAR → EJECUTAR → COMPROBAR → APRENDER`. Archivos históricos: `FLOW_PERSONAJES_OFFLINE.html`, `FLOW_PERSONAJES_V1.md`, `FLOW_PERSONAJES_V1.json`, `PROMPT_UNA_IA.md`, `PROMETEO_FLUJO_PERSONAJES_V1.zip`. **Los archivos originales no están localizados en los repositorios accesibles desde esta entrada:** esta implementación conserva el mecanismo conocido, pero NO afirma haber recuperado literalmente sus 24 etapas, nodos o prompts. Cuando estén disponibles deben releerse y alinearse sin inventar equivalencias.

No imitar insultos, maltrato o humillación; es un protocolo de evaluación estricta y colaborativa, no un ejercicio de abuso. Tampoco convertir una autocrítica en prueba de aprobación artística humana.

## Identidad del trabajo

1. Leer `JuanManuelPM/pruebas@prometeo/control:PROMETEO/START_HERE.md`, CANON/WORK/CONTRATO_COMPARTIDO y el método de calibración acumulativa candidato.
2. Leer `JuanManuelPM/Experimentos@gh-pages:prometeo/root/BATCHES.json`, `ROOM_MESSAGES.json` y el `AUTO_REVIEW_BASELINE.json` (índice de cobertura calculado, nunca sustituto de consultar las fuentes). Resolver cada `batchId` + `taskNumber`; recuperar `messageIds` y retornos publicados por el mismo par. Nunca inferir existencia de una entrega por la mera rama candidata.
3. Inspeccionar **los artefactos reales** con las herramientas pertinentes: interfaz en navegador, HTML/CSS/JS, imagen raster, audio reproducible y forma de onda, video con frames/audio/duración, escena 3D con cámaras/colisiones, interacciones cuando sea posible. Un GitHub file/link NO equivale a una reproducción. Cuando no hay herramientas, archivo o acceso, dejar `NOT_INSPECTED`, marcar causa y separar hallazgos de código de juicios visuales/sonoros.
4. Fijar versión y hash del flujo que produjo cada obra; no mezclar evaluaciones de distintos flujos ni briefs. El hecho de que el usuario haya mandado diez chats NO garantiza diez respuestas publicadas.

## Dos roles, dos argumentos y evidencia

Para cada obra (o grupo compacto de obras cuando son comparables), usar voces cognitivas diferenciadas sin dejar que una apruebe el trabajo de la otra por cortesía:

**ALUMNO / AUTOR EXCEPCIONAL**: explica objetivo, público, criterios de éxito, decisiones de arte/técnica, por qué esas elecciones sirvieron, y formula la mejor defensa posible en base a evidencia, no promesas.

**PROFESOR / CRÍTICO RIGUROSO**: exige respuesta y contraprueba, enumera errores desde distintos puntos de vista, solicita alternativas concretas y razona el defecto raíz. No acepta como victoria «compila», «tiene botones», «pasa lint», «se generó un archivo» ni «probablemente está bien». Tampoco acusa defectos visuales/audio que no pudo comprobar.

Ángulos **obligatorios cuando aplican**: intención vs entrega, originalidad y dirección artística, estructura/escala/composición, funcionalidad real, interacción táctil/teclado, accesibilidad, medios y formato (silencio/clipping/frames/codecs), ergonomía y bibliotecas, rendimiento, compatibilidad móvil/desktop, reproducibilidad, licencia/privacidad, narrativa/ritmo, integración con el shell universal, QA y observabilidad, y generalización del defecto a la producción futura. Justificar N/A, no llenar checks decorativos.

### Proceso dialógico

- **Ronda A · Reconstrucción y defensa:** recuperar brief, resultado, assets y estado; alumno expone intenciones, decisiones y evidencia. Profesor pregunta qué está de verdad demostrado.
- **Ronda B · Ataque amplio:** profesor identifica los 3–7 defectos de mayor impacto, exige reproducirlos con evidencia y separa hechos/hipótesis.
- **Ronda C · Contradicción y alternativas:** alumno defiende, acepta o refuta cada hallazgo con pruebas; propone al menos dos opciones relevantes cuando el defecto amerita alternativas.
- **Ronda D · Corrección:** alumno realiza la corrección en una variante candidata/ambiente de prueba **solo si la tarea autoriza reparación local**, o produce un prototipo reproducible mínimo cuando la regla es de flujo. No sobrescribir obras históricas, briefs, SHA de flujo ni lanzar otra tanda por reflejo.
- **Ronda E · Verificación adversarial:** profesor intenta refutar la corrección y provoca regresiones; alumno aporta pruebas. Repetir de forma proporcional mientras existan fallos de alto impacto y haya herramientas/capacidad, sin fingir ciclos hechos. Mínimo cinco turnos argumentativos sustantivos con evidencia si el contexto permite. Registrar bloqueo si no es posible.
- **Ronda F · Transferencia al sistema (OBLIGATORIA):** profesor pregunta: «¿Qué etapa dejó escapar este defecto, qué control concreto lo habría detectado antes, y cómo lo aplicamos a *otro trabajo diferente*?» Alumno identifica dueño del flujo, `stage_id`, `failure_trigger`, `preventive_gate`, `measurable_test`, `counterexample`, `expected_cost` y `rollback`; el profesor rechaza vaguedades y exige evidencia con dos clases de productos o una regresión legítima.
- **Ronda G · Cierre honesto:** persistir hallazgos y propuestas en fuente privada. Distinguir `OBSERVED`, `HYPOTHESIS`, `FIX_IMPLEMENTED`, `TESTED`, `FLOW_CANDIDATE`, `FLOW_PROMOTED`, `HUMAN_APPROVED`. Las hipótesis no se convierten en hechos por debatirlas.

El debate no termina cuando hay acuerdo, sino cuando el registro liga observación → causa → intervención → prueba → generalización. Sin evidencia, terminar como `BLOCKED`, no como aprobado.

## Responsabilidad y registro

- `OUTPUT_QUALITY`: aplicar criterio a la fábrica del **estudio** (3D, música, video, web, imágenes). Un fallo específico no impone su técnica a todos los trabajos; mejora el sistema que elige técnicas pertinentes.
- `STUDIO_UI`: corregir editor musical, galería, timeline o estudio propio, reutilizando shell universal. Los cambios de UI no exigen regenerar diez obras.
- `ROOT_UI`: modificar una sola vez menú compartido, mensajes, copiado, biblioteca, inspección de medios, comparador, versionado y QA, sin duplicarlo por estudio.
- `WORK_LOCAL`: reparar obra puntual solo cuando fue autorizado; de lo contrario mantener intacta la obra, con variante candidata si la validación necesita una prueba.

En el repositorio privado, **una propuesta por unidad de evidencia** en archivos aislados:
`sistemas/metodo/inbox/<flowId>/<batchId>/<taskNumber>/<auditId>.json` o ubicación canónica que se descubra mediante contrato. Campos: `audit_id`, `batch_id`, `task_number`, `response_ids`, `flow_id`, `flow_sha`, `source_urls`, `artifact_sha`, `observed_failure`, `hypothesis`, `counterexamples`, `candidate_fix`, `preventive_gate`, `test`, `status`, `confidence`, `tool_limitations`. No sobrescribir registros simultáneos ni filtrar contenido privado al repo público. Publicar recibo seguro con cantidad REAL de propuestas y vínculo de trazabilidad; si falla escritura, declarar `NOT_SAVED`.

Acumular al final por estudio y por capas compartidas sin colapsar problemas heterogéneos. Para integrar lo acumulado, usar la referencia existente `prometeo/launch/20261122/FLOW_REVIEW.md`; exigir versión de flujo candidata y QA de regresión para declarar mejora real. **No promover autónomamente cambios destructivos, irreversibles, de seguridad, monetización ni pérdida de datos**. Con autorización permanente solo son autopromovibles cambios de bajo riesgo con pruebas y posibilidad de rollback; los demás se publican como candidatos.

## Objetivo sin revisión humana

Un ejecutor puede revisar una obra (ESTE_CHAT), una tanda o todas **solo cuando recibe el comando en un chat** y sin audio humano. Pero el método necesita un agente/modelo con acceso a las obras, capacidad de ejecutar pruebas y permisos GitHub para escribir. Un navegador Pages estático no invoca por sí solo los dos roles ni edita repositorios.

El agente reporta `evaluados/total`, `inspeccionados realmente`, `defectos observados`, `bloqueados por falta de asset`, `propuestas guardadas`, `cambios implementados`, `regresiones probadas`, `flujos promovidos`. No reportar 40/40 si hay 10 resultados sin publicar o una obra solo documentada. Cada nueva revisión idempotente se distingue por hash de resultado/flujo, no por haber vuelto a leer la misma lista.

## UX ROOT

Exponer **«Revisar sin audio»** como copia del comando **ESTE_CHAT** para pegar en cada chat que entregó una obra. La vista de tanda puede ofrecer revisión agrupada bajo pedido explícito con `batchId`, pero NO reemplaza la revisión individual de cada hilo. En ROOT, **«Actualizar flujos»** recopila todas las mejoras ya guardadas. **Prohibidas revisiones programadas**; no crear nuevas rondas por haber recibido feedback. Primero sintetizar, verificar y versionar.
