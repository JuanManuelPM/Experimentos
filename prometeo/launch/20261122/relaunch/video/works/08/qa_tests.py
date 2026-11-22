#!/usr/bin/env python3
"""Deterministic numeric, geometry, codec and thumbnail checks for W003-08."""
import hashlib, json, subprocess, sys, csv, math
from pathlib import Path
from PIL import Image, ImageFont
from data_to_motion_v3 import load,frame,ROOT,BG,INK,ACCENT,MUTED
V=load(); o={}
assert len(V)==146 and V[0]==(1880,-.17) and V[-1]==(2025,1.18)
assert dict(V)[2024]==1.28
assert [y for y,_ in V]==list(range(1880,2026))
minval,maxval=-.6,1.4
assert all(minval<=v<=maxval for y,v in V)
# constant axis and direct mapping; no data rescaling, smoothing or extrapolation
py=lambda v: 454-(v-minval)/(maxval-minval)*204
assert py(-.5)>py(0)>py(.5)>py(1.0)
assert math.isclose(py(0)-py(1),102)
o['DATA_NUMERIC']='PASS';o['AXIS_FIXED']='PASS';o['REBASE_DOCUMENTED']='1951-1980'

def contrast(a,b):
 def ll(v):
  import re
  rgb=[int(v[i:i+2],16)/255 for i in (1,3,5)]
  lin=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in rgb]
  return .2126*lin[0]+.7152*lin[1]+.0722*lin[2]
 l1,l2=sorted((ll(a),ll(b)),reverse=True)
 return (l1+.05)/(l2+.05)
for x in (INK,MUTED,ACCENT):assert contrast(x,BG)>=4.5
for w,h in [(960,540),(540,960)]:
 for t in [0,5.6,12.4,19.5,23.5]:
  pic=frame(t,w,h);assert pic.size==(w,h)
  assert len(set(pic.resize((96,96)).getdata()))>=15
# Mobile first-article rewrite: two-line title must fit 390 CSS px
font='/usr/share/fonts/truetype/lato/Lato-Heavy.ttf'
assert ImageFont.truetype(font,56).getlength('INVISIBLE')<450
assert ImageFont.truetype(font,23).getlength('LA TENDENCIA NO DESAPARECE')<450
o['VISUAL_FRAMES_RENDERED']='PASS';o['MOBILE_TEXT_WIDTH_MEASURED']='PASS';o['CONTRAST_TEXT_AA_NOMINAL']='PASS'
files={
 'landscape':Path('/mnt/data/LA_CIFRA_INVISIBLE_W003_08.mp4'),
 'portrait':Path('/mnt/data/LA_CIFRA_INVISIBLE_W003_08_VERTICAL.mp4')}
for name,path in files.items():
 assert path.is_file()
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,codec_type,width,height,nb_frames,r_frame_rate','-of','json',str(path)]))
 assert abs(float(probe['format']['duration'])-24.0)<.02
 st=probe['streams'];v=next(x for x in st if x['codec_type']=='video');a=next(x for x in st if x['codec_type']=='audio')
 assert v['codec_name']=='h264' and a['codec_name']=='aac'
 assert (v['width'],v['height'])==((960,540) if name=='landscape' else (540,960))
 assert int(v['nb_frames'])==(576 if name=='landscape' else 480)
 subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(path),'-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 o[name]={"codec":"H264/AAC","duration":float(probe['format']['duration']),"frames":int(v['nb_frames']),"resolution":f"{v['width']}x{v['height']}","bytes":int(probe['format']['size']),"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"DECODE_FULL":"PASS"}
o['DEVICE_ANDROID']='NOT_RUN';o['BROWSER_PAGES']='NOT_RUN';o['HUMAN_APPROVED']='NO';o['AUDIO_SUBJECTIVE_LISTENING']='NOT_RUN';o['CONTENT_INDEPENDENT_REVIEW']='NOT_RUN'
(ROOT/'QA_RESULTS.json').write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(o,ensure_ascii=False,indent=2))
