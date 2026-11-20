# PROMETEO VIEWER V1

**Propietario:** Ideas / gobierno de PROMETEO. **Código:** público e independiente. **Datos de las obras:** privados cuando provienen de un repositorio privado. El visor no publica ni modifica obras.

## Implementado

- Aplicación estática HTML + CSS + JavaScript que puede alojarse gratis en GitHub Pages.
- Acceso a carpetas y archivos de ramas arbitrarias mediante GitHub REST Contents API.
- Repositorios privados con un token fino de solo lectura introducido directamente en la página. La sesión de github.com no se hereda.
- Previsualización de HTML, CSS, imports ES de rutas relativas, archivos solicitados con fetch relativo, imágenes, música, vídeo, PDF y texto.
- Página ejecutada en iframe sandboxed con scripts permitidos, pero SIN permitir same-origin. La página no puede leer el token de la aplicación.
- Puente de recursos con postMessage que valida ventana, sesión, carpeta seleccionada, ruta y extensión. Sin POST al repositorio.
- Token, código recuperado y caches mantenidos exclusivamente en la memoria de la pestaña. Al recargar o cerrar se pierde la sesión.
- Demo pública con Cocina Umbría 002 candidata; no modifica su rama ni la publica en gh-pages.

## Pasos en el celular

1. Abrí el enlace del visor.
2. Para leer un repositorio privado, creá un fine-grained personal access token de GitHub: https://github.com/settings/personal-access-tokens/new
3. Seleccioná Repository access: Only select repositories, elegí JuanManuelPM/pruebas y concedé SOLO Contents: Read-only. Elegí vencimiento corto y no des permisos de escritura.
4. Pegá el token exclusivamente dentro del visor y pulsá Conectar. Nunca lo envíes al chat, a un commit ni a un enlace.
5. Ingresá la rama en la que existe el HTML ejecutable, pulsá Explorar, entrá a la carpeta y abrí index.html.
6. Para probar sin token, pulsá Demo pública 3D.

**Aviso:** el botón de autorización OAuth automática con sesión de GitHub no está implementado. Una web en Pages no puede heredar tu sesión de github.com y una app OAuth con client secret requiere un intercambio seguro del lado servidor. Esta versión no necesita ese servidor, pero sí el token.

## Limitaciones reales

- La privacidad depende de que las obras ejecutables estén realmente en un repo privado. Las ramas candidatas del repo público Experimentos también son públicas.
- La reproducción no está garantizada para importaciones circulares, importaciones dinámicas no literales, Web Workers, rutas de recursos dinámicas, srcset o aplicaciones SPA complejas.
- Recursos absolutos que apunten a repositorios privados de GitHub no adquieren autenticación automáticamente. Preferir rutas relativas dentro de la carpeta del HTML.
- Tamaño máximo por archivo: 24 MiB en V1; se aplican las cuotas de la API de GitHub.
- El contenido de una obra ejecuta JavaScript dentro de su iframe. No accede al token, pero una obra maliciosa podría enviar contenidos de su propia carpeta a terceros. Usar solo proyectos confiables.
- No hay almacenamiento persistente de tokens, porque representa una exposición innecesaria.
- No hay motor de render 3D en el servidor. WebGL y WebAudio se ejecutan en el navegador, con los límites del dispositivo.
- Sin prueba manual real en Chrome Android y un repositorio privado de prueba no debe declararse aprobada la compatibilidad end-to-end ni la revisión de seguridad.

## Publicación

Branch candidata: JuanManuelPM/Experimentos@candidate/prometeo-private-viewer-v1-20261120

Carpeta: prometeo/private-viewer/

Publicar solo los archivos del visor, sin credenciales ni carpetas privadas. No editar otros productos, ni el control canónico, ni las skills o automatizaciones. Si una obra tiene defectos de empaquetado, corregirla en su estudio dueño.
