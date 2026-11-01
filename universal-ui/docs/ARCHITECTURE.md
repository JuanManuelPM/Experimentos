# Arquitectura

## Cinco responsabilidades, un motor

| Responsabilidad | Archivos | Conoce apps |
|---|---|---|
| Núcleo universal: configuración, herencia, perfiles, persistencia, permisos | `core/schema.js`, `core/store.js`, `manifest.json` | No |
| Sistema visual: temas y tokens | `core/themes.js` | No |
| Adaptadores: qué existe en cada app y cómo encontrarlo | `adapters/*.js` | Solo la suya |
| Acciones: accesos a funciones nativas | `adapter.actions` + `engine.runAction()` | Declaradas por el adaptador |
| Verificación: aplicar, comprobar, revertir, detectar cambios | `core/engine.js`, `core/status.js` | No |

Un adaptador es **datos**, no lógica: selectores candidatos, componentes, modos, puente de tema. Toda modificación de la página la hace `engine.js`, igual para todas las apps. No hay motores por app.

## Herencia

```
Global → Aplicación → Componente → Excepción del usuario
```

`schema.resolve(settings, appId, componentId, key, adapter)` devuelve `{ value, source }`. Cada capa sobrescribe a la anterior sin modificarla; `clearValue()` vuelve a heredar.

Cada control declara en qué niveles existe:

| Control | global | app | componente | excepción |
|---|---|---|---|---|
| theme, mode | ✓ | ✓ | | |
| font | ✓ | ✓ | ✓ | |
| fontScale, density, readingWidth, margin | ✓ | ✓ | ✓ | ✓ |
| show:&lt;elemento&gt; | | (vía modo) | | ✓ |

**Excepciones.** Son los ajustes puntuales del usuario. Se distinguen de la capa *componente* porque sobreviven al cambio de modo y a la aplicación de perfiles (salvo `includeExceptions: true`). La visibilidad de un elemento es `excepción ?? !modo.oculta(elemento)`.

## Configuración

```js
{ version: 1, enabled: true,
  global:  { theme: 'cafe' },
  apps: { chatgpt: { enabled: true, values: { mode: 'minimal' },
                     components: { messages: { fontScale: 1.25 } },
                     exceptions: { 'messages/show:feedback': true } } },
  profiles: { p1: { name, scope: 'all' | appId, createdAt, data: { global, apps } } } }
```

Se guarda en `browser.storage.local` bajo `uui.settings`. Todas las operaciones de `store.js` son puras (reciben y devuelven una configuración), lo que permite probarlas sin navegador.

Perfiles transferibles: `exportProfile()` → JSON `{ schema: 'uui.profile/1', profile }`. `importProfile()` valida cada valor contra el esquema y devuelve la lista de lo descartado.

Reutilizar entre apps: `copyApp(settings, from, to, adapterTo)` copia los controles universales siempre y los componentes o elementos solo si el adaptador destino los declara.

## Motor (`createEngine`)

Por cada `apply(settings)`:

1. **Salud**: si falta un ancla del adaptador, la app entera queda *Incompatible* y se revierte todo. Esto evita aplicar reglas a una estructura que ya no se reconoce.
2. **Tema**: `requires()` → *Incompatible* con motivo. Si procede, inyecta los tokens `--uui-*` y el puente del adaptador, y comprueba el color computado de superficies reales (`verify`). Después, contraste ≥ 4.5:1. Si falla algo, revierte → *Error*.
3. **Visibilidad**: localiza cada elemento (primer selector candidato que coincide), rechaza los que contienen un esencial, marca `data-uui-hide` y comprueba `display: none`.
4. **Diseño por componente**: escribe estilos en línea `!important` en los objetivos, recordando el valor previo, y comprueba el valor computado.
5. **Acciones**: localiza el control nativo; bloquea cualquier control de envío.
6. **Informe**: estados por id, selector usado, si fue un candidato alternativo, origen del valor, y registro de invalidaciones.

`start()` observa el DOM (MutationObserver, `childList` + `subtree`) y vuelve a aplicar con un retardo de 250 ms. Si un elemento cambia de selector o desaparece, se registra en `drift` con hora y tipo.

`revertAll()` quita la hoja inyectada, los atributos `data-uui-*` y restaura cada estilo en línea a su valor previo. Las pruebas comparan `outerHTML` antes y después.

**Privacidad**: el motor solo usa `querySelectorAll`, `matches` y `getComputedStyle`. No lee `textContent`, `innerText`, `innerHTML` ni `value` (prueba con trampas en los prototipos). Nada sale del navegador: el informe solo viaja al panel.

## Panel

`popup/popup.js` monta los tres espacios sobre un objeto `env` (contexto, permisos, informe, acciones). `env-extension.js` lo conecta a Firefox; `demo/` lo conecta a páginas sintéticas. Mismo código en ambos casos.

- **Aplicaciones**: adaptadores registrados, permiso, si están personalizados o heredan.
- **Personalización**: ámbito *Común · todas* frente a *Solo &lt;app&gt;* y, dentro de la app, por componente. Cada control muestra su origen (`○ común`, `● propio ↺`) y su estado verificado. Un control no operable queda deshabilitado con el motivo.
- **Perfiles**: guardar (todo o una app), aplicar, exportar, importar, copiar de otra app.

## Permisos

**Acceso opt-in real:** `optional_host_permissions` enumera únicamente los cinco orígenes conocidos. No hay `host_permissions` ni `content_scripts` declarativos. Al pulsar *Permitir en este sitio*, `permissions.request` pide solo el origen activo, `scripting.registerContentScripts` registra el código persistente para ese origen y `executeScript` lo aplica en la pestaña ya abierta. Tras una actualización, el popup reconstruye un registro ausente. Permisos fijos: `storage`, `activeTab`, `scripting`. No hay inyección silenciosa antes del consentimiento. **Firefox real todavía pendiente de comprobar.**
