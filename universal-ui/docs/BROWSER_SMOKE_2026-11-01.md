# Smoke test de Chromium · 2026-11-01

**Alcance:** navegador Chromium /usr/bin/chromium, ejecutado mediante Playwright Python; archivos del ZIP del usuario. **Fixtures sintéticos**, no sitios web reales.

## Método

1. Para cada app, cargar `test/fixtures/{chatgpt,whatsapp,wikipedia}.html` en Chromium.
2. Inyectar los JS originales del ZIP en el orden del manifiesto: core/status, themes, schema, store, adapter, engine y tres adaptadores.
3. Crear engine con el adaptador, aplicar configuración global `theme='cafe'` y modo por app `minimal`.
4. Comprobar `engine.apply().statuses`, `health`, cantidad de nodos `[data-uui-hide]`.
5. Llamar `revertAll()` y comparar `document.documentElement.outerHTML` exactamente con el HTML anterior a aplicar. Verificar que el editor esencial permanece visible.

## Resultados reproducidos

| App | Salud | Tema Café | Elementos ocultos | Restauración completa | Error/incompatible |
|---|---|---|---:|---|---|
| ChatGPT fixture | PASS | applied | 7 | PASS | 0 |
| WhatsApp fixture | PASS | applied | 5 | PASS | 0 |
| Wikipedia fixture | PASS | applied | 4 | PASS | 0 |

Además se confirmó que en ChatGPT y WhatsApp el editor de mensajes sigue visible tras aplicar y revertir. En ChatGPT, `brand` se informa correctamente `not_found` en el fixture: el control **no se anuncia como aplicado**.

## Lo que estos resultados NO prueban

- Que los selectores coincidan con el HTML vivo de ChatGPT, WhatsApp y Wikipedia.
- Que la suite Node `npm test` pase; el ambiente local tenía la carpeta `node_modules/jsdom` vacía y sin conexión al registro npm.
- Que Firefox pueda cargar la extensión y solicitar permisos en la instalación real.
- Que el tema se aplique en modo claro sin riesgo; ChatGPT está condicionado al modo oscuro.
- Que el sistema existente pueda migrarse sin conflicto.

**Siguiente test prioritario:** calibración de ChatGPT real en Firefox y captura de evidencias verificables.
