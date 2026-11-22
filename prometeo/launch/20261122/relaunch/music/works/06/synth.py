#!/usr/bin/env python3
"""MÁQUINA IMPERFECTA, reproducible electro, original DSP instruments.
Usage: python synth.py --first-article; python synth.py --render
Dependencies: numpy, scipy, soundfile. Supports render without external samples.
"""
import argparse, hashlib, json, math, pathlib
import numpy as np
from scipy import signal
import soundfile as sf
from modulation import evaluate_route

ROOT=pathlib.Path(__file__).resolve().parent
P=json.loads((ROOT/'project.json').read_text())
SR=P['sampleRate']; BPM=P['bpm']; SPB=60/BPM
SEED=P['seed']
TRACKS=list(P['mix'])

def seconds(beat): return beat*SPB

def position(beat): return int(round(seconds(beat)*SR))

def midi(n): return 440*2**((n-69)/12)

def env(n, attack, decay):
    t=np.arange(n)/SR
    return np.minimum(1.,t/max(0.0005,attack))*np.exp(-t/max(decay,0.0005))

def two_channel(mono,pan=0.):
    pan=float(np.clip(pan,-1,1));angle=(pan+1)*np.pi/4
    return np.stack((mono*np.cos(angle),mono*np.sin(angle)),axis=-1).astype('float32')

def add(dest,beat,sound,pan=0.):
    i=position(beat)
    if i>=len(dest):return
    y=two_channel(sound,pan) if sound.ndim==1 else sound
    n=min(len(dest)-i,len(y))
    if n>0: dest[i:i+n]+=y[:n]

def lowpass(x,hz):
    sos=signal.butter(2,hz,btype='lowpass',fs=SR,output='sos')
    return signal.sosfilt(sos,x)

def highpass(x,hz):
    sos=signal.butter(2,hz,btype='highpass',fs=SR,output='sos')
    return signal.sosfilt(sos,x)

def bandpass(x,lo,hi):
    return highpass(lowpass(x,hi),lo)

def kick(velocity=1):
    n=int(SR*.44);t=np.arange(n)/SR
    phase=2*np.pi*(47*t+115*.028*(1-np.exp(-t/.028)))
    body=np.sin(phase)*np.exp(-t/.155)
    snap=np.sin(2*np.pi*1120*t)*np.exp(-t/.003)
    triangular=2/np.pi*np.arcsin(np.sin(phase))
    y=np.tanh(P['patches']['kick']['drive']*(.92*body+.12*triangular*np.exp(-t/.043)+.12*snap))
    return (velocity*y*np.minimum(1,t/.0017)).astype('float32')

def snare(rng,ghost=False):
    n=int(SR*(.13 if ghost else .30));t=np.arange(n)/SR
    noise=rng.standard_normal(n)
    fuzz=bandpass(noise,550,7400)
    tone=(np.sin(2*np.pi*190*t)+.42*np.sin(2*np.pi*197*t))*np.exp(-t/.067)
    transient=(np.exp(-((t-.007)/.005)**2)+.48*np.exp(-((t-.023)/.007)**2)+.31*np.exp(-((t-.036)/.009)**2))
    y=(.54*fuzz*np.exp(-t/(.048 if ghost else .108))+ .30*tone + .23*fuzz*transient)
    y*=.44 if ghost else .83
    return (y*np.minimum(1,t/.0015)).astype('float32')

def metallic(rng,open_hat=False):
    dur=.40 if open_hat else .105
    n=int(SR*dur);t=np.arange(n)/SR
    partials=P['patches']['metal']['partials']
    y=sum(np.sin(2*np.pi*(4200*q*t+.14*np.sin(2*np.pi*67*t)))/(1+i*.6) for i,q in enumerate(partials))
    fuzz=highpass(rng.standard_normal(n),5400)
    e=np.exp(-t/(.135 if open_hat else .029))
    y=(.44*y+.43*fuzz)*e*np.minimum(1,t/.0007)
    return (y*.36).astype('float32')

def bass(note,length,beat,accent=1.,variation=0.,raw=False):
    dur=min(seconds(length)*.98+.11,.82);n=int(SR*dur);t=np.arange(n)/SR
    f=midi(note)
    phase=f*t+.0023*np.sin(2*np.pi*5.3*t)
    saw=2*(phase%1)-1
    phaseB=f*2**(P['patches']['bass']['detuneCents']/1200)*t
    pulse=np.where((phaseB%1)<(.41+.07*np.sin(2*np.pi*4*t)),1.,-1.)
    sub=np.sin(2*np.pi*(f*.5)*t)
    cut=P['patches']['bass']['filterBaseHz']+float(evaluate_route(P['modulationRoutes'][0],beat))+ (130*variation)
    movement= float(evaluate_route(P['modulationRoutes'][1],beat))
    cutoff=np.clip(cut+(1050+400*movement)*np.exp(-t/(.042+.06*accent)),85,3200)
    src=.49*saw+.36*pulse+.31*sub
    a=1.-np.exp(-2*np.pi*cutoff/SR)
    s1=np.empty(n);s2=np.empty(n)
    z1=z2=0.;
    for j in range(n):
        z1+=a[j]*(src[j]-z1)
        z2+=a[j]*(z1-z2)
        s1[j]=z1;s2[j]=z2
    e=env(n,.003,.14+min(length*.055,.19))
    gate=np.clip((dur-t)/.028,0,1)
    y=np.tanh((s2+.18*(s1-s2))*2.65)*e*gate
    if raw:return y.astype('float32')
    return (accent*y).astype('float32')

