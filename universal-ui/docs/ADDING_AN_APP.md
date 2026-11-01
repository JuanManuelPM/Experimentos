# Incorporar una aplicación

Ejemplo real: `extension/adapters/wikipedia.js`. Ningún paso toca `core/`.

## 1. Describir

Crear `extension/adapters/<id>.js`:

```js
(function (UUI) {
  UUI.adapters.defineAdapter({
    id: 'miapp', name: 'Mi App', version: '0.1.0', calibratedAt: null,
    hosts: ['miapp.com'],
    anchors: [{ id: 'root', selectors: ['#app'] }],          // sin esto, no se toca nada
    essentials: ['textarea', '#contenido'],                  // jamás se ocultan
    components: {
      lectura: { label: 'Lectura', selectors: ['main'], supports: ['fontScale', 'readingWidth'],
                 targets: { fontScale: ['main .texto'] } },  // opcional: dónde aplicar cada control
    },
    capabilities: [                                         // elementos que se pueden ocultar
      { id: 'promo', label: 'Promoción', component: 'lectura', selectors: ['[data-testid="promo"]', 'aside.promo'] },
    ],
    modes: { minimal: ['promo'], equilibrado: [], completo: [] },
    theme: {                                                // opcional
      requires: (doc) => null,                              // o un motivo legible
      bridge: `html[data-uui-theme] { --fondo-app: var(--uui-bg) !important; }`,
      verify: [{ selector: ['main'], property: 'background-color', token: 'bg' }],
      contrast: { text: ['main p'] },
    },
    actions: [{ id: 'nuevo', label: 'Nuevo', selectors: ['button[aria-label="Nuevo"]'] }],
  });
})(globalThis.UUI);
```

`defineAdapter` valida el contrato: controles conocidos, componentes existentes, modos que apuntan a elementos declarados, tokens de tema válidos.

Preguntas antes de añadir un elemento o control:

- ¿Ya lo cubre un control universal? Entonces solo hace falta declararlo en `supports`.
- ¿Hay al menos dos selectores candidatos, uno estable (`aria-label`, `id`, rol) y otro de respaldo?
- ¿Contiene algo esencial? El motor lo rechazará: mejor apuntar a un hijo más concreto.

## 2. Registrar

- `manifest.json`: cada origen nuevo en `optional_host_permissions`; **no** en `host_permissions` ni en `content_scripts` declarativos.
- `popup/popup.html` y `popup/env-extension.js` (`CONTENT_FILES`): registrar el archivo antes de `content/content.js` para inyección dinámica. El permiso se pide por origen activo, no para todas las aplicaciones.
- `test/third-app.test.mjs` y `test/permissions.test.mjs`: verificar que la aplicación solo recibe acceso cuando el usuario lo concede.

`test/third-app.test.mjs` falla si manifiesto, panel y adaptadores no coinciden.

## 3. Probar

- `test/fixtures/<id>.html`: página sintética con la estructura que usan los selectores. Sin contenido real.
- Añadir al menos: aplicación verificada, restauración idéntica (`outerHTML`), y un caso *No encontrado*.
- `npm test`.

## 4. Calibrar en el sitio real

1. Cargar la extensión temporal, abrir el sitio, conceder permiso.
2. Abrir el panel: cada elemento muestra *Disponible*, *No encontrado* o *selector alternativo*.
3. Corregir los selectores marcados, recargar, repetir.
4. Fijar `calibratedAt: 'AAAA-MM-DD'` y subir `version`. El panel deja de mostrar *sin calibrar*.

Cuando el sitio se actualice, el informe lo indica (*desaparecido* / *selector alternativo*). Se edita el adaptador; el motor no cambia.
