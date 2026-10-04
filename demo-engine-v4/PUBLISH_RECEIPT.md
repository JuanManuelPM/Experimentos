# Publish Receipt — Demo Engine V4

## Publication

- Repository: `JuanManuelPM/Experimentos`
- Branch: `gh-pages`
- Public path: `demo-engine-v4/`
- Intended Pages URL: `https://juanmanuelpm.github.io/Experimentos/demo-engine-v4/`
- Observed branch head immediately before this receipt: `0eca30814b9b58911f38eef9958bab2931ab85bd`
- Date: 2026-10-04

## Published source

The public folder contains the V4 runtime, V3 inherited base, lab controller, embedded pointer and gesture assets, styles, example script, capability/schema metadata, durable continuation state, architecture documentation, motion contracts/gates, provenance and GPL license text.

## Verification performed

- Confirmed the required public files exist on `gh-pages`.
- Parsed the public JavaScript source through the JavaScript parser used in the publishing session:
  - `demo-engine-v3-base.js` — syntax pass.
  - `demo-engine-v4.js` — syntax pass.
  - `lab.js` — syntax pass.
  - `pointer-assets.js` — syntax pass.
  - `gesture-assets.js` — syntax pass.
- Confirmed the public entrypoint references files that are present in the same folder.
- Documentation makes `START_HERE.md → CURRENT.json` the continuation path for a fresh chat/session.

## Not claimed

This receipt does **not** claim browser end-to-end visual verification of the GitHub Pages render from the build environment. The environment could not independently reach the Pages host reliably. Human review of the real public run remains the next quality step.

## Continuation

A fresh chat should start at `START_HERE.md`, then read `CURRENT.json`, the V4 motion contract/gate and architecture before editing.

The exact next action remains: record the public Showcase, inspect it frame-by-frame with Debug hidden, repair any remaining motion failures, then integrate the engine into the Visual Factory A/B/C/D batch.
