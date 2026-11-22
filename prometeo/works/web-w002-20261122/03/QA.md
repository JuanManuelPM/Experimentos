# ARCHIVO ABIERTO · evidencia y evaluación · 2026-11-22

## Origen y referencias realmente examinadas

- **Rijksmuseum Collection Online:** https://www.rijksmuseum.nl/en/about-collection-online · `OBSERVED_TEXT`. La página describe comparador, acercamiento al detalle, piezas e información contextual. **Decisión:** metadatos visibles durante el zoom y enlaces de ficha, sin reproducir su estética.
- **Art Institute of Chicago API:** https://api.artic.edu/docs/ · `OBSERVED_TECH_DOCS`. Se observó separación entre registros de obras y API de imágenes IIIF, y avisos de restricciones de derechos. **Decisión:** inventario propio, procedencia por pieza y arte visual original.
- **OpenSeadragon:** https://openseadragon.github.io/ · `OBSERVED_TECH_DOCS`. Se observaron las capacidades de zoom/pan, fuentes de imágenes y acceso por teclado. **Decisión:** módulo independiente con zoom a 1/1.5/2.5/4/6 y pan, sin dependencia externa.

## Matriz de verificación

| Comprobación | Estado | Evidencia y límite |
| --- | --- | --- |
| 8 fichas y búsqueda/filtros | OBSERVED_LOCAL | Chromium local: 8 tarjetas; filtro Papel = 2, restauración = 8. |
| 3000 × 3800 SVG nativos | OBSERVED_LOCAL | Chromium: se desplazó hasta cada tarjeta; 8/8 imágenes terminaron cargadas con `naturalWidth=3000`, `naturalHeight=3800`. |
| Diálogo detalle, cierre Esc y zoom | OBSERVED_LOCAL | 320/768/1440 px: apertura de primera ficha, zoom botón a 150%, Escape cierra, navegación a segunda ficha. |
| Ausencia de desbordamiento horizontal | OBSERVED_LOCAL | 320/768/1440 px: `documentElement.scrollWidth <= innerWidth`. |
| Exploración visual | OBSERVED_LOCAL | Render Chromium con fuentes del sistema porque el navegador de test tiene bloqueado acceso a Google Fonts. La composición fue inspeccionada, no calificada por humano. |
| URLs profundas / History real | NOT_RUN | El entorno bloquea navegar por HTTP/file; el harness usa `about:blank`, donde `history.pushState` falla por origen nulo. Código de URL implantado, prueba en origen real pendiente. |
| Pinch multitáctil y accesibilidad con lector de pantalla | NOT_RUN | Eventos implementados; falta ensayo con dispositivos reales. |
| `prefers-reduced-motion` | IMPLEMENTED_NOT_RUN | CSS disponible; falta corrida automatizada específica. |
| Acceso HTTP al dominio GitHub Pages | NOT_RUN | Código leído de `gh-pages` tras escritura; herramienta pública de navegación no pudo abrir tampoco el portal ROOT existente. No convertir readback GitHub en comprobación HTTP. |
| Aprobación artística externa | NOT_RUN | No hay revisión humana ni certificado de excelencia. |

## Brecha perceptual frente a benchmarks

**Referente → intención → decisión → artefacto observado → brecha:**
- Rijksmuseum: lectura de detalle con contexto → ficha + imagen → diálogo lateral y zoom → **observado localmente** → resta inspección de navegación pública y más variedad narrativa en cada obra.
- Art Institute: documentación y procedencia → esquema uniforme por obra → ocho fichas y política de ficción explícita → **observado en fuente/local** → no hay historial de conservación real porque el proyecto es ficticio.
- OpenSeadragon: navegación profunda → visor propio con gestos y teclado → controles + módulo reusable → **implementado y zoom observado** → falta prueba táctil de pinch y gran imagen raster genuina; las piezas producidas son vectoriales.

**Límite artístico importante:** las ocho obras son originales y escalables, pero comparten una técnica algorítmica de contornos/orgánicos y el mismo generador. Su variedad y sofisticación no han sido certificadas frente a un portfolio artístico excepcional. No sustituir esta brecha por el tamaño nominal de SVG.

## Aprendizaje preventivo

- `stage=PRODUCTION`; `cause=uniformidad de algoritmo entre piezas`; `preventive_gate=auditar tres lenguajes visuales realmente distintos`; `test=comparación ciega de series a escala real`; `owner=web-design`; `counterexample=misma forma irregular recoloreada ocho veces`.
- `stage=QA`; `cause=test en about:blank no valida History API`; `preventive_gate=habilitar navegador de origen real antes de VERIFIED`; `test=apertura directa y Back/Forward en Pages`; `owner=web-design`; `counterexample=declarar deep link verificado tras revisar solo un modal`.
- `stage=DELIVERY`; `cause=Pages y GitHub contents son oráculos diferentes`; `preventive_gate=lectura HTTP más readback`; `test=GET de index y módulos publicados`; `owner=ROOT/web`; `counterexample=commit en gh-pages presentado como despliegue ya observable`.

**Estados:** IMPLEMENTED, OBSERVED_LOCAL para pruebas explícitas, NOT_RUN para HTTP/gestos/accesibilidad/human-review. Nunca HUMAN_APPROVED.
