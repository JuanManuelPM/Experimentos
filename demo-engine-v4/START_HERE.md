# START HERE — Demo Engine V4

**CURRENT public engine:** `DEMO_ENGINE_V4`

**Public target:** `https://juanmanuelpm.github.io/Experimentos/demo-engine-v4/`

This folder is intentionally chat-agnostic. A new chat should be able to continue by reading this file plus `CURRENT.json`, without reconstructing the history from conversation transcripts.

## Read in this order

1. `CURRENT.json` — authoritative checkpoint: status, focus, known limitations, exact next action.
2. `MOTION_REFERENCE_CONTRACT_V4.json` — what motion must communicate.
3. `MOTION_QUALITY_GATE_V4.json` — what must fail before promotion.
4. `ENGINE_ARCHITECTURE.md` — subsystem boundaries.
5. `README.md` — file map, local run, extension rules.
6. `example-script.json` — current semantic demo script.
7. `pointer-manifest.json` — pointer assets and hotspot contract.

## Current design law

A demo must remain understandable with DEBUG hidden. If the viewer needs receipts/logs to know whether an action is click, drag, scroll, trace, resize, or camera focus, the motion layer has failed.

Every visible action is compiled by the Director as:

`ORIENT → TRAVEL → SETTLE → ACT → OBSERVE`

## Do not regress

- Do not use fixed screen coordinates for semantic targets.
- Do not invent replacement cursor drawings when a registered pointer asset exists.
- Do not place click feedback at element center; place it at the pointer hotspot.
- Do not let drag/resize visually detach from the pointer.
- Do not show raw receipts in Showcase.
- Do not add effects that do not explain direction, causality, state, or result.
- Do not let one primitive crash the entire run; degrade locally and record a receipt.

## Exact next work

1. Human-review the public Showcase by recording it, not by reading DEBUG.
2. Inspect motion frame-by-frame.
3. Fix any remaining continuity, pacing, or visibility failures before adding new primitives.
4. Then connect V4 to the Visual Factory A/B/C/D batch so all candidates share one semantic script.

## Promotion

V4 is CURRENT for the demo engine, but visual/motion quality still requires human review. Preserve prior versions as fossils; do not silently overwrite their behavior.
