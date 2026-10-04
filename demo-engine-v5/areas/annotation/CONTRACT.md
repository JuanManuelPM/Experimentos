# Contract — annotation

- Laser/stroke is annotation ink only.
- Pointer and stroke share a single animation clock while the mark is being drawn.
- The visible tip of the stroke must coincide with the pointer hotspot during drawing.
- **After commit, the mark belongs to world/content coordinates, not pointer coordinates and not viewport coordinates.**
- Pointer movement after drawing must never drag, translate or rebase the finished mark.
- A committed mark keeps its own lifetime and fades independently.
- Page scroll moves the mark together with the content it annotates.
- Cancel/reset removes outstanding marks and their retirement timers.
