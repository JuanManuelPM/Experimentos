# PROMETEO · Una calibración transversal de las tandas

**Comando humano mínimo:** `WORK · https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/FLOW_REVIEW.md`

**Estado de esta entrada:** preparada; NO inicia trabajos ni afirma haber recopilado críticas todavía. Usar después de que el humano revise las entregas y los ejecutores registren sus observaciones.

## Resolver

1. Recuperar `JuanManuelPM/pruebas@prometeo/control:PROMETEO/START_HERE.md`, `PROMETEO/system/CANON.md`, `sistemas/metodo/CONTRATO_COMPARTIDO.md`, `PROMETEO/system/commands/CALIBRAR.md`, `PROMETEO/system/commands/INFORMAR.md`, `PROMETEO/system/commands/ORGANIZAR.md` y el sistema de coordinación existente. Leer la propuesta candidata `candidate/prometeo-ui-response-shared-20261121:sistemas/metodo/CALIBRACION_ACUMULATIVA.md` sin tratarla como canon aprobado.
2. Recuperar inventario y resultados de tandas en `JuanManuelPM/Experimentos@gh-pages:prometeo/root/BATCHES.json` y `ROOM_MESSAGES.json`. Para cada estudio 3D, Música, Web, Video e Imágenes, buscar selectivamente el inbox INFORMAR, propuestas, receipts de obra y feedback de usuario más recientes; verificar documentos y SHAs. No inferir que no hay propuestas por faltar texto en un mensaje público, ni fabricar errores no observados.
3. Clasificar cada propuesta:
   - **TRANSVERSAL_COMPROBABLE:** navegación y medios compartidos, validación de resultados, adquisición legal, calidad de referencia, QA preventivo, escritura concurrente, versionado, evidencia y publicación.
   - **DOMINIO_ESPECÍFICO:** cámaras/locomoción 3D, armonía/DSP, render y codificación de Video, responsive y navegación Web, consistencia multivista de Imágenes.
   - **LOCAL:** defecto específico de una obra que no modifica un procedimiento general.
   - **INSUFICIENTE:** hipótesis sin fuente, evidencia o contexto; pedir una prueba barata interna y no promover.
4. Consolidar transversales por causa real y contraejemplos, **no por coincidencia de palabras**. No meter todos los controles de todos los medios en el flujo global; el método raíz solo declara obligaciones comunes, y cada estudio añade criterios adaptados. Conservar observaciones contradictorias con provenance.
5. Construir una **versión candidata del método común** en rama propia y propuestas/ versiones de los flujos por especialidad cuando corresponda; no editar `prometeo/control` o punteros activos por el mero hecho de procesar feedback. Verificar las regresiones apropiadas, compatibilidad de obras/briefs, atribución, privacidad y rollback. Promover solo con autorización y evidencia suficiente. Los trabajos iniciados siguen su versión fijada; la ola siguiente usa la nueva.
6. Registrar síntesis privada con IDs de feedback, fuentes SHAs, causa, alternativa, cambio implementado, tests, efectos probados y NO_RUN. Publicar únicamente un resumen seguro por sala en ROOT, con estado CANDIDATE/PROMOTED real. Devolver enlaces al siguiente lanzamiento de ola **sin reformular briefs**.

## Criterio humano

La persona solo revisa ejemplos y comenta libremente usando una referencia de obra/tanda. El chat que recibe ese feedback debe conservarlo en el inbox apropiado, no exigir que el humano pronuncie comandos especiales. **Este lanzamiento sintetiza lo acumulado**, no sustituye el registro individual de observaciones ni crea un demonio en segundo plano.

No inventar un botón que lanza automáticamente una IA desde GitHub Pages. La página puede ofrecer Copiar; el humano abre un chat con GitHub autorizado y pega una sola referencia.

## Alimentación desde la autocrítica automática

Recuperar primero `JuanManuelPM/Experimentos@gh-pages:prometeo/root/AUTOCRITICA_WHISPLASH.md` y el índice `AUTO_REVIEW_BASELINE.json`. Leer las auditorías verificadas en `JuanManuelPM/pruebas@candidate/prometeo-autocritica-multistudio-20261122:sistemas/metodo/autocritica/20261122/`: `AUDITORIA_INICIAL.md` y `DELIVERY_PROOF_GATE.json`, más cualquier nuevo recibo por hash generado por monitoreo periódico. Es una **candidata**, no canon.

Antes de promover cada reparación, exigir al ejecutor la respuesta documentada al diálogo: ¿cuál era el error real, en qué etapa apareció, qué control preventivo evita que se repita, qué contraejemplo lo desafía y qué pruebas se ejecutaron efectivamente? Aplicar el gate transversal de evidencia por tipo de artefacto, con adaptadores de medio en vez de 5 flujos duplicados. La falta de un MP4 publicado, playback de navegador o persistencia probada no queda arreglada por redactar una conclusión convincente.

La autoevaluación sin humano debe conservar `HUMAN_APPROVED=NO`. Puede producir y verificar mejoras pequeñas con rollback en ramas candidatas, pero no afirmar una actualización activa general hasta que esté efectivamente promovida y validada. Sin evidencia: `NOT_RUN` o `BLOCKED`. Esta entrada de síntesis es el único coordinador de actualización transversal, no una propuesta extra por trabajador.
