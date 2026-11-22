#!/usr/bin/env python3
"""Original four-movement ambient composition. Deterministic, no external samples.
Usage: python render.py --first-article | --full [--out DIR]
Dependencies: numpy, scipy, soundfile.
"""
import argparse, json, hashlib
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
from motif_transform import transform, interpolate_curve

HERE=Path(__file__).resolve().parent
SCORE=json.loads((HERE/'score.json').read_text(encoding='utf8'))
SR=SCORE['sampleRate']
STEMS=['harmony','memory','glass','air']
SEED=2905

def hz(midi): return 440.0*2**((midi-69)/12)
def fade(n, attack, release):
    e=np.ones(n, dtype=np.float32)
    a=min(n,max(1,int(SR*attack))); r=min(n,max(1,int(SR*release)))
    e[:a]*=np.sin(np.linspace(0,np.pi/2,a,dtype=np.float32))**2
    e[-r:]*=np.cos(np.linspace(0,np.pi/2,r,dtype=np.float32))**2
    return e

def place(track, t0, x, amp, pan=0):
    start=int(round(t0*SR)); end=min(len(track),start+len(x))
    if end<=0 or start>=len(track):return
    x=x[max(0,-start):max(0,-start)+end-max(0,start)]
    left=np.sqrt((1-pan)/2);right=np.sqrt((1+pan)/2)
    track[max(0,start):end,0]+=x*amp*left
    track[max(0,start):end,1]+=x*amp*right

def pad_note(note, sec, rng, bright=0.3):
    n=int(sec*SR); t=np.arange(n,dtype=np.float32)/SR
    f=hz(note)
    drift=np.sin(2*np.pi*(0.066*t+0.07*np.sin(.034*2*np.pi*t)))
    # additive string-like oscillator: multiple evolving overtones, not a static sine pad
    x=np.zeros(n, dtype=np.float32)
    for k, weight in [(1,1),(2,.23+bright*.16),(3,.14+bright*.18),(4,.08+bright*.12),(5,.04+bright*.06)]:
        phase=(f*k*t+0.008*k*drift + np.sin(t*.123+k)*.004)*2*np.pi
        x+=(weight/k**0.22)*np.sin(phase,dtype=np.float32)
    x*=fade(n,8.0,min(8.0,sec*.22))
    x*=.64+.36*np.sin(t*.14+note)**2
    return x

def memory_note(note, sec, bright=.35):
    n=int(SR*sec);t=np.arange(n,dtype=np.float32)/SR;f=hz(note)
    ph=2*np.pi*(f*t+0.07*np.sin(2*np.pi*.08*t))
    x=(np.sin(ph) + .26*np.sin(2*ph+.4)+.08*bright*np.sin(4*ph))
    env=(1-np.exp(-t/0.20))*np.exp(-t/(sec*.68))
    return (x*env*fade(n,.15,.26)).astype(np.float32)

def glass_note(note, sec, rng):
    n=int(SR*sec);t=np.arange(n,dtype=np.float32)/SR;f=hz(note)
    x=(.60*np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2.01*t)+
       .14*np.sin(2*np.pi*f*3.996*t)+.05*np.sin(2*np.pi*f*5.017*t))
    env=(1-np.exp(-t/.042))*np.exp(-t/2.9)
    return (x*env*fade(n,.07,.35)).astype(np.float32)

def air_grain(sec, rng, resonance):
    n=int(SR*sec)
    noise=rng.standard_normal(n).astype(np.float32)
    # two independently shaped bands: soft air and granular shimmer
    lo=sosfilt(butter(3,600,fs=SR,output='sos'),noise).astype(np.float32)
    hi=sosfilt(butter(2,[1000,3600],fs=SR,btype='bandpass',output='sos'),noise).astype(np.float32)
    x=(lo*.6+hi*resonance)*fade(n,min(3,sec*.35),min(3,sec*.35))
    return x

