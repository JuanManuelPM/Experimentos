# ESCENA ABIERTA · W002 / WEB 09 · Recibo de producción y evaluación

**Identidad:** `room=web` · `batchId=web-w002-20261122` · `taskNumber=9` · `taskId=web-w002-20261122-09`.

**Producto:** festival cultural ficticio original con tres jornadas de marzo de 2027, 24 encuentros, 3 escenarios, 4 disciplinas. Interfaz tipográfica responsive, fotografías de ambiente licenciadas, descripción editorial y fichas con enlaces directos. Motor puro reutilizable de programa, agenda y conflictos. Archivo iCalendar exportable. No representa un festival real ni vende entradas.

**Fuente publicada (readback 7/7 idéntico):** [index.html](index.html), [estilos](style.css), [app](app.mjs), [datos](data.mjs), [motor de agenda](festival-core.mjs), [README](README.md), [tests](tests.mjs). Rama dueña [candidate/prometeo-web-w002-09-20261122](https://github.com/JuanManuelPM/Experimentos/tree/candidate/prometeo-web-w002-09-20261122/prometeo/web-w002-09-escena-abierta) con preproducción.

**URL de destino:** https://juanmanuelpm.github.io/Experimentos/prometeo/web-w002-09-escena-abierta/

## QA realizada

| Comprobación | Estado | Oráculo |
|---|---|---|
| Fuente Github publicada | **OBSERVED PASS** | Lectura gh-pages posterior, siete SHA coinciden con rama |
| Integridad de programa | **OBSERVED PASS** | 24 eventos, 8 por día, IDs únicos, duraciones positivas |
| Colisiones de horarios | **OBSERVED PASS** | V8, intervalo estricto, extremos contiguos, solape entre medianoches |
| Filtros combinados | **OBSERVED PASS** | V8, disciplina + escenario + jornada + búsqueda con acentos |
| Persistencia y bloqueo de almacenamiento | **OBSERVED PASS** | V8, memoria simulada, recuperación, degradación temporal |
| Exportación .ics | **OBSERVED PASS** | V8, DTSTART UTC correcto, 2 VEVENT |
| Sintaxis JS de interfaz | **OBSERVED PASS** | Análisis de `app.mjs` con compilación V8 sin ejecutar DOM |
| DEEP-SPEC-1 estructural | **OBSERVED PASS** | Validador canónico ejecutado sobre la ficha real en V8: READY_FOR_FIRST_SLICE |
| Node `tests.mjs` como proceso | **NOT_RUN** | No se ejecutó Node contra copia local |
| Navegador real, clic, táctil, teclado | **NOT_RUN** | Firecrawl interact no disponible por límite de créditos |
| Capturas reales 320/768/1440, tipografía/render | **NOT_RUN** | No hay capturas; no se simulan |
| GitHub Pages HTTP final | **NOT_VERIFIED** | La comprobación externa aún no accede al destino; GitHub Pages deployment pendiente al publicar |
| Aprobación humana / equivalencia artística profesional | **NOT_RUN** | No atribuible a autoverificación |

## Referencias → intención → decisión → artefacto → brecha

| Referencia real examinada | Intención y decisión original | Evidencia del artefacto | Brecha |
|---|---|---|---|
| [Sónar 2026 / SonarApp](https://sonar.es/en/practical-info/sonarapp) | Filtrar programa por día, escenario, disciplina, hora, término | Datos 24 eventos + controles implementados, motor filtrado V8 PASS | Interacción DOM y movilidad NO verificadas |
| [Unsound](https://www.unsound.pl/en/about) / [Bergen Assembly 2025](https://2025.bergenassembly.no/en) | Identidad cultural editorial con fichas completas, no landing genérica | HTML y contenido de 24 actividades + estilos y fotos acreditadas | Criterio visual externo aún pendiente |
| [Space Grotesk](https://fontsource.org/fonts/space-grotesk/about) | Ritmo tipográfico variable y semántica accesible | CSS usa familia wght 300..700, tamaños adaptables y reduced motion | Carga/render de fuente no observados |
| [Unsplash License](https://unsplash.com/license) | Fotografías legítimas sin hacer pasar personas reales por artistas ficticios | Cinco fuentes fotográficas con crédito individual y aviso de ficción | Carga CDN real no probada |
| Intervalos temporales | Agenda que no oculte actuaciones simultáneas | `findClashes`, `createAgenda`, `toICS` evaluados directamente: PASS | UX perceptual y .ics importado en calendario no ensayados |

## Aprendizaje transferible

1. **Escena cultural ≠ afiche vacío.** Gate editorial: cada foto tiene fuente, función narrativa y crédito; prueba: los artistas inventados jamás se atribuyen como personas fotografiadas. Dueño: Web. Contraejemplo: retrato de persona real rotulado como acto ficticio.
2. **Agenda ≠ favoritos sin horario.** Gate lógico: intervalos con duración, zona y extremo estricto, más prueba nocturna. Dueño: Web. Contraejemplo: eventos contiguos señalados erróneamente como conflicto.
3. **Commit ≠ publicación visual comprobada.** Gate de QA: readback de código, URL Pages y navegador se observan por separado. Dueño: Web/ROOT. Contraejemplo: sitio que existe en GitHub pero Pages devuelve 404 o sigue pendiente.

**Estado declarado:** `IMPLEMENTED_SOURCE_VERIFIED · QBAR_REFERENCES_OBSERVED_TEXT · DEEP_SPEC_READY · LOGIC_PASS · BROWSER_NOT_RUN · HUMAN_APPROVED_NO`. No se promueve ningún flujo privado. Sin cron ni seguimiento automático.
