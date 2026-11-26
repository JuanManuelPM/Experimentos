# Character & World · studio-3d
**CANDIDATE 0.2.1** — three connected first articles, not full V15–V17 and not published in Pages. Serve this branch checkout from a static HTTP server, retaining the existing repository paths; open `v15.html`, `v16.html`, `v17.html` in this folder. CDN Three.js r170 import map. A compatible WebGL browser is required.

- V15: actual rig and rest UV/barycentric pigment anchors, 6 presets + recipe `recipes/07-tomas.json`, nose/brow controls, gallery and export/import code. No true nostril cavity or final art review.
- V16: 24 procedural clips, shared actor, 19-second cup action with CCD, editable chair/cup, out-of-reach status. No full eight-action semantic API; no contact or visual certification.
- V17: 58-second Buenos Aires café first slice, two actors, five camera presets, editable timeline; approximate facial motion, no real voice. No street/vehicle scene.

`contract.mjs` exposes actorRecipe, faceRecipe, pigments, sampleAction, sampleScene and gate. `runtime.mjs` provides Actor(head, recipe), edit, applyMotion, clips, action, exportGLB, loadGLB, scene helpers. Units metres, +Y up, +Z forward; versioned JSON. Build the seventh actor using the same public constructor; this was tested by the producer only. Reuse existing body (Character System V2), face (IRIS V11.3, upstream Quaternius CC0 per source metadata), and ARC CHAIR. No imported third-party binary newly licensed or redistributed.

Latest CPU evidence: `CPU_RUNTIME_021.json`, 144/144 clip executions over 7698 frames, 24/24 cup point tests, 45 nasal configurations, seven constructed actors. Worst palm point residual 1.649 mm, not proof of finger contact. Older receipts intentionally preserved as historical evidence. `GATES.json` is the explicit incomplete gate ledger. No WebGL pixels, actual GLB roundtrip, Android, art score or independent reviewer. No prior source files or ACTIVE/ROOT modified.
