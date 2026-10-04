# Gesture assets — Demo Engine V4

## Provenance

The current gesture sprites in `../../gesture-assets.js` are local transformations of the gesture reference image supplied by the user during development.

The transformations remove the original montage background, preserve the gesture silhouette, add safe transparent margins and add contrast treatment so fingers are not clipped against the stage edge.

## Role

Gestures are **narrative events**, not pointer replacements.

Examples: wave, point, snap, approve, reject, stop, victory. They should appear only when they clarify the story.

## Rules

- Never keep a gesture permanently on screen.
- Always run safe-bound placement before showing it.
- Do not cover the active target or the pointer.
- Give the viewer enough enter/hold/exit time to understand it.
- Prefer a normal pointer action when the meaning is ordinary click, drag, resize or text entry.
- If this experiment is distributed beyond the user's own reference-driven workflow, review or replace gesture assets with an explicitly redistributable source.
