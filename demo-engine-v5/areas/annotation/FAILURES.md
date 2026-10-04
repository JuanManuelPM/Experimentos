# Failures — annotation

- MARK-001 · box/trace could draw out of time with the pointer.
  - V5/V6: pointer and ink use one frame clock while drawing.
- MARK-002 · laser was used as decoration for ordinary navigation.
  - V5/V6: navigation guides are disabled; laser is annotation-only.
- MARK-003 · **HIGH**: a completed mark lived in viewport overlay coordinates, so after pointer/page movement it could appear floating away from the content it described.
  - V6 candidate fix: annotations are committed into a world-anchored SVG surface, detached from pointer movement, keep an independent lifetime, then fade in place.

Human visual regression review is still required.
