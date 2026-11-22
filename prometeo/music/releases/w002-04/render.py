#!/usr/bin/env python3
"""AGUA EN MOVIMIENTO | PROMETEO W002-04
Original 174 BPM liquid drum & bass, editable event score, four stems, WAV + MP3.
No third-party recordings or preset/sample dependencies.
Run: python render.py (numpy, soundfile, ffmpeg; break_editor.py alongside).
"""
import json, math, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from break_editor import vary_break, SOURCES

HERE = Path(__file__).resolve().parent
SR, BPM, BARS, SEED = 32000, 174, 96, 220426
BEAT, BAR = 60 / BPM, 240 / BPM
SECONDS = BARS * BAR
N = int(math.ceil((SECONDS + 1.5) * SR))
SECTIONS = [
    {"name": "nacimiento", "start": 0, "end": 8, "level": 0, "drums": False, "bass": False},
    {"name": "cauce", "start": 8, "end": 24, "level": 0, "drums": True, "bass": True},
    {"name": "corriente", "start": 24, "end": 40, "level": 1, "drums": True, "bass": True},
    {"name": "remanso", "start": 40, "end": 48, "level": 0, "drums": False, "bass": False},
    {"name": "crecida", "start": 48, "end": 72, "level": 2, "drums": True, "bass": True},
    {"name": "estuario", "start": 72, "end": 88, "level": 1, "drums": True, "bass": True},
    {"name": "orilla", "start": 88, "end": 96, "level": 0, "drums": True, "bass": False},
]
HARMONY = [
    {"name": "F#m9", "root": 30, "notes": [54, 57, 61, 64, 68]},
    {"name": "Dmaj9", "root": 38, "notes": [54, 57, 61, 64, 69]},
    {"name": "Amaj9", "root": 33, "notes": [52, 57, 61, 64, 71]},
    {"name": "Emaj9", "root": 40, "notes": [52, 56, 59, 63, 66]},
    {"name": "Bm11", "root": 35, "notes": [59, 62, 66, 69, 73]},
    {"name": "Dmaj9", "root": 38, "notes": [54, 57, 61, 64, 69]},
    {"name": "F#m9", "root": 30, "notes": [54, 57, 61, 64, 68]},
    {"name": "Emaj9", "root": 40, "notes": [52, 56, 59, 63, 66]},
]
MOTIF = [69, 73, 76, 78, 76, 73, 71, 68, 66, 69, 73, 76, 73, 71, 68, 66]

def section(bar):
    return next(s for s in SECTIONS if s["start"] <= bar < s["end"])

def midi_hz(n):
    return 440 * 2 ** ((n - 69) / 12)

