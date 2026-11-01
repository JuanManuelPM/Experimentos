# Firefox Launcher 0.4 · Recuperación del popup y menos fricción (2026-11-01)

- **Fallo real:** Firefox mostraba el popup de Universal UI como una tira vertical mínima. La v0.3 fijaba el ancho de `.panel`, pero no de `body`; Mozilla calcula el ancho del popup a partir de `body`.
- **Solución inmediata SIN descargas:** desde `about:debugging#/runtime/this-firefox` abrir la URL del manifiesto de Universal UI y sustituir `manifest.json` por `launcher/index.html`. Guardar marcador. Se usa la v0.3 ya instalada.
- **Candidata 0.4.0:** nuevo `background/open-launcher.js` registrado en manifest MV3. Se **elimina `action.default_popup`**: clic en el icono o atajo abre/enfoca una pestaña normal con el escritorio. Personalización accesible desde botón en launcher; body de página de ajustes también corregido.
- **Seguridad:** NO hay permisos de descargas, `nativeMessaging`, ejecución de archivos ni cambios en los userscripts. `tabs` se usa para localizar el launcher y las apps existentes.
- **CI:** `41335298852` PASS: 53/53 pruebas, build demo, sintaxis y paquete Firefox 0.4.0. Instalación real en Firefox del usuario NOT_RUN.
- **Distribución definitiva, AÚN NO ACTIVA:** firmar extensión en Mozilla AMO (requiere cuenta/consentimiento del usuario) y establecer actualizaciones automáticas (AMO listado o `update_url` HTTPS + XPI firmado si es no listado). Nunca ejecutar un ZIP descargado sin autorización y validación. Una extensión temporal cargada por `about:debugging` no puede autoactualizarse ni persistir tras reinicio.
- **Siguiente acción:** usar marcador ahora, probar v0.4 si se desea el botón reparado, y preparar una firma oficial única para terminar con actualizaciones manuales. No afirmar instalado, firmado ni autoactualizable.
- **Rama:** `candidate/firefox-launcher-frictionless-20261101` (no sustituye la extensión ni producción).

---

# Actualización · Firefox Launcher 0.3.0 (2026-11-01)

**Estado:** candidato en `candidate/firefox-launcher-v0-20261101`, no instalado ni firmado. No modifica `master`, los userscripts de WhatsApp 3.1 / ChatGPT 1.3, ni `gh-pages`.

**Qué se creó:** `extension/launcher/index.html`, `launcher.css`, `launcher-core.js`, `launcher.js`; acceso desde `Universal UI → Aplicaciones → Abrir escritorio Firefox`. Versión del manifiesto 0.3.0. Permiso `tabs` para detectar URL de pestañas y reutilizarlas, sin permiso de descargas ni native messaging. Permisos de contenidos por origen siguen opcionales.

**Funciones:** Abrir WhatsApp/ChatGPT reutilizando pestañas, nueva ventana, pareja de ventanas lado a lado con IDs reutilizables (no Split View nativo), preparar pestañas para Alt + clic manual. No mueve ventanas a otro escritorio de GNOME.

**Pruebas:** GitHub Actions 41333969085: 47/47 PASS, demo PASS, sintaxis PASS, paquete ZIP PASS. Pruebas basadas en API simulada. Firefox real instalado, posiciones GNOME y sesiones de usuarios: NOT_RUN.

**Instalación:** consultar `docs/FIREFOX_LAUNCHER_V0_3.md`. Entrega con `Firefox-Lanzador-0.3.zip` desde conversación. En Firefox estable sin firma, requiere `about:debugging` y carga temporal del `manifest.json`. Para instalación persistente, firmar el add-on.

**Próximo control:** instalar temporalmente, probar Abrir → reutilizar pestaña, Nueva ventana y WhatsApp+ChatGPT en Ubuntu; solo entonces decidir si integrar la candidata en `universal-ui/v0` o publicar una extensión firmada.

---

# Universal UI · START HERE

**Fecha:** 2026-11-01  
**Rama:** `universal-ui/v0` (candidata; NO producción)  
**Fuente original:** ZIP `universal-ui-v0.1.0.zip`, SHA-256 `0c4fc3fac7e4f1dbce81e960c75af56b5d7f1f79f077fbdca1ef3d83493c0fa2`

## Estado comprobado

