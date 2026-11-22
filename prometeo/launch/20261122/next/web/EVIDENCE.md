> **Nota de auditoría ROOT:** esta evidencia fue registrada cuando la tanda aún esperaba revisión. Su estado PREPARED_PENDING_ROOT_REVIEW es histórico. El lanzador público `LAUNCH.md` se encuentra habilitado para empezar trabajos numerados manualmente; calidad final y producción todavía NO están demostradas. La aprobación del método estructural no sustituye QA de obra.

# PROMETEO · WEB W002 · Evidencia de diseño, capacidad y límites

**Alcance:** solo diseño de tanda, no ejecución de los diez encargos. **Fecha de consulta:** 2026-11-22. **Estado documental:** `10/10 PREPARED`. **Calidad artística final:** `NOT_RUN`. **Aprobación ROOT:** `PENDING`.

## Decisión de diseño antes de elegir encargos

La W001 histórica mezcla diez proyectos funcionales más modestos, válidos como línea de base. Esta nueva W002 no los corrige ni los renombra: cambia deliberadamente el techo de exigencia, combinando excelencia editorial, arte y experiencia web con capacidades productivas reutilizables. Se descarta la estrategia «un template de landing + diez paletas», diez demos visuales sin interacción, un juego 3D camuflado, sustitutos de fotos por formas simples, métricas no obtenidas y editores cuyo botón Exportar no produce archivos autónomos.

### Matriz obligatoria de diez avances diferentes

| N | Capacidad diferenciadora | Referencia pertinente observada | Artefacto ambicioso y componente reutilizable | Atajo mediocre que invalida | Prueba perceptual y técnica exigible en WORK |
|---|---|---|---|---|---|
| 01 | Dirección editorial temporal: relato, imagen, ritmo del scroll, rutas de lectura | The Pudding, ensayos visuales | Reportaje multimodal + secuenciador editorial por capítulos | Fondo parallax vacío o slides sin material legítimo | Scroll avance/retroceso sin salto, correspondencia narración/media, lectura móvil y reduced-motion |
| 02 | Lenguaje de marca integral que atraviesa todos los puntos de contacto | Dropbox Brand Guidelines | Marca ficticia y web propia + sistema de identidad aplicable | Hero con círculos decorativos y textos genéricos | Auditoría portada/producto/navegación/móvil, consistencia tipográfica, imágenes y copy |
| 03 | Obras genuinas en detalle profundo con metadatos y accesibilidad | Art Institute of Chicago, API/IIIF | Portfolio/archivo + visor de imágenes por niveles | Galería de thumbnails irreales o zoom CSS de raster diminuto | Imagen de alta resolución observada, zoom/pan, filtros y teclado, metadatos/procedencia visibles |
| 04 | Fuente variable manipulable + cinética tipográfica de alta dirección | Exat, Studio Size y Hot Type | Micrositio de fuente ficticia + motor de especímenes variables | Tipografía genérica agrandada y animación repetitiva | Cambios reales en ejes y glifos, entrada libre, mobile, teclas, reduced-motion |
| 05 | Narración de producto integrada a configuración y transacción coherente | Apple Store, compra de iPhone | Lanzamiento de objeto original + configurador/carrito | Mockup estático con carrito o pagos ficticios | Opciones ↔ fotos ↔ totales coherentes; reabrir/persistir carrito; demo claramente rotulada |
| 06 | Ética y expresividad de visualización con datos públicos trazables | Reuters Graphics / The Pudding | Ensayo de calor urbano + stepper/annotations/chart reusable | Gráfico de datos inventados presentado como noticia | Reconciliación de números con CSV/API, unidades, incertidumbre y versión textual accesible |
| 07 | Arquitectura editorial escalable, accesible y sin monotonía visual | GOV.UK Design System (sistema, no benchmark estético) + The Pudding (publicación) | Revista con formatos contrastados + sistema semántico/editorial | Diez tarjetas iguales presentadas como revista | Varios artículos con layouts distintos, búsqueda, deep links, contrastes, teclado y 320 px |
| 08 | Authoring sin código con serialización y export verificable | Webflow Interactions (capacidad), no código a copiar | Editor de scroll + esquema/renderer/exportador HTML estático | Editor de utilería con preview no exportable | Construir dentro del editor → guardar → exportar → abrir fuera; paridad contenido/interacción |
| 09 | Identidad cultural variable y agenda orientada a decisiones | Sónar, programación y formatos de asistencia | Festival ficticio + calendario, filtros y agenda persistente | Afiche bonito con botones sin destinos | Conflictos horarios, filtros combinados, navegación directa, persistencia y tacto |
| 10 | Prueba de diferencias visuales con fuentes auténticas y estados reproducibles | Playwright Visual Comparisons + Chromatic (herramientas, no estándar artístico) | Comparador A/B + capturador/historial de snapshots y diffs | Dos cajas CSS iguales presentadas como diff real | Capturas rastreables, swipe/overlay, escenarios de error, mediciones solo con runner real |

