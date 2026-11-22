# RECEIPT · Web W001 / 10 · ATLAS
- **ID:** `web-w001-20261122-10`
- **Room:** `web` | **batchId:** `web-w001-20261122` | **taskNumber:** `10`
- **Brief:** interfaz para comparar versiones de una obra creativa con dos vistas y cambio funcional.
- **Estado:** `DELIVERED_CODE / LOGIC_TESTED / BROWSER_QA_NOT_RUN / PUBLIC_URL_NOT_VERIFIED`.
- **Salida:** `index.html` HTML, CSS, JS y SVG inline; `SMOKE_TEST.cjs`, `README.md`.
- **Preview prevista:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/web/w001/10/
- **Fuente:** `JuanManuelPM/pruebas@candidate/prometeo-web-w001-10-20261122:prometeo/previews/web/w001/10/`.
- **Publicación:** `JuanManuelPM/Experimentos@gh-pages:prometeo/previews/web/w001/10/`.
- **Flow fijado:** `prometeo.web.production-flow.v2`, `version 2.0.0`, blob `02f7b6161b50cd5bc6b342b84c969aaa36bac90a`, `SPEC_ONLY`.

## Evidencia realizada
1. Fuente existente en `gh-pages` leída por API; código de interfaz y cuatro SVG distintos inspeccionados.
2. Script inline parseado sin error en motor V8.
3. Smoke con DOM simulado **PASS 7/7** en ejecución interactiva: estado inicial, selector B, modo Cortina, slider/URL, intercambio A/B, retorno a paralelo, sincronización del segundo selector.
4. Corrección aplicada y guardada: `split=0` ya no vuelve a 50 % al cargar; foco de teclado visual en la cortina.
5. Script de pruebas reproducible agregado; no se ejecutó en Node/Chromium real contra el HTML publicado desde la infraestructura disponible.
6. Readback GitHub de archivos y commits pendiente de completar al cierre; no declarar nivel `BROWSER_VERIFIED` ni `PUBLIC_VERIFIED` por una URL o por un archivo HTML.

## Pendiente de verificación
- Abrir de verdad el sitio público y probar 320, 390, 768 y 1440 px, en especial el arrastre táctil y tabulación.
- Capturas de pantalla y revisión visual real. Sin acceso HTTP desde contenedor local; navegador remoto de Firecrawl sin créditos en esta sesión.
- Validación de Pages y revisión humana. No se generan capturas sintéticas.

## Alcance y licencia
Contenido ficticio y SVG originales dentro de esta aplicación; sin material privado, peticiones de red ni telemetría. La obra y su código no modifican el flujo Web, el canon ni otras obras. Componente potencial, no promoción a ROOT.
