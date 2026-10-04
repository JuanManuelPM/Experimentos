# Demo Engine V6 — Showcase & Viewport Authority

V6 is the current experience pass over V5.

## Core rules

- Autoplay owns the demo viewport.
- Human wheel/touch/scroll keys cannot alter geometry while a run is active.
- Real cursor is hidden only over the demo stage during autoplay.
- Programmatic page/local scroll remains available to the Director.
- Normal navigation never uses laser.
- **Annotation is a two-phase object:**
  1. while drawing, pointer + ink share one frame clock;
  2. after commit, the mark belongs to the content/world and has no spatial dependency on the pointer.
- A committed annotation scrolls with its target content, remains briefly, and fades independently.
- Camera focus uses adaptive pan + zoom without laser.
- Text narration is fast and its synthetic voice is quiet/sparse.
- Public demo controls stay intentionally minimal: **DEMO** and **CANCELAR**.

## Invariant

During ENGINE authority, human input must not alter the geometry used by the Director.
After an annotation is committed, pointer motion must not alter the annotation geometry.