def sequence(note,length,beat,brightness=.65):
    dur=min(.52,seconds(length)*.9+.12);n=int(SR*dur);t=np.arange(n)/SR
    f=midi(note)
    y=sum((1/(h**1.25))*np.sin(2*np.pi*f*h*t+.35*np.sin(2*np.pi*1.5*f*t)) for h in [1,3,5,7,9])
    y=lowpass(y,1600+3700*brightness)
    e=np.minimum(1,t/.006)*np.exp(-t/.13)*np.minimum(1,(dur-t)/.021)
    return np.tanh(y*1.05).astype('float32')*e.astype('float32')

def stab(notes,length=1.,dark=0.7):
    n=int(SR*min(seconds(length)+.32,1.1));t=np.arange(n)/SR
    y=np.zeros(n)
    for j,note in enumerate(notes):
        f=midi(note)
        phi=f*t+.011*np.sin(2*np.pi*(.27+j*.09)*t)
        y+=(2*(phi%1)-1)*(.85-.1*j)
    y=lowpass(y,500+dark*1250)/len(notes)
    e=np.minimum(1,t/.026)*np.exp(-t/.38)*np.minimum(1,(n/SR-t)/.07)
    return np.tanh(y*1.45)*e

def echo(stereo,beats,feedback=.19):
    offset=position(beats)
    if offset==0:return stereo
    y=stereo.copy()
    for k in range(1,4):
        a=offset*k
        if a>=len(y):break
        y[a:,0]+=(feedback**k)*stereo[:-a,1]
        y[a:,1]+=(feedback**k)*stereo[:-a,0]
    return y

def section_at(bar):
    for s in P['sections']:
        if s['startBar']<=bar<s['endBar']:return s
    return P['sections'][-1]