La matriz ofrece **diez capacidades principales no redundantes**. La estética sigue subordinada al contenido: 01 no es 06, 02 no es 05, 03 no es 04, 07 no es 08 y 09 no es 10. Las técnicas pueden compartirse, pero los productos tienen modelos de interacción y oráculos diferentes.

## Referencias públicas consultadas y observaciones concretas

**Tipo de inspección:** recuperación del contenido HTML/textual público y documentación original mediante búsqueda y apertura de páginas el 2026-11-22. NO hubo recorrido humano/automatizado de píxeles, captura de pantalla, uso interactivo de cada sitio ni auditoría de rendimiento de estas referencias. No atribuirles calidad técnica que no se haya medido.

### Referentes de dirección artística, narrativa y producto

1. **The Pudding**, https://pudding.cool/ : portada viva de ensayos visuales, con búsqueda y clasificación por «Your Input», video, audio y temas; entradas de octubre/noviembre de 2026 visibles. Aporta la idea de ensayos interactivos vinculados al contenido, no copiar sus visuales. N 01, 06, 07. `OBSERVED_TEXT`.
2. **Dropbox Brand Guidelines**, https://brand.dropbox.com/ : identidad descrita como sistema articulado de framework, voz, logo, tipografía, iconografía, color, imagery y motion. Aporta la noción de sistema de marca completo y coherencia transversal, no permiso de uso de marca. N 02. `OBSERVED_TEXT`.
3. **Art Institute of Chicago API/IIIF**, https://aggregator-data.artic.edu/docs/ : documentación original de objetos de colección, imágenes IIIF, tamaños, manifiestos y copyright. Es referente de capacidad documental y de imagen por niveles, NO permiso para usar cualquier imagen sin revisar derechos. N 03. `OBSERVED_TECH_DOCS`.
4. **Studio Size / Exat**, https://studio-size.com/work/exat/ y https://hottype.co/fonts/exat : el estudio documenta motion, micrositio y exploración tipográfica para una familia concreta; Hot Type detalla fuente y licencias. La [ficha Red Dot de Studio Size](https://www.red-dot.org/siegerprofile/studio-size/2026) identifica reconocimiento 2026 del sitio Exat; reconocimiento no prueba igualdad estética. N 04. `OBSERVED_TEXT`.
5. **Apple Store · Buy iPhone**, https://www.apple.com/shop/buy-iphone : menú de modelos con comparación, entrada a detalle y compra; ejemplo para conectar narrativa, elección y acción. Sin copiar sus imágenes, marca ni flujo exacto. N 05. `OBSERVED_TEXT`.
6. **Reuters Graphics**, https://reutersagency.com/content/content-types/graphics/ y https://github.com/reuters-graphics/ : documentación de trabajo interactivo y repositorios del equipo. El artículo recopilatorio en Reuters sobre gráficas 2025 devolvió acceso restringido; NO se afirma su inspección visual. N 06. `OBSERVED_DESCRIPTION`.
7. **Sónar · 2026**, https://sonar.es/en/sonar-2026-novedades : información programática con sedes, escenarios, opciones de entradas y distintas experiencias del festival, fuente de preguntas UX sobre horarios y contenidos. La web no es licencia de fotografía/branding. N 09. `OBSERVED_TEXT`.

