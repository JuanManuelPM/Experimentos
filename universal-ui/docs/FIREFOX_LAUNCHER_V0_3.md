# Firefox · Lanzador v0.3 (candidato)
## Qué hace
Extiende Universal UI (no reemplaza los scripts existentes) con una página interna en la extensión: `launcher/index.html`. Desde el botón de Universal UI se abre **Aplicaciones → Abrir escritorio Firefox**. Se puede guardar como marcador la URL interna una vez instalada la extensión.
- **Abrir:** enfoca una pestaña ya existente de WhatsApp Web o ChatGPT o crea una nueva.
- **Nueva ventana:** abre esa aplicación en una ventana Firefox normal independiente.
- **WhatsApp + ChatGPT:** abre (o recupera) dos ventanas Firefox y solicita que queden lado a lado; el gestor de ventanas de Ubuntu puede ajustar o ignorar coordenadas.
- **Preparar vista dividida:** crea dos pestañas en la ventana actual para poder unirlas manualmente con Alt + clic. **No** puede crear Split View nativa programáticamente.
## Seguridad y límites
La extensión usa `tabs` para conocer URLs de pestañas y así evitar duplicados; **no lee mensajes ni archivos**. Los permisos para inyectar CSS siguen siendo opcionales por sitio. No se piden permisos de descargas, nativeMessaging ni gestión de escritorios. No se ejecutan archivos descargados. La persistencia de la distribución almacena IDs de ventanas y se valida antes de reutilizarlas.
Este es un candidato. Firefox real instalado y las sesiones privadas requieren prueba humana; las pruebas automatizadas de API usan dobles y no confirman el posicionamiento en GNOME Wayland.
## Instalación candidata
Descargá el paquete ZIP, descomprimilo. En Firefox abrí `about:debugging#/runtime/this-firefox`, elegí **Cargar complemento temporal** y seleccioná `universal-ui/extension/manifest.json`. El complemento temporal desaparece al reiniciar Firefox. Para instalación persistente hace falta firmar el complemento. El lanzador se abre desde el botón de Universal UI → Aplicaciones.
## Fuera de alcance ahora
Automatizar escritorios de Ubuntu, vigilar Descargas, autoactualizaciones, modificar apariencia de WhatsApp o ChatGPT. Son tareas separadas y no necesarias para la funcionalidad del lanzador.
