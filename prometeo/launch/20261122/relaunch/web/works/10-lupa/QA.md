# LUPA W003 / 10 · QA (evidencia real y límites)

**runAt UTC:** `2026-11-22T19:14:45.125101+00:00`. **batch:** `web-w003-20261122`, **task:** `web-w003-20261122-10`. **launch blob SHA:** `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`. **humanApproved:** `false`.

## Primer artículo / diferencia genuina

Chromium real (`/usr/bin/chromium`, Playwright Python), `page.set_content` de dos archivos HTML **originales autocontenidos**; screenshots `PNG` capturados con `page.screenshot`, `deviceScaleFactor=1`, `reducedMotion=reduce`, `animations=disabled`, `fullPage=false`. Comparación con Pillow: `max(|ΔR|, |ΔG|, |ΔB|) >32`. Estos son píxeles de un fixture, no puntuaciones perceptuales o Lighthouse.

| Viewport | Diferentes | Diferencia | SHA256 A (16) | SHA256 B (16) |
|---|---:|---:|---|---|
| 390×900 | 8,712 | 2.4821% | `0ac120c581369c68` | `ee5d5777cbc7d3e2` |
| 1440×900 | 21,802 | 1.6823% | `4f764e0d67741d04` | `974519c5e5a43750` |

**Primer intento falló:** `page.goto(http://127.0.0.1:port)` devolvió `net::ERR_BLOCKED_BY_ADMINISTRATOR`. No se repite ese método ni se representa como exitoso. Segunda técnica: `page.set_content` sobre HTML propio, screenshot real; `capture.py --a-html ... --b-html ...` se ejecutó con retorno 0. El manifiesto marca `sourceType=self-contained-html`, no pretende prueba de URL HTTP. Las imágenes y manifiesto genuinos se publican en `evidence/` si el commit los contiene.

## E2E en navegador local (código inyectado con set_content)

- **390×780 y 1440×900:** captura real de la apertura de LUPA, ancho de documento sin overflow. Primera pantalla editorial observada y captura guardada en `evidence/app-empty-390.png`, `evidence/app-empty-1440.png`.
- En ambos viewports: inicio vacío y botón disabled, subir imágenes PNG legítimas, bloqueo explícito por 390/1440 incompatibles, carga del par compatible, `8712` y `21802` píxeles coinciden con el runner, 4 modos, flechas izquierda/derecha, salida JSON y descarga PNG. Chromium no registró excepciones JS.
- **IndexedDB tras recarga: NOT_RUN.** La navegación a una URL HTTP (y a `file://` o `data:`) está bloqueada por política administrativa. `about:blank` tiene origen opaco, no apto para ese E2E.
- **Manifest HASH_MATCH: NOT_RUN.** `crypto.subtle` no está disponible en origen opaco: se observó correctamente `MANIFIESTO NO COINCIDE`; por eso no se afirma prueba de verificación.
- **Public GitHub Pages / acceso HTTP desde móvil: NOT_RUN.** El commit en rama candidata prueba SOURCE_READBACK, no hosting.
- **HUMAN_APPROVED: NO**; validadores estructurales no evalúan calidad estética y su salida debe estar separada de QA.

## Criterios pendientes de aceptación

1. Ejecutar `capture.py` en un navegador con navegación permitida sobre un sitio de prueba autorizado, cotejar URLs y hashes.
2. Servir la app en `localhost` en un navegador sin bloqueo, subir muestras, guardar, recargar, restaurar y verificar HASH_MATCH.
3. Auditar captura pública real y comportamiento táctil Android. No afirmar que el código tiene UX sobresaliente sin ese examen.

## Comparación W002 → W003

- W002: screenshots de fixtures generados con Python, **Node CLI y navegador app NOT_RUN**, sin carga pública comprobada; ver [recibo anterior](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/web/releases/w002-10-lupa/RECEIPT.md).
- W003: **runner Python reproducible ejecutado** sobre fixtures autónomos, hashes y pixel diff; interfaz real inspeccionada localmente con 390/1440 y exportación observada, persiste brecha de origen seguro/IndexedDB/Page.
- Diferencia estratégica: se eligió motor ejecutable en herramientas existentes y se corrigió el bloqueo de navegación sin simular URL; se concentra en seguridad semántica de evidencias.
- No es prueba de superioridad artística frente al anterior. Sin criterio humano, la calidad editorial permanece no aprobada.