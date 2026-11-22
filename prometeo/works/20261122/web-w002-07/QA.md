# CONTRAPUNTO · Evidencia de QA y brechas

**WORK:** `web-w002-20261122-07`. **Estado local:** `IMPLEMENTED` + `OBSERVED_IN_BROWSER_DOM`. **Publicación HTTP:** por verificar de forma independiente tras push. **Calidad premiada:** `NOT_CLAIMED`; **evaluación humana:** `NOT_RUN`.

## Artefacto real

Ocho páginas HTML estáticas, seis publicaciones completas, tres WebP originales, un índice estructurado, sistema de tokens y dos componentes reutilizables (`filterArchive`, `createVisualTabs`). El contenido se puede leer sin JS. Entrevista y crónica están identificadas como ficción.

## Pruebas ejecutadas

- `python tools/check.py`: **PASS**, ocho HTML, seis artículos, rutas relativas y assets locales, landmarks, un H1 por página, IDs únicos.
- Chromium con Playwright (Python) en 320, 768 y 1440 px y `reduced_motion=reduce`: **PASS** para filtros, búsqueda de una coincidencia, dos resultados por filtro Ideas, limpiar, estado vacío y ausencia de scroll lateral. Se recorrieron los seis artículos a 320 px sin overflow.
- Tablist del especial visual: **PASS**, ArrowRight desde tab 2 selecciona tab 3 y sincroniza imagen, título y `aria-selected` en las tres anchuras.
- Incidencia **resuelta**: en primer test la regla `.archive-entry{display:grid}` se imponía al atributo `[hidden]`; se corrigió con `[hidden]{display:none!important}` y repitió la suite con éxito.
- Capturas reales: `contrapunto-home-320.png`, `contrapunto-home-1440.png`, `contrapunto-visual-768.png` (generadas desde Chromium con HTML/estilos inyectados en el DOM).

## Límite de prueba honesto

El navegador del contenedor respondió `ERR_BLOCKED_BY_ADMINISTRATOR` tanto al servidor en `127.0.0.1:8765` como a `file://`. La suite de Chromium usó `page.set_content` con HTML real, CSS real y JS real inyectados, además de imágenes locales convertidas en data URLs. **Por eso la suite demuestra interacción y composición, no navegación por HTTP del sitio publicado ni carga real de Google Fonts**. La prueba estática verifica la existencia de rutas y recursos. Falta prueba real de publicación pública y auditoría WCAG integral.

## Benchmark observado → intención → decisión → resultado → brecha

| Observado | Intención | Decisión | Evidencia | Brecha |
| --- | --- | --- | --- | --- |
| The Pudding: ensayos y narrativas de estructura variable (página textual) | No clonar una única plantilla | Seis géneros con CSS propio | Seis HTML y screenshots Chromium | Falta crítica visual independiente |
| It's Nice That: archivo de publicaciones y temas (página textual) | Archivo de navegación no monótono | Filtros combinados y búsquedas locales | Playwright 3 viewport PASS | Sin corpus grande ni paginación |
| A List Apart: lectura concentrada en estándares | Continuidad de lectura | HTML estático, semántica y enlaces | check.py PASS | No hubo test con lector de pantalla |
| GOV.UK Design System: patrones accesibles | Control por teclado | Tablist ARIA sin autoplay | Tab 2 → 3 PASS | Sin auditoría WCAG completa |

## Aprendizaje transferible

- **Stage:** CSS/interacción.
- **Cause:** `.archive-entry{display:grid}` anulaba por cascada el `hidden` nativo.
- **Preventive gate:** cada control de filtrado exige prueba de visibilidad computada, no solo revisar atributo.
- **Test:** `locator('[data-article]:visible').count()` a 320/768/1440.
- **Owner:** estudio Web.
- **Counterexample:** `hidden=true` en el DOM pero los seis artículos siguen visibles en pantalla.

**No se autodeclara `HUMAN_APPROVED`, WCAG conformant, ni calidad premiada.**