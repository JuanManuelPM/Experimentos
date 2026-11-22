# LUPA · RECIBO DE PRODUCCIÓN / EVIDENCIA

**Identidad:** `web-w002-20261122-10` · brief SHA `cd88a07941ab62072f6de5ee69764308f1ec2387` · QBAR-1 / DEEP-SPEC-1.

## Estado observado

El artefacto de interfaz y el runner Node están **IMPLEMENTADOS EN CÓDIGO**. Un spike independiente con **Chromium real vía Python Playwright** capturó seis PNG originales (dos versiones de fixture HTML en 320×700, 768×700 y 1440×700). Un cómputo NumPy de `max(|ΔR|,|ΔG|,|ΔB|)>32` detectó diferencias no nulas en tres viewports. **No se ejecutó en este ambiente el CLI Node `capture.mjs`; no se debe confundir la prueba de capacidad de Chromium con un end-to-end de ese script.**

| Viewport CSS | Cambiados | Total | Porcentaje | SHA-256 A (12) | SHA-256 B (12) |
|---|---:|---:|---:|---|---|
| 320×700 | 7517 | 224000 | 3.3558% | `1d5ec0331c3b` | `8983e41857f4` |
| 768×700 | 19172 | 537600 | 3.5662% | `be1908f852da` | `08283b870212` |
| 1440×700 | 38064 | 1008000 | 3.7762% | `8817a3f315a4` | `92a2dcafc52e` |

SHA completos y condiciones de prueba en [QA_BROWSER_SPIKE.json](QA_BROWSER_SPIKE.json). El navegador del entorno denegó navegación directa a `file://` (observado `ERR_BLOCKED_BY_ADMINISTRATOR`), pero permitió `set_content` y `screenshot` de las mismas fuentes HTML legítimas.

## Calidad: referencia → intención → decisión → artefacto → brecha

- **Playwright:** control explícito de viewport, motion y archivos de captura → `capture.mjs` y PNG genuinos de Chromium en spike → **CLI Node aún NOT_RUN**.
- **BackstopJS:** referencia y prueba separadas → pares A/B con dimensiones estrictamente iguales → **falta integración reproducible de CI y confirmación de navegador en publicación**.
- **Pixelmatch:** comparación de píxeles calibrable → mapa RGB propio con criterio documentado → **no equivalente a percepción humana, ni robusto contra todas las variaciones de raster**.
- **Chromatic:** histórico con revisión → IndexedDB, importación y cotejo de manifiesto, descargas → **persistencia tras reload y tacto aún NOT_RUN**.

## Pruebas pendientes o no realizadas

- Navegador real sobre la app publicada: estados vacío/error, subir archivos, cortina, mezcla, cambios, side by side, 320/768/1440, teclado, touch, reduced-motion.
- Node: `npm install`, `node capture.mjs` sobre fixtures originales y readback de los manifiestos/PNG.
- Historial IndexedDB después de recarga, incluyendo error de cuota, y manifiesto importado con hash alterado.
- Disponibilidad HTTP de GitHub Pages; un commit de GitHub no equivale a carga pública exitosa.

**Aprobación humana: NO.** No se atribuye excelencia estética por autoevaluación ni se informan métricas de carga/Lighthouse sin medición.

## Aprendizaje transferible

1. **capture / bloqueo file URL / prueba con setContent / propietario web:** contar una captura de navegador como tal solo cuando existen bytes PNG y SHA, no por presencia del HTML.
2. **provenance / cargas no prueban URL / hash y manifiesto opcional / propietario web:** mostrar `UNVERIFIED_UPLOAD` si no hay evidencia cruzada. Contraejemplo: etiquetar toda imagen arrastrada como captura verificada.
3. **comparison / dimensiones distintas / bloquear el diff y mostrar tamaños / propietario web:** nunca fabricar correspondencia escalando capturas diferentes.

**Criterio de cierre:** artefacto observable y código leído tras escritura; no confundir con `HUMAN_APPROVED`.

## Verificación HTTP externa posterior a publicación

Un fetch externo de la portada respondió **HTTP 503** y el de `fixtures/a.html` respondió **HTTP 404**, a pesar del readback correcto de los 10 archivos en `gh-pages`. Por lo tanto, **disponibilidad pública NO VERIFICADA**; no atribuir estos códigos a un bug de la interfaz sin una prueba de navegador/hosting adicional. El servicio de navegador interactivo conectado no pudo ejecutar la prueba (sin créditos). Se mantienen `browserInteraction=NOT_RUN` y `humanApproved=false`.
