"""AGUA EN MOVIMIENTO | break slice editor / provenance-aware original rhythms.

This does not manipulate a third-party break recording. It generates a
deterministic event list referring exclusively to sounds synthesized in render.py.
"""
import random

SOURCES = {
    "kick": {"id": "ae-kick-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "snare": {"id": "ae-snare-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "ghost": {"id": "ae-ghost-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "hat": {"id": "ae-hat-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "ride": {"id": "ae-ride-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "perc": {"id": "ae-perc-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
}

def vary_break(level: int, bar: int, seed: int = 220426):
    """Three intensity settings 0/1/2; individual timing/velocity per hit.

    Returns step (sixteenth position 0..15), velocity, offset_ms, provenance.
    Changing one hit never re-quantizes other instruments. A fill is a real
    event mutation; this is not one sample loop with different BPM.
    """
    if level not in (0, 1, 2):
        raise ValueError("level must be 0, 1 or 2")
    r = random.Random(seed + 1009 * bar + 863 * level)
    hits = []
    def put(kind, step, velocity, shift=0.0):
        jitter = r.uniform(-2.0, 2.0) if kind not in ("kick", "snare") else 0.0
        swing = 10.8 if step % 2 else 0.0
        hits.append({
            "kind": kind, "step": step,
            "velocity": round(float(velocity), 4),
            "offset_ms": round(float(swing + shift + jitter), 3),
            "sourceId": SOURCES[kind]["id"],
            "origin": SOURCES[kind]["origin"],
            "license": SOURCES[kind]["license"]
        })
    kick_positions = ([0, 10] if level == 0 else
                      [0, 7, 10] if level == 1 else [0, 6, 10, 14])
    if bar % 8 == 7:
        kick_positions = [0, 7, 10, 13] if level == 2 else [0, 10]
    for step in kick_positions:
        put("kick", step, .93 if step == 0 else (.74 if step == 10 else .52))
    for step in (4, 12):
        put("snare", step, .87 if step == 4 else .91)
    if bar % 4:
        put("ghost", 3 if level >= 1 else 11, .18 + r.random() * .09, -6)
    if level >= 1:
        put("ghost", 11, .27)
        if bar % 4 > 1: put("ghost", 15, .23)
    if level == 2:
        put("ghost", 7, .37)
        if bar % 2: put("ghost", 1, .22)
    for step in range(0, 16, 2):
        if level == 0 and step in (6, 14) and bar % 2 == 0: continue
        put("hat", step, (.24 if step % 4 == 2 else .15) + r.uniform(-.03, .03))
    if level >= 1:
        for step in (3, 7, 11, 15):
            if r.random() > (.66 if level == 1 else .32):
                put("hat", step, .10)
    if level == 2 and bar % 2 == 0:
        for step in (2, 6, 10, 14): put("ride", step, .15)
    if bar % 8 == 7:
        for step in ((13, 14, 15) if level == 2 else (14, 15)):
            put("ghost", step, .3 + .09 * (step - 13))
    if bar % 16 == 15: put("perc", 15, .37)
    return sorted(hits, key=lambda h: h["step"] + h["offset_ms"] / 100)

if __name__ == "__main__":
    from collections import Counter
    for intensity in (0, 1, 2):
        events = vary_break(intensity, 15)
        assert all(e["sourceId"] in [s["id"] for s in SOURCES.values()] for e in events)
        print(intensity, Counter(e["kind"] for e in events), len(events))
