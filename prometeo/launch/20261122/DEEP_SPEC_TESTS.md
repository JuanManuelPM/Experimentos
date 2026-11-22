# DEEP-SPEC-1 · resultado de calibración lógica · 2026-11-22

## Alcance y estado de evidencia

- **Propuesta de calibración del método**, sin ejecutar encargos ni retocar obras; 3D W5, Web W001, Música W001, Video W001, Imágenes W001 mantienen briefs y SHA.
- Validador: `prometeo/launch/deep-spec-v1.mjs`; pruebas `deep-spec-v1.test.mjs`.
- **28 comprobaciones lógicas PASSED** ejecutadas in-memory a partir de lectura remota del validador y test versionados en GitHub, con la misma semántica que Node. No hubo ejecución local Node desde el runtime público ni test de Actions.
- **QA visual/sonora/interactiva de obras: NOT_RUN.** Tampoco se afirma que la estructura demuestra calidad, que un trabajador real completó una ficha ni que las cinco herramientas de render están disponibles. El gate es trazabilidad, no criterio humano.

## Comparación contra etapa anterior

Antes, QBAR-1 requería referencias y criterio de calidad pero no exigía vínculos verificables entre pregunta → prueba → elección → partes del producto → prevención. Después, DEEP-SPEC-1 identifica estos vínculos y clasifica riesgos altos; las variantes siguientes son **simulaciones de preproducción**, no ejecuciones.

| Caso del brief existente | Pregunta y relación que antes podía omitirse | Decisión propuesta por la nueva etapa | Defecto anticipado | Prueba perceptual pendiente |
|---|---|---|---|---|
| 3D W5/01 Cocina Umbría | Trayecto cámara/muro/actor; material y sombra de contacto | Oclusión selectiva + elección de roughness/material según fuente | El muro tapa actor o texturas parecen artificiales | Orbit/pinch y screenshots reales |
| Web W001/01 portada editorial | Jerarquía de tapa a 320px + navegación por teclado y reduced-motion | Tipografía fluida y alternativa sin animación | Bello a 1440px, ilegible o inaccesible en móvil | Navegador y teclado en dispositivos |
| Música W001/02 FÁBRICA VACÍA | Diálogo de swing/ghost notes entre batería y bajo | Dos patrones rítmicos comparables, A/B auditivo | Loop repetitivo sin groove ni desarrollo | WAV/escucha real y comparación |
| Video W001/07 microhistoria | Eje de acción y tiempo/sonido entre planos | Bloquear eje antes del segundo plano y montar corte motivado | Planos aislados bonitos sin continuidad | MP4/WebM completo y sonido |
| Imágenes W001/02 interior | Horizonte, fuga y proporciones de muebles/personas | Retícula y guías de escala antes de detallar | Objetos con perspectivas incompatibles | Raster inspeccionado frontal y detalle |

**Fuentes técnicas originales examinadas para elaborar los casos (no equivalen a benchmarks artísticos):**
- 3D: https://www.khronos.org/gltf/pbr (material metálico-rugoso, roughness y oclusión ambiental).
- Web: https://web.dev/learn/design/accessibility (prefers-reduced-motion y estructura semántica).
- Música: https://www.ableton.com/en/manual/using-grooves/ (timing/velocity y parámetros de groove).
- Video: https://docs.blender.org/manual/en/latest/video_editing/ (secuenciador audiovisual y sincronización).
- Imágenes: https://helpx.adobe.com/illustrator/desktop/manage-objects/reshape-transform-objects/draw-and-modify-objects-on-perspective-grid.html (relaciones perspectívicas).

**Pruebas automáticas:** 5 medios × 5 verificaciones (caso válido o SPIKE_REQUIRED según riesgo, sin relación, fuente no observada, decisión desconectada, pregunta sin objetivo) = 25. + bloqueo por spike fallido, desbloqueo con spike registrado, medio nuevo con el mismo validador = 28. **No hay test causal de calidad**, y las fuentes técnicas no sustituyen una selección de 3–5 obras profesionales para cada nuevo WORK.

## Aceptación, pendientes y rollback

- Los cinco lanzadores apuntan a **un único** DEEP_SPEC.md y deep-spec-v1.mjs. QBAR-1 y UNIVERSAL introducen el gate sin tocar brief ni herramienta específica.
- En preproducción real: consultar referencias artísticas del encargo, completar ficha genuina, correr validador en entorno de obra, probar spikes altos, observar perceptualmente la obra y diferenciar progreso de aprobación. Todo eso permanece **NOT_RUN** para las cinco producciones de esta calibración.
- **No hay sincronización automática del plugin privado de CALIBRAR/ONE-SHOTTING** con GitHub; el cambio en sus skills instaladas es pendiente explícito.
- Rollback: revertir commits de DEEP-SPEC-1 en rama pública y su enlace desde el contrato privado, preservando SHA/versiones anteriores. No editar ejecuciones históricas.
- Próxima etapa humana exclusivamente: **elevar las diez consignas de cada estudio**; no crearlas ni ejecutarlas por efecto de esta calibración.
