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
- **Suite Node de 34 pruebas:** **NO VERIFICADA** localmente: falta la dependencia `jsdom`. No confundir el número de pruebas declaradas por la entrega con 32 PASS independientes.
- **Firefox real y páginas reales:** **NOT_RUN**. Los adaptadores todavía tienen `calibratedAt: null`.

## Próxima etapa

1. Instalar dependencias de desarrollo en un entorno con npm operativo y ejecutar `npm test`. Registrar cada resultado.
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
