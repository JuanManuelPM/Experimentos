# Demo Engine V5 — Production System

V5 changes the authoring model from **primitive choreography** to **semantic production**.

A demo author should normally specify:
- what to show,
- what to activate,
- what text to enter,
- what result to reveal,
- and the presentation preset.

The engine owns scroll, targeting, pointer motion, camera, annotation timing, audio, waits and observation pacing.

## Pipeline

`PAGE INSPECTOR → PAGE MANIFEST → RECIPE → DIRECTOR → VIEWPORT / POINTER / CAMERA / ANNOTATION / AUDIO → OBSERVER → QUALITY`

## Important V5 rules

1. Normal navigation never uses laser/trails.
2. Laser/stroke is annotation ink only.
3. Annotation cursor and stroke share one requestAnimationFrame timeline.
4. Offscreen targets trigger viewport scroll first, geometry is recalculated after scroll, then pointer moves.
5. Page scroll and local scroll are separate.
6. Camera focus is adaptive to target size and pans as well as zooms.
7. Audio is event-driven. Scripts do not schedule click.wav by timeout.
8. Audio is optional; demos remain understandable muted.
9. Recipes describe intent, not coordinates or animation milliseconds.
10. V4 remains preserved as the previous runtime fossil.

## High-level recipe

```json
{
  "demo":"Reply to email",
  "preset":"TEACH",
  "steps":[
    {"show":"mail.reply","say":"Primero abrimos la respuesta."},
    {"activate":"mail.reply"},
    {"enter":{"target":"reply.input","text":"Perfecto, gracias."}},
    {"activate":"reply.send"},
    {"showResult":"reply.sent"}
  ]
}
```

## Modules

- `page-inspector.js`: discovers targets/actions and emits a page manifest.
- `recipe.js`: compiles high-level recipes.
- `viewport.js`: ensures offscreen targets become visible before interaction.
- `annotation.js`: underline/box/circle/arrow with pointer/stroke lockstep.
- `camera.js`: adaptive pan + zoom.
- `audio.js`: event-driven WebAudio + text-voice blips.
- `demo-engine-v5.js`: integration layer.
