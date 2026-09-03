# CASA — fases de ejecución y gates

## F0 — Congelar alcance
**Objetivo:** que cinco amigos puedan entrar al mismo link y hablar.

Incluye: nombre, una sala, presencia online, mensajes realtime, mobile/desktop.
No incluye: cuentas, contraseña, historial, imágenes, inventario, mapa, moderación avanzada.

**Gate:** nada fuera del loop `abrir → nombre → entrar → ver online → enviar → recibir` puede bloquear v1.

## F1 — Transporte realtime
Usar Supabase Realtime sin base de datos:
- Broadcast para mensajes.
- Presence para conectados.
- canal público único.

**Gate:** no introducir servidor propio, SQL ni auth si no son necesarios.

## F2 — Identidad efímera
- `crypto.randomUUID()` por pestaña.
- `sessionStorage` para conservar la identidad durante la sesión.
- `localStorage` sólo para recordar el nombre.

**Gate:** dos pestañas del mismo navegador deben poder representar dos conexiones distintas.

## F3 — Chat
- mensaje máximo 500 caracteres;
- Enter/form envía;
- `broadcast.self=true` para que el remitente reciba el mismo evento que los demás;
- ACK habilitado;
- máximo 100 mensajes renderizados por cliente.

**Gate:** no duplicar localmente el mensaje antes del Broadcast.

## F4 — Presencia
- `track()` al suscribirse;
- `presenceState()` para reconciliar lista completa;
- `untrack()` al salir cuando sea posible;
- deduplicación por `clientId`.

**Gate:** la UI deriva del estado Presence, no de contadores manuales.

## F5 — UI mínima
- login de una sola acción;
- escritorio: chat + columna online;
- móvil: chat fullscreen y contador online compacto;
- leve lenguaje visual social/Sims sin copiar assets propietarios.

**Gate:** ninguna navegación secundaria para poder empezar a hablar.

## F6 — Robustez y seguridad mínima
- `textContent` para texto de usuarios;
- límites de nombre/mensaje;
- rate-limit cliente;
- estados visibles Conectando/Conectado/Error;
- únicamente publishable key en frontend.

**Gate:** cero secret/service-role keys en código público.

## F7 — Publicación
- deploy estático a Vercel;
- alias estable;
- código versionado en GitHub;
- README y prompt de reconstrucción junto al código.

**Gate:** `/`, `/app.js`, `/style.css` deben responder 200 desde producción.

## F8 — E2E
Prueba deseada con dos clientes aislados:
1. Alice entra.
2. Bob entra.
3. ambos ven 2 online.
4. Alice envía `hola`.
5. Bob recibe `hola`.
6. Bob responde.
7. Alice recibe respuesta.
8. Bob sale y Alice vuelve a ver 1 online.

**Estado en esta ejecución:** pendiente de confirmación humana porque el navegador automatizado y las conexiones WebSocket salientes del sandbox están bloqueados por política de entorno. No confundir deploy exitoso con E2E aprobado.

## Criterio de cierre v1
La primera prueba real de dos dispositivos que complete F8 convierte v1 en `WORKING_CONFIRMED`. Hasta entonces: `DEPLOYED_AWAITING_EXTERNAL_E2E`.