def construct(bars=64,save=False,first=False,override_mod=None,start_bar=0):
    n=position(bars*4)+int(.85*SR)
    stems={k:np.zeros((n,2),dtype='float32') for k in TRACKS}
    rng=np.random.default_rng(SEED)
    motifs=[[40,None,40,43,40,47,None,45,40,None,43,47,40,38,40,None],
            [40,None,47,43,40,None,45,47,40,43,None,45,47,45,43,38]]
    seq=[64,None,67,69,None,71,74,None,76,74,71,None,69,67,None,62]
    for bar in range(bars):
        s=section_at(bar+start_bar);region=s['name'];density=s['density'];root=s['harmonicRoot'];barbeat=bar*4
        if region=='CIRCUIT B':root_off=5
        elif region=='BROWNOUT':root_off=3
        elif region=='GHOST SIGNAL':root_off=-2
        else:root_off=0
        if region not in ('BROWNOUT','GHOST SIGNAL'):
            kick_hits=[0,2.0,2.75] if bar%4!=3 else [0,1.75,2.75,3.5]
        elif region=='BROWNOUT':kick_hits=[0,2.75] if bar%2==0 else [0]
        else:kick_hits=[0,2.0]
        for i,k in enumerate(kick_hits):add(stems['kick'],barbeat+k,kick(.93 if i else 1))
        for k in [1,3]:
            if region=='BROWNOUT' and k==3 and bar%2:continue
            add(stems['snare'],barbeat+k,snare(rng),pan=-.045)
        if region in ('CIRCUIT A','CIRCUIT B','GHOST SIGNAL'):
            for ghostpos in ([.73,2.74] if bar%4==3 else [2.74] if bar%2 else []):
                add(stems['snare'],barbeat+ghostpos,snare(rng,ghost=True),pan=.14)
        metal_steps=[.5,1.5,2.5,3.5] if region in ('ACTIVATION','BROWNOUT','POWER DOWN') else [0,.5,1,1.5,2,2.5,3,3.5]
        for st in metal_steps:
            if (bar%8==7 and st==3.5) or (region=='BROWNOUT' and st==2.5):continue
            vel=.5 if st%1==0 else .87
            add(stems['metal'],barbeat+st+.014*((bar+int(st*2))%3),metallic(rng,open_hat=(st==3.5 and bar%2==1))*vel,pan=(-.33 if st%1 else .27))
        if bar%8==7:
            for st in [3.0,3.25,3.5,3.75]:add(stems['metal'],barbeat+st,metallic(rng)*.63,pan=(st-3.35)*1.2)
        if region not in ('ACTIVATION', 'POWER DOWN') or bar%2==0:
            pat=motifs[(bar//2)%2]
            for idx,note in enumerate(pat):
                if note is None:continue
                if region in ('BROWNOUT','POWER DOWN') and idx%3!=0:continue
                if region=='GHOST SIGNAL' and idx%4==3:continue
                if (bar%2==0 and idx>=8) or (bar%2==1 and idx<8):continue
                pos=(idx%8)*.5
                accent=1.03 if idx%4==2 else .78 if idx%3==0 else .94
                tone=bass(note+root_off,.44,barbeat+pos,accent,variation=(.65 if region=='CIRCUIT B' else -.16))
                add(stems['bass'],barbeat+pos+.06,tone,pan=0.)
        if region in ('CIRCUIT A','CIRCUIT B','GHOST SIGNAL'):
            for st in range(8):
                if seq[(bar*3+st)%16] is None:continue
                if region=='GHOST SIGNAL' and st%2:continue
                if bar%4==0 and st in (0,4):continue
                b=barbeat+st*.5+.22
                note=seq[(bar*3+st)%16]+(root_off if region!='CIRCUIT B' else 0)
                bright=float(evaluate_route(P['modulationRoutes'][3],b)) if override_mod is None else override_mod
                pan=float(evaluate_route(P['modulationRoutes'][2],b))
                add(stems['sequence'],b,sequence(note,.35,b,bright),pan)
        if region!='ACTIVATION' and (bar%4 in (0,2)):
            note_set=[52+root_off,57+root_off,62+root_off] if bar%4==0 else [50+root_off,55+root_off,59+root_off]
            add(stems['stabs'],barbeat+(.15 if bar%4==0 else 2.6),stab(note_set,.87,.43 if region=='BROWNOUT' else .78),pan=(-.31 if bar%4==0 else .25))
        if region=='ACTIVATION' and bar in (4,6):
            add(stems['stabs'],barbeat+.12,stab([52,57,62],1.,.36),pan=-.22)
    stems['sequence']=echo(stems['sequence'],.75,.235)
    stems['stabs']=echo(stems['stabs'],1.5,.28)
    gain=P['mix']; summed=sum((stems[k]*gain[k] for k in TRACKS),np.zeros((n,2),dtype='float32'))
    max_peak=float(np.max(np.abs(summed)))
    factor=min(1.,P['master']['peakTarget']/max(max_peak,1e-9))
    scaled={k:(stems[k]*gain[k]*factor).astype('float32') for k in TRACKS}
    master=sum(scaled.values(),np.zeros((n,2),dtype='float32'))
    fade=np.ones(n,dtype='float32');m=int(.65*SR);fade[-m:]=np.linspace(1,0,m,dtype='float32')
    for k in scaled:scaled[k]*=fade[:,None]
    master*=fade[:,None]
    if save:
        name='FIRST_ARTICLE' if first else 'MASTER'
        sf.write(str(ROOT/(name+'.wav')),master,SR,subtype='PCM_24')
        if not first:
            (ROOT/'stems').mkdir(exist_ok=True)
            for k in TRACKS:sf.write(str(ROOT/'stems'/(k.upper()+'.flac')),scaled[k],SR,subtype='PCM_24')
            sf.write(str(ROOT/'MASTER.flac'),master,SR,subtype='PCM_24')
    return scaled,master,{'bars':bars,'seconds':len(master)/SR,'sampleRate':SR,'stems':TRACKS,'peakBefore':max_peak,'sharedGain':factor,'peakAfter':float(np.max(np.abs(master))),'stemsNumericallySumToMaster':float(np.max(np.abs(sum(scaled.values())-master)))}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--first-article',action='store_true');ap.add_argument('--render',action='store_true');ap.add_argument('--ab',action='store_true');args=ap.parse_args()
    bars=4 if args.first_article else 64
    stems,master,stats=construct(bars,save=(args.first_article or args.render),first=args.first_article,start_bar=(8 if args.first_article else 0))
    if args.ab:
        _,baseline,_=construct(4,start_bar=8)
        _,changed,_=construct(4,override_mod=.08,start_bar=8)
        r=(np.mean(baseline*baseline)/max(np.mean(changed*changed),1e-12))**.5
        sf.write(str(ROOT/'AB_BASE.wav'),baseline,SR,subtype='PCM_24')
        sf.write(str(ROOT/'AB_DARK_SEQUENCE.wav'),changed*r,SR,subtype='PCM_24')
        stats['abRmsMatchedRatio']=float(r);stats['abMeanAbsDifference']=float(np.mean(np.abs(baseline-changed*r)))
        stats['abRmsDifferenceDb']=float(20*np.log10(np.sqrt(np.mean(baseline**2))/np.sqrt(np.mean((changed*r)**2))))
    (ROOT/('FIRST_ARTICLE_QA.json' if args.first_article else 'RENDER_QA.json')).write_text(json.dumps(stats,indent=2))
    print(json.dumps(stats,indent=2))
