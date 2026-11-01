# Universal UI · Importación candidata (pendiente de código)

**Estado real, 2026-11-01:** creada rama `universal-ui/v0` desde `master`. Este archivo es un handoff de recepción, NO una entrega funcional ni una importación del código fuente.

## Fuente recibida

Adjunto de conversación: `universal-ui-v0.1.0.zip`

- SHA-256 del ZIP original: `0c4fc3fac7e4f1dbce81e960c75af56b5d7f1f79f077fbdca1ef3d83493c0fa2`.
- Archivo de la entrega: `universal-ui/`, 53 entradas ZIP en total.
- Contiene `extension/` (manifest MV3, núcleo, adaptadores para ChatGPT, WhatsApp Web y Wikipedia), `test/`, `docs/`, `design/`, `demo/` y `scripts/`.
- El ZIP **todavía no está subido a esta rama**. No afirmar que el código esté versionado en GitHub hasta confirmar su importación.

## Pruebas reproducidas desde el ZIP

- `node --check` en todos los JS de `extension/`: **PASS**.
- `npm run build:demo`: **PASS**, produjo `demo/index.html`.
- `npm test`: **NOT_RUN / entorno sin jsdom**. La entrega declara 32 casos, pero en este entorno `ERR_MODULE_NOT_FOUND` impide ejecutarlos. No contar 32 PASS propios.
- Navegación funcional contra ChatGPT y WhatsApp Web reales: **NOT_RUN**.
- Firefox real (permisos, popup, atajo, reversión): **NOT_RUN**.

## Estado de seguridad

No activar Universal UI en producción ni cambiar `userstyles/chatgpt-live.css` y `userstyles/chatgpt-live.user.js`. El personalizador que el usuario utiliza permanece en `master`.

El manifiesto del ZIP declara permisos `storage`, `activeTab`, `scripting` y permisos de host limitados a ChatGPT, WhatsApp Web y Wikipedia. Esto es una lectura estática, no una garantía de seguridad.

## Continuación estricta

1. Importar el ZIP completo en esta rama, con el mismo hash/estructura y sin directorio `node_modules`.
2. Ejecutar la suite con `jsdom` instalado y registrar resultado real.
3. Calibrar los selectores de ChatGPT en Firefox real. Registrar `No encontrado` frente a `Aplicado`; nunca falsos positivos.
4. Probar restauración, navegación y selección de tema, en una rama candidata y sin activar simultáneamente el userscript de ChatGPT.
5. Solo tras aceptación humana, planificar migración; no sustituir la instalación actual unilateralmente.

**Regla:** el ZIP adjunto es fuente de verdad para la versión 0.1.0 hasta que los archivos estén importados y comparados. Este documento no reemplaza `docs/STATE.md` de la entrega.
