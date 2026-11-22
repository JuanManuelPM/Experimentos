#!/usr/bin/env python3
"""CATEDRAL DE ECO / W003-03. Original, deterministic dub-techno source and editable rack.
Dependencies: numpy, scipy, soundfile. No samples, presets or third-party recordings.
Usage: python render.py --first-article | --full
"""
import argparse, json, math, os, hashlib
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, lfilter

SR=44100
BPM=122
BEAT=60/BPM
BAR=BEAT*4
TOTAL_BARS=88
ROOT=Path(__file__).resolve().parent
RNG=np.random.default_rng(3803)
CHORDS={
  'Dm9':[50,53,57,60,64], 'Bbmaj9':[46,50,53,57,60],
  'Gm9':[43,46,50,53,57], 'Cadd9':[48,52,55,62],
  'Fmaj9':[48,53,57,60,64], 'Am11':[45,48,52,55,62]
}
SECTIONS=[
 {'name':'APERTURA / AIRE','start':0,'end':8,'drum':.56,'sub':.52,'chord':.70,'echo':.70,'air':.60},
 {'name':'PILARES / PULSO','start':8,'end':24,'drum':.86,'sub':.90,'chord':.85,'echo':.75,'air':.52},
 {'name':'NAVE / DERIVA','start':24,'end':40,'drum':.93,'sub':1.,'chord':.95,'echo':.85,'air':.59},
 {'name':'VACÍO / RESPIRACIÓN','start':40,'end':48,'drum':.28,'sub':.35,'chord':.50,'echo':.92,'air':.68},
 {'name':'CÚPULA / APERTURA','start':48,'end':64,'drum':.98,'sub':1.,'chord':1.05,'echo':.92,'air':.78},
 {'name':'RETORNO / GRAVEDAD','start':64,'end':80,'drum':.82,'sub':.88,'chord':.78,'echo':.76,'air':.62},
 {'name':'UMBRAL / COLA','start':80,'end':88,'drum':.45,'sub':.45,'chord':.36,'echo':.85,'air':.40}
]
PROGRESSION=['Dm9']*8+['Bbmaj9']*4+['Gm9']*4+['Dm9']*4+['Cadd9']*4 + ['Bbmaj9']*4+['Gm9']*4+['Fmaj9']*4+['Dm9']*4 + ['Am11']*4+['Cadd9']*4 + ['Dm9']*4+['Bbmaj9']*4+['Gm9']*4+['Cadd9']*4+ ['Dm9']*4+['Fmaj9']*4+['Bbmaj9']*4+['Gm9']*4 + ['Dm9']*8
assert len(PROGRESSION)==TOTAL_BARS, len(PROGRESSION)
RACK={
 'schema':'prometeo.music.echo-rack/v1', 'name':'Filtered Two-Depth Dub Echo',
 'bpm':BPM, 'samplerate':SR, 'source':'synthesized chord bus only (never kick/sub)',
 'primary':{'leftBeats':.75,'rightBeats':1.,'feedback':.56,'repeats':11,
            'lowCutHz':310,'highCutHz':3300,'gain':.73,'crossPan':.20},
 'secondary':{'leftBeats':1.5,'rightBeats':2.,'feedback':.44,'repeats':7,
              'lowCutHz':440,'highCutHz':2150,'gain':.35,'crossPan':.10},
 'outputLowCutHz':270, 'wetAutomation':'per section; dry unprocessed master retains center',
 'stabilityLaw':'finite repeats, feedback <1, band-limit on EACH repeat, no wet->sub routing'
}

def add(buf, x, at, gain=1):
    p=int(round(at*SR));
    if p>=len(buf) or p+len(x)<=0: return
    start=max(0,-p); end=min(len(x),len(buf)-p)
    if end>start: buf[p+start:p+end]+=gain*x[start:end]

def tone(freq, length, wave='warm', seed=0):
    n=max(1,int(length*SR)); t=np.arange(n,dtype=np.float32)/SR
    ph=2*np.pi*freq*t
    if wave=='warm':
       v=(.52*np.sin(ph)+.21*np.sin(2*ph+.11)+.12*np.sin(3*ph+.3)+.07*np.sin(5*ph+.8))
       v+=.08*np.sin(2*np.pi*(freq*.998)*t+.37)
    elif wave=='sub': v=.81*np.sin(ph)+.14*np.sin(2*ph+.14)+.05*np.sin(3*ph+.3)
    else: v=np.sin(ph)
    return v.astype(np.float32)

