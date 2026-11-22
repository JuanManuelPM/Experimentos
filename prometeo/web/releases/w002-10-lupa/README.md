# LUPA · Web W002 · 10

**Una herramienta real para comparar capturas auténticas de dos versiones de una página.** No genera ni simula screenshots en el cliente. Opera 100% localmente con PNG/JPG/WEBP que el usuario aporta, o PNG generados por el runner autorizado.

- Aplicación: \`https://juanmanuelpm.github.io/Experimentos/prometeo/web/releases/w002-10-lupa/\`
- Código fuente: \`JuanManuelPM/Experimentos@gh-pages:prometeo/web/releases/w002-10-lupa/\`
- Identidad: \`batchId=web-w002-20261122\`, \`taskId=web-w002-20261122-10\`.
- Brief fuente SHA: \`cd88a07941ab62072f6de5ee69764308f1ec2387\`. QBAR-1 / DEEP-SPEC-1.

## Flujo de uso

1. Abrí la web. Importá **A / ANTES** y **B / DESPUÉS** mediante los dos selectores o arrastrando PNG, JPG o WEBP.
2. El inspector exige dimensiones idénticas. No interpola screenshots diferentes para fabricar correspondencias.
3. Cambiá entre **Cortina A/B**, **Mezcla**, **Cambios** (mapa de píxeles en naranja) y **A | B**. Arrastrá sobre la cortina, usá el rango con teclado o ajustá el umbral RGB.
4. Guardá la comparación. IndexedDB conserva los blobs originales y permite abrir o borrar entradas aun después de recargar.
5. Descargá imágenes A y B, PNG del mapa de cambios y el JSON de evidencia. La evidencia guarda SHA-256, tamaño real, umbral, píxeles distintos y procedencia, **sin** atribuir calidad perceptual o rendimiento no medidos.

El navegador **no puede** capturar una página externa cross-origin por medio de un iframe o canvas. Por eso LUPA usa un runner de Chromium aparte. Los archivos no se envían a ningún servidor desde la UI.

## Capturador reutilizable: \`capture.mjs\`

Requiere Node.js >= 20 y npm. En esta carpeta:

\`\`\`bash
npm install
npx playwright install chromium

# Capturas genuinas de fixtures HTML originales sin red
npm run capture -- --a-html fixtures/a.html --b-html fixtures/b.html --viewports 320x700,768x700,1440x700 --out captures

# Capturar solamente sitios propios/autorizados, con host explícito
LUPA_ALLOW_HOSTS=mi-sitio.example npm run capture -- \
  --a-url https://mi-sitio.example/version-anterior \
  --b-url https://mi-sitio.example/version-nueva \
  --viewports 320x700,768x700,1440x700 --out captures
\`\`\`

Para usar una instalación de Chromium disponible localmente: \`LUPA_CHROMIUM_PATH=/usr/bin/chromium npm run capture -- ...\`.

El runner usa Chromium con DPR 1, escala CSS, captura del viewport, animaciones desactivadas, caret oculto, motion reducido, \`UTC\` y \`es-AR\`; espera fuentes e imágenes cuando es posible y restringe solicitudes de red a hosts incluidos en la allowlist. No elimina todos los factores de variación de plataformas/fontes. Para un baseline de producción se recomienda fijar versión de navegador, OS, fuentes y contenido dinámico en CI.

Por cada viewport, crea \`A.png\`, \`B.png\`, \`diff.png\` y \`manifest.json\`. El JSON incluye SHA-256 de los PNG, procedencia declarada de los HTML/URLs, dimensiones CSS, condiciones de captura y delta RGB exacto. Importá A, B y opcionalmente \`manifest.json\` al visor. El visor coteja hashes y viewport, pero **no puede certificar de forma independiente** que la URL indicada, el permiso de captura o los datos de procedencia sean reales.

## Motor reutilizable

\`app.js\` implementa el motor de análisis RGB + persistencia IndexedDB; \`capture.mjs\` implementa la captura Playwright y el diff PNG sin servicio de terceros. La semántica de ambos motores es la misma: un píxel cambió cuando \`max(abs(Ra-Rb),abs(Ga-Gb),abs(Ba-Bb)) > threshold\`, con \`threshold=32\` por defecto. Canal alfa ignorado; no son métricas perceptuales, WCAG ni scores de Lighthouse.

Los cambios de texto, antialias, fuentes, disposición y escala pueden afectar el porcentaje. No se aprueba automáticamente una regresión según un número. El historial existe únicamente en el dispositivo y origen web del usuario; no es un registro central ni una auditoría inmutable.

## Alcance de pruebas y pendientes

- **Observado localmente:** Chromium real (mediante Python Playwright) renderizó los HTML de prueba en tres viewports, generando seis PNG con hashes SHA-256 y máscaras de píxeles distintas. Evidencia reproducible documentada en \`RECEIPT.md\`.
- **No ejecutado en la sesión inicial:** \`npm install\` / \`node capture.mjs\` (paquete Node Playwright no disponible localmente sin acceso a npm); el runner es código entregado que requiere una ejecución en un entorno Node equipado.
- **QA de UI pendiente de oráculo real:** visor publicado, tacto, teclado, IndexedDB tras recargar, 320/768/1440 px deben probarse en navegador de la publicación. Validar en producción antes de etiquetar \`VERIFIED\`.
- **Licencias:** código/fixtures originales; nunca capturar sitios de terceros sin permiso ni reutilizar archivos sin licencia.

## Referencias estudiadas y decisiones

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots): comparar snapshots bajo condiciones estables, no confiar en equivalencia casual.
- [Playwright page.screenshot](https://playwright.dev/docs/api/class-page): PNG real, viewport y animaciones desactivadas; no hay API de captura cross-origin de clientes web.
- [BackstopJS](https://github.com/garris/BackstopJS): escenarios de referencia/test y condiciones comparables.
- [Pixelmatch](https://github.com/mapbox/pixelmatch): documentación de diferencia pixel por pixel y manejo de anti-alias, inspiración técnica, no dependencia ni copia.
- [Chromatic Playwright](https://www.chromatic.com/docs/playwright/): revisión de diffs con baselines e interacción, no servicio obligatorio.

Se entregan preproducción \`PREPRODUCTION.deep-spec-v1.json\`, motor, fixtures, artefacto público y recibo. \`HUMAN_APPROVED\` y equivalencia con referentes profesionales no se declaran.
