# Changelog de producción 3D

## 2.1.0 · 2026-11-20 · CURRENT_CANDIDATE
- 280 nodos, 370 aristas, 17 etapas y 12 subflujos con 11 nodos para decisión temprana de personajes y reparación del flujo.
- Seis auditorías de decisiones sobre Ola 002: por qué eligieron CesiumMan, pasajeros de formas, GLB de morfología repetida y mallas loft pese a la calidad deficiente.
- Registradas cinco familias de visuales rechazos/uso restringido, **cero** personajes aprobados. Movimiento de Cruce clasificado sólo como PARTIAL_POSITIVE.
- Sistema de estrategia visual separado de rig, animación y comportamiento; 10 pipelines experimentales distintos, 7 asignaciones a escenas con personajes y 3 alternativas sin necesidad de introducir NPC en escenas que no lo requieren.
- `flow-repair.mjs`: síntesis causal por etapa, control de trazas genéricas, parche acotado a nueva versión, prohibición de modificar brief humano/otros sectores.
- Reusar Character Flow V3, Character Motion Factory A/B/C/D y fuentes oficiales. No inventar herramientas instaladas.
- QA por componente y permitir publicación íntegra con defecto visible; aprobación humana y segundo consumidor sólo para promoción real.
- No se relanzó Ola 002 ni se modificaron los diez encargos fijados al flujo 2.0.
- Personajes de calidad comercial todavía **NO PRODUCIDOS NI APROBADOS** con este método.

# Evolución del método 3D

## 2.0.0 · 2026-11-20 · CURRENT_CANDIDATE
- 269 nodos / 359 aristas / 17 etapas / 10 subflujos, operaciones profundas por etapa en lugar de duplicación textual.
- Compilador de briefs mínimos y cobertura completa; catálogo de diez proyectos, pero briefs todavía NO congelados.
- Calidad por componente: Arcade héroe/pantalla vs mal ambiente/cámara; Cruce actor/HUD vs calle/cámara, Ascensor luces; prohibición de copiar buenos y malos de una escena indiscriminadamente.
- Toolchain real y licencias, 12 interfaces extensibles + selección que nunca inventa herramientas conectadas; validador de assets con comprobantes de bytes/uso.
- WebGL2 moderno (no falso WebGL1 en Three r163+), boot por fases, errores separados, fallback honesto, context loss.
- Cobertura real de escena vs faltantes **sin autocensura artística**, QA por componente, traza y aprendizaje post-entrega.
- Contrato y tests de integración; resultados visuales nuevos **NOT_RUN**.

# Changelog del flujo de producción 3D

## 1.4.0 · 2026-11-20 · CURRENT_CANDIDATE
- BR0: conservar brief humano literal, fijo entre versiones; BR1: la IA genera la planificación desde el flujo.
- QL0: catalogar patrones estéticos/implementativos de Arcade (favorito), Cruce (favorito), Ascensor (bueno), Ventilador (mecánica) y críticos de Entrevista y Submarino.
- WEB0: detectar empaquetado web frágil, ruta única gzip/Blob y errores mezclados como «WebGL», registrar compatibilidad y fallback honesto.
- TR0: traza factual compacta de cada una de las 17 etapas para identificar dónde se originan errores y sintetizar patrones entre proyectos.
- 262 nodos, 352 conexiones, 17 etapas, 9 subflujos. Producción completa y no cancelación heredadas de 1.3.
- Los diez briefs propuestos son CANDIDATOS, no falsos «prompts originales» de Ola 001.

## 1.3.0 · 2026-11-20 · IMMUTABLE
- Producción completa sin veto artístico o canario como producto.

## 1.2.0 · 2026-11-20 · IMMUTABLE
- Prevención inicial pero con error de detención por primer artículo.

## 1.1.0 · 2026-11-19 · IMMUTABLE
- Diez gates de QA final.

## 1.0.0 · 2026-11-19 · IMMUTABLE
- Primera versión del flujo universal.