def arrange(duration, out):
    n=round(duration*SR);rng=np.random.default_rng(SEED)
    tracks={k:np.zeros((n,2),dtype=np.float32) for k in STEMS}
    # Changes in harmony, texture and contour are composed against the same timeline.
    for mi,m in enumerate(SCORE['movements']):
        s=m['start'];end=m['end'];level=m['intensity']
        if s>=duration:continue
        for chord_idx,chord in enumerate(m['harmony']):
            at=s+chord_idx*24-6
            for j,note in enumerate(chord):
                pn=note+12*(j>=2)
                timbre=pad_note(pn,42,rng,bright=level)
                place(tracks['harmony'],at+0.19*j,timbre,.040+level*.018,(-.42,-.15,.18,.42)[j])
        motif=SCORE['motif']
        if mi==1: motif=transform(motif,invert_axis=69,transpose=12,stretch=.88,duration_scale=1.20)
        if mi==2: motif=transform(motif,retrograde=True,transpose=-7,stretch=1.15,duration_scale=1.35)
        if mi==3: motif=transform(motif,transpose=-12,stretch=1.03,duration_scale=1.45)
        offsets=([10],[2,27],[16],[5,29])[mi]
        for off in offsets:
            for j,e in enumerate(motif):
                if off+e['at']>46:continue
                at=s+off+e['at']
                x=memory_note(e['note'],e['dur']+3,bright=level)
                place(tracks['memory'],at,x,(.043+level*.02)*e['vel'],(-.32,.34)[j%2])
        for k in range(2 if mi==2 else 4 if mi==1 else 3):
            at=s+6+k*12+(k%2)*2.6
            pitch=(76,81,74,72)[(mi+k)%4]-12*(mi==2)
            place(tracks['glass'],at,glass_note(pitch,9,rng),.014+.013*level,(-.57,.54,.12)[k%3])
        for k in range(5 if mi==1 else 3 if mi==2 else 4):
            at=s+2.5+k*(8.6 if mi==1 else 12.7)
            place(tracks['air'],at,air_grain(11.5,rng,.28+level*.2),.010+level*.009,(-.65,.46)[k%2])
    # Early reflections with damped tails per stem. No feedback recursion.
    for key in STEMS:
        a=tracks[key]
        dry=a.copy()
        for delay,scale,panflip in ((.19,.15,False),(.43,.12,True),(.79,.09,False),(1.33,.06,True)):
            off=int(delay*SR)
            if off<n:
                a[off:]+=dry[:-off,::-1 if panflip else 1]*scale if panflip else dry[:-off,:]*scale
        # 4-second master fade only at the end, avoid final abrupt cut.
        endfade=min(n,SR*4)
        a[-endfade:]*=np.linspace(1,0,endfade,dtype=np.float32)[:,None]**1.7
    mix=sum(tracks.values())
    peak=float(np.max(np.abs(mix)))
    gain=min(4.0,0.58/max(0.001,peak))
    mix*=gain
    for k in STEMS: tracks[k]*=gain
    out.mkdir(parents=True, exist_ok=True)
    sf.write(out/'MASTER.flac',mix,SR,subtype='PCM_24',format='FLAC')
    for k,a in tracks.items():sf.write(out/f'STEM_{k}.flac',a,SR,subtype='PCM_24',format='FLAC')
    # verify our actual output files by decoding, not by checking filenames
    decoded,sr=sf.read(out/'MASTER.flac',dtype='float32')
    assert sr==SR and decoded.shape==(n,2)
    diff=decoded - sum(sf.read(out/f'STEM_{k}.flac',dtype='float32')[0] for k in STEMS)
    jumps=np.max(np.abs(np.diff(decoded,axis=0)),axis=0)
    dbfs=20*np.log10(np.maximum(1e-12,np.sqrt(np.mean(decoded**2,axis=0))))
    result={'sampleRate':SR,'channels':2,'durationSeconds':duration,'peak':float(np.max(np.abs(decoded))),
      'rmsDbfsLR':list(map(float,dbfs)),'maxAdjacentDeltaLR':list(map(float,jumps)),
      'maxStemNullError':float(np.max(np.abs(diff))),
      'sha256':hashlib.sha256((out/'MASTER.flac').read_bytes()).hexdigest(),
      'checks':{'decode':'PASS','peakBelow1':'PASS' if np.max(np.abs(decoded))<1 else 'FAIL',
      'stemParity':'PASS' if np.max(np.abs(diff))<0.00001 else 'FAIL',
      'adjacentDeltaUnder0_2':'PASS' if np.max(np.abs(jumps))<0.2 else 'FAIL'},
      'artisticListening':'NOT_RUN','humanApproved':False}
    (out/'METRICS.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--first-article',action='store_true');p.add_argument('--full',action='store_true');p.add_argument('--out',default='output');a=p.parse_args()
    arrange(24 if a.first_article else SCORE['durationSeconds'],Path(a.out))