def compose_score():
    ev = {"DRUMS": [], "SUB_BASS": [], "KEYS": [], "AIR": []}
    for bar in range(BARS):
        sec = section(bar)
        level = sec["level"]
        chord = HARMONY[bar % 8]
        t0 = bar * BAR
        if sec["drums"]:
            for hit in vary_break(level, bar, SEED):
                e = dict(hit)
                e.update(bar=bar, level=level,
                         time=round(t0 + hit["step"] * BEAT / 4 + hit["offset_ms"] / 1000, 7))
                ev["DRUMS"].append(e)
        elif 1 <= bar < 40 and bar % 2 == 0:
            ev["DRUMS"].append({
                "kind": "hat", "step": 8, "velocity": .11, "sourceId": SOURCES["hat"]["id"],
                "origin": SOURCES["hat"]["origin"], "license": SOURCES["hat"]["license"],
                "time": round(t0 + 2 * BEAT, 7), "bar": bar, "level": 0})
        if sec["bass"]:
            notes = (
                [(0, .78, 0), (7, .31, 0), (10, .72, 7)] if level == 0 else
                [(0, .73, 0), (5, .32, 7), (8, .48, 0), (11, .55, 12), (14, .27, 0)] if level == 1 else
                [(0, .68, 0), (3, .29, 7), (6, .28, 0), (8, .47, 12), (11, .46, 7), (14, .27, 0)]
            )
            for idx, (step, duration, interval) in enumerate(notes):
                ev["SUB_BASS"].append({
                    "time": round(t0 + step * BEAT / 4 + (step % 2) * .006, 7),
                    "midi": chord["root"] + interval, "duration": round(duration * BEAT, 5),
                    "velocity": round((.82 if idx == 0 else .58) * (1 if level == 2 else .88), 4),
                    "bar": bar, "level": level})
        positions = [0, 2.5] if bar % 4 == 0 else [1.5] if bar % 4 == 1 else [.5, 3] if bar % 4 == 2 else [0, 2.75]
        for pos in positions:
            for idx, note in enumerate(chord["notes"]):
                if (level == 0 or bar < 8) and idx == 4: continue
                mid = note - (12 if bar >= 72 and idx == 3 else 0)
                ev["KEYS"].append({
                    "time": round(t0 + pos * BEAT + idx * .004, 7), "midi": mid,
                    "duration": round((1.04 if pos < 1 else .68), 5),
                    "velocity": round((.19 if bar < 8 else .29 if level == 2 else .245)
                                      * (.76 if idx == 0 else 1), 4),
                    "melody": False, "bar": bar})
        if 24 <= bar < 88 and bar % 2 == 0 and not (40 <= bar < 48):
            for idx in range(4):
                if idx == 3 and level == 1: continue
                note = MOTIF[(bar * 2 + idx) % len(MOTIF)] + (-12 if bar >= 72 else -2 if bar < 48 else 0)
                ev["KEYS"].append({
                    "time": round(t0 + (idx * .78 + .18) * BEAT, 7), "midi": note,
                    "duration": round((.27 + (idx % 2) * .10) * BEAT, 5),
                    "velocity": round(.22 + (idx % 3) * .025, 4),
                    "melody": True, "bar": bar})
        if bar % 2 == 0:
            for idx, note in enumerate(chord["notes"][1:]):
                ev["AIR"].append({
                    "time": round(t0 + (idx + 1) * .04, 7),
                    "midi": note - (12 if idx == 0 else 0), "duration": round(1.86 * BAR, 5),
                    "velocity": .16 if bar < 8 else .12, "bar": bar})
    return {
        "schema": "prometeo.music.songproject/v2", "taskId": "music-w002-20261122-04",
        "title": "AGUA EN MOVIMIENTO", "bpm": BPM, "bars": BARS,
        "sampleRate": SR, "seed": SEED, "harmony": HARMONY, "sections": SECTIONS,
        "sources": SOURCES, "events": ev,
        "licensePolicy": "100% original synthesized signals; no third-party samples",
        "editability": "Edit event fields and rerun python render.py; score is read rather than overwritten."
    }

score_file = HERE / "SONGPROJECT.json"
if score_file.exists():
    score = json.loads(score_file.read_text(encoding="utf-8"))
    assert score["taskId"] == "music-w002-20261122-04"
    assert score["bpm"] == BPM and score["bars"] == BARS
