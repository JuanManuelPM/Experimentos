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
