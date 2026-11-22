# MAPA DEL CALOR · W003 / 06 · QA y recibo honesto

**Identidad:** `web-w003-20261122-06` · `taskNumber=6` · `room=web` · LAUNCH blob `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`. Fecha: 2026-11-22. **HUMAN_APPROVED=NO**.

## Entrega realizada

Ensayo periodístico responsive original «El calor de los años», con página `index.html`, componentes ES reutilizables `components.js`, orquestación `app.js`, primera representación independiente `first-article.html` y gráfico estático `first-article.svg`. La página incluye capítulo anual, umbral de máximas diarias ≥35 °C, proxy de mínimas ≥24 °C, visualización por ciudad, línea anual, comparación de décadas, 75 registros en tabla y export CSV. No se interpolan mapas espaciales de isla urbana.

La escala de color del protagonista se alimenta de la **misma serie verificable** que la tabla y los gráficos: media de máximas diarias 2001–2025, tres localidades. La versión W002 usó datos idénticos, pero su página anterior no fue modificada.

## Evidencia de esta ejecución

| Gate | Resultado | Qué demuestra y qué no |
|---|---|---|
| Brief y flujo fijados | **OBSERVED** | LAUNCH SHA `bef87bf...`, flujo candidato WEB_FACTORY_V2 versión 2.0.0, blob `1a0e709b...`. El flujo privado **no fue promovido**. |
| Contrato DEEP-SPEC + first article | **BOOK_PUBLISHED** | Ficha antes de construir; primer artículo fuente real disponible. Validador oficial no ejecutado: `DEEP_SPEC_GATE_NOT_RUN`, `ART_DIRECTION_GATE=FIRST_ARTICLE_REQUIRED` mientras no exista captura visual. |
| Dataset heredado | **SOURCE_MATCH_PASS** | `data.json` W003 tiene idéntico blob Git al W002: `b7ab02af9855453b101f0c48ff600156bc2ccaab`. |
| Validación en sesión | **OBSERVED / PARTIAL** | Parse del JSON, 3 ciudades × 25 registros, 9.131 días por ciudad y cálculo independiente de medias de décadas desde las 75 filas anuales; números en `REPRODUCE.md`. |
| Días originales desde API | **NOT_RUN EN W003** | La entrega previa W002 reporta contraste de 75 agregados contra 27.393 datos diarios. Se entrega `node verify.mjs --remote`, pero no se ejecutó aquí. |
| Gráfico original de primer artículo | **SOURCE_CREATED** | El SVG se construyó desde `data.json` con 75 marcas (<rect>) y valores propios, no screenshot ficticio. El archivo HTML también ejecuta un control por año, pero no está certificado perceptualmente. |
| Source readback gh-pages | **PASS 9/9** | Las nueve rutas existentes en gh-pages se releyeron con blobs iguales a la rama candidata, sin tocar W002. |
| HTTP GitHub Pages | **FAIL / 404** | El chequeo remoto del sitio `/prometeo/works/web-w003-20261122/06/` devolvió 404 tras publicarse el código. No declarar URL navegable. |
| Capturas y uso en navegador | **NOT_RUN** | El navegador remoto interactivo estaba saturado (límite de trabajos concurrentes). No hubo capturas 320/390/768/1440 ni prueba táctil/teclado/end-to-end de la obra. |
| JS `node --check` y script `verify.mjs` | **NOT_RUN** | Los archivos y el verificador están disponibles; su existencia no acredita ejecución del test. |
| Aprobación humana y juicio artístico | **NO / NOT_RUN** | Pendiente evaluación visual externa real; ningún PASS técnico sustituye al criterio editorial. |

**Media anual de máximas (°C)** calculada en sesión desde `data.json`: Buenos Aires 20,453 → 21,053 (**+0,600**); Rosario 22,995 → 23,706 (**+0,711**); Córdoba 22,867 → 23,438 (**+0,571**). Comparación 2001–2010 frente a 2016–2025. No afirmar tendencia estadística, causalidad urbana ni intervalos de confianza que no fueron calculados.

## Pruebas de aceptación planeadas al principio, no inventadas al final

1. **Apertura 390/1440:** gráfica real visible, 75 marcas, tipografía legible, ningún `scrollWidth > innerWidth`, controles y datos con aria labels.
2. **Interacción exacta:** selector 2022/2025, cambio de ciudad/indicador, lectura de Rosario 2022 = **34 días ≥35 °C**; tabla y gráfico sincronizados.
3. **Integridad:** 25 filas por ciudad; el CSV de 75 filas y el tooltip usan exactamente los mismos registros sin redondeos contradictorios.
4. **Funcionamiento contextual:** reduced motion, navegación por teclado, carga de módulos/JSON sin error de consola y despliegue HTTP 200.

## Comparación W002 → W003

| Dimensión | W002 | W003 |
|---|---|---|
| Brief | Mismo contenido original | Mismo contenido original, nuevo ID |
| Base de datos | ERA5-Land, 75 agregados | **Exactamente el mismo blob**, para no atribuir diferencias a datos |
| Primera pantalla | Hero tipográfico y gráficos interiores | **75 marcas de temperatura reales en la primera pantalla** + año explorable |
| Estrategia de datos | Gráficos, SVG de coordenadas, tabla | Mosaico temporal sin mapa espacial insinuado, gráfico y CSV |
| QA visual | NOT_RUN según recibo W002 | **NOT_RUN**, no atribuir mejora observada |
| Deploy | HTTP 503/404 según recibo W002 | **HTTP 404 observado**, readback fuente PASS |
| Mejora demostrable | No se puede afirmar visual | Solo separación de datos/forma, arquitectura y artefactos publicados; comparación perceptual pendiente |

## Hallazgo transferible y rollback

**Causa W002 → gate W003:** confundir completitud de fuente con experiencia observada. **Prevención:** construir una primera representación de contenido real, probarla en 390/1440 antes de declararla lista y mantener `BROWSER_NOT_RUN` mientras la prueba no exista. **Owner:** WEB diseño/QA. **Contraejemplo:** una página puede contener un gráfico correcto y, sin embargo, devolver 404 o ser ilegible a 320 px.

**Rollback:** desindexar únicamente `web-w003-20261122-06` si se observa regresión. No borrar W002 ni cambiar los diez briefs ni promover el flujo candidato sin test real.

**Resultado:** SOURCE_GH_PAGES_READBACK_PASS · DATA_BASELINE_MATCH_PASS · FIRST_ARTICLE_SOURCE_PUBLISHED · BROWSER_QA_NOT_RUN · LIVE_HTTP_404 · HUMAN_APPROVED_NO.
