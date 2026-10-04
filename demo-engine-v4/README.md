# Demo Engine V4 — Motion Director

Demo Engine V4 is a reusable browser demo-performance engine. It is not tied to Kindle, Prometeo, cats, or any one product. A product exposes semantic targets; the engine performs and explains actions on them.

## Public entrypoints

- Public Showcase: `https://juanmanuelpm.github.io/Experimentos/demo-engine-v4/`
- Source Lab: `https://juanmanuelpm.github.io/Experimentos/demo-engine-v4/lab.html`

## Architecture in one line

`SCRIPT → DIRECTOR → TARGET STRATEGY → POINTER / INTERACTION / NARRATIVE → OBSERVER`

The Director expands visible actions into:

`ORIENT → TRAVEL → SETTLE → ACT → OBSERVE`

## V4 motion changes

- Hotspot continuity while switching pointer modes.
- Semantic targeting for buttons, text entry, checkboxes, scroll areas, handles, and resize edges.
- Local motion guides (`laser`, `arrow`, `ghost`) for long travel when they improve comprehension.
- Three-phase click feedback located at the actual pointer hotspot.
- Scroll with local directional evidence instead of unexplained autonomous page movement.
- Drag physically binds the moved object to the pointer for the whole travel phase.
- Resize physically binds the resized edge to the pointer and may show dimensions locally.
- `LOOK` creates an intentional observation hold without clicking.
- `TRACE` leaves a temporary path so the region being explained remains legible.
- Camera focus uses `requestAnimationFrame` and must degrade locally rather than aborting the run.
- Showcase hides raw receipts; Debug groups events by step.

## File map

- `index.html` — public Showcase build.
- `lab.html` — source-oriented Lab shell.
- `styles.css` — source Lab styles.
- `lab.js` — source Lab behavior.
- `demo-engine-v4.js` — CURRENT Motion Director layer.
- `demo-engine-v3-base.js` — inherited primitive/runtime base.
- `example-script.json` — semantic example run.
- `script-schema.json` — script shape.
- `capabilities.json` — capability inventory.
- `pointer-manifest.json` — pointer modes, assets, hotspots.
- `pointer-assets.js` — embedded cursor data URIs for public/source Lab portability.
- `gesture-assets.js` — embedded transformed gesture data URIs.
- `MOTION_REFERENCE_CONTRACT_V4.json` — visible motion principles.
- `MOTION_QUALITY_GATE_V4.json` — quality rejection checks.
- `CURRENT.json` — authoritative continuation state.
- `START_HERE.md` — first file another chat should read.
- `ENGINE_ARCHITECTURE.md` — subsystem responsibilities.
- `CONTINUATION_PROTOCOL.md` — handoff rules.
- `CHANGELOG.md` — durable changes.
- `PUBLISH_RECEIPT.md` — publication receipt.

## Extension rule

Prefer adding a semantic behavior to the Director over making every script author manually reproduce micro-timing. Scripts should describe intent; the engine should own performance quality.

## Quality rule

Hide Debug and record the Showcase. If a viewer cannot tell what action is happening from the product area alone, the primitive or Director recipe fails even if the logs say it succeeded.
