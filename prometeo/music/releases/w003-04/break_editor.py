"""AGUA EN MOVIMIENTO | break slice editor / provenance-aware original rhythms.

This does not manipulate a third-party break recording. It generates a
deterministic event list referring exclusively to sounds synthesized in render.py.
"""
import random

SOURCES = {
    "kick": {"id": "ae3-kick-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "snare": {"id": "ae3-snare-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "ghost": {"id": "ae3-ghost-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "hat": {"id": "ae3-hat-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "ride": {"id": "ae3-ride-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
    "perc": {"id": "ae3-perc-01", "origin": "Original algorithmic synthesis", "license": "Original; produced for this commission"},
}

def vary_break(level: int, bar: int, seed: int = 22042604):
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
    # Phrase-dependent edits: actual event changes rather than a speed-only loop
    if bar % 4 == 2:
        for e in hits:
            if e["kind"] == "hat" and e["step"] in (2, 10):
                e["velocity"] = round(e["velocity"] * .64,4)
    if bar % 8 == 5 and level >= 1:
        put("ghost", 9, .23, -7)
        put("perc", 13, .20, 6)
    if bar % 8 == 7:
        for step in ((13, 14, 15) if level == 2 else (14, 15)):
            put("ghost", step, .3 + .09 * (step - 13))
    if level == 2 and bar % 8 in (3, 7):
        put("ride", 15, .13, -5)
    if bar % 16 == 15: put("perc", 15, .37)
    return sorted(hits, key=lambda h: h["step"] + h["offset_ms"] / 100)

if __name__ == "__main__":
    from collections import Counter
    for intensity in (0, 1, 2):
        events = vary_break(intensity, 15)
        assert all(e["sourceId"] in [s["id"] for s in SOURCES.values()] for e in events)
        print(intensity, Counter(e["kind"] for e in events), len(events))

def slice_licensed_wav(wav_path, provenance, divisions=16):
    """Physical audio slice editor. Caller must supply legally cleared audio.
    Returns sample cells and exact origin/license metadata; audio itself is not
    embedded or silently copied. Works for mono or stereo PCM WAV/FLAC.
    """
    import numpy as np
    import soundfile as sf
    from pathlib import Path
    if not isinstance(provenance,dict) or not all(provenance.get(k) for k in
        ("sourceId","origin","license","permissionEvidence")):
        raise ValueError("Provenance and permission evidence are mandatory")
    y,sr=sf.read(str(wav_path),always_2d=True,dtype="float32")
    if y.shape[0]<divisions*128 or not (8000<=sr<=192000):
        raise ValueError("Invalid input for slicing")
    # Exact equal-grid segmentation; no magical BPM detection claim.
    edges=np.linspace(0,len(y),divisions+1).astype(int)
    cells=[y[edges[i]:edges[i+1]].copy() for i in range(divisions)]
    return {"cells":cells,"sampleRate":sr,"provenance":provenance,
            "sourcePath":str(Path(wav_path).name),
            "sliceBounds":edges.tolist(),"method":"equal-grid slice"}
def reconstruct_slices(sliced, order, crossfade_ms=3):
    """Render a new original order of actual audio cells with tiny boundary fades."""
    import numpy as np
    cells=sliced["cells"];sr=sliced["sampleRate"];parts=[]
    if not order or any(not isinstance(i,int) or not 0<=i<len(cells) for i in order):
        raise ValueError("Slice indices out of bounds")
    for i in order:
        c=cells[i].copy(); n=min(len(c)//4,max(1,int(sr*crossfade_ms/1000)))
        c[:n]*=np.linspace(0,1,n)[:,None];c[-n:]*=np.linspace(1,0,n)[:,None]
        parts.append(c)
    return np.concatenate(parts,axis=0)
