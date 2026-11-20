# PROMETEO · Estudio 3D · Flujo de producción 2.0.0

**Entrada 3D universal dentro del estudio.** Una palabra registrada o un brief humano breve se convierte en el contrato completo de escena. El flujo, no el prompt, decide arte, herramientas, materiales, cámara, FX, animación, publicación y aprendizaje.

**Método actual:** `FLOW_INDEX.json` → `versions/2.0.0/flow.json`, SHA-256 `27c96cac84056dd8b1f2a952cdb8f0f2f7f8136ef322280f34f510f24c239682`.

- **[Manual operativo completo](versions/2.0.0/METHOD.md)**: instrucciones de las 17 etapas, cómo investigar recursos reales y construir todo.
- [Operaciones profundas para las 17 etapas](versions/2.0.0/STAGE_OPERATIONS.json), reutilizadas por **269 nodos** vía `procedureRef`; no duplicar instrucciones.
- [Calidad por componente](versions/2.0.0/COMPONENT_REFERENCE_MATRIX.json): Arcade gabinete/pantalla SÍ, fondo/cámara NO; Cruce actor SÍ, calle/cámara NO.
- [Compilador mínimo](versions/2.0.0/scene-compiler.mjs) y [Catálogo de diez proyectos](versions/2.0.0/SCENE_INTENT_CATALOG.json), aún **NO aprobados como briefs fijos**.
- [Toolchain](versions/2.0.0/TOOLCHAIN_ROUTING.json), [12 interfaces de conexión](versions/2.0.0/ADAPTER_INTERFACES.json) y [selección segura](versions/2.0.0/adapter-routing.mjs).
- [Arranque web robusto](versions/2.0.0/browser-boot.mjs), [análisis de loader](versions/2.0.0/browser-check.mjs).
- [Auditoría del flujo](versions/2.0.0/flow-audit.mjs) y [trazas de etapa](versions/2.0.0/validate-trace.mjs).

**Principio:** entregar intento **íntegro y visible** aunque tenga defectos. No cancelar por QA artística o primer artículo. Evaluación humana después, mejoras generales en la versión siguiente sin editar el brief original.

**Madurez:** código y tests; ejecución de nuevas diez escenas/QA Android y aprobación artística todavía NOT_RUN. 1.0 a 1.4 continúan archivadas e inmutables.
