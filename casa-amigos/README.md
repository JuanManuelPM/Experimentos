# CASA — chat realtime mínimo

Una sala web para amigos: abrir link → escribir nombre → hablar.

## Link público

https://casa-amigos-neon.vercel.app

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
- el flujo realtime está implementado usando las APIs documentadas de Supabase Broadcast + Presence.

### Limitación del entorno de prueba

El sandbox desde el que se construyó bloqueó Chromium por política administrativa y también bloqueó DNS saliente desde procesos locales, así que no fue posible ejecutar aquí una prueba automatizada de dos navegadores conectados simultáneamente. No se marca ese E2E como aprobado. La prueba humana final es simple: abrir el link en dos dispositivos/pestañas, entrar con nombres distintos y enviar un mensaje.

## Archivos de continuidad

- `ONE_SHOT_PROMPT.md`: prompt para reconstruir/publicar la app completa en una sola pasada.
- `PHASES.md`: fases, gates y criterio de cierre para futuras iteraciones.

## Próxima evolución natural

Persistencia opcional, salas por código, avatares que se mueven en una habitación y acciones sociales. Ninguna de esas funciones es necesaria para que v1 funcione.
