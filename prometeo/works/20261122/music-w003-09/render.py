#!/usr/bin/env python3
"""PUNTO DE RETORNO: original synthesis, deterministic section arrangement, stem renderer.
CC0-like self-created code and sounds; no third-party audio source is used.
Requires numpy, scipy, soundfile. Python 3.11+.
Usage: python render.py --bars 8 --out first_article ; python render.py --out export
"""
from __future__ import annotations
import argparse, json, math, pathlib, hashlib, os, time
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import soundfile as sf

SR=44100; BPM=124; BEATS=4; SPB=60/BPM; BAR=4*SPB
STEMS=['kick','percussion','bass','harmony','motif','space']
SECTIONS=[
 {'name':'UMBRAL','start':0,'bars':32,'role':'DJ intro: kick/hat, filtered motif ghost, open key center','density':.19},
 {'name':'HUELLA','start':32,'bars':24,'role':'bass begins / harmonic imprint','density':.38},
 {'name':'DERIVA','start':56,'bars':32,'role':'countermotif, warm voicings, rhythmic development','density':.54},
 {'name':'VACÍO','start':88,'bars':16,'role':'deliberate subtraction: melody remains, no four-on-floor','density':.17},
 {'name':'ASCENSO','start':104,'bars':24,'role':'harmonic tension, increasing onset density and register','density':.63},
 {'name':'CUMBRE','start':128,'bars':32,'role':'full phrase release with counterpoint, not louder master','density':.91},
 {'name':'RETORNO','start':160,'bars':16,'role':'initial four-note motif exposed one octave lower','density':.43},
 {'name':'SALIDA','start':176,'bars':32,'role':'DJ outro: remove tonal voices, leave dependable drums','density':.21},
]
# D minor, Bbmaj9, Fmaj9/A, Cadd9. Four bars per chord, repeat in 16-bar period.
ROOTS=[38,34,41,36]
CHORDS=[[50,53,57,60,64],[46,50,53,57,60],[45,53,57,60,67],[48,52,55,62,67]]
MOTIF=[(0,74),(1.5,77),(2.75,76),(3.5,72),(5,69),(6.5,72),(7.25,74)]
MOTIF_RETURN=[(0,62),(1.5,65),(2.75,64),(3.5,60),(5,57),(6.5,60),(7.25,62)]
RNG=np.random.default_rng(2026112209)

def hz(m): return 440 * (2**((m-69)/12))
def osc(freq,t,kind='soft',phase=0):
    # band-limited additive sound, intentional harmonic weighting and modulation; avoids single-oscillator presets
    p=2*np.pi*freq*t + phase
    if kind=='sub': return np.sin(p)+0.11*np.sin(2*p+.43)+.034*np.sin(3*p)
    if kind=='pluck': return (np.sin(p)+.36*np.sin(2*p+.7)+.17*np.sin(3*p+1.1)+.06*np.sin(5*p)) / 1.65
    return (np.sin(p)+.17*np.sin(2*p+.5)+.12*np.sin(3*p+.9)+.06*np.sin(4*p)) / 1.35

def sigmoid(x):return 1/(1+np.exp(-x))
def smooth_env(n,attack,release):
    i=np.arange(n); return np.minimum(1,np.maximum(.0,i/(max(1,attack*SR))))*np.minimum(1,np.maximum(.0,(n-i)/(max(1,release*SR))))

def insert(dst,sig,sec,pan=0):
    st=int(round(sec*SR)); k=min(len(sig),len(dst)-st)
    if k<=0 or st<0:return
    if sig.ndim==2:
        dst[st:st+k]+=sig[:k];return
    a=math.sqrt((1-pan)/2); b=math.sqrt((1+pan)/2)
    dst[st:st+k,0]+=sig[:k]*a; dst[st:st+k,1]+=sig[:k]*b

def lowpass(x,cutoff):
    return sosfilt(butter(2,cutoff,fs=SR,output='sos'),x).astype(np.float32)

def sec_at(bar):
    return next(s for s in SECTIONS if s['start']<=bar<s['start']+s['bars'])

def curve(section,local,bar):
    t=local/max(1,section['bars']-1)
    if section['name']=='UMBRAL':return min(1, .28+t*.45)
    if section['name']=='HUELLA':return .58+.16*t
    if section['name']=='DERIVA':return .64+.19*t
    if section['name']=='VACÍO':return .10+.06*t
    if section['name']=='ASCENSO':return .47+.52*t
    if section['name']=='CUMBRE':return .87+ .06*np.sin(2*np.pi*t)
    if section['name']=='RETORNO':return .38-.13*t
    return max(.22,.6-.43*t)

