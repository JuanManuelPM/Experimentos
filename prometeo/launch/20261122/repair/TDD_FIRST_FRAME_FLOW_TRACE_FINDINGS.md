# PROMETEO · Auditoría de TDD de primera pantalla y Flow/Trace

Corte 2026-11-22. Diagnóstico documental, NO auditoría completa y NO cambio de flujo en producción. Preservar los cinco chats de auditoría en curso. Integrar hallazgos al final de ese ciclo.

## Qué ya existe y qué falla

- Método 3D 2.3.0: prometeo/3d-flow/versions/2.3.0/flow.json define 17 etapas, 316 nodos y 406 aristas, junto a STAGE_OPERATIONS.json por etapa, schema de STAGE_TRACE.json y graph edges. El registro stageInstrumentation.nonBlocking es TRUE. qualityArchitecture.earlyDiagnostics indica Advisory PRE-BUILD decisions only y no exige pase artístico en producción.
- scene-compiler.mjs v2.3.0 define defaultUI:PRESENTATION, hudMaxFraction:0.12, focalOverlapMax:0, inProductionFinishPassRequired:false. El humano pide inicial de obra limpia, sin HUD/textos/overlays salvo controles esenciales. Especificar ese criterio ANTES de construir, sin prohibir contenido textual legítimo de sitios editoriales.
- DEEP_SPEC.md + deep-spec-v1.mjs permiten definir preguntas, componentes, relaciones, decisiones y criterios antes de construir, pero sus 28 tests conocidos son estructurales y no validan calidad de primera pantalla.
- 3D 01: prometeo/launch/20261122/next/3d/works/01/PREPRODUCTION.deep-spec-v1.json reconoce HIGH riesgo de cara como esferas, mechones pobres y deformación en perfil, y criterio visual de rostro coherente en tres cámaras. Ambos quedaron NOT_RUN; hubo publicación y humano vio cara de piezas apiladas, UI con textos superpuestos.
- 3D 02: prometeo/previews/3d/w6/02/PREPRODUCTION.deep-spec-v1.json reconoce HIGH riesgo de pared/techo que bloquea cámara y aceptación de seis vistas reales, ambos NOT_RUN; captura humana muestra gran pared que oculta la sala. Tests lógicos de colisión PASS no previenen mala composición.
- No se encontró STAGE_TRACE.json en las rutas públicas inspeccionadas de 3D W6 01, 3D W6 02, Imágenes W002 04, Web W002 01, ni en ramas revisadas de Música W002 02 y Video W002 01. Sí hay fichas PREPRODUCTION con decisiones y referencias en varias obras. Esto no prueba ausencia absoluta, pero el cumplimiento por tarea NO ESTÁ VERIFICADO.
- flow.json v2.3.0 referencia versions/1.4.0/validate-trace.mjs; ese validador rechaza cualquier trace.flow.version distinto de 1.4.0. Incompatibilidad comprobada de versión, aunque no se demostró que se ejecute en la ruta actual.

## TDD artísitico antes de construir, no más formularios

Un solo contrato compartido, 3 compuertas proporcionales:
1. FIRST-FRAME: antes de código/arte, decir qué DEBE VERSE al abrir la obra en móvil y escritorio, cuál es el protagonista, su composición, referencia de excelencia y UI mínima imprescindible. Por defecto, experiencias de escena y medios muestran su OBRA, no títulos/instrucciones/paneles; texto editorial real es contenido permitido. Fijar 2-4 tests de aceptación específicos, como sujeto visible, cero oclusión de objeto principal, tipografía sin solapes, controles no duplicados, cero overflow y cámara bien dirigida. Captura real al primer frame estable, antes de la construcción completa.
2. FIRST-ARTICLE: construir o adquirir PRIMERO la pieza que más riesgo conlleva, en estado presentable: cara/rig de actor, escena interior con cámara entre paredes, groove mezclado de una sección, plano de video continuo, raster maestro. Observar el resultado y compararlo con una referencia realmente vista. Si la representación falla, cambiar herramienta, técnica o recurso en lugar de maquillar con iluminación o documentación. Una prueba informativa temprana, no iteración infinita.
3. RECORRIDO: las pruebas se definen antes y se ejecutan en primer artículo, primera pantalla y entrega. Un test lógico certifica comportamiento lógico, no excelencia estética. Estados PASS/FAIL/NOT_RUN con artefacto real; un NOT_RUN no se transforma en PASS por el reporte.

## Reconstruir las cuatro caras sin duplicar trabajo

El diseño histórico era Surface | Book | Flow | Trace. Surface = obra limpia que ve el humano; Book = decisiones/ficha profunda; Flow = mapa de nodos/etapas/transiciones; Trace = recorrido real con eventos, tiempos, decisiones, herramientas, evidencia. Book y Flow existen documentalmente, pero Trace no es una señal durable obligatoria observada en la muestra.

Un SOLO contrato de trazabilidad para todos los medios, con adaptadores específicos, captura eventos SOLO de etapas/nodos visitados: taskId, flowVersion/sha, stage/nodeId, status, inputRef, decisionSummary, alternativesConsidered, outputRef, testStatus, evidenceRef, timestamp. Registrar en fronteras reales mientras sucede, con readback; no reconstruir los 316 nodos al final ni exponer pensamiento privado. SKIPPED necesita razón. Un validador debe comprobar que transiciones del trace corresponden a aristas permitidas y que evidencia de prueba realmente existe cuando se anuncia OBSERVED. Reparar validador 1.4.0 hardcoded antes de afirmar Trace universal. Captura, decisiones y límites se ofrecen en panel secundario de ROOT, sin sobrecargar la Surface.

## Gate de siguiente integración

Cuando terminen auditorías, antes de preparar nuevos 50 WORK: demostrar en al menos un corte REAL que first-frame y first-article se definieron ANTES de programar, que un contraejemplo cambió la representación, y que Trace se persistió con decisiones, artefactos y test antes del retorno. Conservar versiones históricas; no introducir otro método paralelo; no bloquear entrega de candidatos por ausencia de QA artístico, pero tampoco afirmar acabado profesional sin observación.

Fuentes: flow.json v2.3.0, STAGE_OPERATIONS.json, scene-compiler.mjs, METHOD.md, validate-trace.mjs v1.4.0, DEEP_SPEC.md, deep-spec-v1.mjs y PREPRODUCTION W6/01 W6/02.
