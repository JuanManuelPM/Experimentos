# Demo Engine V6 — Showcase & Viewport Authority

V6 is a focused experience pass over V5.

## Changes

- Autoplay owns the demo viewport. Human wheel/touch/scroll keys cannot alter geometry while a scene is running.
- Real cursor is hidden only over the demo stage while autoplay owns it.
- Programmatic page/local scroll continues to work.
- Authority is released when the scene ends, stops, or hands control to the user.
- Adds a faster `SHOWCASE` motion preset.
- Narration reveal is much faster.
- Text-voice audio is substantially quieter and sparser.
- Form typing is faster.
- Window Lab V3 presents the engine as short chapters and supports NEXT ANIMATION.

## Invariant

During ENGINE authority, human input must not be able to alter the geometry used by the Director.
