# Continuation Protocol — Demo Engine V4

Use this when another chat, worker, or future session continues the engine.

## Bootstrap

1. Read `START_HERE.md`.
2. Read `CURRENT.json`.
3. Read both V4 motion contracts/gates.
4. Inspect `example-script.json` and the current public Showcase.
5. Do not plan changes until you can state the current design law and exact next action from `CURRENT.json`.

## Before editing

- Preserve semantic IDs and target strategies unless a migration is explicit.
- Preserve Bibata asset provenance and license files.
- Keep Showcase and Debug separate.
- Keep prior public versions/fossils intact unless explicitly asked to replace them.

## After editing

- Validate JavaScript syntax.
- Validate JSON documents.
- Run/inspect the public or local Showcase with Debug hidden.
- Record what changed in `CHANGELOG.md`.
- Update `CURRENT.json` only when the authoritative state really changed.
- Update `PUBLISH_RECEIPT.md` after public publication.

## Handoff minimum

A handoff is incomplete unless it states:

- public URL or local artifact,
- engine version,
- files changed,
- gates/contracts used,
- known failures,
- exact next action.