### Referencias de arquitectura, interacciones, export y pruebas

8. **GOV.UK Design System**, https://design-system.service.gov.uk/ : componentes, patrones, estilo y accesibilidad documentados; es referente funcional y de rigor, no estética que debamos imitar. N 07. `OBSERVED_TECH_DOCS`.
9. **Webflow Interactions con GSAP**, https://webflow.com/feature/interactions-animations y https://help.webflow.com/hc/en-us/articles/46300264646803-Interactions-with-GSAP-vs-Classic-Interactions : define editor visual de interacciones, triggers y timeline. La [documentación de exportación](https://help.webflow.com/hc/en-us/articles/33961386739347-How-do-I-export-my-Webflow-site-code) explica condiciones y límites; sirve para diseñar pruebas de autonomía de export sin suponer un servicio de pago disponible. N 08. `OBSERVED_TECH_DOCS`.
10. **Playwright Visual Comparisons**, https://playwright.dev/docs/test-snapshots : test `toHaveScreenshot()` y comparación de capturas de navegador. N 10. `OBSERVED_TECH_DOCS`.
11. **Chromatic para Playwright**, https://www.chromatic.com/docs/playwright/ : integración de snapshots tras recorridos funcionales, con revisión de diferencias. Servicio externo opcional, no dependencia obligatoria ni disponible por defecto. N 10. `OBSERVED_TECH_DOCS`.
12. **WCAG 2.2**, https://www.w3.org/TR/WCAG22/ y https://www.w3.org/WAI/WCAG22/Techniques/css/C39 : navegación, alternativas y control del movimiento; criterios para todos los N, no una declaración anticipada de conformidad. `OBSERVED_TECH_DOCS`.

**Alcance de la investigación:** amplio para elegir la tanda; no reemplaza 3–5 referentes **específicos de cada futuro N**, que deberán examinarse durante DEEP-SPEC según herramientas realmente disponibles. Si el entorno futuro no puede recuperar un referente, registrar `ENVIRONMENT_LIMIT` en lugar de inventar observaciones.

## Identidades, método y estado de capacidad en repositorios

| Objeto | Fuente leída realmente | SHA de archivo observado | Conclusión |
|---|---|---|---|
| Contrato compartido | `pruebas@prometeo/control:sistemas/metodo/CONTRATO_COMPARTIDO.md` | `8fa6052db2ee8c76984153dfd7771ac0550b0053` | Integra `Q-LOOP`, `QBAR-1`, `DEEP-SPEC-1` |
| QUALITY BAR | `Experimentos@gh-pages:prometeo/launch/QUALITY_BAR.md` | `5653704d3267c339fe7405f2b36b8488dbb44be9` | Exige referencias y rechazo de atajos |
| Universal | `Experimentos@gh-pages:prometeo/launch/20261122/UNIVERSAL.md` | `7e0c3219d31f9b1cc67bfec7dc6c3c05e00f2120` | Referencia la implementación DEEP-SPEC |
| DEEP_SPEC | `Experimentos@gh-pages:prometeo/launch/DEEP_SPEC.md` | `84f3f6ef8f7dd1cf39de630f2bf50bec352a3ee2` | Adaptador Web, ficha, gates |
| Validador | `Experimentos@gh-pages:prometeo/launch/deep-spec-v1.mjs` | `0536af26982d50dfc3c3689aca2677751bdee1fe` | Implementación de validación estructural existente |
| Pruebas método | `Experimentos@gh-pages:prometeo/launch/20261122/DEEP_SPEC_TESTS.md` | `197e94c47e9b3e002702a7196f8d47a75a5f2c53` | Declara **28 tests lógicos in-memory PASSED**, ejecución Node/Actions `NOT_RUN` |
| Estudio Web | `pruebas@prometeo/control:PROMETEO/spaces/web-design/PROJECT.md` | `a9bd113ecfcfe2acc9474ca5458623473831cce5` | Migración histórica pendiente |
| Entrada WEB_FACTORY | `pruebas@candidate/prometeo-web-factory-engine-v2-20261117:.../WEB_FACTORY_ENTRYPOINT.md` | `6e0784d1edbd9e69c54ff6c422b8f16d025ac44b` | Explica contrato V2: etapas, preguntas y límites; motor general `NOT_BUILT` al corte observado |
| Flujo especializado | `pruebas@candidate/prometeo-web-factory-workflow-v2-20261117:.../workflows/WEB_FACTORY_V2/FLOW.json` | `02f7b6161b50cd5bc6b342b84c969aaa36bac90a` | `version 2.0.0`, `SPEC_ONLY`. No afirmar browser/arte profesional verificados |
| Web W001 original | `Experimentos@gh-pages:prometeo/launch/20261122/web/LAUNCH.md` | `a803245911bbee2eaf5570c1939380ba1304535b` | Preservación inmutable y comparación histórica |
| ROOT index | `Experimentos@gh-pages:prometeo/root/BATCHES.json` | `5d1414698b4a7d0a954982e47ef5b647f31bb39d` | Contiene `web-w001-20261122`, no W002; no modificado |