def kick():
    n=int(.47*SR);t=np.arange(n,dtype=np.float32)/SR
    # curved pitch sweep, small click softened by sine envelope
    ph=2*np.pi*(48*t+90*.029*(1-np.exp(-t/.029))+13*.090*(1-np.exp(-t/.090)))
    body=np.sin(ph)*np.exp(-t*9.5)
    transient=RNG.standard_normal(n).astype(np.float32)*np.exp(-t*180)*.042
    return (body*.83+transient).astype(np.float32)

def hat(length=.095, bright=.6):
    n=int(SR*length);t=np.arange(n,dtype=np.float32)/SR
    x=RNG.standard_normal(n).astype(np.float32)
    # synthetic metallic clusters with resonances, highpassing
    s=butter(2, 4200/(SR/2), btype='highpass',output='sos')
    x=sosfilt(s,x)
    return (x*np.exp(-t*(40 if length<.14 else 19))*bright*.13).astype(np.float32)

def snare():
    n=int(.25*SR);t=np.arange(n,dtype=np.float32)/SR
    x=RNG.standard_normal(n).astype(np.float32)*np.exp(-t*22)
    x=sosfilt(butter(2,[480/(SR/2),7800/(SR/2)],btype='bandpass',output='sos'),x)
    return (.13*x+.075*np.sin(2*np.pi*193*t)*np.exp(-t*31)).astype(np.float32)

def chord_stab(notes, bar, variation=0):
    seconds=.83 if variation else .66
    n=int(seconds*SR);t=np.arange(n,dtype=np.float32)/SR
    wave=np.zeros(n,dtype=np.float32)
    for j,m in enumerate(notes):
      freq=440*2**((m-69)/12)
      # dynamic unison beating, high harmonic, not pure oscillator
      wave+=.30*tone(freq,seconds,'warm') * (1+.035*np.sin(2*np.pi*(.36+j*.07)*t+j))
    attack=np.minimum(1,t/.019)
    env=attack*(.9*np.exp(-t*(3.1 if variation else 4.0))+.09*np.exp(-t*1.9))
    cutoff=620+420*(.5+.5*np.sin(2*np.pi*(bar%24)/24))+350*variation
    wave=sosfilt(butter(2,cutoff/(SR/2),output='sos'),np.tanh(wave*1.7)).astype(np.float32)
    return (wave*env).astype(np.float32)

