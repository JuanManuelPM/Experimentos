# UNIVERSAL BUILD + DEMO PROTOCOL V1

**Status:** CURRENT  
**Purpose:** Universal local-first workflow for creating or improving pages and leaving them fully validated and demo-ready before publication.

## Core law

> Every promised capability must have a planned proof before implementation and an executable proof before publication.

> GitHub receives validated artifacts, not development iterations.

The demo is **designed at the beginning**, **compiled at the end**, and used as the acceptance proof for the page.

---

# 0. OPERATING MODE

When the user asks to create or improve a page:

1. Work **locally first**.
2. Do not use GitHub as the development loop.
3. Do not publish partial attempts.
4. Create the proof/demo plan before implementation.
5. Build and verify the page locally.
6. Compile the demo against the real finished page.
7. Verify the demo locally.
8. Produce a local acceptance receipt.
9. Leave a publish packet ready.
10. Publish only when publication is explicitly requested or already part of the task.

If publication is requested from the start, the protocol still completes all local stages first and publishes only the accepted artifact.

---

# 1. DEFINE — OBJECTIVE + PROOF CONTRACT

Before changing code, define:
- what is being created or improved;
- what the user should be able to do;
- what visible result proves each capability works;
- how each capability could be demonstrated later.

Create:
```text
OBJECTIVE.md
proof/DEMO_PLAN.json
```

Each promised capability receives a stable ID and a matching proof:
```text
FEATURE-01 → PROOF-01
FEATURE-02 → PROOF-02
FEATURE-03 → PROOF-03
```

At this stage the demo is only a **proof design**. Do not animate anything yet.

### Gate
Do not proceed until every important feature has an observable proof.

---

# 2. PLAN — IMPLEMENTATION CONTRACT

Prefer semantic targets and observable states.

Good:
```text
settings.save
reply.input
task.drop
settings.saved
```

Bad:
```text
x=428 y=613
third button from the left
wait 800ms
```

Create:
```text
BUILD_PLAN.md
proof/PAGE_CONTRACT.json
```

Plan semantic IDs, expected actions, observable results, scroll containers, dialogs, tabs, draggable objects, resize handles, loading/success/error states, responsive requirements and accessibility semantics.

### Gate
Every proof from Stage 1 must be implementable without fragile screen coordinates or arbitrary timing.

---

# 3. BUILD LOCAL

Implement locally in `src/`.

Rules:
- iterate freely;
- do not publish intermediate versions;
- keep the page functional without the demo engine;
- expose semantic IDs and observable states as planned;
- preserve user-facing behavior independently of animation.

A pretty demo cannot compensate for a broken page.

---

# 4. FUNCTIONAL LOCAL VERIFY

Verify the page itself before producing the demo.

Check loading, buttons, links, forms, typing, selects, sliders, toggles, dialogs, scrolling, drag/drop, resize, success/error states, responsive behavior and reload/reset behavior.

Create:
```text
validation/FUNCTIONAL_REPORT.json
```

### Gate
`FUNCTIONAL_REPORT.status` must be `PASS`.

---

# 5. INSPECT — PAGE MANIFEST

Inspect the finished local page and create:
```text
proof/PAGE_MANIFEST.json
```

The manifest should expose what can be demonstrated: sections, buttons, links, inputs, selects, sliders, toggles, scroll regions, dialogs, tabs, draggable objects, drop targets, resize handles and observable states.

### Gate
Every target required by `DEMO_PLAN.json` must exist in the real page manifest.

---

# 6. COMPILE DEMO LOCAL

Convert the original proof plan into an executable demo recipe against the real finished page.

Create:
```text
demo/recipe.json
demo/profile.json
```

The recipe describes **intent**, not choreography.

Example:
```json
{
  "demo": "Save a preference",
  "preset": "SHOWCASE",
  "steps": [
    {"show": "settings.mode"},
    {"set": {"target": "settings.mode", "value": "Teach"}},
    {"activate": "settings.save"},
    {"showResult": "settings.saved"}
  ]
}
```

The Director owns pointer motion, scroll, target measurement, camera, annotation, waits, pacing, audio and result observation.

Keep presentation separate from proof content.

---

# 7. DEMO RUNTIME RULES

## Viewport
During autoplay:
```text
owner = ENGINE
```

For an offscreen target:
```text
detect target
→ find scroll container
→ scroll
→ settle
→ recalculate geometry
→ move pointer
→ act
```

Never act using coordinates measured before a scroll.

## Pointer
Normal navigation does not use laser.

```text
END_POSITION(N) = START_POSITION(N+1)
```
unless there is an explicit cut.

## Annotation
Laser/stroke is only for intentional marking:
```text
underline
box
circle
arrow
trace
free path
```

While drawing:
```text
pointer + ink = one animation clock
```

