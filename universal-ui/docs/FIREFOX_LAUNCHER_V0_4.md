# Firefox Launcher 0.4 · popup resuelto y distribución sin fricción

## Causa del fallo del popup anterior
Firefox calcula la anchura del popup a partir del **body** en documentos estándares. En la v0.3, `body` no fijaba un ancho y solo `.panel` tenía 380 px; en determinados menús de Firefox esto puede comprimirse hasta una tira con scrollbar. La nueva v0.4 elimina el popup del botón principal: hace clic → abre o enfoca directamente `launcher/index.html`, página completa en una pestaña. La configuración original permanece en `popup/popup.html`, accesible desde Personalización. Su CSS además fija `body` a 390 px como respaldo.

## Para alguien que ya instaló la v0.3 (SIN nueva descarga)
Abrir `about:debugging#/runtime/this-firefox` → Universal UI → **Manifest URL**. Reemplazar al final `manifest.json` por `launcher/index.html`. Guardar como marcador. Es la ruta interna del lanzador que ya existe en v0.3; el botón de la extensión seguirá mostrando el popup antiguo hasta cargar una versión nueva.

## Desarrollo: sin bajar ZIP cada vez
Si la instalación temporal apunta a una carpeta de trabajo real (un clon Git), actualizar el código mediante git y pulsar **Recargar** en `about:debugging` cambia el código sin reinstalar ni descargar ZIP. Alternativa: `web-ext run --source-dir universal-ui/extension` durante desarrollo, que recarga automáticamente al editar archivos. La instalación temporal desaparece cuando se reinicia Firefox.

## Producción: **una sola instalación firmada**
Publicar Universal UI en addons.mozilla.org (AMO), listado o sin listar. Firefox podrá recibir actualizaciones firmadas. Para distribución sin listar se necesita una URL HTTPS estable de manifiesto de versiones `browser_specific_settings.gecko.update_url` y XPIs firmados por Mozilla en esa URL. **No activar `update_url` antes de que exista un endpoint real y estable.**
La firma requiere una cuenta de Mozilla/AMO, acuerdo de desarrollador, y aprobación / credenciales para subir versiones; no está realizada aquí. No se puede actualizar ni reinstalar silenciosamente una extensión temporal desde JavaScript del navegador.

## Permisos y seguridad
Permisos actuales: pestañas, scripting, almacenamiento, activeTab. Permisos de sitios opcionales. Sin descargas, ejecución de archivos, Native Messaging ni lectura de contenido de mensajes. La acción principal solo usa tabs/windows con URL `moz-extension://...` de la propia extensión.

## Validación
- Tests unitarios de reuso de pestañas, un único listener, error del launcher, atajo de acción.
- Prueba en Firefox real de botón → pestaña visible requiere extensión instalada en sesión de test.
- No afirmar autoactualización de Firefox hasta tener XPI firmado y una fuente de updates válida.
