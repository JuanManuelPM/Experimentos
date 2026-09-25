# Worker Lab · EXPERIMENT WAVE 001
Fecha: 2026-09-25
Regla: laboratorio aislado. NO integrar con Prometeo todavía.

## Objetivo
Probar de forma barata qué podemos hacer con las capacidades ya disponibles y descubrir qué vale la pena migrar después.

## Cuotas confirmadas / observables
- OpenRouter Free: 50 requests/día.
- Groq gpt-oss-120b / gpt-oss-20b / qwen3.8-27b: 30 RPM, 1000 RPD, 8K TPM, 200K TPD.
- Groq Whisper large-v3 / turbo: 20 RPM, 2000 RPD, 28,800 segundos de audio/día.
- Cohere trial: 1000 API calls/mes; Chat 20 RPM.
- Cloudflare Workers AI Free: 10,000 Neurons/día; algunos modelos grandes requieren Workers Paid.
- Gemini Free: límites por modelo/proyecto; leer cuota activa desde AI Studio o headers/respuesta. Reset diario según Google.
- Mistral Free mode: límites por organización/modelo; leer Limits/Admin o headers/429. No asumir un número fijo.

## Wave A — model behavior lab
Costo objetivo: 5 tareas por provider, excepto OpenRouter 3–5.
Misma tarea, misma longitud máxima, evidencia cruda conservada.

Tareas:
1. VISUAL THINKING — diseñar una escena/juego extraño a partir de restricciones visuales.
2. RESEARCH PLAN — planificar una investigación con fuentes y criterios de verificación.
3. CRITIC — encontrar errores concretos en una propuesta.
4. STRUCTURED — transformar input desordenado en JSON válido con schema fijo.
5. BUILDER — producir un pequeño HTML/JS autocontenido con acceptance criteria.

Medir:
- latencia;
- longitud;
- instruction following;
- structured validity;
- novelty;
- errores factuales evidentes;
- utilidad del output;
- provider/model real;
- rate-limit headers cuando existan.

## Wave B — visual experiments

### B1 Asset Hunter
Brief visual -> browser/image search -> shortlist de referencias -> descripción estructurada -> asset generado o seleccionado -> contacto sheet.
Objetivo: comprobar si el browser worker sirve para alimentar juegos/escenas visuales sin búsqueda humana manual.

### B2 Visual Critic Tournament
Misma screenshot del mundo/Coliseo -> varios modelos describen problemas -> síntesis -> ranking de problemas por coincidencia.
No modificar el producto. Sólo crítica.

### B3 One-Prompt Game Jam
Brief -> 3 conceptos paralelos -> crítico -> uno elegido -> HTML aislado -> Playwright screenshot/test.
Nada se migra.

### B4 Screenshot Repair Loop
Página experimental -> Playwright screenshot móvil/desktop -> modelo crítico -> un repair -> screenshot final.
Medir si mejora con una sola iteración.

## Wave C — alerts / presence

### C1 Worker Bell
Evento sintético WORK_DONE / BLOCKED / HUMAN_NEEDED -> comparar:
- beep;
- visual flash;
- browser notification;
- Web Speech voice;
- email draft/notification candidate.
Objetivo: descubrir qué señal realmente sirve en TV/móvil.

### C2 Prometeo Voice Booth
Texto corto de evento -> 3 voces/velocidades -> reproducción desde página TV experimental.
Primero Web Speech / recursos ya existentes; después comparar TTS externo sólo si aporta valor.

### C3 TV Announcer
Feed falso pero explícitamente DEMO con 5 eventos.
La TV anuncia sólo eventos materiales:
- terminó;
- bloqueado;
- necesita humano;
- nuevo artifact.
Evitar hablar cada heartbeat.

## Wave D — personal automation, read-only primero

### D1 Calendar Concierge
Leer calendario -> producir:
- próximos compromisos;
- huecos;
- conflictos;
- suggested blocks.
No crear/modificar eventos durante experimento.

### D2 Inbox Radar
Leer pequeña muestra de Gmail -> clasificar:
urgent / reply / academic / payment / ignore.
No enviar ni archivar. Sólo comparar modelos.

### D3 Morning Brain
Calendar + Gmail read-only + estado de laboratorio -> briefing de 60 segundos.
Salida texto + TTS experimental.

## Wave E — messaging concept tests

### E1 Telegram Candidate
No conectar todavía.
Simular input/output exacto de Telegram usando nuestra UI:
voice/text -> intent -> tool -> confirmation -> response.
Si realmente nos gusta, recién ahí crear bot.

### E2 WhatsApp Candidate
Misma simulación.
Sólo avanzar a Meta/WhatsApp API si Telegram no cubre el caso o necesitamos hablar con terceros.

## Wave F — media

### F1 STT Shootout
Mismo audio corto -> Groq Whisper (cuando podamos ejecutar con token) vs alternativas disponibles.
Medir WER subjetivo, nombres propios, puntuación y latencia.

### F2 Zero-Cost Promo
Screenshots + texto + TTS + FFmpeg GitHub Action -> video corto.
Sin Runway.

### F3 Image Variation Lab
Mismo brief visual -> 4 variantes -> crítico visual -> selección.
No integrar assets aún.

## Regla de promoción
Un experimento sólo pasa a CANDIDATE si:
- produjo salida real;
- guardó evidencia;
- tiene costo/cuota conocida;
- la experiencia resultó útil;
- no necesita infraestructura desproporcionada.

Nada pasa a Prometeo desde este laboratorio hasta recibir el prompt de migración del otro chat.
