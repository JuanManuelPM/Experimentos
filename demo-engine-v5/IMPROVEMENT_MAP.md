# Improvement Map

Each area can be improved independently. Human criticism should be recorded in the matching area's `FAILURES.md`, then turned into a regression test.

| Area | Current focus |
|---|---|
| viewport | page/local scroll, offscreen targets, geometry refresh |
| pointer-motion | clean travel without laser, continuity |
| annotation | underline/box/circle/arrow, lockstep ink |
| camera | adaptive zoom + pan |
| targeting | semantic aim points |
| interaction | click/type/drag/resize/control manipulation |
| pacing | orient/travel/settle/act/observe |
| audio | click/UI sounds, text voice, coalescing |
| narrative | captions, pointer comments, gestures |
| authoring | page manifest, recipe compiler, presets |
| observer | receipts, failures, deterministic reports |
| quality | regression gates and preview matrix |

## Workflow

`criticism → area failure → isolated experiment → candidate → human review → champion → regression test`

Do not change several areas merely because one visual problem is annoying.
