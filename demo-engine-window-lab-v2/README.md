# Window Lab V2

Public fixture for Demo Engine V5.

It deliberately contains:
- a local scroll region,
- targets below the page fold,
- forms and controls,
- drag/drop,
- resize,
- annotation target,
- adaptive camera targets.

The demo is authored through a semantic recipe rather than manual primitive choreography.

## What V2 is supposed to prove

1. Offscreen page targets cause page scroll before pointer travel.
2. Nested/local scroll is handled separately.
3. Navigation uses no laser.
4. Laser appears only when drawing an annotation.
5. Annotation stroke and pointer share one frame clock.
6. Focus uses adaptive pan + zoom.
7. Audio follows engine events.
8. Narration can use game-like synthetic text blips.
9. Mute does not remove semantic information.
10. Page Inspector can emit the available target/action manifest.
