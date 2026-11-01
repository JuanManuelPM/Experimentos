# Universal UI · Revisión de observador · 2026-11-01

**Rama candidata:** `universal-ui/v0` · **Producción:** sin cambios.

## Hallazgo reproducible (FAIL original)

En Chromium local, con los tres fixtures `test/fixtures/{chatgpt,whatsapp,wikipedia}.html`, se cargaron los mismos `extension/core/*.js` y adaptadores que usa la extensión. Tras `engine.apply(settings)`, `engine.start()` y **una única inserción** DOM externa, el contador `onReport` alcanzó **12** informes en ~550 ms para cada app con `debounceMs: 50`.

**Causa:** el observador escuchaba todos los cambios `childList`. `apply()` reescribía `#uui-style.textContent`, lo que generaba otra mutación observada. La cadena podía seguir indefinidamente y consumir CPU sin cambios reales de la aplicación.

## Corrección aplicada

- Se filtran las mutaciones cuyo objetivo es la hoja propia `#uui-style` y las inserciones/remociones de esa hoja.
- No se filtran cambios externos del DOM.
- El observador ahora examina ciertos atributos estructurales (por ejemplo `data-testid`, `aria-label`, `class`, `id` y `data-theme`). No escucha `data-uui-hide`, que modifica el propio motor, ni estilos en línea, que también modifica.
- El control de contraste, los adaptadores, la persistencia, los elementos esenciales y la configuración global no se modificaron.

## Evidencia después de reparar (PASS local)

| Aplicación / caso | Antes | Después |
|---|---:|---:|
| ChatGPT · una inserción externa | 12 informes | 3 informes |
| WhatsApp · una inserción externa | 12 informes | 3 informes |
| Wikipedia · una inserción externa | 12 informes | 3 informes |
| ChatGPT · cambio **solo** de `data-testid` | No se reevalúa | Fallback de Share detectado |
| Restaura marcas `data-uui-hide` | Sí | Sí |

**Interpretación del contador 3:** aplicación inicial, **una reaplicación** legítima por el cambio externo y consulta explícita del informe al final. Las mediciones fueron hechas con Playwright/Chromium y fixtures sintéticos, no con páginas reales.

## Pruebas incorporadas

Se añadieron dos casos a `test/engine.test.mjs`:
1. `observador no se realimenta al escribir su propia hoja de estilos`
2. `observador detecta cambios de selector por atributo sin nueva inserción DOM`

Hay **34 pruebas escritas** (32 originales + 2). `node --check` de los archivos tocados y `npm run build:demo`: **PASS**. El comando `npm test`: **NOT_RUN completo** porque `jsdom` no se pudo instalar (`ERR_MODULE_NOT_FOUND`, `npm ci` agotó el tiempo).

## Límites y próxima acción

- Firefox real: **NOT_RUN** (no hay Firefox instalado en esta máquina).
- ChatGPT real: **NOT_RUN**, la navegación desde Chromium local devuelve `ERR_BLOCKED_BY_ADMINISTRATOR`.
- WhatsApp real: **NOT_RUN**.
- No se generó una extensión firmada ni se pidió instalar un complemento candidato.
- Siguiente paso: ejecutar `npm ci && npm test` en CI con dependencias instalables; después calibrar adaptadores y comprobar permisos y reversión en Firefox real. Nunca afirmar que los selectores actuales están calibrados sin inspeccionarlos.

**Prohibido migrar al usuario de `userstyles/` antes de aceptación y pruebas reales.**