def drum_kick(b=0):
    n=int(.63*SR); t=np.arange(n)/SR
    phase=2*np.pi*(48*t + 72*.041*(1-np.exp(-t/.041)))
    body=np.sin(phase)*np.exp(-t*10.5)
    click=(RNG.standard_normal(n).astype(np.float32)*np.exp(-t*210)*.24)
    return (body + click).astype(np.float32)*.79

def clap():
    n=int(.22*SR);t=np.arange(n)/SR
    noise=RNG.standard_normal(n).astype(np.float32)
    hp=noise-lowpass(noise,850)
    bursts=np.exp(-t*25)+.55*np.exp(-((t-.018)/.010)**2)+.37*np.exp(-((t-.044)/.014)**2)
    return (hp*bursts*.13).astype(np.float32)

def hat(open_=False):
    dur=.34 if open_ else .075;n=int(dur*SR);t=np.arange(n)/SR
    v=RNG.standard_normal(n).astype(np.float32)
    hp=v-lowpass(v,4700)
    env=np.exp(-t*(12 if open_ else 65))
    return (hp*env*(.105 if open_ else .08)).astype(np.float32)

def bass_note(midi,dur,vel):
    n=int((dur+.08)*SR);t=np.arange(n)/SR
    f=hz(midi); w=osc(f,t,'sub')
    # subtle pitch fall on the initial 30 ms + asymmetric harmonic body
    pinch=.02*np.sin(2*np.pi*f*2.03*t)*np.exp(-t*17)
    env=(1-np.exp(-t*160))*np.minimum(1,np.maximum(0,(dur+.05-t)/.13))*np.exp(-t*.55)
    x=np.tanh(1.45*(w+pinch))*env*vel*.38
    return lowpass(x,1050)

def chord_note(midi,dur,weight,pan):
    n=int((dur+.4)*SR);t=np.arange(n)/SR;f=hz(midi)
    v=(osc(f,t,'soft')+.50*osc(f*1.0021,t,'soft',.7)+.20*osc(f*.9991,t,'soft',1.8))/1.7
    trem=.82+.18*np.sin(2*np.pi*.16*t+pan*4)
    env=(1-np.exp(-t*3.5))*np.minimum(1,np.maximum(0,(dur+.37-t)/.6))
    return lowpass(v*trem*env*weight*.125,2900)

def phrase_note(midi,dur,weight):
    n=int((dur+.18)*SR);t=np.arange(n)/SR;f=hz(midi)
    jitter=1+.0007*np.sin(2*np.pi*5.1*t)
    p=2*np.pi*f*np.cumsum(jitter)/SR
    v=np.sin(p)+.27*np.sin(2*p+.5)+.11*np.sin(3*p+1.6)+.08*np.sin(5*p)
    env=(1-np.exp(-t*100))*np.exp(-t/(dur*.63+.05))*np.minimum(1,np.maximum(0,(dur+.13-t)/.10))
    return lowpass(np.tanh(v*.73)*env*weight*.27,4100)

def stereo_echo(x,delays=(.247,.405),feedback=.2):
    out=x.copy()
    for j,d in enumerate(delays):
        samples=int(SR*d)
        for times in range(1,4):
            off=samples*times
            if off<len(x):
                out[off:,j]+=x[:-off,1-j]*(feedback**times)
    return out

