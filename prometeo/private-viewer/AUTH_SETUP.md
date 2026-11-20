# PROMETEO Viewer V2 · Autenticación GitHub

ESTADO: código preparado. GitHub App y callback NO configurados. No declarar el login como funcional.

El login con Google no concede acceso a repositorios privados de GitHub. La cookie de github.com tampoco puede ser reutilizada por github.io.

## Configuración única

1. Registrar una GitHub App en https://github.com/settings/apps/new . Homepage: https://juanmanuelpm.github.io/Experimentos/prometeo/private-viewer/ . Permiso Repository Contents: Read-only. Metadata como requerido por GitHub. Sin escrituras.
2. Instalar esa App solo en JuanManuelPM/pruebas, no en todos los repositorios.
3. Configurar un Cloudflare Worker Free con el código auth-worker.mjs de esta carpeta. Agregar GH_CLIENT_ID, GH_CLIENT_SECRET (secreto privado) y VIEWER_ORIGIN=https://juanmanuelpm.github.io . Nunca subir secretos al repositorio.
4. Configurar callback de la GitHub App a https://TU-WORKER.workers.dev/callback .
5. Completar auth.json con clientId público y callbackUrl HTTPS. allowedOrigins debe permanecer https://juanmanuelpm.github.io .
6. Iniciar sesión desde el visor y probar lectura de un archivo privado. Validar revocación, expiración, bloqueo de cuentas no autorizadas, estado OAuth, y ausencia de tokens en URLs o logs.

## Seguridad y límites

- GitHub Pages es estático y no puede intercambiar un OAuth code usando un client secret por sí solo.
- El callback de Worker envía un token temporal a la página que abrió GitHub utilizando postMessage y validación de origen y state; no lo coloca en una URL ni lo guarda en GitHub.
- El navegador mantiene el token solo en memoria. Al recargar hay que reconectar, hasta implementar una sesión propia protegida.
- El contenido ejecutable puede acceder a archivos de su carpeta, pero no al token.
- Para una sesión persistente auténtica se necesitaría un backend adicional o autorización explícita para un almacenamiento cifrado/controlado.
- Ninguna cuenta ni plataforma nueva se configuró por esta rama candidata.
- Todos los cambios son exclusivos del visor, no afectan estudios, canon o ramas ajenas.
