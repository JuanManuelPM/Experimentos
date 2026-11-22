# ESCENA ABIERTA · Festival cultural ficticio · Web W002 / 09

**Estado:** implementación en revisión, sin aprobación humana. Sitio de demostración: no es un festival real ni procesa entradas, reservas o cobros.

**Identidad:** `room=web`, `batchId=web-w002-20261122`, `taskNumber=9`, `taskId=web-w002-20261122-09`. Brief inmutable: [LAUNCH.md](../launch/20261122/next/web/LAUNCH.md), SHA de blob `cd88a07941ab62072f6de5ee69764308f1ec2387`. QBAR-1 y DEEP-SPEC-1.

## Entregables de producto

- `index.html`: publicación editorial original, cinco fotografías documentadas de contexto y jerarquía variable `Space Grotesk wght 300..700`.
- `style.css`: diseño editorial responsive, control de teclado y alternativa sin movimientos (`prefers-reduced-motion`).
- `data.mjs`: 24 eventos y tres espacios ficticios, tres días con hora y duración explícitas.
- `festival-core.mjs`: **motor reutilizable sin dependencias** para filtrado Unicode, intervalos, detección de choques, agenda persistente tolerante a error y exportación iCalendar.
- `app.mjs`: controles por día, espacio, disciplina, tramo horario y palabra; fichas de evento con rutas `#evento/slug`, diálogo accesible, favorito, conflicto, agenda y .ics.
- `tests.mjs`: pruebas reproducibles de invariantes sobre datos, selección, persistencia, tiempo y export.
- `PREPRODUCTION.deep-spec-v1.json`: decisiones y trazabilidad de investigación previas a construcción, en rama dueña.

## Referencias realmente examinadas (texto/documentación, no copia visual)

1. [Sónar 2026, guía de app](https://sonar.es/en/practical-info/sonarapp): programa por día/escenario/hora/artista y favoritos; se eligieron filtros combinados que no requieren gestos.
2. [Unsound, About](https://www.unsound.pl/en/about): una edición cultural sostenida por tema y programación interdisciplinaria, no un collage arbitrario.
3. [Bergen Assembly 2025](https://2025.bergenassembly.no/en): densidad y contexto curatorial, que justifican fichas extensas.
4. [Space Grotesk](https://fontsource.org/fonts/space-grotesk/about): familia variable con SIL OFL 1.1, usada por peso editorial.
5. [Unsplash License](https://unsplash.com/license): fotografías gratuitas autorizadas, créditos originales listados en el pie. Las fotos son **de ambiente** y NO muestran artistas inventados.

## Pruebas y límites

Ejecutar `node tests.mjs` en esta carpeta para pruebas de datos y motor. Para navegador, probar con servidor HTTP que sirva ES Modules: cargar 320 / 768 / 1440 px; tocar botones y selects, tabular y usar Escape; elegir dos sesiones simultáneas; abrir enlace directo `#evento/brote-electrico`; recargar y verificar persistencia; exportar .ics; emular reduced motion.

**Riesgos honestos:** los archivos de fotos y la fuente usan CDN externos y necesitan red; la web conserva estructura y contenido si esos archivos no cargan. Si localStorage está bloqueado, la agenda funciona solo durante la visita y lo indica. No se certifica WCAG, calidad artística profesional ni aprobación humana sin evaluación independiente.

## Aprendizaje al método

- `stage=preproduction; cause=usar imágenes reales como falsos retratos; preventive_gate=verificar licencias y representación editorial; test=créditos y disclaimer por ficha; owner=web; counterexample=concierto de un artista real rotulado como persona ficticia`.
- `stage=modelo temporal; cause=comparar horas de inicio, no intervalos; preventive_gate=intervalos en epoch con duración y zona; test=choque cruzando medianoche y extremos contiguos; owner=web; counterexample=22:45–00:20 vs 00:00–01:00`.
- `stage=verificación; cause=confundir documento con ejecución; preventive_gate=separar tests Node, navegador y revisión humana; test=readback remoto y QA de interacción; owner=web; counterexample=declarar éxito visual con HTML sin cargar`.
