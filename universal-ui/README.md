# Universal UI

Una sola extensión de Firefox, un solo botón en la barra del navegador, para personalizar varias aplicaciones web con cambios **reversibles y verificados**. Empieza con ChatGPT y WhatsApp Web; Wikipedia es el ejemplo de tercera app.

> Trabajo aislado en la rama `universal-ui/v0`. No toca `userstyles/` (la versión funcional actual sigue en `master` y se actualiza sola desde ahí).

## Qué resuelve

El personalizador anterior (`userstyles/chatgpt-live.user.js` v1.3.0) mostraba interruptores que cambiaban de estado sin producir efecto, porque el estado venía del interruptor y no de la página. Aquí el estado viene del DOM: cada cambio se aplica sobre elementos encontrados y se comprueba en el estilo computado. Ver [docs/DIAGNOSIS.md](docs/DIAGNOSIS.md).

Estados de cada control: **Disponible · Aplicado · No encontrado · Incompatible · Error**.

## Estructura

```
extension/
  manifest.json          MV3 · Firefox ≥115 · Alt+Shift+U abre el panel
  core/                  núcleo universal: no menciona ninguna app (lo comprueba un test)
    status.js            estados
    themes.js            sistema visual: tokens y temas
    schema.js            controles universales y herencia
    store.js             persistencia, perfiles, import/export, reutilización entre apps
    adapter.js           contrato y registro de adaptadores
    engine.js            aplicación, verificación, restauración, detección de cambios del sitio
  adapters/              una descripción por app (chatgpt, whatsapp, wikipedia)
  content/content.js     arranque en las páginas permitidas
  popup/                 el panel: Aplicaciones · Personalización · Perfiles
test/                    34 casos escritos (node:test + jsdom) y páginas sintéticas
demo/index.html          demo funcional: panel y motor reales sobre páginas sintéticas
design/                  copia versionada del canvas de diseño (.dc.html)
docs/                    arquitectura, decisiones, pruebas, estado
```

## Uso

```bash
npm install
npm test               # 34 casos escritos; requiere jsdom instalado
npm run build:demo     # regenera demo/index.html (abrir en el navegador)
```

Probar la extensión en Firefox: `about:debugging` → *Este Firefox* → *Cargar complemento temporal* → `extension/manifest.json`. Al abrir el panel en ChatGPT o WhatsApp Web, pulsar **Permitir en este sitio**: la extensión no actúa en ningún sitio sin ese permiso.

## Documentación

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — responsabilidades, herencia, flujo, contrato
- [docs/ADDING_AN_APP.md](docs/ADDING_AN_APP.md) — incorporar una app nueva
- [docs/DECISIONS.md](docs/DECISIONS.md) — registro de decisiones y limitaciones
- [docs/TESTING.md](docs/TESTING.md) — qué se prueba y qué no
- [docs/STATE.md](docs/STATE.md) — estado actual y cómo continuar

> **Verificación de esta revisión (2026-11-01):** dos nuevas regresiones para evitar bucles del observador y detectar cambios por atributos. Chromium con fixtures PASS; la suite Node/jsdom está pendiente por dependencia faltante. Véase [docs/OBSERVER_REPAIR_2026-11-01.md](docs/OBSERVER_REPAIR_2026-11-01.md).
