# PROMETEO VIEWER · V2

Visor público minimalista para explorar y previsualizar archivos provenientes de repositorios GitHub privados, sin publicar esas obras.

## Interfaz

Pantalla inicial: marca, una acción Continuar con GitHub, demostración pública. Explorador y configuraciones solo después de entrar en el espacio de trabajo. Modo visual oscuro y visor a pantalla completa. La entrada por PAT está oculta en Acceso alternativo.

## Autenticación real

El inicio automático con GitHub está preparado en shell.js y auth-worker.mjs, pero NO operativo hasta registrar una GitHub App de solo lectura, instalarla en los repositorios autorizados, desplegar el callback gratuito y configurar auth.json. La sesión de github.com no puede ser compartida directamente con un sitio github.io. Google tampoco concede permiso sobre repositorios privados de GitHub.

El archivo AUTH_SETUP.md contiene los pasos humanos únicos. Nunca subir client secret, tokens, cookies ni credenciales a GitHub. El callback entrega token temporal a la ventana originadora por postMessage y verificación de state y origin. El frontend lo conserva solo en memoria.

## Estado de calidad

Controles de UI y sintaxis: pruebas estáticas satisfactorias. QA Chrome Android y autenticación real: NOT_RUN. Login automático: NOT_CONFIGURED. Ver QA_RECEIPT.json.

## Demo

Ver demostración carga una candidata pública 3D de Cocina Umbría 002. Es una prueba de compatibilidad, no una garantía de que WebGL y todos los recursos funcionen en Chrome Android. El script del visor se ejecuta en iframe sin allow-same-origin para aislar credenciales. El motor de módulos no cubre importaciones circulares, import.meta.url y todas las estrategias de cargas dinámicas.

## Uso actual sin GitHub App

Acceso alternativo: usar un fine-grained personal access token limitado a solo Contents: Read-only del repositorio deseado. No se guarda entre recargas, no se pega en chats, enlaces ni commits.

## Dueño

Ideas · Gobierno de PROMETEO. Rama candidata candidate/prometeo-private-viewer-v2-minimal-auth-20261120. Publicación única en prometeo/private-viewer/; sin cambios en otros estudios o publicaciones.
