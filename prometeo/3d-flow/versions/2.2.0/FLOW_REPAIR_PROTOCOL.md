# FLOW-REPAIR · Flujo para corregir el flujo del Estudio 3D

**Implementación candidata:** `flow-repair.mjs` + `flow-repair.test.mjs`. Se integra al flujo 2.1 como subflujo `self-correcting-flow-character`, desde `CHAR_CAUSE`. Sólo estudia personajes en esta revisión: problemas de cámara, entorno o sonido pueden entrar después como dominios separados, sin cambiar los procedimientos ajenos ahora.

## Ciclo de evidencia, no de opiniones inventadas

1. **User signal:** screenshot/voz del usuario, identificar escena, rol, parte del actor y rechazo/aprobación. No afirmar que la imagen está en GitHub si sólo está en este chat.
2. **Exact source:** obtener rama, árbol, código del actor, ASSET_MANIFEST, STAGE_TRACE, hash. `CHARACTER_DECISION_AUDIT.json` fija seis casos de Ola 002, no sólo recordatorios.
3. **Earliest causal stage:** reconstruir por qué se eligió mal esa familia (recuperación → planificación → adquisición → humanoide) y quién repitió una opción ya rechazada; diferencia entre síntoma final y elección. `locateCharacterFailure` devuelve `SOURCE_BACKED_HYPOTHESIS` o `UNKNOWN_CAUSE`, **nunca** «causa pixelográfica probada» por texto solo.
4. **Counterexample registry:** guardar el rechazo de la parte VISUAL específica en `NEGATIVE_CHARACTER_REGISTRY.json`, pudiendo conservar MOTION parcial. Se prueba en futuras selecciones.
5. **Diferenciar propuestas:** `synthesizeRepairProposals` agrupa causas entre proyectos, indica etapa precisa, lista fuentes y genera la regla abstracta. Si solo aparece en un caso se mantiene como hipótesis, no sentencia.
6. **Parche acotado:** `applyApprovedStagePatch` exige `USER_CHARACTER_FLOW_CHANGE`, versión nueva y etapa dentro de recuperación/planificación/adquisición/clasificación/humanoide/acting/QA/reparación/persistencia. Devuelve nuevo objeto de operaciones; no reescribe prompt, branch global ni archivos de producción.
7. **Regresión:** tests previos + nueva prueba que antes fallaba. `reviewFlowDelta` comprueba mismo briefHash e impacto acotado; readback de GitHub, árbol de 17 etapas, nodes/edges, fuente inmutable. Registrar OUTPUT y QA sin fingir GPU.
8. **Promoción:** el método nuevo puede ser candidato con tests de fuente; un **personaje** sólo se aprueba con imágenes auténticas y evaluación humana. Una capacidad compartida necesita segundo uso diferente, licencia válida y verificación.

## Contención de errores
- Rechazo visual NO cancela la obra pedida: intentar nueva estrategia **antes del ensamblaje**, luego producir FULL_ATTEMPT y mostrar incluso fallos; no bucle infinito.
- Aprobación de movimiento ≠ aprobación visual.
- Reutilización de un clip requiere compatible skeleton/rest pose/bone map/foot contact, no atribuir Walk a GLB sin clips.
- No combinar todas las diez escenas en una sola estética, ni meter NPC si el brief no lo pide.
- Los registros de etapa con el mismo texto genérico son evidencia de *traza débil*, detectada por `traceDecisionHealth`; no sustituyen una decisión real.

## Ejemplo causal verificable
**Bondi V3:** la STAGE_TRACE indicó que los secundarios eran «imperfectos» y ASSET_MANIFEST nombró `passenger-profiles` con «Primitive visual quality known deficiency». El actor construido en `scene.mjs` usó esferas/cilindros. Causa upstream: el proceso permitió escoger esa vía en recovery/adquisición, incluso con advertencia. Corrección nueva: leer negativos ANTES de elegir, comparar otras dos fuentes, preparar diferente personaje, conservar asiento/ruta si sirven.

**Cruce V2:** `ASSET_MANIFEST` documentó 12 instancias del mismo CesiumMan recoloreadas. El usuario sólo valoró la fluidez; rechazo de su skin/cara. Corrección: visual source NO aprobado, motion candidatable, retarget como adaptador independiente.

**Entrevista V2:** dos GLB reales de Quaternius-derived civilian; la malla cargable fue un éxito técnico, la cara en primer plano no lo fue. Corrección: estrategia facial real y test de closeup en vez de otro recolor.

**Respawn V3:** no usa simples esferas para el actor, pero el resultado sigue rechazado. Corrección: el filtro no es «¿usó primitivas?» sino cara/ropa/silueta realmente aceptables en el plano; traza genérica no oculta causa.

**Límite:** el código actual implementa detección/síntesis/parche de datos con QA estructural. No convierte una crítica humana en un nuevo modelador visual automáticamente ni puede afirmar mejora de imagen hasta siguiente producción.