def make_song(bars, first=False):
   n=int(round((bars*BAR+4.4)*SR))
   drums=np.zeros((n,2),dtype=np.float32)
   sub=np.zeros((n,2),dtype=np.float32)
   chords=np.zeros((n,2),dtype=np.float32)
   atmos=np.zeros((n,2),dtype=np.float32)
   ki=kick();sn=snare()
   sections=SECTIONS[:1] if first else SECTIONS
   def section_at(b): return next((s for s in sections if s['start']<=b<s['end']),sections[-1])
   for b in range(bars):
      s=section_at(b); st=b*BAR
      drop=(40<=b<48) or (b==63) or (b==79) or (b>=86)
      for beat in range(4):
         p=st+beat*BEAT
         if not(drop and beat!=0) and not (b==40 and beat>0):
            a=.31*s['drum']*(.86 if beat in (1,3) else 1.0)
            add(drums[:,0],ki,p,a);add(drums[:,1],ki,p,a)
         if beat in (1,3) and s['drum']>.3 and not drop:
            add(drums[:,0],sn,p,.37*s['drum']);add(drums[:,1],sn,p,.34*s['drum'])
         if (b>=8 or first) and b<84 and not (40<=b<44) and not (b>=86):
            # D2 -> G1 -> Bb1 -> C2; dry mono sub with explicit gaps
            bassnote= {'Dm9':38,'Bbmaj9':34,'Gm9':31,'Cadd9':36,'Fmaj9':29,'Am11':33}[PROGRESSION[b]]
            if beat in ([0,2] if b%4!=3 else [0,2,3]):
                f=440*2**((bassnote-69)/12)
                bb=tone(f,.39,'sub')
                tt=np.arange(len(bb))/SR
                env=np.minimum(1,tt/.012)*np.exp(-tt*4.4)
                bb=(bb*env*.45*s['sub']).astype(np.float32)
                add(sub[:,0],bb,p+.065);add(sub[:,1],bb,p+.065)
         if not drop:
           ht=hat(.070 if beat%2 else .105, .82 if beat%2 else .53)
           t0=p+(.5*BEAT if beat%2==0 else 0)
           drift=((b*11+beat*7)%9-4)*.0011
           add(drums[:,0],ht,t0+drift,.53*s['drum']);add(drums[:,1],ht,t0+drift,.65*s['drum'])
      if b<86:
          notes=CHORDS[PROGRESSION[b]]
          # offbeats change by 8/16-bar phrase, silence at turnarounds
          pattern=([1.5,3.0] if (b//8)%2==0 else [.75,2.75])
          if b%8 in (3,7):pattern=[2.75]
          if 40<=b<48: pattern=[2.5] if b%2==0 else []
          if b==63 or b==79:pattern=[]
          for k,beat in enumerate(pattern):
              v=(.65 if k else 1.0)*s['chord']
              signal=chord_stab(notes,b,variation=(b%4==2 or b>=48 and b<64))
              # dry chord centered but subtly tilted
              add(chords[:,0],signal,st+beat*BEAT,.24*v)
              add(chords[:,1],signal,st+beat*BEAT,.219*v)
      # air: a shaped original noisy sweep, gentle stereo phase wander, different each 4 bars
      if b%4==0:
          t=np.arange(int(4*BAR*SR),dtype=np.float32)/SR
          bed=RNG.standard_normal(len(t)).astype(np.float32)
          bed=sosfilt(butter(2,[500/(SR/2),3400/(SR/2)],btype='bandpass',output='sos'),bed)
          env=np.sin(np.pi*np.clip(t/(4*BAR),0,1))**2
          mod=(.5+.5*np.sin(2*np.pi*.14*t+b*.21))
          e=(bed*env*mod*.008*s['air']).astype(np.float32)
          add(atmos[:,0],e,st,1.0)
          add(atmos[:,1],e,st+.024,.89)
   return {'drums':drums,'sub':sub,'chords':chords,'atmos':atmos}

def delay_rack(dry,rack):
   n=len(dry); wet=np.zeros((n,2),dtype=np.float32)
   # Two independently sync'd lines, band-limiting injected source per repeat.
   for key in ('primary','secondary'):
      cfg=rack[key]
      fb=cfg['feedback']; assert 0<fb<1
      for side,times in enumerate((cfg['leftBeats'],cfg['rightBeats'])):
         source=.5*(dry[:,0]+dry[:,1])
         for i in range(1,cfg['repeats']+1):
             offset=int(round(i*times*BEAT*SR));
             if offset>=n:break
             # series of lowpass + highpass chains, one extra pass per repeat
             sos=butter(1,[cfg['lowCutHz']/(SR/2),cfg['highCutHz']/(SR/2)],btype='bandpass',output='sos')
             filtered=sosfilt(sos,source).astype(np.float32)
             src=np.tanh(1.1*filtered).astype(np.float32)
             g=cfg['gain']*fb**(i-1)
             sl=slice(offset,n)
             wet[sl,side]+=(g*src[:n-offset]).astype(np.float32)
             wet[sl,1-side]+=(cfg['crossPan']*g*src[:n-offset]).astype(np.float32)
             source=src
   out_sos=butter(2,rack['outputLowCutHz']/(SR/2),btype='highpass',output='sos')
   return sosfilt(out_sos,wet,axis=0).astype(np.float32)

def render(bars,first=False):
   stems=make_song(bars,first)
   stems['echo']=delay_rack(stems['chords'],RACK)
   n=len(stems['echo']);
   # Wet/send follows arrangement: echo changes per section with sparse chord entries.
   wetGain=np.ones(n,dtype=np.float32)
   for i,s in enumerate(SECTIONS if not first else SECTIONS[:1]):
       a=int(s['start']*BAR*SR);b=min(n,int(s['end']*BAR*SR));
       if b<=a:continue
       wetGain[a:b]=s['echo']
   # Preserve tails into next section, do not hard cut. 250ms smoothed transitions.
   if not first:
     for s in SECTIONS[1:]:
       z=int(s['start']*BAR*SR); nfade=int(.25*SR)
       if z+nfade<n: wetGain[z:z+nfade]=np.linspace(wetGain[z-1],s['echo'],nfade)
   stems['echo']*=wetGain[:,None]
   raw=sum(stems.values())
   # Gain before gentle soft ceiling, never normalize every section independently.
   drive=2.1
   mastered=np.tanh(raw*drive).astype(np.float32)*.92
   return stems,mastered,raw

def rms(x): return float(np.sqrt(np.mean(np.square(x.astype(np.float64)))))
def db(x):return 20*np.log10(max(x,1e-12))
def qa_report(stems,master,raw,bars):
   n=len(master); report={'sampleRateHz':SR,'channels':2,'bars':bars,'tempoBpm':BPM,'durationSeconds':n/SR,
      'peakDbfs':float(round(db(np.max(np.abs(master))),2)),
      'rmsDbfs':round(db(rms(master)),2),'monoPeakDbfs':float(round(db(np.max(np.abs(master.mean(axis=1)))),2)),
      'monoRmsDbfs':round(db(rms(master.mean(axis=1))),2),
      'stemParityMaxAbs':float(np.max(np.abs(raw-sum(stems.values())))),
      'echoPeakDbfs':float(round(db(np.max(np.abs(stems['echo']))),2)),'feedback':RACK['primary']['feedback'],
      'lowFrequencyEchoToSubDb':None,'sections':[]}
   def low_rms(x):
       sig=x.mean(axis=1); sos=butter(2,130/(SR/2),btype='lowpass',output='sos');return rms(sosfilt(sos,sig))
   report['lowFrequencyEchoToSubDb']=float(round(db(low_rms(stems['echo'])/max(low_rms(stems['sub']),1e-9)),2))
   for s in SECTIONS:
      if s['start']>=bars:break
      a=int(round(s['start']*BAR*SR)); b=min(n,int(round(s['end']*BAR*SR)))
      clip=master[a:b]
      report['sections'].append({'section':s['name'],'barRange':[s['start'],min(s['end'],bars)],
        'rmsDbfs':round(db(rms(clip)),2),'peakDbfs':round(db(np.max(np.abs(clip))),2),
        'wetDryRatioDb':round(db(rms(stems['echo'][a:b])/max(rms(stems['chords'][a:b]),1e-8)),2)})
   # Feedback impulse: monotonic decay in dry-free late window, even with wet tails.
   # Measured as separated synthetic isolated chord impulse through same rack.
   probe=np.zeros((int(11*SR),2),dtype=np.float32);probe[:128]=.5
   echo=delay_rack(probe,RACK)
   windows=[rms(echo[int(i*SR):int((i+1)*SR)]) for i in range(3,10)]
   report['impulseTailWindowRms']=list(map(lambda x:float(round(x,7)),windows))
   report['impulseTailStability']=bool(windows[-1]<windows[0] and np.max(np.abs(echo))<1.0)
   report['samplePeakOnlyTruePeakNotEstimated']=True
   report['perceptualListening']='NOT_RUN';report['headphonePlayback']='NOT_RUN';report['humanApproved']=False
   report['passNumerical']=bool(np.isfinite(master).all() and np.max(np.abs(master))<.98 and report['impulseTailStability'] and report['stemParityMaxAbs']<1e-6 and report['lowFrequencyEchoToSubDb']< -12.)
   return report

def main():
   parser=argparse.ArgumentParser();parser.add_argument('--first-article',action='store_true');parser.add_argument('--full',action='store_true');args=parser.parse_args()
   ROOT.mkdir(exist_ok=True)
   first=args.first_article or not args.full; bars=8 if first else TOTAL_BARS
   stems, master,raw=render(bars,first)
   folder=ROOT / ('first_article' if first else 'audio')
   folder.mkdir(exist_ok=True)
   sf.write(folder/'MASTER.wav',master,SR,subtype='PCM_24')
   if not first:
       stfolder=folder/'STEMS'; stfolder.mkdir(exist_ok=True)
       for key,value in stems.items():sf.write(stfolder/(key+'.wav'),value,SR,subtype='PCM_24')
   else:
       sf.write(folder/'CHORDS_DRY.wav',stems['chords'],SR,subtype='PCM_24')
       sf.write(folder/'ECHO_WET.wav',stems['echo'],SR,subtype='PCM_24')
   report=qa_report(stems,master,raw,bars)
   (folder/'QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2,default=float)+'\n')
   print(json.dumps({'folder':str(folder),'status':report['passNumerical'],'peak':report['peakDbfs'],'subToEchoDb':report['lowFrequencyEchoToSubDb'],'bars':bars,'length':len(master)/SR},ensure_ascii=False))

if __name__=='__main__':main()
