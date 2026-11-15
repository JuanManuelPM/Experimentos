# VALIDATION LOG · 2026-11-15
- Source: `preflight-engine.mjs` fetched from this GitHub branch; 11 unit cases run successfully in Code Mode V8 from exact test source. A different Node process executing `npm test` is **not verified** yet.
- `scene-source-lint.mjs`: 6 unit cases run successfully in Code Mode V8; actual `../psx-night-drive/film.mjs` inspected, 3 BLOCK signatures + 3 REVIEW signatures in `night-drive.source-lint.receipt.json`.
- `night-drive.audit.json`: recorded user-supplied screenshot observations and source inspection (images not persisted here), forward axis numeric measurement unknown, not fabricated.
- Current report `night-drive.receipt.json`: **1 PASS / 8 FAIL / 3 UNVERIFIED**, state STOP_PREPRODUCTION. The 3 unknown: camera full-shot visual checks, complete WebGL playback, and Android performance.
- Public deployment verified by external source extraction, latest output shows **1 / 8 / 3** and FAIL PREPRODUCTION.
- Chromium interactive Firecrawl tool was unavailable due to connected service credits; no new on-device test or visual render was executed by this work cycle.
- The actual film `../psx-night-drive/` remains unchanged. No ART_APPROVED.
- State of work: reusable checker and dashboard **implemented**, artistic corrections to film **not attempted in this branch**. See private studio `factory/preproduction-gate-v1/NEXT_WORK.md` for subsequent work.

Reference engineering sources: https://threejs.org/docs/pages/GLTFLoader.html and https://github.com/creativelifeform/three-nebula .
