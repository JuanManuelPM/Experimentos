# WORKER LAB · Isolated Sandbox V1

Worker Lab is a zero-cost, mobile-first worker-scheduler laboratory isolated from Prometeo production.

## Verifiable contract

- Separate repository surface: `JuanManuelPM/Experimentos/worker-lab/`. No changes to `JuanManuelPM/prometeo`, Prometeo Supabase, Work Graph, Worker Bus, Guides, Current Tree, or production surfaces.
- One engine for all experiments: `Experiment → Graph → Jobs → Scheduler → Workers → Provider Adapter → Result → Verification → State transition`.
- Explicit DEMO / LIVE / MIXED modes. DEMO runs now. LIVE and MIXED remain disabled until a real backend provider binding exists.
- MockProvider supports success, bad answer, slow answer, timeout, rate limit, worker crash, verifier reject, retry, and stale worker behavior.
- Job states: BLOCKED, READY, ACTIVE, VERIFY, DONE, FAILED, RETRY.
- Dependency gating: BLOCKED becomes READY only when every dependency is verified DONE.
- Ten experiments use the same scheduler: Exam Chain, Parallel Questions, Research→Synthesis, Builder→Verifier, Failure/Recovery, Rate Limit, 100 Task Grid, Model Tournament, Mixed Providers, Universal Worker.
- Gold benchmark levels L0–L6 are represented in Model Tournament and job detail.
- Provider adapter contract is visible as listModels(), health(), run(), usage(), rateLimitState().
- Connection Center never stores secrets in client code. CONNECTED is reserved for a future real backend health test.
- Mobile surfaces: LAB, EXPERIMENTS, WORKERS, TASKS, PROVIDERS, CONNECT, RESULTS, LOG.
- Every job exposes prompt, dependencies, worker, provider, model, answer, verification, latency, errors and events.
- Static build, no API key and no external runtime dependency in DEMO.

## Local verification already performed before publication

A separate source build was smoke-tested locally across all ten experiment graph definitions. Tests covered dependency integrity, Research→Synthesis unlocking, retry/stale/verifier-reject paths, the 100-task grid shape, and DEMO/LIVE execution gating.

## Security boundary for future real providers

Provider secrets must remain server-side. The future backend should implement the same provider-adapter API, so replacing MockProvider with Groq, Mistral, Gemini, Cerebras, Cloudflare Workers AI, OpenRouter, or a local/OpenAI-compatible endpoint does not change the scheduler or experiment definitions.
