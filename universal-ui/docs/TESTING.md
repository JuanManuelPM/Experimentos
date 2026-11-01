# Pruebas

`npm test` · 34 pruebas declaradas (32 originales + 2 regresiones) · `node:test` + jsdom. Cargan los mismos archivos que la extensión (`core/`, `adapters/`) dentro de páginas sintéticas (`test/fixtures/`).

Las páginas sintéticas reproducen la estructura de selectores, no son capturas de los sitios: no contienen conversaciones, mensajes ni contactos.

## Cobertura

| Área | Prueba |
|---|---|
| Contrato | los tres adaptadores son válidos; uno mal formado se rechaza con motivos |
| Herencia | Global → App → Componente → Excepción, con origen; `clearValue` vuelve a heredar; el global nunca cambia |
| Niveles | un control rechaza niveles y valores no admitidos |
| Aislamiento | lo particular de ChatGPT no cambia WhatsApp ni el global (configuración y DOM) |
| Modo y excepciones | Minimal oculta; la excepción prevalece y sobrevive a cambios de modo |
| Restauración | `revertAll()` y *Restaurar todo* devuelven un `outerHTML` idéntico; pausar una app conserva la configuración |
| Tiempo real | un cambio en el almacenamiento se aplica al DOM; elementos añadidos después (SPA) se procesan solos |
| Verificación | regla anulada por el sitio → *Error* y reversión; *No encontrado* para selectores supuestos |
| Esenciales | un contenedor con la conversación no se oculta (*Incompatible*) |
| Tema | aplicado y verificado; modo claro → *Incompatible*; contraste bajo → *Error* y reversión |
| Cambios del sitio | botón renombrado → *selector alternativo* registrado; eliminado → *desaparecido*; ancla perdida → app incompatible sin cambios |
| Acciones | clic sobre control nativo; control de envío bloqueado |
| Privacidad | ninguna lectura de `textContent`, `innerHTML`, `innerText`, `value` |
| Perfiles | guardar, aplicar, conservar excepciones, exportar/importar con validación |
| Reutilización | copiar ChatGPT → WhatsApp solo copia lo que WhatsApp entiende |
| Tercera app | Wikipedia con el mismo motor; adaptador nuevo en 20 líneas; el núcleo no menciona apps; manifiesto y panel coinciden |

## Comprobación visual

`npm run build:demo` y abrir `demo/index.html`: panel real + motor real sobre las tres páginas sintéticas. Se verificó con Playwright (Chromium): tema común Café aplicado en ChatGPT y WhatsApp, Minimal solo en ChatGPT, *Marca* y *Avisos* de WhatsApp como *No encontrado*, sin errores de consola.

## Qué no se prueba todavía

- Los sitios reales (ver STATE.md, paso 1).
- Firefox real: permisos, `scripting.executeScript`, cierre del panel al pedir permiso.
- Rendimiento del observador en conversaciones muy largas.

## Regresión del observador · 2026-11-01

- Antes del arreglo: tras una sola inserción DOM externa se observaron **12 informes en ~550 ms** en cada fixture (ChatGPT, WhatsApp y Wikipedia); se realimentaba por escritura en `#uui-style`.
- Después: **3 informes** en ~550 ms, incluyendo aplicación inicial, una actualización por cambio externo y consulta explícita. Restauración completa de `data-uui-hide`.
- Una mutación **solo de `data-testid`**, sin insertar nodos, dispara reevaluación: el botón Compartir pasa del selector principal al alternativo y registra `selector alternativo`.
- Esta comprobación se hizo con **Chromium y fixtures sintéticos**. NO equivale a comprobar Firefox real ni los sitios públicos.
- **Suite `npm test`: NO EJECUTADA como prueba completa aquí** porque `npm ci` quedó bloqueado y falta `jsdom/index.js`; el número 34 describe casos escritos, no PASS.