else:
    score = compose_score()
    score_file.write_text(json.dumps(score, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
ev = score["events"]
stems = {name: np.zeros((N, 2), dtype=np.float32) for name in ev}
kick_starts = []

def place(track, time, wave, pan=0):
    start = max(0, int(round(time * SR)))
    if start >= N: return
    end = min(N, start + len(wave))
    if end <= start: return
    x = np.asarray(wave[:end-start], dtype=np.float32)
    l = 1.0 - max(0.0, pan) * .67
    r = 1.0 + min(0.0, pan) * .67
    stems[track][start:end, 0] += x * l
    stems[track][start:end, 1] += x * r

# Each sound is built from mathematical synthesis, never imported recordings.
for i, e in enumerate(ev["DRUMS"]):
    kind, vel, when = e["kind"], float(e["velocity"]), float(e["time"])
    dur = {"kick": .34, "snare": .23, "ghost": .13, "hat": .095, "ride": .17, "perc": .16}[kind]
    tt = np.arange(int(SR * dur), dtype=np.float64) / SR
    rng = np.random.default_rng(SEED + 10007 * i)
    noise = rng.standard_normal(len(tt))
    hp = noise - np.convolve(noise, np.ones(13)/13, "same")
    if kind == "kick":
        phase = 2 * np.pi * (51*tt + 72 / 24 * (1 - np.exp(-tt*24)))
        x = .81 * np.sin(phase) * np.exp(-tt*15) + .075 * hp * np.exp(-tt*90)
        kick_starts.append(when)
    elif kind == "snare":
        x = .43 * hp * np.exp(-tt*20) + .30 * np.sin(2*np.pi*178*tt) * np.exp(-tt*23)
    elif kind == "ghost":
        x = .21 * hp * np.exp(-tt*33) + .10*np.sin(2*np.pi*217*tt)*np.exp(-tt*40)
    elif kind == "hat":
        x = (.19*hp + .065*np.sin(2*np.pi*8930*tt)) * np.exp(-tt*61)
    elif kind == "ride":
        x = (.15*hp + .07*np.sin(2*np.pi*6590*tt)) * np.exp(-tt*23)
    else:
        x = (.19*hp + .11*np.sin(2*np.pi*330*tt)) * np.exp(-tt*30)
    x *= vel * (1 - np.exp(-tt*1700))
    place("DRUMS", when, x, 0 if kind in ("kick", "snare", "ghost") else (-.36 if i % 2 else .37))

# Bass has its own note-level releases, controlled harmonics and kick-aware gain.
for e in ev["SUB_BASS"]:
    dur = float(e["duration"])
    tt = np.arange(int(SR*(dur+.065)),dtype=np.float64)/SR
    f = midi_hz(e["midi"])
    release = np.exp(-np.maximum(0,tt-dur)*69)
    env = (1-np.exp(-tt*260))*release
    x = (.78*np.sin(2*np.pi*f*tt)+.16*np.sin(2*np.pi*2*f*tt)+.055*np.sin(2*np.pi*3*f*tt))
    place("SUB_BASS", e["time"], x*env*e["velocity"]*.57)
duck = np.ones(N, dtype=np.float32)
for when in kick_starts:
    st = int(when*SR)
    count = min(int(.18*SR),N-st)
    if count <= 0: continue
    tt = np.arange(count)/SR
    curve = .48 + .52*(1 - np.exp(-tt*24))
    duck[st:st+count] = np.minimum(duck[st:st+count],curve.astype(np.float32))
stems["SUB_BASS"] *= duck[:,None]

# Rhodes-like partials, detuned beating and a small tempo-related echo.
for i,e in enumerate(ev["KEYS"]):
    dur=float(e["duration"])
    tt=np.arange(int(SR*(dur+.22)),dtype=np.float64)/SR
    f=midi_hz(e["midi"])
    envelope=(1-np.exp(-tt*700))*np.exp(-tt*(3.3 if not e["melody"] else 5.5))
    envelope*=np.exp(-np.maximum(0,tt-dur)*18)
    osc=(.61*np.sin(2*np.pi*f*tt)+
         .27*np.sin(2*np.pi*(f*2.003)*tt)*np.exp(-tt*3.0)+
         .12*np.sin(2*np.pi*(f*3.91)*tt)*np.exp(-tt*8.5))
    x=osc*envelope*e["velocity"]*.52
    pan=.21 if (i%3==0) else (-.23 if i%3==1 else 0)
    place("KEYS",e["time"],x,pan)
    place("KEYS",e["time"]+(.26 if e["melody"] else .39),x*.115,-pan)

# Soft slowly moving harmonics, original air and independently phased stereo.
for i,e in enumerate(ev["AIR"]):
    dur=float(e["duration"])
    tt=np.arange(int(SR*dur),dtype=np.float64)/SR
    f=midi_hz(e["midi"])*.5
    fade=np.minimum.reduce([np.ones(len(tt)),tt/.65,(dur-tt)/.74]).clip(0,1)
    vibrato=1+.0016*np.sin(tt*1.6+e["bar"]*.49)
    tone=(.51*np.sin(2*np.pi*f*vibrato*tt)+.23*np.sin(2*np.pi*f*1.501*tt)
          +.13*np.sin(2*np.pi*f*2.001*tt))
    x=tone*fade*e["velocity"]*.6
    place("AIR",e["time"],x,.32 if i%2 else -.28)

# Air from within composition, not a riser made by throwing white noise over it.
for bar in (8,24,40,48,72,88):
    rng=np.random.default_rng(SEED+bar)
    tt=np.arange(int(SR*.85),dtype=np.float64)/SR
    n=rng.standard_normal(len(tt))
    smooth=np.convolve(n,np.ones(55)/55,"same")
    x=smooth*np.sin(np.pi*tt/.85)**2*.065
    place("AIR",bar*BAR-.23,x,.18 if bar%2 else -.18)

# Master = exact linear sum of exported stems; gain is shared, no limiter trick.
mix_weights={"DRUMS":.88,"SUB_BASS":1.0,"KEYS":1.0,"AIR":.77}
pre_master=np.zeros((N,2),dtype=np.float32)
for name in stems:
    pre_master+=stems[name]*mix_weights[name]
raw_peak=float(np.max(np.abs(pre_master)))
assert raw_peak > .03
gain=.90/raw_peak
for name in stems:
    stems[name]*=mix_weights[name]*gain
master=np.zeros((N,2),dtype=np.float32)
for x in stems.values(): master+=x
assert float(np.max(np.abs(master))) < .901

def rms_db(x):
    return float(20*np.log10(np.sqrt(np.mean(np.asarray(x,dtype=np.float64)**2))+1e-12))

STEM_DIR=HERE/"STEMS"
STEM_DIR.mkdir(parents=True,exist_ok=True)
sf.write(HERE/"MASTER.wav",master,SR,subtype="PCM_16")
for name,x in stems.items():
    sf.write(STEM_DIR/f"{name}.flac",x,SR,format="FLAC",subtype="PCM_16")
subprocess.run(["ffmpeg","-y","-hide_banner","-loglevel","error",
                "-i",str(HERE/"MASTER.wav"),"-codec:a","libmp3lame","-b:a","192k",
                str(HERE/"MASTER.mp3")],check=True)

# Independent readback: real file bytes, aligned stems, levels and section contrast.
wav, wav_sr=sf.read(HERE/"MASTER.wav",dtype="float32",always_2d=True)
loaded=[]
for name in stems:
    x,sr=sf.read(STEM_DIR/f"{name}.flac",dtype="float32",always_2d=True)
    assert sr==SR and x.shape==wav.shape
    loaded.append(x)
residual=np.sqrt(np.mean((wav-np.sum(loaded,axis=0))**2,dtype=np.float64))
section_metrics={}
for s in SECTIONS:
    portion=wav[int(s["start"]*BAR*SR):int(s["end"]*BAR*SR)]
    section_metrics[s["name"]]={
        "level":s["level"],"rmsDbFS":round(rms_db(portion),2),
        "samplePeakDbFS":round(20*math.log10(float(np.max(np.abs(portion)))+1e-12),2),
        "drumEvents":sum(s["start"]<=e["bar"]<s["end"] for e in ev["DRUMS"])
    }
peak=float(np.max(np.abs(wav)))
qa={
 "schema":"prometeo.music.qa/v2","taskId":"music-w002-20261122-04",
 "status":"BINARY_RENDER_OBSERVED_NOT_HUMAN_APPROVED",
 "bpm":BPM,"bars":BARS,"sampleRate":SR,"channels":2,
 "musicalDurationSeconds":round(SECONDS,3),"fileDurationSeconds":round(len(wav)/SR,3),
 "masterSamplePeak":round(peak,6),"masterRmsDbFS":round(rms_db(wav),3),
 "stemMasterResidualRMS":round(float(residual),8),"stemNames":list(stems),
 "events":{k:len(v) for k,v in ev.items()},
 "sectionMetrics":section_metrics,
 "sampleSources":SOURCES,"rights":"No third-party recorded sample was used.",
 "notRun":["Critical listening in monitoring environment","Equal-loudness human A/B of three sections",
           "True-peak / intersample measurement","Independent professional mastering review"]
}
assert qa["stemMasterResidualRMS"] < .00015,qa
assert qa["masterSamplePeak"] <= .902,qa
assert qa["events"]["DRUMS"]>900
assert section_metrics["crecida"]["drumEvents"]>section_metrics["cauce"]["drumEvents"]
(HERE/"QA_RECEIPT.json").write_text(json.dumps(qa,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({k:qa[k] for k in ("fileDurationSeconds","masterSamplePeak","stemMasterResidualRMS","events")},indent=2))