- **Código fuente importado:** 40 archivos extraídos del ZIP original y versionados en esta rama: `extension/`, `test/`, `docs/`, `design/`, `demo/`, `scripts/`, manifiesto y dependencias.
- **Recuperación:** `sources/universal-ui-v0.1.0.tar.xz` es un archivo redundante íntegro con esos 40 archivos. SHA-256 local: `ed178d416fa4d479a1e96318589d2082d29d406229fdc5e25f3e50852e38046e`.
- **Prueba de sintaxis JS:** PASS (`node --check`).
- **Construcción de demo:** PASS (`npm run build:demo`).
- **Pruebas de navegador con Chromium local y fixtures sintéticos:** PASS para aplicar tema Café, ocultar elementos con modo Minimal y restaurar en ChatGPT, WhatsApp y Wikipedia. Véase `docs/BROWSER_SMOKE_2026-11-01.md`.
- **Suite Node de 38 pruebas:** **38/38 PASS** en GitHub Actions (`41312116187`). No se pudo instalar `jsdom` localmente por DNS, pero la ejecución del runner remoto es verificable.
- **Firefox real y páginas reales:** **NOT_RUN**. Los adaptadores todavía tienen `calibratedAt: null`.

## Próxima etapa

1. La suite `npm test` ya pasó (38/38) en GitHub Actions; mantener CI verde después de cada cambio.
2. Calibrar adaptador ChatGPT con navegador real. Prioridad: elemento esencial `composer`, encabezado, texto de marca, `Manage`, valoración y ancho.
3. Calibrar WhatsApp Web y asegurar que jamás se lean ni envíen mensajes.
4. Probar permiso por sitio, popup y teclado en Firefox. Contrastar el modo claro/oscuro y la restauración.
5. Preparar un paquete instalable candidato y una instalación de un solo paso; **no sustituir el userscript actual** antes de demostrar equivalencia y obtener aceptación del usuario.

## Aislamiento

Este trabajo vive exclusivamente en `universal-ui/v0`. `master`, `gh-pages` y el personalizador existente permanecen sin cambios. No afirmar que un selector funciona en chatgpt.com o web.whatsapp.com reales hasta aportar evidencia.

Reanudar leyendo `docs/DIAGNOSIS.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` y `docs/BROWSER_SMOKE_2026-11-01.md`.

## Actualización verificada (2026-11-01, corrección del observador)

- Se corrigió `extension/core/engine.js`: filtrado de mutaciones internas del estilo; observación de atributos estructurales sin bucles.
- En Chromium con fixtures sintéticos: cambio externo → solo una reaplicación adicional, y selector `data-testid` renombrado → fallback detectado.
- Se añadieron **dos regresiones** en `test/engine.test.mjs` (ahora 34 casos escritos). **No se ejecutó `npm test` completo**: `jsdom` no quedó instalado en el contenedor, y `npm ci` agotó el tiempo.
- No hay acceso desde este entorno a `https://chatgpt.com` (`ERR_BLOCKED_BY_ADMINISTRATOR`); calibración real y Firefox siguen pendientes.
- Ver `docs/OBSERVER_REPAIR_2026-11-01.md`. Producción y userscript actual intactos.

## Actualización CI y permisos (2026-11-01)

- GitHub Actions candidato `.github/workflows/universal-ui-verify.yml`: ejecución `41311607812` **PASS**, 34/34 tests, demo y sintaxis. Cuatro regresiones extra de permisos incorporadas luego: deben comprobarse en un run nuevo.
- `manifest.json`: se reemplazaron hosts obligatorios y scripts declarativos por `optional_host_permissions` y registro dinámico por origen en `popup/env-extension.js`. No se habilitan todas las páginas al instalar.
- `test/third-app.test.mjs` actualizado y `test/permissions.test.mjs` creado (opt-in, rechazo, alias y recuperación). Ahora hay **38 casos escritos**.
- **Falta:** prueba Firefox real con permiso / denegación / reapertura, además de selectores ChatGPT/WhatsApp reales y aceptación humana. No tocar `master` ni `userstyles/`.

## CI definitivo de esta etapa (2026-11-01)

- Run: https://github.com/JuanManuelPM/Experimentos/actions/runs/41312116187
- **PASS: 38 pruebas / 0 fallas / 0 omitidas**, `npm ci`, `npm run build:demo`, sintaxis JS.
- Se corrigieron permisos globales del manifiesto: acceso ahora opcional por origen mediante `optional_host_permissions` + registro dinámico y script en la pestaña abierta, con cuatro regresiones.
- **No equivale a validación real en Firefox o ChatGPT/WhatsApp**. Conservamos `calibratedAt: null` y el userscript actual de producción intacto.
