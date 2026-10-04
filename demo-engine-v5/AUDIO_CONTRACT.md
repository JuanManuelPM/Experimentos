# Audio Contract V5

Audio follows engine events. It does not drive timing.

## Current event vocabulary

- click feedback → compact click transient
- wheel tick → coalesced soft tick
- drag completion → drop transient
- resize completion → short low UI tone
- timeout/assert failure → warning tone
- run complete → two-note success
- annotation completion → subtle mark tone
- narration text → optional game-like text blips

## Rules

- No action may become ambiguous when muted.
- Repeated sounds are coalesced.
- Text voice is synthetic feedback, not speech or TTS.
- AudioContext is activated only after a human gesture.
- Timing variation is seeded through the engine where possible.
- Future profiles may change timbre without changing semantic events.
