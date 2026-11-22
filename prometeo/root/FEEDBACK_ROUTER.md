# PROMETEO · Entrada universal de revisiones

Esta ruta es una referencia operativa estable. No crea un segundo método ni una segunda raíz.

## Invocación corta
`CONTINUAR · PROMETEO · https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/root/FEEDBACK_ROUTER.md · <referencia de tanda, respuesta, estudio o ROOT>` + comentario humano libre (texto o audio). Si la fuente sólo es una tanda, recuperar todos los resultados por `batchId`; si es una respuesta, su obra y tarea; si es una obra/estudio, su interfaz y flujo; si es ROOT, su método o UI. No exigir palabras «para el flujo», «para la UI» ni rutas de GitHub adicionales.

## Identidad y recuperación
1. Leer `JuanManuelPM/pruebas@prometeo/control:PROMETEO/START_HERE.md`, CANON, CONTRATO_COMPARTIDO, CALIBRAR, INFORMAR/ORGANIZAR; leer las decisiones candidatas de calibración acumulativa sin atribuirles promoción automática.
2. Leer `JuanManuelPM/Experimentos@gh-pages:prometeo/root/BATCHES.json` y `ROOM_MESSAGES.json`; resolver identificador EXACTO de la referencia. Una URL `/#music/tanda/music-w001-20261122` identifica la tanda, no una canción; `/#music/mensaje/{id}` identifica una respuesta; `/#music/obra/{id}` identifica un editor/obra. `/#root` identifica la interfaz/método universal. No adivinar obra por número o por orden del feed.
3. Verificar obras entregadas y evidencias. Una entrada de resultado no equivale a calidad aprobada, una rama preparada no significa ejecución, un botón de copiar no inicia chats.

## Clasificación obligatoria sin participación humana
Dada una revisión que contenga múltiples observaciones, descomponer una sola vez y asignar propietario:
- `OUTPUT_QUALITY`: defecto de las diez canciones, videos, sitios, imágenes o escenas, incluso si aparece en un solo caso. Proponer corrección **al flujo de creación** del medio cuando generalice; vínculo con los task IDs afectados. La intervención humana no tiene que repetir «para el flujo».
- `STUDIO_UI`: defectos del reproductor, DAW, biblioteca, editor de video, lienzo web, galería de imágenes o escena principal. La obra existente no se reescribe; preparar cambio de UI del estudio con componentes del shell compartido.
- `ROOT_UI`: defecto transversal en mensajes, copiado, navegación, menú, tipos multimedia, feedback, estructura del visor o comparación. Su propietario es ROOT y su contrato compartido; no multiplicar cinco versiones del mismo control.
- `WORK_SPECIFIC`: arreglo de una obra puntual solicitado de modo explícito, con su propia versión. No sustituye una corrección de flujo.

Una crítica puede generar varios tickets de los tres primeros tipos, conservando el comentario original y sus referencias. Por defecto una revisión **registra propuestas y arreglos de bajo riesgo expresamente solicitados**, pero no relanza tandas, no cambia briefs, no promueve flujos globales ni publica contenido privado sin autorización.

## Entrega durable y recibo
Para cada propuesta registrar identificador único, fuente `response_id|batch_id|work_id`, `flowId` + SHA real, observación atribuida al humano, hipótesis separada, área/propietario, acción candidata, riesgo, evidencia y estado `PROPOSED`. Escribir en archivos/ramas aislados o mecanismo con CAS y relectura, sin sobrescribir críticas simultáneas. El inbox privado es el lugar de los detalles; el resumen público puede enlazarse desde la misma respuesta. Si no se pudo persistir, declarar `NO_GUARDADO` y su motivo. No confundir PROPOSED, IMPLEMENTED, VERIFIED, PROMOTED.

## Actualizar desde ROOT
`WORK · https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/FLOW_REVIEW.md` reúne observaciones de todos los estudios y del propio ROOT, separa problemas universales de defectos especializados, valida cambios y genera versiones candidatas con pruebas. La promoción requiere autoridad, regresión y rollback. Una nueva tanda reproduce los mismos briefs con la nueva versión de flujo; una corrección de UI del estudio puede desplegarse antes porque NO requiere volver a generar las diez obras.

## Regla de visualización
- Solo un shell universal para todas las áreas.
- `Mensajes` como icono de burbuja accesible y feed simple; `Proyectos` como biblioteca; `Estudio` como superficie principal. No duplicar menús anidados.
- En tanda: números SOLO para seleccionar resultado, acción visible `Copiar NN` para copiar el comando COMPLETO de la tarea, con número incluido y sin editar a mano, y `Revisar toda la tanda` para copiar su referencia única. Los mensajes de resultado de cada worker se mantienen asociados.
- El editor/reproductor se abre en la misma área principal con herramientas contextuales del menú; mejoras de UI no crean aplicación paralela.
- ChatGPT recibe audio y texto; GitHub Pages es un visor de solo lectura, no un chat ni un proceso automático. No fingir que una copia o una publicación lanza agentes.

**Fuentes de las tandas:** `prometeo/launch/20261122/UNIVERSAL.md`, `prometeo/root/BATCHES.json`; contrato candidato previo: `JuanManuelPM/pruebas@candidate/prometeo-ui-response-shared-20261121:sistemas/metodo/CALIBRACION_ACUMULATIVA.md`. Toda nueva propuesta debe registrarse en el propietario real, no usar este documento como inbox mutable.