After commit:
```text
mark belongs to world/content
pointer becomes independent
mark keeps its own lifetime
mark fades independently
```

## Camera
Focus:
```text
point/reveal
→ adaptive pan + zoom
→ observe
→ return
```

No laser for normal focus.

## Audio
Audio is event-driven and optional. Mute must preserve meaning. Text voice is not TTS.

---

# 8. DEMO LOCAL VERIFY

Run the complete demo locally and create:
```text
validation/DEMO_REPORT.json
```

Verify:
- all proof targets found;
- no viewport authority violation;
- no pointer clipping or accidental teleport;
- no stale pre-scroll geometry;
- annotation pointer/stroke sync;
- committed annotations remain world-anchored;
- camera target remains readable;
- comments do not cover target;
- no wait timeout;
- audio can be muted;
- demo remains understandable muted.

Test relevant viewports:
```text
desktop wide
desktop narrow
mobile portrait
```

### Fundamental quality rule
> If the action cannot be understood with Debug hidden, the primitive or demo fails.

### Gate
`DEMO_REPORT.status` must be `PASS`.

---

# 9. LOCAL ACCEPTANCE

Create:
```text
validation/LOCAL_ACCEPTANCE.json
```

It combines product and demo verification and must end in:
```text
READY_TO_PUBLISH
```

No publish packet is produced unless local acceptance passes.

---

# 10. PREPARE PUBLISH PACKET

Create:
```text
publish/PUBLISH_PACKET.json
```

Include artifact/version, source files, demo files, reports, known limitations, target branch/path, expected public URL and local acceptance receipt.

At this point the work is ready even if the user does not want to publish yet.

---

# 11. PUBLISH ONCE

Only after local acceptance:
```text
validated local artifact
→ single coherent promotion
→ GitHub / hosting
```

Do not use the published repository as the development loop.

Prefer:
```text
edit local
verify local
accept local
publish coherent version
```

---

# 12. POST-PUBLISH SMOKE

Verify only:
- URL loads;
- expected version is served;
- assets resolve;
- page initializes;
- demo initializes;
- one representative proof works.

Create:
```text
validation/PUBLISH_SMOKE.json
```

If smoke fails, return to local, fix locally, rerun affected gates and republish a new accepted packet.

---

# 13. REQUIRED PROJECT SHAPE

```text
project/
├── OBJECTIVE.md
├── BUILD_PLAN.md
├── proof/
│   ├── DEMO_PLAN.json
│   ├── PAGE_CONTRACT.json
│   └── PAGE_MANIFEST.json
├── src/
├── demo/
│   ├── recipe.json
│   └── profile.json
├── validation/
│   ├── FUNCTIONAL_REPORT.json
│   ├── DEMO_REPORT.json
│   ├── LOCAL_ACCEPTANCE.json
│   └── PUBLISH_SMOKE.json
└── publish/
    └── PUBLISH_PACKET.json
```

---

# 14. FAILURE / IMPROVEMENT LOOP

A human criticism must become:
```text
FAILURE ID
Observed
Expected
Severity
Area
Regression test
Status
```

Then:
```text
criticism
→ failure
→ isolated fix
→ local regression
→ human review
→ promote
```

---

# 15. DEFAULT INSTRUCTION FOR A NEW CHAT / AGENT

> Follow `UNIVERSAL_BUILD_DEMO_PROTOCOL_V1`.
>
> Work local-first. Start by defining the objective and proof contract before modifying the page. Plan semantic targets and observable states, implement locally, verify the page locally, inspect the finished page into a manifest, compile the demo from the original proof plan, verify the demo locally, and produce `LOCAL_ACCEPTANCE.json` plus `PUBLISH_PACKET.json`.
>
> Do not publish intermediate development attempts. Do not use fixed screen coordinates when semantic targets are possible. Do not treat the demo as decoration: every promised capability must have an executable proof. Leave the complete accepted artifact ready locally. Publish only if publication is part of the request.

---

# 16. SHORT COMMAND INTERPRETATION

If the user says:
```text
"Mejorá esta página siguiendo el protocolo."
```

Interpret it as:
```text
DEFINE
→ PLAN
→ BUILD LOCAL
→ VERIFY PAGE
→ INSPECT
→ COMPILE DEMO
→ VERIFY DEMO
→ LOCAL ACCEPTANCE
→ PREPARE PUBLISH PACKET
```

If the user also says:
```text
"y publicala"
```

append:
```text
→ PUBLISH ONCE
→ POST-PUBLISH SMOKE
```

---

# MACHETE

**DEFINE + PROOF → PLAN → BUILD LOCAL → VERIFY PAGE → MANIFEST → COMPILE DEMO → VERIFY DEMO → LOCAL ACCEPTANCE → PUBLISH PACKET → [PUBLISH] → SMOKE**

The demo is planned first, generated last, and acts as the executable proof that the page fulfills what was promised.
