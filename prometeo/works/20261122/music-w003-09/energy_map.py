#!/usr/bin/env python3
"""Reusable audio-derived per-bar energy and change-point map (not subjective scoring).
Usage: python energy_map.py export/master.wav --out export/ENERGY_MAP.json
"""
import argparse, json, numpy as np, soundfile as sf
from pathlib import Path

def analyse(path,bpm=124,steps_per_bar=4):
    audio,sr=sf.read(path,dtype='float32',always_2d=True)
    mono=np.mean(audio,axis=1)
    frames=int(sr*60/bpm*steps_per_bar)
    entries=[]
    old_spec=None
    for i,start in enumerate(range(0,len(mono),frames)):
        chunk=mono[start:min(start+frames,len(mono))]
        if len(chunk)<frames//2:break
        power=np.sqrt(np.mean(chunk**2));peak=np.max(np.abs(chunk))
        # 8x overlapping STFT 8192 to compare harmonic vs percussive spectral changes.
        windows=[]
        for k in range(8):
            q=int(k*(max(0,len(chunk)-8192))/7)
            v=chunk[q:q+8192];w=np.hanning(len(v));sp=np.abs(np.fft.rfft(v*w,n=8192));windows.append(sp)
        spectrum=np.mean(windows,axis=0); freqs=np.fft.rfftfreq(8192,1/sr)
        centroid=float(np.sum(spectrum*freqs)/(np.sum(spectrum)+1e-12))
        low=float(np.sum(spectrum[freqs<120])/(np.sum(spectrum)+1e-12))
        spectral_flux=0 if old_spec is None else float(np.sum(np.maximum(0,spectrum-old_spec))/(np.sum(spectrum)+1e-12))
        old_spec=spectrum
        # Onset proxy on smoothed 10 ms spectral-energy increments
        hop=int(.01*sr)
        energy=np.array([np.sqrt(np.mean(chunk[q:q+hop]**2)) for q in range(0,len(chunk)-hop,hop)])
        e=np.maximum(0,np.diff(energy)); thresh=max(np.percentile(e,80)*2.8,.001)
        onset=int(np.count_nonzero((e[1:-1]>e[:-2])&(e[1:-1]>e[2:])&(e[1:-1]>thresh)))
        entries.append({'bar':i+1,'time':round(start/sr,3),'rmsDb':round(float(20*np.log10(power+1e-12)),2),'peakDb':round(float(20*np.log10(peak+1e-12)),2),'centroidHz':round(centroid),'lowShare':round(low,3),'novelty':round(spectral_flux,3),'onsetProxy':onset})
    # Perceptual-feature change detector: bar-to-bar magnitude, 4-bar averaged steadiness.
    features=np.array([[x['rmsDb'],x['centroidHz']/150,x['onsetProxy']/3,x['lowShare']*12] for x in entries]);delta=np.linalg.norm(np.diff(features,axis=0),axis=1)
    # Meaningful change above robust threshold, avoid every incidental hit becoming a section.
    threshold=max(float(np.percentile(delta,80)),2.0) if len(delta)>0 else 99
    edges=[{'bar':int(i+2),'strength':round(float(v),2)} for i,v in enumerate(delta) if v>=threshold]
    edges=sorted(edges,key=lambda x:x['strength'],reverse=True)
    selected=[]
    for e in edges:
        if all(abs(e['bar']-s['bar'])>=4 for s in selected):selected.append(e)
        if len(selected)==16:break
    selected.sort(key=lambda x:x['bar'])
    return {'schema':'prometeo.music.energy-map/audio-derived-v1','source':str(path),'features':'measured RMS dB, peak, FFT centroid, sub-120Hz ratio, spectral-flux, onset proxy; automated change points use robust multifeature distance','limits':'heuristic change detection; bar boundaries may drift <= one audio frame due rounding; no artistic proof','bpm':bpm,'sampleRate':sr,'bars':entries,'detectedChanges':selected,'changeThreshold':round(threshold,3)}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('audio');p.add_argument('--out',default='ENERGY_MAP.json');a=p.parse_args()
    data=analyse(a.audio);Path(a.out).write_text(json.dumps(data,ensure_ascii=False,indent=2))
    print('measured',len(data['bars']),'bars; strongest changes:',data['detectedChanges'])