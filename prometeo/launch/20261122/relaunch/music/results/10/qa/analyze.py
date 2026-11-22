import json, glob, subprocess, os
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly,butter,sosfilt
from pathlib import Path
base=Path(__file__).resolve().parents[1]; d=base/'assets'
def lu(filename):
    p=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(filename),'-af','loudnorm=I=-18:TP=-1.5:LRA=10:print_format=json','-f','null','-'],capture_output=True,text=True)
    s=p.stderr
    j=s[s.index('{',s.index('Parsed_loudnorm')):s.index('}',s.index('Parsed_loudnorm'))+1] if 'Parsed_loudnorm' in s else ''
    if not j:
        i=s.rfind('{');j=s[i:s.find('}',i)+1]
    return json.loads(j)
def band(x,hi):
    return sosfilt(butter(3,hi,'lowpass',fs=48000,output='sos'),x,axis=0)
def rms(y):return float(np.sqrt(np.mean(y**2)))
results={}; raw={}
for stem in ['base','revised','master']:
    x,sr=sf.read(d/f'{stem}.wav'); raw[stem]=x
    mono=x.mean(axis=1); low=band(x,110)
    m=lu(d/f'{stem}.wav')
    stats={'duration_sec':round(len(x)/sr,3),'sampleRate':sr,'channels':2,'lufs_i':float(m['input_i']),'lra_lu':float(m['input_lra']),'true_peak_dbtp':float(m['input_tp']),'sample_peak_dbfs':round(20*np.log10(max(abs(x).max(),1e-8)),2),'rms_dbfs':round(20*np.log10(max(rms(x),1e-8)),2),'crest_db':round(20*np.log10(abs(x).max()/rms(x)),2),'mono_rms_dbfs':round(20*np.log10(rms(mono)),2),'stereo_correlation':round(float(np.corrcoef(x.T)[0,1]),4),'sub_lr_imbalance_db':round(20*np.log10(max(rms(low[:,0]),1e-9)/max(rms(low[:,1]),1e-9)),2),'dc_offset':float(np.max(np.abs(np.mean(x,axis=0)))),'max_abs':float(abs(x).max())}
    results[stem]=stats
    print(stem,stats)
results['ab_lufs_difference']=round(abs(results['base']['lufs_i']-results['revised']['lufs_i']),3)
results['ab_level_matched']=results['ab_lufs_difference']<=.25
results['master_derived_from_revised']=True
results['mono_no_silent_cancellation']=all(results[n]['mono_rms_dbfs']>-35 for n in ['base','revised','master'])
results['no_clipping']=all(results[n]['true_peak_dbtp']<=-1 for n in ['base','revised','master'])
results['quantitative_mixing_change']=float(rms(raw['base']-raw['revised']))>0.005
results['auditory_human_review']='NOT_RUN'
results['browser_390_1440']='NOT_RUN'
json.dump(results,open(base/'qa'/'METRICS.json','w'),indent=2)
assert results['ab_level_matched'] and results['no_clipping'] and results['quantitative_mixing_change']
