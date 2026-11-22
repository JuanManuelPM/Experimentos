# PROMETEO · Tandas compartidas · contrato operativo

Estado: **Lanzadores publicados, no sesiones iniciadas ni resultados verificados.** Cada estudio tiene un único enlace LAUNCH.md; comando humano: `WORK · <enlace> · N` con N entero 1..10. El número selecciona solamente el brief N; la URL y el brief no cambian según el chat. Diez es tamaño de esta primera tanda, **no es un límite de paralelismo**, y futuras tandas pueden solaparse.

## Calidad de referencia obligatoria en nuevos WORK

**Antes de producir cualquier N**, leer [QUALITY_BAR.md](../../launch/QUALITY_BAR.md) y aplicar `QBAR-1` a la consigna original **sin alterarla**: investigar referentes excepcionales reales del mismo medio, extraer capacidades que elevan el resultado, rechazar sustituciones mediocres, producir un artefacto completo y compararlo con criterios perceptuales y funcionales. El benchmark es objetivo aspiracional, no promesa ni certificación. `QUALITY_BAR.md` es un único control transversal; cada estudio conserva su técnica especializada. Esta condición no cambia trabajos con SHA ya fijado ni promueve automáticamente los flujos privados.

## ESPECIFICACIÓN PROFUNDA · DEEP-SPEC-1

Para **todos los nuevos WORK**, incluido cualquier estudio futuro, leer [la única especificación compartida](../../DEEP_SPEC.md) junto a QBAR-1 y Q-LOOP. Antes de construir el primer corte, producir en el propietario de la tarea una ficha versionada de decisiones, componentes y relaciones, investigar lo que cambie elecciones y probar primero el riesgo alto. Usar el adaptador del medio que corresponda; **no** pedir un formulario al humano, cambiar los diez briefs, alterar hashes previos ni ejecutar tandas por esta modificación. Referencia común de los cinco lanzadores, sin duplicar el texto del método.

## Copia única desde ROOT

La interfaz compartida presenta **un solo botón «Copiar prompt universal» por tanda**, no uno por cada número. Copia `WORK · <enlace común> · ` (incluido el espacio final). El humano pega ese mismo texto en un chat nuevo por encargo y escribe solo el número **1 a N** al final. Cada número resuelve un brief independiente ya existente; **no hay que duplicar briefs ni cambiar enlaces**. Los números de ROOT sirven para consultar resultados, no para copiar instrucciones ni disparar ejecuciones. Copiar no equivale a STARTED.

## Resolver un WORK

1. Leer esta entrada, el `LAUNCH.md` completo y **solo** la sección N. Recuperar fuente de verdad pertinente del estudio, `JuanManuelPM/pruebas@prometeo/control:PROMETEO/START_HERE.md`, `sistemas/metodo/CONTRATO_COMPARTIDO.md` y cambios posteriores reales. El documento de entrada puede estar desactualizado; comprobar ramas/obras recientes antes de escribir. No inventar acceso a otros chats.
2. Recuperar el **flujo actual por identidad/hash** del estudio cuando exista. Registrar el hash fijado en la tarea; si una versión fue promovida en mitad de la tanda, mantener el hash del inicio y no mezclar versiones sin decisión humana. Distinguir `PREPARED` / `STARTED_EVIDENCED` / `DELIVERED` / `VERIFIED` / `HUMAN_APPROVED`.
3. Cada tarea produce una **obra observable y revisable**, no solo un plan o un panel que afirma haber trabajado. El brief es el de la sección; investigar opciones y prevenir defectos críticos antes de producir. Reusar motores reales, archivos y fuentes legales, con estado honesto cuando falta capacidad de audio/video/imagen/navegador. Ninguna técnica o género es requisito universal de todos los estudios.
4. Usar una rama exclusiva `candidate/prometeo-<estudio>-w001-<NN>-20261122` en el propietario del trabajo, tras comprobar colisiones y trabajos anteriores. No sobrescribir otra rama, obra, versión del flujo ni archivo privado. El trabajo de Música reutiliza sus ramas y W001 existentes en vez de crear duplicados.
5. Si se publica en Pages, hacerlo solo con material original/autorizado en ruta nueva aislada. Un HTML válido no acredita render, MP4 exportado, WAV audible o calidad artística; usar estados reales y comprobaciones apropiadas. Si la publicación implica datos privados, no publicar y registrar la limitación.
6. Escribir código/fuentes, archivos finales, preview cuando viable, evidencia y recibo en GitHub; leer el commit publicado. Para mostrar el retorno en ROOT, emitir una entrada segura en `prometeo/root/ROOM_MESSAGES.json` con `room` exacta, `batchId` de la tanda, `taskNumber:N`, id único, `publishedAt`, contenido y enlaces públicos reales. CAS por SHA + relectura/reintento; nunca reemplazar todo el listado desde un HEAD viejo.
7. **Aprendizaje acumulativo:** feedback humano sobre la respuesta/tanda se registra como propuesta dirigida al propietario del flujo usado, no repara automáticamente esa obra ni reescribe su brief. Un integrador de la especialidad reúne observaciones y produce una versión candidata; a ROOT solo se promueven principios probados compartibles entre estudios (navegación, licencias, publicación, tratamiento de medios, prevención de fallos, oráculos), **no** técnicas especializadas como algoritmos 3D de cámara o sintes musicales. La unión de recomendaciones no se considera versión activa.
8. Una siguiente ola repite los mismos briefs con versión nueva del flujo y nuevos IDs/ramas para comparar. No tocar la primera ni declarar mejoras causales sin evidencia de resultados.

## Contratos por estudio

- `music`: recuperar primero la W001 musical ORIGINAL ya preparada, con sus 10 briefs inmutables en `JuanManuelPM/pruebas@candidate/prometeo-music-flow-v2-wave001-20261121:PROMETEO/spaces/music-studio/production-universal/waves/W001/WAVE.json`. No sustituir los diez pedidos musicales por encargos nuevos.
- `video`: reutilizar investigación y pruebas del motor de Video; codificar 10 micros de obra original audiovisual diferentes; verificar videos reales por formato/duración, no prometer export inexistente.
- `web`: usar flujos/código de Web existentes; producir 10 sitios/apps originales funcionales independientes, no diez documentos de arquitectura ni clones de la misma plantilla.
- `images`: recuperar fuente propietaria pendiente y obras HOTEL-001; entregar 10 estudios visuales originales solo cuando haya herramienta de render auténtica. No considerar un SVG procedural pobre una prueba de capacidad generativa de imagen. No usar fotos personales o privadas.

## Recepción en ROOT

Ruta única humana: `https://juanmanuelpm.github.io/Experimentos/prometeo/root/`. El portal es lectura pública, no lanza chats ni autentica escritura a un repo privado. `BATCHES.json` es el índice del lote; mensajes/archivos se publican solo tras ejecución verificada. El botón `Copiar` no demuestra inicio y una entrega no equivale a aprobación. Los números del selector **solo cambian la vista del resultado**; no copian encargos ni ejecutan tareas. El botón universal copia al portapapeles, no inicia un trabajo.

**Nota de madurez:** la recolección universal de feedback de todos los chats y botón de integración global todavía no están verificados como función completa. El contrato de aprendizaje candidato está en `JuanManuelPM/pruebas@candidate/prometeo-ui-response-shared-20261121:sistemas/metodo/CALIBRACION_ACUMULATIVA.md`; no declararlo promovido.
