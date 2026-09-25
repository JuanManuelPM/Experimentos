# Worker Lab · Automation Project Backlog
Fecha: 2026-09-25
Repo: JuanManuelPM/Experimentos

Objetivo: coleccionar proyectos concretos inspirados en workflows reales de n8n, Cloudflare Workflows, MCP, Activepieces, Pipedream, voz/telefonía y agentes multi-herramienta.

Principio rector:
- Workflow = ejecución determinista, durable y observable.
- Agent/LLM = juicio, síntesis, routing y decisiones ambiguas.
- No usar AI donde una regla simple alcanza.
- Acciones externas importantes deben poder requerir confirmación humana.
- Priorizar herramientas gratuitas o free-tier.
- No confundir demos lindas con sistemas útiles.

## Tier A · construir primero

### 1. PROMETEO RELAY LAB
Entrada -> Worker A responde -> Worker B critica -> Worker C reescribe -> Verifier -> Final.
Stack: OpenRouter/Groq/Gemini/Mistral + Cloudflare Workflows + Supabase.
Objetivo: probar si una cadena de modelos gratuitos produce trabajo comparable a un chat fuerte.
Costo: muy bajo / free-tier.
Valor: máximo para el experimento actual.

### 2. PROMETEO PARALLEL PANEL
Una tarea -> 4 workers en paralelo -> juez -> síntesis.
Stack: pools de providers + Workflow engine.
Objetivo: diversidad, selección y consensus.
Medir: latencia, calidad, tokens, error rate, model actual.

### 3. TELEGRAM COMMAND CENTER
Bot personal en Telegram con texto y voz.
Puede:
- leer/resumir Gmail;
- consultar Calendar;
- crear recordatorios/tareas;
- consultar Drive;
- disparar workers;
- mostrar estado de Prometeo;
- pedir aprobación antes de acciones externas.
Stack: Telegram Bot API + Gemini/OpenRouter/Groq + Google tools + Supabase.
Costo: Telegram gratis; inference según free tiers.

### 4. VOICE CAPTURE -> ACTION
Enviar nota de voz desde Telegram.
Transcribir -> clasificar -> convertir en tarea/nota/evento/proyecto.
Stack: Telegram + STT + Gemini/Groq + Supabase/Drive.
Objetivo: reducir captura a hablar 10-30 segundos.

### 5. MORNING / EVENING BRIEF
Cada mañana:
Calendar + emails importantes + tareas + Prometeo + noticias elegidas.
Cada noche:
qué cambió + pendientes + mañana.
Entrega por Telegram.
Stack: scheduler + Gmail/Calendar/Prometeo + AI summary.
Costo muy bajo.

### 6. PROMETEO REMOTE CONTROL
Desde Telegram:
"estado"
"lanzá experimento X"
"mostrame workers activos"
"pausá Y"
"resumí resultados"
Stack: Telegram -> authenticated webhook -> Worker Lab / control plane.
Importante: acciones destructivas con confirmación.

### 7. AGENT TOOL FABRIC VIA MCP
Un endpoint MCP que exponga Gmail, Drive, Calendar, GitHub, Supabase y herramientas propias.
Permite que distintos agentes usen el mismo set de tools.
Stack: n8n/Activepieces/custom MCP.
Objetivo: desacoplar modelo de herramientas.

## Tier B · alto valor personal

### 8. EMAIL TRIAGE
Nuevo email -> clasificar:
urgente / responder / archivar / académico / pago / basura.
Generar borrador cuando corresponde.
Nunca enviar automáticamente sin regla/confirmación.
Stack: Gmail + LLM + labels/drafts.

### 9. ACADEMIC INBOX
Blackboard/email/material nuevo -> Drive -> extracción -> resumen -> preguntas de estudio -> Telegram.
Stack: Gmail/Drive + parser + AI + Telegram.
Objetivo: que material académico nuevo se convierta solo en algo estudiable.

### 10. AI TUTOR FACTORY
PDF/tema -> researcher -> explanation builder -> exam generator -> verifier -> practice set.
Stack: Drive + pools de models + workflow.
Puede elegir modelo diferente por etapa.

### 11. YOUTUBE / ARTICLE DIGEST
URL -> transcript/content -> resumen -> ideas -> guardar en Drive/Notion -> opcional quiz.
Stack: browser/search + transcript + AI + storage.
Ideal para aprender sin acumular pestañas muertas.

### 12. MEMORY INBOX
Todo lo que mandes por Telegram:
texto, foto, audio, link.
Router decide:
nota / tarea / evento / lectura / proyecto / persona / idea.
Después búsqueda semántica.
Stack: Telegram + storage/vector DB + AI.

### 13. EXPENSE CAPTURE
Foto/ticket/texto -> extraer monto/categoría -> Sheet/Supabase.
Resumen semanal.
No conectar banco inicialmente.
Stack: vision/OCR + Sheets/Supabase.

### 14. SMART REMINDERS
"No me recuerdes mañana; recordámelo cuando tenga sentido."
Agent decide ventana usando Calendar/contexto y workflow durable espera hasta entonces.
Stack: Cloudflare Workflows wait/sleep + Calendar + Telegram.

## Tier C · voz y teléfono

### 15. INBOUND VOICE ASSISTANT
Número de teléfono -> agente atiende -> conversa -> consulta Calendar/knowledge -> agenda -> resumen.
Stack típico observado: Twilio + Vapi/ElevenLabs + n8n/Workflow + Calendar.
Nota: telefonía casi nunca es $0 recurrente. Hacer sólo experimento barato.

