# CASA — chat realtime mínimo

Una sala web para amigos: abrir link → escribir nombre → hablar.

## Link público

https://casa-amigos-neon.vercel.app

## Estado

`WORKING_CORE_CONFIRMED`

## Arquitectura

- **Frontend:** 3 archivos estáticos (`index.html`, `style.css`, `app.js`), sin build step.
- **Realtime:** Supabase Realtime Broadcast para mensajes.
- **Presencia:** Supabase Realtime Presence para la lista de conectados.
- **Auth:** ninguna; el canal es público a propósito para que cualquiera con el link pueda entrar.
- **Persistencia:** ninguna en v1. Los mensajes viven solo mientras la pestaña está abierta.
- **SDK:** `@supabase/supabase-js@2.114.0`, fijado a versión exacta vía CDN.

## Límites intencionales de v1

- una sola sala;
- nombre de hasta 24 caracteres;
- mensaje de hasta 500 caracteres;
- últimos 100 mensajes renderizados por cliente;
- sin historial para usuarios que llegan después;
- sin archivos, imágenes, login ni moderación.

## Seguridad mínima

- se usa únicamente una **publishable key** de Supabase, nunca una secret/service-role key;
- nombres y mensajes se insertan con `textContent`, no con HTML;
- límites de longitud y rate-limit local básico;
- no se almacena información sensible ni historial.

## Verificación realizada

- `app.js` pasa `node --check`;
- servidor estático local responde correctamente;
- deployment Vercel está en estado `READY`;
- `/`, `/app.js` y `/style.css` del dominio público responden HTTP 200;
- E2E externo ejecutado desde una Vercel Function con **dos conexiones WebSocket reales** contra la sala de producción;
- Alice y Bob pudieron unirse;
- Alice detectó a Bob por Presence;
- Bob recibió `hola desde e2e` enviado por Alice vía Broadcast.

### Limitación restante del entorno de prueba

El Chromium del sandbox está bloqueado por política administrativa, así que no se pudo automatizar aquí el recorrido DOM completo de la UI publicada. La infraestructura realtime sí quedó probada desde internet. El smoke test humano final es abrir el link en dos dispositivos/pestañas, poner dos nombres y mandar un mensaje.

## Archivos de continuidad

- `ONE_SHOT_PROMPT.md`: prompt para reconstruir/publicar la app completa en una sola pasada.
- `PHASES.md`: fases, gates y criterio de cierre para futuras iteraciones.

## Próxima evolución natural

Persistencia opcional, salas por código, avatares que se mueven en una habitación y acciones sociales. Ninguna de esas funciones es necesaria para que v1 funcione.
