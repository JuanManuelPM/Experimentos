import numpy as np, soundfile as sf, json, subprocess, pathlib,hashlib
folder=pathlib.Path(__file__).parent/'export'; bpm=124; bar=4*60/bpm
wav=folder/'master.wav'; master,sr=sf.read(wav,dtype='float32',always_2d=True)
checks={}
checks['durationSeconds']=round(len(master)/sr,3)
checks['peakSampleDbfs']=round(20*np.log10(np.max(np.abs(master))),2)
checks['rmsDbfs']=round(20*np.log10(np.sqrt(np.mean(master**2))),2)
checks['channels']=master.shape[1]
checks['sampleRate']=sr
checks['nonFiniteSamples']=int((~np.isfinite(master)).sum())
checks['clippedFrames']=int(np.sum(np.max(np.abs(master),axis=1)>=.999))
checks['longSilenceFrames']=int(np.sum(np.abs(master).max(axis=1)<1e-7))
checks['monoDownmixRmsDbfs']=round(20*np.log10(np.sqrt(np.mean(master.mean(axis=1)**2))+1e-12),2)
checks['leftRightCorrelation']=round(float(np.corrcoef(master[:,0],master[:,1])[0,1]),3)
# Stem parity against written premix. Files quantized to PCM16, render mix before soft clipping.
sf_stems={n:sf.read(folder/f'{n}.flac',dtype='float32',always_2d=True)[0] for n in ['kick','percussion','bass','harmony','motif','space']}
premix,_=sf.read(folder/'premix.flac',dtype='float32',always_2d=True)
checks['stemLengthsMatch']=all(len(v)==len(master) for v in sf_stems.values())
combined=np.zeros_like(master)
for v in sf_stems.values():combined+=v
checks['stemSumVsPremixRmsError']=round(float(np.sqrt(np.mean((np.clip(combined,-1,1)-premix)**2))),7)
# Test large spikes on 8-bar chunk seams; compare to typical one-sample derivative magnitude.
diff=np.abs(np.diff(master,axis=0)).max(axis=1)
seams=[round(i*8*bar*sr) for i in range(1,26)]
checks['seamMaxStep']=round(float(max(diff[min(max(0,idx-2),len(diff)-1):min(idx+2,len(diff))].max() for idx in seams)),6)
checks['derivativeP999']=round(float(np.quantile(diff,.999)),6)
checks['seamComparedToP999']=round(checks['seamMaxStep']/checks['derivativeP999'],2)
# Independently generated equal-RMS A/B excerpts: intro, before climax, climax, return, outro.
parts=[('INTRO',8),('DERIVA',64),('PRECLIMAX',112),('CUMBRE',136),('RETORNO',164),('OUTRO',184)]
excerpts=[]
for name,start in parts:
    frames=round(4*bar*sr); a=master[round(start*bar*sr):round(start*bar*sr)+frames].copy()
    if len(a)<frames: continue
    rms=float(np.sqrt(np.mean(a*a)));excerpts.append((name,a,rms))
# level matching works within a conservative -21 dBFS RMS target, no boosted beyond .96 sample peak
ref=min(x[2] for x in excerpts)
chunks=[];notes=[]
for name,a,r in excerpts:
    mul=min(ref/max(1e-12,r), .96/np.max(np.abs(a)))
    a*=mul
    tail=np.zeros((int(.4*sr),2),dtype=np.float32)
    chunks.extend([a,tail]);notes.append({'section':name,'gainDb':round(20*np.log10(mul),2),'comparisonRmsDbfs':round(20*np.log10(np.sqrt(np.mean(a*a))+1e-12),2)})
sf.write(folder/'AB_equal_level.wav',np.concatenate(chunks),sr,subtype='PCM_16')
checks['equalLevelAB']=notes
# Per-section metrics measured from audio, not just settings
meas={}
for s in json.loads((pathlib.Path(__file__).parent/'PROJECT.json').read_text())['sections']:
    v=master[round(s['start']*bar*sr):round((s['start']+s['bars'])*bar*sr)]
    meas[s['name']]={'rmsDb':round(20*np.log10(np.sqrt(np.mean(v*v))+1e-12),2),'peakDb':round(20*np.log10(np.max(np.abs(v))+1e-12),2),'bars':s['bars'],'startSeconds':round(s['start']*bar,1)}
checks['sectionsMeasured']=meas
checks['firstArticleRecordedBeforeFullRender']='first_article/first_article.wav: first 8-bar synth/drum intro; did NOT isolate advanced motif risk prior to full render'
checks['audioPerceptualListening']='NOT_RUN: independent human listening not available; signal checks are not musical approval'
checks['browser390and1440']='NOT_RUN: chromium command blocked/timed out, no fabricated screenshots'
checks['sourcePublished']='PENDING'
checks['humanApproved']=False
checks['sha256']={x.name:hashlib.sha256(x.read_bytes()).hexdigest() for x in [folder/'master.mp3',folder/'master.wav',folder/'AB_equal_level.wav']}
(folder/'QA_RECEIPT.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2,default=lambda x: float(x) if hasattr(x,"item") else str(x)))
print(json.dumps({k:v for k,v in checks.items() if k not in ('sha256','equalLevelAB')},ensure_ascii=False,indent=2,default=lambda x: float(x) if hasattr(x,"item") else str(x)))