import json
from pathlib import Path
import numpy as np
import soundfile as sf
from motif_transform import transform,interpolate_curve
b=Path(__file__).parent
s=json.loads((b/'score.json').read_text())
assert len(s['movements'])==4 and s['durationSeconds']==192
notes=s['motif']
assert len(transform(notes,retrograde=True))==len(notes)
assert [x['note'] for x in transform(notes,invert_axis=69)] != [x['note'] for x in notes]
assert [x['note'] for x in transform(notes,transpose=-12)]!=[x['note'] for x in notes]
a=np.array(interpolate_curve([(0,0),(1,1)], np.linspace(0,1,101)))
assert np.all(np.diff(a)>=0) and abs(a[0])<1e-9 and abs(a[-1]-1)<1e-9
x,sr=sf.read(b/'master'/'MASTER.flac',dtype='float32')
assert sr==44100 and len(x)==192*sr and x.shape[1]==2
assert np.max(np.abs(x))<0.9
assert np.max(np.abs(x[-10:]))<0.002
for i in [48,96,144]:
 c=x[i*sr-1:i*sr+1,:]
 assert np.max(np.abs(np.diff(c,axis=0)))<0.2, (i,c)
energies=[]
for i in range(4):
 q=x[i*48*sr:(i+1)*48*sr]
 energies.append(round(float(20*np.log10(np.sqrt(np.mean(q*q))+1e-12)),2))
assert len(set(energies))==4
print({'score':'PASS','motif_transform':'PASS','smooth_curves':'PASS', 'audio':'PASS','movementRMSdBFS':energies,'transitions':'PASS','fadeToSilence':'PASS'})
