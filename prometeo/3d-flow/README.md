# PROMETEO · Estudio 3D · Flujo actual 1.4.0

**El usuario NO debería escribir prompts técnicos nuevos por escena.** Escribe un brief corto en lenguaje humano, lo congela por ID/SHA y el flujo lo convierte internamente en plan de producción. La misma entrada se ejecuta bajo distintas versiones del método; los errores corrigen EL FLUJO, no el brief.

- Fuente: `FLOW_INDEX.json` → `versions/1.4.0/flow.json`, SHA `267130c29bacef26ed2e41ba855b5f20166300a73d8cffef82d36b051f44ca7d`.
- Contrato: [METHOD_CONTRACT.md](versions/1.4.0/METHOD_CONTRACT.md).
- Prueba de calidad transferible: [QUALITY_TRANSFER.json](versions/1.4.0/QUALITY_TRANSFER.json) (Arcade, Cruce, Ascensor, Ventilador, Entrevista, Submarino, con limitaciones).
- Problemas de Ola 001: [USER_REVIEW_WAVE001.json](versions/1.4.0/USER_REVIEW_WAVE001.json).
- Registro por las 17 etapas: [STAGE_TRACE.schema.json](versions/1.4.0/STAGE_TRACE.schema.json) + [validate-trace.mjs](versions/1.4.0/validate-trace.mjs).
- Inspección de boot móvil: [browser-check.mjs](versions/1.4.0/browser-check.mjs), [WEB_RUNTIME_CONTRACT.md](versions/1.4.0/WEB_RUNTIME_CONTRACT.md).
- Benchmarks humanos: [BENCHMARK_BRIEFS.v1.json](versions/1.4.0/BENCHMARK_BRIEFS.v1.json) (candidatos aún no aprobados como originales).

**Contrato de ejecución intacto:** producción completa siempre, incluso con defectos; un primer artículo o falta de WebGL no termina la obra. No revisar artísticamente en ese mismo turno. Publicar preview candidata honesta y conservar fuente.

**Estado:** flujo publicado, pruebas de código/estructura; comportamiento artístico en una nueva tanda = NOT_RUN.

Esquemas para ejecutar el **mismo brief** con diferentes flujos: [HUMAN_BRIEF.schema.json](versions/1.4.0/HUMAN_BRIEF.schema.json) y [COMPILED_PLAN.schema.json](versions/1.4.0/COMPILED_PLAN.schema.json).