**Estado del gate:** `VERIFIED_WIRING_LOGIC_ONLY`: fuente, adaptador, validador y enlace desde lanzadores existentes comprobados por lectura, con registro de tests lógicos previo. **No equivale** a probar el validador dentro de un WORK de W002, ni a probar navegador/audio/video, ni a sincronizar plugins privados. Estos quedan `NOT_RUN`/pendientes. La tanda W002 está `PREPARED_PENDING_ROOT_REVIEW`, **no** `READY_TO_LAUNCH`.

## Capacidades disponibles, candidatas y no demostradas

- **Verificado en la sesión de diseño:** lectura de fuente GitHub, permisos de escritura sobre repo `Experimentos`, investigación documental de fuentes públicas, existencia e integración documental/estructural del contrato DEEP-SPEC. Los diez prompts se prepararon; no se ejecutó ninguno.
- **Disponibles como estándares/alternativas, no infraestructura PROMETEO verificada:** HTML/CSS/JS, recursos abiertos con licencia revisable, IIIF, Playwright, componentes accesibles, datos públicos, librerías de scroll/tipografía. Requieren comprobación y selección independiente para cada obra.
- **Pendientes de probar:** capacidad de obtener/generar foto/video con calidad y derechos, navegador QA del runner futuro, exportador de webs, pipelines de capturas, fuentes variables concretas, compra simulada, motor completo Web Factory y calidad artística. No usar un texto de flujo como si fuera un servicio ejecutado.
- **Pruebas futuras de producción:** 320/768/1440 CSS px, lectura y navegación por teclado/tacto, estado de carga/error, reduced-motion, integridad media/licencias, screenshot real, tareas P0 de cada N, evaluación perceptual independiente. La exigencia de accesibilidad es objetivo y necesita evaluación, no certificación.

## Condiciones para revisión ROOT y rollback

1. Releer `LAUNCH.md` y este `EVIDENCE.md` en la misma rama candidata; comprobar que el índice 1..10 es único, existe un enlace común y que la W001 en `gh-pages` no cambió.
2. Integrador ROOT debe revisar los cinco estudios, readiness de DEEP-SPEC en ejecución real, colisiones de ramas/IDs, límites de herramientas y eventual promoción. El candidato solo autoriza **revisión**, no lanzamiento autónomo.
3. Si la evaluación rechaza la tanda, descartar o modificar **esta rama candidata**; nunca reescribir W001, el método común, resultados previos ni `BATCHES.json` para simular continuidad.

**Recibo documental:** LAUNCH/EVIDENCE candidatos solamente; estados `PREPARED`, `WORKS_NOT_STARTED`, `ART_QA_NOT_RUN`, `ROOT_APPROVAL_PENDING`.
