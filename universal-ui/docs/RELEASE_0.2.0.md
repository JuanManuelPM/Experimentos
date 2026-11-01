# Universal UI 0.2.0 · Entrega visible · 2026-11-01

## Qué se entrega

1. **Extensión candidata Firefox**: `extension/` con manifiesto MV3 0.2.0, un único botón del navegador, permisos opcionales por sitio, panel con perfiles, temas y modos.
2. **Probar en esta app**: botón visible `Aplicar ahora` = tema Café + Minimal, limitado a la aplicación abierta; `↺ Original` elimina la capa personalizada de esa aplicación sin modificar las otras.
3. **Demo pública interactiva**: https://universal-ui-lab.vercel.app/ (proyecto Vercel independiente `universal-ui-lab`, deploy `dpl_CJ7yFxbgXKgVCAXfQ4TxPC69mh41`, fuente commit `01abe59257e4ff1950478d97a7251eb57939efa7`). Se abre WhatsApp en modo Café + Minimal; se puede restaurar y cambiar a ChatGPT/Wikipedia. **Son fixtures sintéticos, no chats reales**.
4. **Paquete temporal**: `Universal-UI-Firefox-0.2.0.zip` generado localmente a partir del código versionado. Contiene 16 archivos, `manifest.json` en raíz, SHA-256 `cf90eedb6d712acd9f4df341f6746544cff79aa4053032393ca8351d8e1bce33`. El ZIP está adjunto en la conversación del usuario, no en GitHub; **no fingir un release binario de GitHub**.

## Evidencia de funcionamiento

- GitHub Actions `41314966925`: **PASS** (38 tests, build de demo, sintaxis JS), commit `01abe59257e4ff1950478d97a7251eb57939efa7`.
- Demo local Chromium: **PASS** botón `↺ Original` quitó `data-uui-theme` y restauró el control Estados (`display:block`). Al pulsar `Aplicar ahora`, el tema `cafe` se aplicó y Estados pasó a `display:none`; fondo principal `rgb(42, 33, 29)`. No hubo errores JS.
- Paleta y ocultación verificadas **sobre fixtures**, no sobre las páginas reales.
- Demo Vercel: despliegue `READY`, alias `universal-ui-lab.vercel.app` asignado; no pudo verificarse la navegación HTTP desde este entorno.
- `master` y `userstyles/chatgpt-live.user.js` v1.3.0 no se modificaron.

## Cómo probar el paquete en Firefox de escritorio

1. Descargar `Universal-UI-Firefox-0.2.0.zip` desde la conversación (sin descomprimir).
2. Abrir `about:debugging` → **Este Firefox** → **Cargar complemento temporal** → seleccionar el ZIP. Mozilla permite cargar un ZIP unsigned así durante esa sesión. Al reiniciar Firefox, hay que volver a cargarlo.
3. Abrir WhatsApp Web; pulsar el icono de Universal UI en la barra → `Permitir en este sitio` → `Aplicar ahora`. `↺ Original` restaura la aplicación.

**Recomendación inicial:** probar WhatsApp primero, porque en ChatGPT sigue activo el userscript Violentmonkey y ambas hojas podrían competir. Desactivar el userscript ChatGPT Minimal Live antes de probar Universal UI sobre ChatGPT.

## Qué falta para decir «instalación permanente verificada»

- No hubo prueba de extensión en Firefox real ni de selectores contra ChatGPT y WhatsApp Web reales con sesión iniciada.
- La extensión está **sin firmar**: instalación temporal vía `about:debugging`, no instalación permanente de un clic. Para publicar una extensión permanente en Firefox normal se necesita firma de Mozilla/AMO con intervención del propietario.
- La paleta Café requiere modo oscuro nativo según los adaptadores actuales; en modo claro puede aparecer `Incompatible`. El modo Minimal igualmente se aplica si encuentra sus elementos.
- **No** afirmar que la extensión ya está instalada en la computadora del usuario.

## Regla de continuidad

La rama `universal-ui/v0` es fuente de verdad del código. Antes de seguir, recuperar este documento, `docs/STATE.md`, el último CI y el Vercel deploy. No reconstruir ni reemplazar la base.
