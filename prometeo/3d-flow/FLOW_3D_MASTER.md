# PROMETEO · Flujo actual 3D 2.0.0

**Fuente única de versión:** [FLOW_INDEX.json](FLOW_INDEX.json) → [flow.json](versions/2.0.0/flow.json). **SHA:** `27c96cac84056dd8b1f2a952cdb8f0f2f7f8136ef322280f34f510f24c239682`.

## Importante para cualquier nueva IA

El usuario escribe el mismo brief humano breve para distintas versiones de flujo. No optimizar el prompt individual: el método compila el plan, investiga herramientas y recursos existentes y produce la escena completa en una primera pasada, con el mejor intento posible. Una escena fea o incompleta **se muestra igual** y se etiqueta con sus faltantes reales; ninguna prueba D39/D40/D41/D42/QA autoriza ocultar o terminar trabajo antes de entregar el intento.

Hay **269 nodos y 17 etapas**, pero las instrucciones técnicas están centralizadas en **[STAGE_OPERATIONS.json](versions/2.0.0/STAGE_OPERATIONS.json)**: cada nodo apunta a un procedimiento por `procedureRef`. Para detalles ver el **[METHOD.md](versions/2.0.0/METHOD.md)**; no releer cientos de nodos duplicando texto.

Nuevas capacidades: [scene-compiler.mjs](versions/2.0.0/scene-compiler.mjs), [COMPONENT_REFERENCE_MATRIX.json](versions/2.0.0/COMPONENT_REFERENCE_MATRIX.json), [TOOLCHAIN_ROUTING.json](versions/2.0.0/TOOLCHAIN_ROUTING.json), [ADAPTER_INTERFACES.json](versions/2.0.0/ADAPTER_INTERFACES.json), [browser-boot.mjs](versions/2.0.0/browser-boot.mjs), [flow-audit.mjs](versions/2.0.0/flow-audit.mjs), [BENCHMARK_PROTOCOL.md](versions/2.0.0/BENCHMARK_PROTOCOL.md).

Arquitectura modular y privada del Estudio 3D. **No** modificar otros proyectos ni coordinar chats globales. Los briefs de los diez proyectos permanecen como candidatos, no como textos aprobados. Las versiones históricas 1.0–1.4 permanecen inmutables.

**QA de software ≠ evaluación artística.** Navegador Android real y diez nuevas escenas todavía NOT_RUN.
