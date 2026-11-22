#!/usr/bin/env python3
"""LA CIFRA INVISIBLE 08 / W003: deterministic NASA GISTEMP CSV -> editorial motion film.
All line geometry uses raw annual values in fixed °C domain; no extrapolation or smoothing.
Dependencies: Python 3, Pillow, numpy, FFmpeg. Fonts are OS fonts, not redistributed.
"""
import argparse, csv, math, subprocess, wave, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
ROOT=Path(__file__).resolve().parent
DATA=ROOT/'nasa_gistemp_20261110_snapshot.csv'
BG='#121a23'; INK='#e9ede9'; MUTED='#a0afba'; RULE='#334350'; ACCENT='#ff996b'; BLUE='#75c6cf'
FONT='/usr/share/fonts/truetype/lato/Lato-Regular.ttf'; BOLD='/usr/share/fonts/truetype/lato/Lato-Heavy.ttf'
try: ImageFont.truetype(BOLD,22)
except OSError: BOLD=FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def load(path=DATA):
    with open(path,encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
    values=[(int(row['year']),float(row['anomaly_c'])) for row in rows]
    assert len(values)==146 and [y for y,_ in values]==list(range(1880,2026)), 'Unvollständige Jahresreihe / serie inválida'
    assert dict(values)[2024]==1.28 and dict(values)[2025]==1.18
    assert all(-.6<=v<=1.4 for _,v in values)
    return values

DATASET=load()
def ease(v):
    v=max(0,min(1,v));return v*v*(3-2*v)
def clamp(v):return max(0,min(1,v))
def font(px,bold=False):return ImageFont.truetype(BOLD if bold else FONT,max(10,round(px)))
def text(draw, xy, string, size, color=INK, bold=False, anchor=None, spacing=0):
    draw.text(xy,string,font=font(size,bold),fill=color,anchor=anchor,spacing=spacing)

def frame(t,w=960,h=540):
    portrait = h/w > 1.05
    S=w/540 if portrait else w/960
    im=Image.new('RGB',(w,h),BG);d=ImageDraw.Draw(im)
    if portrait:
        x0=int(46*S); x1=w-int(46*S); y0=int(338*S); y1=int(745*S)
        header_y=int(62*S); title_y=int(102*S); subtitle_y=int(238*S)
        base=40*S; title_size=56*S; sub=23*S
        axis=18*S; footer=19*S
    else:
        x0=int(92*S);x1=w-int(88*S);y0=int(250*S);y1=int(454*S)
        header_y=int(27*S);title_y=int(78*S);subtitle_y=int(171*S)
        base=45*S;title_size=67*S;sub=27*S
        axis=21*S;footer=17*S
    # Header and evolving editorial premise
    text(d,(x0,header_y),'INFORME VISUAL    /    08',22*S,MUTED,True)
    title='LA CIFRA INVISIBLE'
    if portrait:
        text(d,(x0,title_y),'LA CIFRA',title_size,INK,True)
        text(d,(x0,title_y+58*S),'INVISIBLE',title_size,INK,True)
    else: text(d,(x0,title_y),title,title_size,INK,True)
    if t<4:
        subtitle='146 AÑOS · LA TIERRA, EN DATOS'
    elif t<10:
        subtitle='CERO ES LA REFERENCIA, NO EL FRÍO.'
    elif t<16.6:
        subtitle='UNA SERIE COMPLETA. SIN RECORTAR EL EJE.'
    elif t<21.8:
        subtitle='2025 BAJA. LA TENDENCIA NO DESAPARECE.'
    else:
        subtitle='NO ES TEMPERATURA ABSOLUTA.'
    if portrait:
        maplines={
          '146 AÑOS · LA TIERRA, EN DATOS':('146 AÑOS','LA TIERRA, EN DATOS'),
          'CERO ES LA REFERENCIA, NO EL FRÍO.':('CERO ES LA REFERENCIA','NO EL FRÍO'),
          'UNA SERIE COMPLETA. SIN RECORTAR EL EJE.':('UNA SERIE COMPLETA','SIN RECORTAR EL EJE'),
          '2025 BAJA. LA TENDENCIA NO DESAPARECE.':('2025 BAJA','LA TENDENCIA NO DESAPARECE'),
          'NO ES TEMPERATURA ABSOLUTA.':('NO ES TEMPERATURA','ABSOLUTA') }
        a,b=maplines[subtitle]
        text(d,(x0,subtitle_y),a,sub,ACCENT if t>=10 else MUTED,True)
        text(d,(x0,subtitle_y+29*S),b,sub,ACCENT if t>=10 else MUTED,True)
    else: text(d,(x0,subtitle_y),subtitle,sub,ACCENT if t>=10 else MUTED,True)
    # Fixed scale and explicitly labeled zero reference
    domLo,domHi=-.6,1.4
    def yy(v):return round(y1-(v-domLo)/(domHi-domLo)*(y1-y0))
    def xx(y):return round(x0+(y-1880)/145*(x1-x0))
    for val in [-.5,0,.5,1.0]:
        py=yy(val)
        d.line((x0,py,x1,py),fill=('#647586' if val==0 else RULE),width=max(1,round(2*S if val==0 else S)))
        label=('0' if val==0 else f'{val:+.1f}').replace('.',',')
        text(d,(x0-14*S,py),label,axis,MUTED,anchor='rm')
    for yr in [1880,1920,1960,2000,2025]:
        px=xx(yr);d.line((px,y1+4*S,px,y1+11*S),fill=MUTED,width=2)
        text(d,(px,y1+17*S),str(yr),axis,MUTED,anchor='mt')
    text(d,(x0, y0-31*S),'ANOMALÍA TÉRMICA GLOBAL  ·  °C',axis,MUTED,True)
    # Narrative reveal moves along a stationary x and y scale; each year maps to its original value.
    if t<4: end=1880+7*ease(t/4)
    elif t<10: end=1887+(1976-1887)*ease((t-4)/6)
    elif t<16.6: end=1976+49*ease((t-10)/6.6)
    else: end=2025
    line=[(xx(y),yy(v),v,y) for y,v in DATASET if y<=end]
    for a,b in zip(line,line[1:]):
        color=ACCENT if (a[2]+b[2])/2>=0 else BLUE
        d.line((a[0],a[1],b[0],b[1]),fill=color,width=max(3,round(3.4*S)),joint='curve')
    if line:
        x,y,v,yr=line[-1]
        d.ellipse((x-5*S,y-5*S,x+5*S,y+5*S),fill=ACCENT if v>=0 else BLUE)
        # Cursor follows real observation; no interpolated values are represented as measured.
        if t>6 and t<16.8:
            text(d,(x, y-16*S),str(yr),axis,INK,anchor='mb',bold=True)
    if t>=16.6:
        a=(xx(2024), yy(1.28)); b=(xx(2025), yy(1.18))
        for p in [a,b]:d.ellipse((p[0]-5*S,p[1]-5*S,p[0]+5*S,p[1]+5*S),fill=INK)
        if portrait:
            yinfo=int(794*S)
            text(d,(x0,yinfo),'2024   +1,28 °C',34*S,ACCENT,True)
            text(d,(x0,yinfo+44*S),'2025   +1,18 °C',34*S,INK,True)
        else:
            text(d,(x0, 492*S),'2024  +1,28 °C     /     2025  +1,18 °C',26*S,ACCENT,True)
    # Actual frame always carries source and baseline, including the opening frames.
    if portrait:
        text(d,(x0,int(902*S)),'NASA GISS · GISTEMP v4 · 1951–1980 = 0',footer,MUTED)
        text(d,(x0,int(928*S)),'Datos anuales 1880–2025 · captura 10.11.2026',footer,MUTED)
    else:
        text(d,(x1,int(512*S)),'NASA GISS · GISTEMP v4 · base 1951–1980',footer,MUTED,anchor='ra')
    return im

def make_audio(path,duration):
    # Original restrained soundtrack, not a quantitative sonification.
    sr=44100; ts=np.arange(int(duration*sr),dtype=np.float64)/sr
    pad=(np.sin(2*np.pi*110*ts)+.32*np.sin(2*np.pi*164.81*ts)+.16*np.sin(2*np.pi*220*ts))*.085
    moving=(np.sin(2*np.pi*55*ts)*.025)*(np.sin(2*np.pi*.11*ts)*.5+.5)
    env=np.minimum(1,ts/.7)*np.minimum(1,np.maximum(0,(duration-ts)/1.0))
    sound=(pad+moving)*env
    for moment in [4,10,16.6,21.8]:
        k=np.maximum(0,ts-moment)
        sound += np.exp(-k*9.5)*(ts>=moment)*.085*np.sin(2*np.pi*(460-80*k)*k)
    sound=np.int16(np.clip(sound,-.98,.98)*32767)
    with wave.open(str(path),'wb') as wf:
        wf.setnchannels(1);wf.setsampwidth(2);wf.setframerate(sr);wf.writeframes(sound.tobytes())

def render(out,w,h,fps,duration,preview=False):
    out=Path(out);out.parent.mkdir(parents=True,exist_ok=True)
    if preview:
        for t in (0,5.6,12.4,19.5,23.5):
            img=frame(t,w,h);img.save(ROOT/(f'frame_{w}x{h}_{str(t).replace(".","_")}.png'))
        return
    wav=ROOT/'original_soundtrack.wav';make_audio(wav,duration)
    p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(fps),'-i','pipe:0','-i',str(wav),'-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','112k','-t',str(duration),'-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
    try:
        for f in range(round(fps*duration)):
            p.stdin.write(frame(f/fps,w,h).tobytes())
    finally:p.stdin.close()
    if p.wait():raise RuntimeError('ffmpeg failed')

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--out',default=str(ROOT/'LA_CIFRA_INVISIBLE_W003_08.mp4'));ap.add_argument('--width',type=int,default=960);ap.add_argument('--height',type=int,default=540);ap.add_argument('--fps',type=int,default=24);ap.add_argument('--duration',type=float,default=24);ap.add_argument('--preview',action='store_true');args=ap.parse_args()
    render(args.out,args.width,args.height,args.fps,args.duration,args.preview)
