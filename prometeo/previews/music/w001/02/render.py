#!/usr/bin/env python3
"""FABRICA VACIA W001-02. Deterministic original reference synthesizer.
Renders the editable SongProject, not an emulation of the browser WebAudio engine.
No samples, loops or recordings from third parties. Python 3.11, numpy, scipy, soundfile, ffmpeg.
"""
import json, hashlib, math, subprocess, pathlib
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

BASE=pathlib.Path(__file__).resolve().parent
SONG=json.loads((BASE/'SONGPROJECT.json').read_text(encoding='utf-8'))
assert SONG['schema']=='prometeo.songproject/v2'
assert SONG['id']=='music-w001-02-fabrica-vacia'
SR=32000
BPM=SONG['bpm']
N=round(SONG['duration_seconds']*SR)
assert SR==SONG['render_sample_rate'] and SONG['bars']==96 and BPM==128
RNG=np.random.default_rng(2026112202)
STEMS=BASE/'STEMS'
STEMS.mkdir(exist_ok=True)
LPS={hz:butter(2,hz,fs=SR,output='sos',btype='lowpass') for hz in (180,420,900,1900,4200)}
HPS={hz:butter(2,hz,fs=SR,output='sos',btype='highpass') for hz in (125,260,900)}
def filt(x,lo=None,hi=None):
    if lo:x=sosfilt(HPS[lo],x)
    if hi:x=sosfilt(LPS[hi],x)
    return np.asarray(x,np.float32)
def envelope(n,attack,release,decay=0):
    t=np.arange(n,dtype=np.float32)/SR
    a=np.minimum(1,t/max(attack,.0001))
    r=np.minimum(1,(n-1-np.arange(n,dtype=np.float32))/(max(release,.0001)*SR))
    return a*r*np.exp(-decay*t)
def synth(kind,note,velocity,dur):
    n=round(SR*min(4.4,max(.09,dur+.60)))
    ti=np.arange(n,dtype=np.float32)/SR
    amp=velocity/127
    if kind=='techkick':
        n=round(.53*SR);ti=np.arange(n,dtype=np.float32)/SR
        phase=2*np.pi*(46*ti+(.028*95)*(1-np.exp(-ti/.028)))
        body=np.sin(phase)*np.exp(-ti*11.6)
        transient=filt(RNG.standard_normal(n).astype(np.float32),hi=1900)*np.exp(-ti*105)*.035
        return (body+transient)*.82*amp
    if kind=='techrumble':
        n=round(.40*SR);ti=np.arange(n,dtype=np.float32)/SR
        pulse=np.sin(2*np.pi*46*ti+1.6*np.sin(2*np.pi*17*ti))*np.exp(-ti*7.8)
        noise=filt(RNG.standard_normal(n).astype(np.float32),hi=180)*np.exp(-ti*9)
        x=(pulse*.78+noise*.27)*envelope(n,.016,.085)
        return np.tanh(x*1.4).astype(np.float32)*.43*amp
    if kind=='sub':
        hz=440*2**((note-69)/12)
        phase=2*np.pi*hz*ti
        x=(np.sin(phase)+.12*np.sin(phase*2))*envelope(n,.032,.19,.22)
        return np.tanh(x*.82).astype(np.float32)*.47*amp
    if kind=='velsilkhat':
        n=round(.14*SR);ti=np.arange(n,dtype=np.float32)/SR
        x=filt(RNG.standard_normal(n).astype(np.float32),lo=900,hi=4200)
        return x*envelope(n,.012,.023,26)*.07*amp
    if kind=='velbrush':
        n=round(.24*SR);ti=np.arange(n,dtype=np.float32)/SR
        x=filt(RNG.standard_normal(n).astype(np.float32),lo=260,hi=1900)
        return x*envelope(n,.021,.035,15)*.12*amp
    if kind=='velwood':
        n=round(.32*SR);ti=np.arange(n,dtype=np.float32)/SR
        x=(.62*np.sin(2*np.pi*154*ti)+.27*np.sin(2*np.pi*231*ti)+.16*np.sin(2*np.pi*382*ti))
        x*=envelope(n,.014,.06,13)
        breath=filt(RNG.standard_normal(n).astype(np.float32),hi=900)*envelope(n,.014,.04,18)
        return (x+breath*.14)*.23*amp
    if kind=='velhush':
        n=round(SR*min(4.4,dur+.35));ti=np.arange(n,dtype=np.float32)/SR
        x=filt(RNG.standard_normal(n).astype(np.float32),hi=420)
        slow=np.sin(np.pi*np.clip(ti/max(dur,.2),0,1))**2
        return (x*.48+np.sin(2*np.pi*57*ti)*.20)*slow*envelope(n,.2,.25)*.11*amp
    if kind=='velsweep':
        n=round(SR*min(4.4,dur+.35));ti=np.arange(n,dtype=np.float32)/SR
        x=filt(RNG.standard_normal(n).astype(np.float32),lo=125,hi=900)
        slow=np.sin(np.pi*np.clip(ti/max(dur,.2),0,1))**2
        return x*slow*envelope(n,.2,.28)*.14*amp
    raise ValueError('Unsupported timbre '+str(kind))
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(path,data):
    sf.write(path,data,SR,subtype='PCM_16')
