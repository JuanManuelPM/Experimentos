# Demo Engine V4 architecture

## Pipeline

`SCRIPT → DIRECTOR → TARGET STRATEGY → PERFORMERS → OBSERVER`

### SCRIPT
Declares semantic intent and targets. It should not encode screen coordinates or hand-tuned animation frames.

### DIRECTOR
Owns pacing and compiles actions into `ORIENT → TRAVEL → SETTLE → ACT → OBSERVE`. It decides whether a motion guide helps, how long the viewer needs to see a result, and when to use a local fallback.

### TARGET STRATEGY
Resolves where a human would actually aim: button comfort point, text-entry point, checkbox box, resize edge, drag handle, scrollable region, or explicit custom hotspot. It must not blindly use element center.

### POINTER SYSTEM
Uses registered assets and explicit hotspots. Pointer mode changes must preserve the semantic hotspot so arrow→hand or arrow→resize never looks like a teleport.

### INTERACTION SYSTEM
Click, hover, type, scroll, drag, resize, move, scale, rotate, keyboard and related primitives. During drag/resize, visual causality must remain frame-linked to the pointer.

### NARRATIVE SYSTEM
Narrator, pointer comments, gestures, LOOK, TRACE, comparison and local focus. Narrative overlays must explain rather than compete with the product.

### SPATIAL EVIDENCE
Long travel may draw a temporary guide. Scroll shows direction locally. TRACE leaves a temporary perimeter/path. These are evidence, not decoration.

### OBSERVER
Waits for conditions, assertions and results, then emits grouped receipts. Observer data is infrastructure and belongs in Debug, not Showcase.

## Failure model

A single unsupported visual primitive should degrade locally, emit a receipt, and continue when safe. A cosmetic failure must not terminate the entire semantic run.

## Continuity invariant

For normal actions, the previous visible hotspot is the next motion's origin. Scene cuts must be explicit. There should be no accidental hybrid between animated travel and teleport.