def render_chunk(start_bar,num_bars=8):
    frames=round(num_bars*BAR*SR)
    # Last bar varies fractionally due to nearest integer; exact bar boundaries are computed by samples of global timeline.
    outputs={name:np.zeros((frames,2),dtype=np.float32) for name in STEMS}
    for b in range(num_bars):
        global_b=start_bar+b; s=sec_at(global_b); local=global_b-s['start'];section=s['name']; val=float(curve(s,local,global_b))
        onset=b*BAR; chord_idx=(global_b//4)%4
        root=ROOTS[chord_idx]; chord=CHORDS[chord_idx]
        is_break=section=='VACÍO'
        # Kick: drops for deliberate negative space; no random displacement of downbeat.
        if not is_break:
            for beat in range(4):
                insert(outputs['kick'],drum_kick(),onset+beat*SPB,.0)
        elif local in [0,8,15]:
            insert(outputs['kick'],drum_kick(),onset,0)
        if section!='VACÍO':
            for step in range(8):
                if (section=='UMBRAL' and global_b<8 and step%2) or (section=='SALIDA' and global_b>=192 and step%2):continue
                v=hat(open_=(step==7 and (global_b%4==3)))
                insert(outputs['percussion'],v,onset+step*SPB/2+(.008 if step%2 else 0),.32 if step%2 else -.23)
            if section not in ('UMBRAL',) or global_b>=16:
                for bb in [1,3]:insert(outputs['percussion'],clap(),onset+bb*SPB,.08)
            if section in ('DERIVA','ASCENSO','CUMBRE'):
                for step in [2,5,10,13]:
                    if (global_b*17+step)%7==0:continue
                    insert(outputs['percussion'],hat(),onset+step*SPB/4+.013,.48)
            if local%8==7 and section not in ('UMBRAL','SALIDA'):
                for z in range(4):insert(outputs['percussion'],clap()*.23,onset+(3+z/4)*SPB,-.3+z*.2)
        if section not in ['UMBRAL','VACÍO'] and not (section=='SALIDA' and local>=8):
            # low-end counterpoint stays under the kick, using 4 alternate rhythms every 4 bars
            rhythm=[(0,.78),(1.48,.51),(2.75,.56),(3.46,.28)]
            if global_b%4==3:rhythm=[(0,.69),(1.25,.4),(2.25,.55),(3.33,.42)]
            if section=='CUMBRE':rhythm += [(2.0,.27)]
            for beat,vel in rhythm:
                tone=root if beat <2 else (root+7 if (global_b%4==3 and beat>3) else root+12)
                insert(outputs['bass'],bass_note(tone,.27,vel),onset+beat*SPB,-.03)
        # Chords: on cycle for four-bar resonance, revoice at section boundaries.
        if global_b%4==0 and section not in ('SALIDA',):
            if section=='UMBRAL' and global_b<16:pass
            elif section=='VACÍO' or section=='RETORNO' or section=='ASCENSO' or section=='CUMBRE' or section in ['HUELLA','DERIVA'] or global_b>=16:
                base=.51 if section in ('UMBRAL','RETORNO') else (.82 if section=='VACÍO' else 1.0)
                for j,m in enumerate(chord):
                    insert(outputs['harmony'],chord_note(m,4*BAR-.27,base*(.68 if j==0 else 1), (j-2)*.16),onset,(j-2)*.21)
        # local shorter chord stabs resolve chromatically during ascent, never a noise riser
        if section in ('ASCENSO','CUMBRE') and global_b%2==1:
            for j,note in enumerate([chord[1]+12,chord[3]+12]):
                insert(outputs['harmony'],phrase_note(note,.7,.26 if section=='ASCENSO' else .4),onset+1.5*SPB,.3*(j*2-1))
        # Exposed theme, variable register and density. One little idea changes its role throughout.
        if section in ('DERIVA','VACÍO','ASCENSO','CUMBRE','RETORNO') or (section=='HUELLA' and global_b>=40):
            melody=MOTIF_RETURN if section=='RETORNO' else MOTIF
            # in a 2-bar phrase, transpose with harmony while preserving intervals
            if global_b%2==0:
                shift=[0,-4,3,-2][chord_idx]
                for beat,midi in melody:
                    if section=='ASCENSO' and local<8 and beat>=5:continue
                    if section=='VACÍO' and beat in (1.5,6.5):continue
                    if section=='DERIVA' and beat in (2.75,6.5) and local<16:continue
                    if section=='CUMBRE':shift_m=shift+12 if (local%8)>=4 else shift
                    else:shift_m=shift
                    if section=='RETORNO':shift_m=0
                    insert(outputs['motif'],phrase_note(midi+shift_m,.34 if section!='VACÍO' else .72,.77 if section=='CUMBRE' else .56),onset+beat*SPB,(-.3 if int(beat*2)%2 else .25))
        # atmospheric tonal particles, no imported field recordings or white noise riser
        if section not in ('SALIDA','UMBRAL') and global_b%4 in (1,3):
            note=chord[-1]+(12 if section in ['ASCENSO','CUMBRE'] else 0)
            n=int(1.4*SR); t=np.arange(n)/SR
            drifting=np.sin(2*np.pi*hz(note)*t+1.3*np.sin(2*np.pi*.32*t))
            e=np.sin(np.pi*np.clip(t/1.4,0,1))**2
            insert(outputs['space'],drifting*e*.04,onset+2.25*SPB, -.65 if global_b%4==1 else .65)
    # Continuous-within-phrase echo; side-chain duck reduces harmonic/bass collisions with kick.
    for name in ('harmony','motif','space'):
        outputs[name]=stereo_echo(outputs[name], feedback=.15 if name=='harmony' else .23)
    t=np.arange(frames)/SR
    ph=(t + start_bar*BAR) % SPB
    duck=1-.30*np.exp(-ph/.18) # kick hole for low end, gentle on melody
    outputs['bass'] *= (1-.24*np.exp(-ph/.12))[:,None].astype(np.float32)
    outputs['harmony'] *= duck[:,None].astype(np.float32)
    return outputs

def generate(out,num_bars,first=False):
    out=pathlib.Path(out);out.mkdir(parents=True,exist_ok=True)
    filenames={k:out/(k+'.flac') for k in STEMS}
    f={k:sf.SoundFile(path,mode='w',samplerate=SR,channels=2,format='FLAC',subtype='PCM_16') for k,path in filenames.items()}
    master=sf.SoundFile(out/'master.wav','w',SR,2,format='WAV',subtype='PCM_24')
    dry=sf.SoundFile(out/'premix.flac','w',SR,2,format='FLAC',subtype='PCM_16')
    firstpart=sf.SoundFile(out/'first_article.wav','w',SR,2,format='WAV',subtype='PCM_16') if first else None
    musicmetrics=[];gain={'kick':.48,'percussion':.8,'bass':1.05,'harmony':.91,'motif':.74,'space':.9}
    for start in range(0,num_bars,8):
        nums=min(8,num_bars-start)
        tracks=render_chunk(start,nums)
        sumv=np.zeros_like(tracks['kick'])
        for name in STEMS:
            tracks[name]*=gain[name]
            np.clip(tracks[name],-1,1,out=tracks[name])
            f[name].write(tracks[name]);sumv+=tracks[name]
        dry.write(np.clip(sumv,-1,1))
        # True nominal master is nonlinear, soft saturation only on high peaks, not limit-to-loudness.
        mix=np.tanh(sumv*.90)*.86
        master.write(mix)
        if firstpart is not None:firstpart.write(mix)
        for j in range(nums):
            local=mix[round(j*BAR*SR):round((j+1)*BAR*SR)]
            if local.size==0:continue
            musicmetrics.append({'bar':start+j+1,'section':sec_at(start+j)['name'], 'rms':round(float(np.sqrt(np.mean(local**2))),6),'peak':round(float(np.max(np.abs(local))),6), 'crestDb':round(float(20*np.log10((np.max(np.abs(local))+1e-9)/(np.sqrt(np.mean(local**2))+1e-9))),2)})
        if start%32==0:print('render',start,'/',num_bars,flush=True)
    for v in [*f.values(),master,dry,firstpart]:
        if v is not None:v.close()
    return musicmetrics

def analyze_rms(metrics):
    slices={s['name']:[a['rms'] for a in metrics if a['section']==s['name']] for s in SECTIONS}
    return {k:{'rms_mean':round(float(np.mean(v)),5),'rms_min':round(float(np.min(v)),5),'rms_max':round(float(np.max(v)),5)} for k,v in slices.items() if v}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--out',default='export');ap.add_argument('--bars',type=int,default=208);ap.add_argument('--project',default=None,help='Editable arrangement JSON');args=ap.parse_args()
    global SECTIONS, ROOTS, CHORDS, MOTIF, MOTIF_RETURN
    if args.project:
        project=json.loads(pathlib.Path(args.project).read_text())
        SECTIONS=project['sections'];ROOTS=project['harmony']['rootsMidi'];CHORDS=project['harmony']['chordsMidi']
        MOTIF=project['motifs']['main'];MOTIF_RETURN=project['motifs']['return']
        assert SECTIONS[-1]['start']+SECTIONS[-1]['bars']>=args.bars, 'Project must cover complete render'
    if args.bars<1 or args.bars>208:ap.error('--bars must be between 1 and 208')
    t=time.time();metrics=generate(args.out,args.bars,first=args.bars==8)
    receipt={'taskId':'music-w003-20261122-09','title':'PUNTO DE RETORNO','bpm':BPM,'key':'D minor','sampleRate':SR,'totalBars':args.bars,'durationSeconds':round(args.bars*BAR,3),'sectionDesign':SECTIONS,'measuredSectionDynamics':analyze_rms(metrics),'perBarActualAudio':metrics,'renderSeconds':round(time.time()-t,2),'authorship':'All sounds DSP synthesized by render.py; no external samples'}
    path=pathlib.Path(args.out)/'RENDER_QA.json';path.write_text(json.dumps(receipt,indent=2,ensure_ascii=False))
    print('done',path,receipt['durationSeconds'],'sec', receipt['measuredSectionDynamics'])
if __name__=='__main__':main()