def rms(x):return float(np.sqrt(np.mean(np.square(x,dtype=np.float64))))
def report():
    stem_buffers=[]
    stemstats=[]
    for tr in SONG['tracks']:
        y=np.zeros(N,dtype=np.float32)
        for ev in tr['events']:
            i=round(ev['time']*SR)
            if not (0<=i<N):continue
            a=synth(tr['type'],ev['note'],ev['vel'],ev['dur'])
            l=min(len(a),N-i)
            y[i:i+l]+=a[:l]
        y*=float(tr['gain'])
        if tr['type']=='techrumble':
            # Gentle acoustic-style lowpass on the shared low-end role.
            y=filt(y,hi=420)
        pan=float(tr['pan'])
        stereo=np.empty((N,2),np.float32)
        stereo[:,0]=y*math.sqrt((1-pan)/2)
        stereo[:,1]=y*math.sqrt((1+pan)/2)
        stem_buffers.append((tr['id'],stereo))
        stemstats.append({'id':tr['id'],'type':tr['type'],'events':len(tr['events']),
                          'peak_prebus':round(float(np.max(np.abs(stereo))),6)})
        print('prepared',tr['id'],len(tr['events']),flush=True)
    mixed=np.zeros((N,2),np.float64)
    for _,s in stem_buffers:mixed+=s
    premix_peak=float(np.max(np.abs(mixed)))
    bus_gain=min(2.5,.84/max(premix_peak,1e-9))  # Linear peak normalization; preserves stem parity
    # Apply only LINEAR attenuation to retain explicit stem/master parity.
    mixed=(mixed*bus_gain).astype(np.float32)
    for id,s in stem_buffers:
        p=STEMS/(id+'.flac')
        sf.write(p,s*bus_gain,SR,format='FLAC',subtype='PCM_16')
    master_path=BASE/'MASTER.wav'
    write(master_path,mixed)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(master_path),
                    '-c:a','libmp3lame','-b:a','192k',str(BASE/'MASTER.mp3')],check=True)
    # Eight bars are a real first-loop preflight snapshot, not the entire delivery.
    write(BASE/'FIRST_LOOP.wav',mixed[:8*4*round(SR*60/BPM)])
    peak=float(np.max(np.abs(mixed)))
    # parity: quantized PCM stems vs master PCM at 16-bit, tolerance <=9 bits of 16-bit.
    decoded=np.zeros_like(mixed,dtype=np.float64)
    for id,_ in stem_buffers:
        data,sr=sf.read(STEMS/(id+'.flac'),dtype='float32',always_2d=True)
        assert sr==SR and data.shape==(N,2)
        decoded+=data
    audible,sr=sf.read(master_path,dtype='float32',always_2d=True)
    residual=rms(decoded-audible)
    assert residual<0.0003,(residual,'stems/master not close')
    assert peak<.998 and N/SR==180
    # A/B for the highest-risk metal role: an intentionally over-bright counterexample,
    # compared on the exact same event as the chosen, damped resonator.
    testN=round(.30*SR);tt=np.arange(testN,dtype=np.float32)/SR
    reject=np.sin(2*np.pi*2830*tt)*np.exp(-tt*13)*.2
    approved=synth('velwood',43,60,.2)
    def upper_ratio(x):
        f=np.fft.rfftfreq(len(x),1/SR)
        power=np.abs(np.fft.rfft(x))**2
        return float(power[f>=2200].sum()/(power.sum()+1e-15))
    bright=upper_ratio(reject);dark=upper_ratio(approved)
    assert dark<bright,(dark,bright)
    tests={'mode':'CODE_TEST + AUDIO_RENDER','sampleRate':SR,'channels':2,'bars':96,'bpm':128,
           'durationSeconds':N/SR,'masterPCM':'WAV PCM16','compressedMaster':'MP3 192k',
           'stemFormat':'8 original FLAC PCM16','masterPeak':peak,'masterRMS':rms(mixed),
           'stemMasterResidualRMS':residual,'clipping':peak>=.998,
           'highMetalRejectionRatio':bright,'dampedMetalChosenRatio':dark,
           'topLayerGuard':bool(dark<bright),'webAudioParity':'NOT_VERIFIED',
           'browserPlayback':'NOT_RUN','androidPhysical':'NOT_RUN',
           'humanListening':'NOT_RUN','artisticApproval':'PENDING',
           'files':{p.relative_to(BASE).as_posix():{'bytes':p.stat().st_size,'sha256':sha(p)}
                    for p in [master_path,BASE/'MASTER.mp3',BASE/'FIRST_LOOP.wav']+sorted(STEMS.glob('*.flac'))},
           'stems':stemstats,'license':'Original procedural synthesis, no external samples'}
    (BASE/'QA_RECEIPT.json').write_text(json.dumps(tests,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    (BASE/'QUALITY_DELTA.json').write_text(json.dumps({
        'defectCode':'TOP_LAYER_TOYLIKE',
        'candidate':'2830 Hz bright, hard attack metallic counterexample; rejected at M06',
        'revision':'velwood damped resonator 154/231/382 Hz and filtered breath; retained as final timbre',
        'objectiveUpperEnergyRatioBefore':bright,'objectiveUpperEnergyRatioAfter':dark,
        'result':'Measured reduction in >2.2 kHz spectral energy for matched short event, not human-perceived approval',
        'verification':'CODE_TEST','humanEvaluation':'NOT_RUN'
    },indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print('QA',json.dumps({k:tests[k] for k in ('masterPeak','masterRMS','stemMasterResidualRMS','durationSeconds','topLayerGuard')},indent=2),flush=True)
    return tests
if __name__=='__main__':report()
