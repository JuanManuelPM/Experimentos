# PROMETEO · Estudio 3D · Flujo vigente 2.1.0

**El brief humano no se optimiza.** La mejora se aplica al método universal de producción del **Estudio 3D**, no al prompt individual ni a un router de otros chats. Fuente: `FLOW_INDEX.json` → `versions/2.1.0/flow.json` · SHA-256 canónico `1a5b7e270f725974208236eb6b4e1a299f397eb976677f49d8e2143332506db8`.

## Novedad 2.1 · PERSONAJES Y CORRECCIÓN DEL FLUJO

**No existe todavía un personaje visualmente aprobado por el usuario.** Los actores de Bondi (primitivas), Cruce/Estación/Submarino (skin CesiumMan), Entrevista (GLB recoloreado con rostro débil) y Respawn (malla loft insatisfactoria) quedan rechazados como estándar visual. La fluidez del Cruce es un CANDIDATO de movimiento separado del modelo.

- [Manual vigente](versions/2.1.0/METHOD.md) · [17 operaciones profundas](versions/2.1.0/STAGE_OPERATIONS.json) · [280 nodos](versions/2.1.0/flow.json).
- [Auditoría de decisiones reales de seis trabajos](versions/2.1.0/CHARACTER_DECISION_AUDIT.json) · [Lista de visuales rechazados](versions/2.1.0/NEGATIVE_CHARACTER_REGISTRY.json).
- [10 estrategias diferentes de producción de humanoides](versions/2.1.0/CHARACTER_STRATEGIES.json) · [Asignador/auditor](versions/2.1.0/character-strategy.mjs). Siete de las diez escenas requieren personas; no inventar NPC en las otras tres.
- [Contrato visual/rig/motion/behavior independiente](versions/2.1.0/CHARACTER_COMPONENT.schema.json).
- [Flujo para corregir el flujo](versions/2.1.0/FLOW_REPAIR_PROTOCOL.md) · [Código y propuestas causales](versions/2.1.0/flow-repair.mjs).
- [QA de grafo](versions/2.1.0/flow-audit.mjs) · [traza versionada](versions/2.1.0/validate-trace.mjs).
- [Herramientas investigadas, no presuntamente instaladas](versions/2.1.0/TOOLCHAIN_ROUTING.json).

**Cambios ACOTADOS a decisiones de personajes:** recovery, planning, acquisition, classification, humanoid, acting, qa, repair, persistence. Otros ocho procedimientos de 2.0 permanecen idénticos.

**Contrato no negociable:** producir el mejor primer intento completo, incluso con defectos; nunca cancelar por QA artística ni engañar sobre fuentes/render/Android. El usuario aprueba arte después de verlo. No escribir ramas de otros trabajos ni modificar sus briefs.

**Importante:** los diez trabajos Ola 002 fueron fijados a 2.0.0. Publicar el método 2.1 NO los relanza ni los cambia retroactivamente.

Madurez: flujo y software probado al nivel de fuente; diez nuevos personajes y QA visual/GPU todavía NOT_RUN. El objetivo de personajes «10 veces mejores» es aspiracional y necesita ensayos reales.