### 16. OUTBOUND CALL AGENT
Trigger -> IA llama a un número autorizado -> conversación -> resultado estructurado.
Casos útiles:
- confirmar turno;
- pedir información;
- hacer una reserva donde esté permitido;
- llamar a un servicio propio/test.
Requiere consentimiento y control anti-spam.
Stack: Vapi/Retell/Twilio + workflow.

### 17. TELEPHONE CALLBACK BOT
Vos mandás por Telegram: "llamame".
Bot inicia una llamada contigo y mantenés una conversación por voz.
Usos:
- brainstorming caminando;
- dictar plan;
- tutor oral.
Menor riesgo que llamar a terceros.

## Tier D · comunicación y coordinación

### 18. MESSAGE DRAFT ROUTER
"Decile a X que..."
Busca contacto/contexto -> prepara mensaje -> pide confirmación -> manda por canal permitido.
Canales potenciales: Gmail, Telegram, Slack, WhatsApp Business.
Nunca spam masivo.

### 19. FOLLOW-UP ENGINE
Después de una interacción:
esperar N días -> verificar si hubo respuesta -> si no, preparar follow-up -> pedir aprobación.
Cloudflare Workflows es ideal por waits durables.

### 20. GROUP / CHANNEL SUMMARIZER
Recolectar mensajes autorizados de Slack/Telegram/email -> resumen de decisiones/pendientes -> enviar digest.
LLM sólo resume/prioriza; extracción y routing deterministas.

### 21. PERSONAL CRM
Personas + última conversación + promesas + próxima acción.
Puede decir:
"hace 3 semanas que no respondés a X"
"prometiste mandar Y".
Stack: Gmail/Calendar/Telegram + Supabase.

## Tier E · research / internet

### 22. RESEARCH SWARM
Pregunta -> 4 investigadores con fuentes distintas -> deduplicador -> crítico -> síntesis con evidencia.
Stack: search/browser + LLM pools + workflow.
Ideal para gastar providers distintos de forma inteligente.

### 23. CHANGE WATCH
Monitorear una URL/repositorio/precio/documentación.
Sólo avisar si hubo cambio material.
Stack: scheduler + fetch + diff + AI only for materiality.
Muy barato.

### 24. REDDIT / FORUM RADAR
Temas concretos -> nuevas discusiones -> deduplicar -> extraer patrones -> digest.
No vigilar "todo"; sólo dominios útiles.
Stack: web/RSS/API + summarizer.

### 25. GITHUB PROJECT WATCHER
Issues/PRs/commits -> clasificar -> resumen -> proponer acciones -> Telegram.
GitHub actions reales sólo tras confirmación cuando corresponda.

## Tier F · creative/content

### 26. CONTENT MULTIPLIER
Una nota/audio/video -> post largo -> hilo -> short script -> títulos -> imágenes/prompts.
No autopublicar por defecto.
Stack: transcription + multiple LLMs + Drive.

### 27. SHORTS FACTORY
Video largo -> detectar momentos -> clips -> captions -> metadata -> Drive.
Puede usar APIs multimedia externas, muchas no serán gratis.
Inspirado en pipelines n8n existentes.

### 28. PERSONAL PODCAST
Links/notas de la semana -> research -> guion -> TTS -> archivo/audio privado.
Puede servir para estudiar caminando.

## Tier G · meta automation

### 29. WORKFLOW FACTORY
Prompt:
"Quiero que cada mañana mire X, haga Y y me avise Z."
Agent genera un workflow JSON/candidate.
Otro verifier revisa seguridad y dependencias.
Humano aprueba -> deploy.
Inspirado en agentes que crean n8n workflows desde lenguaje natural.

### 30. SELF-HEALING WORKFLOW
Error -> clasificar -> retry -> cambiar provider -> degradar funcionalidad -> avisar sólo si sigue roto.
Cloudflare Workflows da checkpoints/retries durables.

### 31. QUOTA-AWARE ROUTER
Antes de cada job:
leer cuota/concurrencia/provider health -> elegir modelo barato disponible -> reservar cuota -> ejecutar.
Evita quemar OpenRouter 50/día en tareas inútiles.

### 32. MODEL MARKET
Cada modelo mantiene métricas reales por task family:
exámenes
crítica
síntesis
routing
verificación
código
research
El scheduler elige por calidad/costo/cuota, no por marca.

## Referencias observadas

- n8n Telegram assistants con Gmail/Calendar/Notion y voz.
- n8n multi-agent productivity assistants.
- WhatsApp + voice customer service con routing a subagentes.
- Vapi + Twilio + n8n para llamadas reales y booking.
- Gmail/Drive MCP servers.
- MCP bridges para Google Workspace.
- pipelines de YouTube Shorts.
- workflow factories generadas desde prompts.
- Cloudflare Workflows durable AI agents con retry/checkpoints/waitForEvent.
- Reddit: patrones repetidos de usar workflow para lógica determinista y AI sólo donde hace falta juicio.

## Recomendación de orden experimental

1. Prometeo Relay Lab
2. Telegram Command Center
3. Voice Capture -> Action
4. Morning/Evening Brief
5. Research Swarm
6. MCP Tool Fabric
7. Smart Reminders / Follow-up Engine
8. Telephone Callback Bot
9. Inbound voice agent
10. Workflow Factory

No empezar por llamadas a terceros ni pipelines enormes: primero probar el motor, tools y seguridad con Telegram y workflows internos.
