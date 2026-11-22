#!/usr/bin/env python3
"""CUERPO Y CIRCUITO: original electronics responding to unquantized real human guitar performances.
Usage: python render.py --first-article; python render.py --full
Requirements: Python 3, numpy, scipy, soundfile, ffmpeg.
"""
import argparse, hashlib, json, subprocess, urllib.request
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d, gaussian_filter1d
from scipy.signal import find_peaks, butter, sosfilt, resample_poly

ROOT=Path(__file__).resolve().parent
SR=44100
SOURCE='https://huggingface.co/datasets/Julian-br/GuitarJam/resolve/main/guitar_jam/test/026.wav'
SOURCE_PAGE='https://huggingface.co/datasets/Julian-br/GuitarJam'
SEED=2026112207

CLIPS=['026.wav','059.wav','135.wav','226.wav']
DATASET='https://huggingface.co/datasets/Julian-br/GuitarJam/resolve/main/guitar_jam/test/'

def acquire():
    """Preserve four unquantized guitar takes, their articulation and human timing.
    Each unaltered take is independently auditable in audio/source_clips/. A short
    silence between sections permits the electronic response to finish a phrase.
    Wikimedia CC0 spinet was rejected after an observed HTTP 429 (not replaced by MIDI).
    """
    clipdir=ROOT/'audio'/'source_clips'
    clipdir.mkdir(parents=True,exist_ok=True)
    passages=[]
    manifests=[]
    for filename in CLIPS:
        path=clipdir/filename
        if not path.exists():
            req=urllib.request.Request(DATASET+filename,headers={'User-Agent':'PrometeoMusicStudy/1.0 (licensed CC0 acoustic performance adaptation)'})
            with urllib.request.urlopen(req,timeout=90) as resp:
                data=resp.read()
            if len(data)<100000: raise RuntimeError('Remote acoustic take absent: '+filename)
            path.write_bytes(data)
        clip,rate=sf.read(path,dtype='float64')
        if clip.ndim==2: clip=clip.mean(axis=1)
        if rate!=SR: clip=resample_poly(clip,SR,rate)
        if len(clip)<3*SR or not np.isfinite(clip).all():
            raise RuntimeError('Genuine CC0 take failed validation: '+filename)
        # Only anti-click edge ramps: no timing quantization, no synthetic note replacement.
        ramp=min(int(.09*SR),len(clip)//12)
        clip[:ramp]*=np.linspace(0,1,ramp)
        clip[-ramp:]*=np.linspace(1,0,ramp)
        passages.append(clip)
        manifests.append({'file':filename,'sourceUrl':DATASET+filename,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(), 'durationSeconds':round(len(clip)/SR,3)})
    gaps=[np.zeros(int(.55*SR),dtype='float64') for _ in range(len(passages)-1)]
    interleaved=[]
    for i,take in enumerate(passages):
        interleaved.append(take)
        if i<len(gaps):interleaved.append(gaps[i])
    src=np.concatenate(interleaved)
    origin=ROOT/'audio'/'source_decoded.wav'
    sf.write(origin,src,SR,subtype='PCM_24')
    (ROOT/'audio'/'SOURCE_PROVENANCE.json').write_text(json.dumps({'license':'CC0-1.0','dataset':SOURCE_PAGE,'performer':'GuitarJam contributor Julian-br (public dataset credit)','humanPerformance':'electric guitar strings, DI capture, not acoustic-microphone capture','assembly':'four complete 14-25 s recorded improvisation clips separated by 0.55 s breath; no sample-by-note synthesis','clips':manifests},indent=2)+'\n')
    if len(src)<SR*25:raise RuntimeError('Genuine-source sequence shorter than full piece required')
    return src,origin

def gestures(x):
    hop=256
    rms=np.sqrt(np.maximum(0,uniform_filter1d(x*x,size=1536)[::hop]))
    smooth=gaussian_filter1d(rms,1.)
    rise=np.maximum(0,np.diff(smooth,prepend=smooth[0]))
    prom=max(float(np.percentile(rise,88))*.65,float(np.max(rise))*.025,.000015)
    peaks,_=find_peaks(rise,prominence=prom,distance=int(.24*SR/hop))
    if len(peaks)<4:
        peaks,_=find_peaks(smooth,prominence=max(float(np.max(smooth))*.085,.00015),distance=int(.23*SR/hop))
    events=[]
    strengths=[]
    for p in peaks:
        t=p*hop/SR
        if t<.15 or t>len(x)/SR-.2: continue
        snippet=x[int(t*SR):int(t*SR)+8192]
        if len(snippet)<8192: continue
        spec=np.abs(np.fft.rfft(snippet*np.hanning(len(snippet))))
        freq=np.fft.rfftfreq(len(snippet),1/SR)
        mask=(freq>=110)&(freq<=1180)
        hz=float(freq[mask][np.argmax(spec[mask])])
        strength=float(rise[p])
        strengths.append(strength)
        events.append({'time':round(t,5),'attack':strength,'pitch_observed_hz':round(hz,1)})
    ref=max(float(np.percentile(strengths,88)),1e-8) if strengths else 1.
    for e in events:
        e['articulation']=round(float(np.clip(e.pop('attack')/ref,.08,1.8)),4)
    return events

def envelope(t,points):
    return np.interp(t,[p[0] for p in points],[p[1] for p in points])

def compose(x):
    secs=len(x)/SR
    N=len(x)+7*SR
    timeline=np.arange(N)/SR
    dry=np.zeros((N,2),dtype='float64')
    dry[:len(x),:]=x[:,None]*.71
    events=gestures(x)
    if len(events)<3: raise RuntimeError('FIRST_ARTICLE_FAIL: fewer than 3 genuine detected attacks')
    sos=butter(3,[170,3900],btype='band',fs=SR,output='sos')
    coloured=np.tanh(sosfilt(sos,x)*2.)/1.45
    wet=np.zeros_like(dry)
    for delay,level,pan in [(0.19,.36,-.45),(0.47,.31,.50),(0.91,.21,-.22),(1.64,.13,.32),(2.71,.08,-.20)]:
        shift=int(delay*SR)
        span=min(len(x),N-shift)
        wet[shift:shift+span,0]+=coloured[:span]*level*(1-pan*.5)
        wet[shift:shift+span,1]+=coloured[:span]*level*(1+pan*.5)
    section=envelope(timeline,[(0,.09),(.20*secs,.10),(.37*secs,.38),(.64*secs,.58),(.82*secs,.75),(secs,.26),(secs+7,0)])
    wet*=section[:,None]*.60
    circuit=np.zeros_like(dry)
    for i,e in enumerate(events):
        t=e['time']
        strength=e['articulation']
        if t<.12 or t>secs-.3: continue
        reaction=t+(.14+.18/(.25+strength))
        start=int(reaction*SR)
        if start>=N: continue
        dur=.45+min(1.7,1.1/(.30+strength))
        count=min(int(dur*SR),N-start)
        u=np.arange(count)/SR
        hz=float(np.clip(e['pitch_observed_hz']*.5,80,760))
        wobble=1+.006*np.sin(2*np.pi*(.8+(i%4)*.18)*u)
        phase=2*np.pi*hz*np.cumsum(wobble)/SR
        attack=np.minimum(1,u/.023)
        decay=np.exp(-u*(1.9+strength*.8))
        voice=(np.sin(phase)+.19*np.sin(2.015*phase)+.09*np.sin(3.04*phase))*np.tanh(attack*3)*decay*.047*min(1.4,strength)
        arc=float(np.interp(t/max(secs,.001),[0,.16,.35,.58,.79,1],[.12,.17,.67,.94,.83,.26]))
        pan=np.sin(i*2.399963)*.63
        circuit[start:start+count,0]+=voice*arc*np.sqrt((1-pan)/2)
        circuit[start:start+count,1]+=voice*arc*np.sqrt((1+pan)/2)
    room=np.zeros_like(dry)
    rng=np.random.default_rng(SEED)
    noise=rng.standard_normal(N)
    air=sosfilt(butter(3,[90,730],btype='band',fs=SR,output='sos'),noise)
    slow=gaussian_filter1d(np.abs(air),1200)
    air=air/np.maximum(slow,.04)*.014
    roomarc=envelope(timeline,[(0,0),(.30*secs,.01),(.50*secs,.30),(.78*secs,.72),(secs,.22),(secs+7,0)])
    room[:,0]=air*roomarc
    room[:,1]=np.roll(air,int(.013*SR))*roomarc*.87
    components={'acoustic_dry':dry,'acoustic_processed':wet,'circuit':circuit,'room':room}
    mix=sum(components.values())
    gain=min(3.0,.83/max(float(np.max(np.abs(mix))),1e-9))
    components={k:v*gain for k,v in components.items()}
    return components,sum(components.values()),events,gain

def stats(y):
    peak=float(np.max(np.abs(y)))
    rms=float(np.sqrt(np.mean(y*y)))
    oversampled=resample_poly(y,4,1,axis=0)
    return {'peak_dbfs':round(20*np.log10(max(peak,1e-9)),2),
            'oversampled_peak_estimate_dbfs':round(20*np.log10(max(float(np.max(np.abs(oversampled))),1e-9)),2),
            'rms_dbfs':round(20*np.log10(max(rms,1e-9)),2),
            'duration_s':round(len(y)/SR,3),
            'channel_difference_rms':round(float(np.sqrt(np.mean((y[:,0]-y[:,1])**2))),7)}

def output(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    sf.write(path,data,SR,subtype='PCM_16')
    return hashlib.sha256(path.read_bytes()).hexdigest()

def render(full):
    x,origin=acquire()
    original_seconds=len(x)/SR
    if not full: x=x[:min(len(x),18*SR)]
    stems,mix,events,gain=compose(x)
    folder=ROOT/'audio' if full else ROOT/'first-article'
    folder.mkdir(parents=True,exist_ok=True)
    digests={}
    for name,data in stems.items():
        digests[name]=output(folder/'stems'/f'{name}.wav',data)
    digests['master']=output(folder/'master.wav',mix)
    begin=20 if full else 2
    duration=13 if full else 10
    a=stems['acoustic_dry'][begin*SR:(begin+duration)*SR]
    b=mix[begin*SR:(begin+duration)*SR]
    if len(a)>0 and len(b)==len(a):
        ra=np.sqrt(np.mean(a*a)+1e-12)
        rb=np.sqrt(np.mean(b*b)+1e-12)
        b=np.clip(b*(ra/rb),-.96,.96)
        digests['ab_dry']=output(folder/'ab_dry.wav',a)
        digests['ab_processed_level_matched']=output(folder/'ab_processed_level_matched.wav',b)
    report={'stage':'FULL_RENDER' if full else 'FIRST_ARTICLE_TECHNICAL',
            'taskId':'music-w003-20261122-07','sampleRate':SR,
            'humanApproved':False,'independentListening':'NOT_RUN',
            'sourceUrl':SOURCE_PAGE,'sourceSha256':hashlib.sha256(origin.read_bytes()).hexdigest(),
            'sourceDurationSeconds':round(original_seconds,3),
            'renderedAcousticSeconds':round(len(x)/SR,3),
            'unquantizedArticulations':len(events),
            'commonMasterGain':round(gain,7),'measurements':stats(mix),
            'filesSha256':digests,'firstEvents':events[:8],
            'assertions':{'four_original_human_takes_preserved':True,
                          'stems_sum_to_master':bool(np.max(np.abs(sum(stems.values())-mix))<1e-10),
                          'finite_audio':bool(np.isfinite(mix).all()),
                          'not_silent':bool(np.sqrt(np.mean(mix*mix))>1e-4),
                          'unquantized_event_times':len(set(round(e['time']%0.5,2) for e in events))>2}}
    (folder/'QA.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    (folder/'articulation_map.json').write_text(json.dumps(events,indent=2)+'\n')
    if not all(report['assertions'].values()):
        raise RuntimeError('TECHNICAL_CHECK_FAILED: '+str(report['assertions']))
    return report

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    choices=parser.add_mutually_exclusive_group(required=True)
    choices.add_argument('--first-article',action='store_true')
    choices.add_argument('--full',action='store_true')
    args=parser.parse_args()
    report=render(full=args.full)
    print(json.dumps({k:report[k] for k in ('stage','sourceDurationSeconds','unquantizedArticulations','measurements','assertions')},indent=2))
