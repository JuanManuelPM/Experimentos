# Worker Lab · Tool Farm Registry
Fecha: 2026-09-25
Objetivo: inventario durable de capacidades, conexión y mini-pruebas.

## Estado

### TEXT / LLM POOLS
- OpenRouter — READY — OAuth + worker responses observadas.
- Gemini API — READY — credencial guardada y provider test OK reportado por usuario.
- Groq — READY — credencial guardada y provider test OK reportado por usuario.
- Cohere — READY — credencial guardada y provider test OK reportado por usuario.
- Mistral — READY — credencial guardada y provider test OK reportado por usuario.
- Cloudflare Workers AI — BROWSER_BLOCKED — credencial/token presente; test desde GitHub Pages bloqueado por CORS, pendiente prueba server-side.
- Cerebras — SKIP — flujo real pidió tarjeta; fuera del experimento $0 por ahora.

### CONNECTORS DIRECTOS PROBADOS DESDE CHATGPT
- Gmail — READY — get_profile respondió.
- Google Calendar — READY — list_calendars respondió.
- Google Drive — READY — search metadata respondió.
- GitHub — READY — lectura de archivo en JuanManuelPM/Experimentos respondió.
- Supabase — READY — list_projects respondió; NO usar para estado experimental sin aislarlo del proyecto Prometeo.
- Vercel — READY — list_projects respondió; proyecto worker-lab visible.

### BROWSER / COMPUTER USE
- GitHub Actions + Playwright Chromium — READY — run real PASS, navegación/click/screenshots/YouTube.
- Browserbase — RESEARCHED / NOT CONNECTED.
- Browserless — RESEARCHED / NOT CONNECTED.
- Cloudflare Browser Run — RESEARCHED / NOT CONNECTED.
- Steel — RESEARCHED / NOT CONNECTED.

### CREATIVE / MEDIA
- ChatGPT Image generation — AVAILABLE, mini-test pendiente.
- Canva plugin — PENDING USER AUTH.
- Hugging Face plugin — PENDING USER AUTH.
- Figma plugin — AVAILABLE, conexión no confirmada en este chat; sugerido recientemente.
- Runway plugin — AVAILABLE, conexión no confirmada en este chat; sugerido recientemente.
- OpenArt plugin — AVAILABLE, conexión no confirmada en este chat; sugerido recientemente.
- Cloudflare image generation — CAPABILITY KNOWN, pendiente test server-side/API.
- Groq Whisper STT — CAPABILITY KNOWN, pendiente mini-test con audio.
- Cloudflare TTS/STT — CAPABILITY KNOWN, pendiente test.
- FFmpeg via GitHub Actions — AVAILABLE, pendiente mini-test de render.

### PRODUCTIVITY / TOOL PLUGINS
- Notion — PENDING USER AUTH.
- Slack — PENDING USER AUTH.
- Todoist — PENDING USER AUTH.
- Linear — PENDING USER AUTH.
- Atlassian Rovo (Jira/Confluence/Bitbucket/Loom) — PENDING USER AUTH.
- Dropbox — PENDING USER AUTH.

### EXTERNAL AUTOMATION FABRICS
- n8n — no direct ChatGPT plugin; external/self-hosted integration required.
- Activepieces — no direct ChatGPT plugin; external integration required.
- Pipedream — no direct ChatGPT plugin; external integration required.
- Telegram — no direct ChatGPT plugin; Bot API integration required.
- Twilio — no direct ChatGPT plugin; API integration required.
- ElevenLabs — no direct ChatGPT plugin; API integration required.

## Regla de mini-test
Cada capability se considera READY sólo si:
1. auth/connection funciona;
2. hace una acción read-only o generación mínima real;
3. devuelve evidencia observable;
4. no requiere billing/tarjeta para el experimento $0;
5. se registra el límite/cuota cuando pueda conocerse.

## Siguiente batch
1. Autorizar plugins pendientes desde ChatGPT: Canva, Hugging Face, Notion, Slack, Todoist, Linear, Atlassian Rovo, Dropbox.
2. Test read-only de cada plugin autorizado.
3. Test creativo mínimo de imagen, diseño, audio y video.
4. Resolver Cloudflare server-side.
5. Crear TOOL_FARM_RUN_001 con una salida pequeña por cada capacidad.
