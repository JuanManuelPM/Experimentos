#!/usr/bin/env python3
"""DataToMotionCompiler v0.1: reproducible editorial film from a dated CSV.

Usage: python data_to_motion.py --input annual_nasa_gistemp_1880_2025.csv --output LA_CIFRA_INVISIBLE.mp4
The chart is value-preserving: one fixed linear Y domain, never fake interpolation of source observations.
All visual content and audio composition in this script are original.
"""
import argparse, csv, math, json, subprocess, wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
FPS, W, H, SECONDS = 24, 960, 540, 22
BG='#0B1519'; WHITE='#F2F3EC'; MUTED='#ACBDBE'; DIM='#5A7778'; ACCENT='#FD8666'; BLUE='#79BEC4'
FONTS='/usr/share/fonts/truetype/lato'
FONT_REG=FONTS+'/Lato-Regular.ttf'; FONT_BOLD=FONTS+'/Lato-Heavy.ttf'; FONT_LIGHT=FONTS+'/Lato-Light.ttf'
YEAR0, YEAR1 = 1880, 2025
YMIN, YMAX = -0.6, 1.4
CX0,CX1,CY0,CY1=97,866,169,419

def f(size, kind='regular'):
    p={'regular':FONT_REG,'bold':FONT_BOLD,'light':FONT_LIGHT}[kind]
    return ImageFont.truetype(p,size)

def ease(x):
    x=max(0,min(1,x)); return x*x*(3-2*x)

def fade(x,a,b): return ease((x-a)/(b-a)) if a!=b else 1

def val_text(v):return ('+' if v>0 else '')+f'{v:.2f}'.replace('.',',')+' °C'

def read_data(path):
    with open(path,encoding='utf8',newline='') as fh: rows=list(csv.DictReader(fh))
    vals=[(int(r['year']),float(r['anomaly_c'])) for r in rows]
    years=[y for y,_ in vals]
    if years!=list(range(years[0],years[-1]+1)):raise ValueError('Los años deben ser completos y consecutivos')
    if years[0]!=YEAR0 or years[-1]!=YEAR1:raise ValueError('Exige años completos 1880–2025, no incluir 2026 parcial')
    if not all(math.isfinite(v) and YMIN<=v<=YMAX for _,v in vals):raise ValueError('Fuera del dominio fijo o valor inválido')
    if len(vals)!=146:raise ValueError('No son 146 observaciones anuales')
    return vals

def X(year):return CX0+(year-YEAR0)/(YEAR1-YEAR0)*(CX1-CX0)
def Y(v):return CY1-(v-YMIN)/(YMAX-YMIN)*(CY1-CY0)

def txt(d, xy, s, size, color=WHITE, kind='regular', anchor=None):
    d.text(xy,s,font=f(size,kind),fill=color,anchor=anchor,stroke_width=0)

def line(d,coords,fill,width=2):d.line(coords,fill=fill,width=width,joint='curve')
def header(d,t):
    txt(d,(55,35),'PROMETEO  /  DOCUMENTAL DE DATOS',12,MUTED,'bold')
    txt(d,(904,35),'NASA  •  GISTEMP v4',12,MUTED,'regular','ra')
    line(d,[(54,60),(905,60)],'#2E4549',1)
    txt(d,(55,505),'ANOMALÍA MEDIA GLOBAL  •  °C RESPECTO DE 1951–1980',12,MUTED)
    txt(d,(904,505),f'{t:04.1f} s / 22 s',11,DIM,'regular','ra')

def chart(d, vals, reveal=1., alpha=1., dynamic=False):
    # Fixed linear axis for the whole story. Every plotted point is the annual NASA J–D observation.
    for v in [-0.5,0.0,0.5,1.0,1.4]:
        yy=round(Y(v)); col='#4B6869' if v==0 else '#264044'
        line(d,[(CX0,yy),(CX1,yy)],col,2 if v==0 else 1)
        txt(d,(CX0-15, yy),('+' if v>0 else '')+f'{v:.1f}'.replace('.',','),13,MUTED,'regular','rm')
    for yr in [1880,1900,1920,1940,1960,1980,2000,2025]:
        xx=X(yr);line(d,[(xx,CY1+5),(xx,CY1+10)],DIM,1)
        txt(d,(xx,CY1+20),str(yr),12,MUTED,'regular','mt')
    cutoff=YEAR0+(YEAR1-YEAR0)*max(0,min(1,reveal))
    dots=[(X(y),Y(v)) for y,v in vals if y<=cutoff]
    if len(dots)>1:
        # Deliberately no area fill: a temperature anomaly is not a quantity that starts at zero.
        line(d,dots,ACCENT,3)
    if dynamic and dots:
        yr,v=max((y,v) for y,v in vals if y<=cutoff)
        x,y=X(yr),Y(v)
        line(d,[(x,CY0),(x,CY1)],'#375C5D',1)
        d.ellipse((x-6,y-6,x+6,y+6),fill=WHITE,outline=ACCENT,width=3)
    if reveal>=.999:
        for yr in (1880,2025):
            v=dict(vals)[yr];x,y=X(yr),Y(v)
            d.ellipse((x-5,y-5,x+5,y+5),fill=ACCENT,outline=WHITE,width=1)

def background(d,t):
    d.rectangle((0,0,W,H),fill=BG)
    # Extremely restrained texture: structural grid, not decorative data.
    for k in range(7):
        yy=80+62*k
        line(d,[(0,yy),(W,yy)],'#0F2024',1)
    line(d,[(40,75),(40,475)],'#244047',1)
    line(d,[(920,75),(920,475)],'#244047',1)

def frame(t,vals):
    im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im)
    background(d,t);header(d,t)
    if t < 3.25:
        k=fade(t,.1,.85)
        txt(d,(72,112),'UN DOCUMENTAL DE DATOS',18,BLUE)
        txt(d,(72+int((1-k)*-25),160),'LA CIFRA',76,WHITE,'bold')
        txt(d,(72+int((1-k)*-25),240),'INVISIBLE',76,ACCENT,'bold')
        line(d,[(75,355),(75+int(k*750),355)],ACCENT,3)
        txt(d,(76,377),'146 observaciones anuales. Una misma escala.',22,MUTED)
        txt(d,(76,422),'1880  →  2025',16,BLUE,'bold')
        return im
    if t < 11.15:
        p=ease((t-3.25)/7.2)
        txt(d,(76,82),'01  /  LA SERIE',17,BLUE,'bold')
        yr=min(2025,1880+int(p*145)); v=dict(vals)[yr]
        txt(d,(75,112),f'{yr}',43,WHITE,'bold')
        txt(d,(905,132),val_text(v),36,ACCENT,'bold','ra')
        chart(d,vals,reveal=p,dynamic=True)
        return im
    if t < 16.25:
        chart(d,vals,reveal=1)
        txt(d,(76,83),'02  /  EL CAMBIO',17,BLUE,'bold')
        # The 1880 and 2025 values are annotated as anomalies, not global absolute temperatures.
        txt(d,(76,109),'1880',28,MUTED,'bold')
        txt(d,(190,108),val_text(dict(vals)[1880]),29,WHITE,'bold')
        txt(d,(520,109),'2025',28,MUTED,'bold')
        txt(d,(625,108),val_text(dict(vals)[2025]),30,ACCENT,'bold')
        return im
    # Close: the caveat is the actual take-away, not a footnote buried in a graph.
    k=fade(t,16.25,16.85)
    txt(d,(75,106),'LA CIFRA INVISIBLE',20,BLUE,'bold')
    txt(d,(75,155),'NO ES LA',57,WHITE,'bold')
    txt(d,(75,218),'TEMPERATURA',57,WHITE,'bold')
    line(d,[(76,307),(76+int(k*720),307)],ACCENT,3)
    txt(d,(76,337),'Es la diferencia respecto del promedio',27,WHITE)
    txt(d,(76,378),'de referencia de 1951–1980.',27,WHITE)
    txt(d,(76,453),'FUENTE: NASA GISS  •  GISTEMP v4  •  corte anual 2025',14,MUTED)
    return im

def synth_audio(wavfile):
    sr=22050; t=np.arange(int(SECONDS*sr),dtype=np.float32)/sr
    # Original non-speech score. Cues are timed to transitions, NOT sonification of the values.
    low=np.zeros_like(t)
    for hz,amp in [(65.406,.028),(97.998,.018),(130.813,.008)]:
        low+=amp*np.sin(2*np.pi*hz*t+0.07*np.sin(2*np.pi*.17*t))
    env=np.minimum(1,t/.8)*np.minimum(1,(SECONDS-t)/1.4)
    for at in [3.25,11.15,16.25]:
        delta=t-at;gate=np.where(delta>=0,np.exp(-np.maximum(delta,0)*8),0)
        low+=.08*gate*np.sin(2*np.pi*(430*delta+100*delta*delta))
    signal=np.clip(low*env,-.95,.95)
    with wave.open(str(wavfile),'wb') as out:
        out.setnchannels(1);out.setsampwidth(2);out.setframerate(sr)
        out.writeframes((signal*32767).astype('<i2').tobytes())

def compile_video(csv_file,output):
    data=read_data(csv_file); path=Path(output); temp=path.with_name('video_only.mp4')
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','rgb24','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(temp)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    try:
        for i in range(SECONDS*FPS):
            proc.stdin.write(frame(i/FPS,data).tobytes())
        proc.stdin.close();rc=proc.wait()
        if rc:raise RuntimeError(f'FFmpeg video encoder exited with {rc}')
    finally:
        if proc.poll() is None:proc.kill()
    wav=path.with_name('original_sound_design.wav'); synth_audio(wav)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(temp),'-i',str(wav),'-c:v','copy','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',str(path)],check=True)
    temp.unlink()
    return {'frames':SECONDS*FPS,'duration_seconds':SECONDS,'resolution':f'{W}x{H}', 'source_rows':len(data),'first':data[0],'last':data[-1],'y_domain':[YMIN,YMAX],'audio':'original synthetic score; no sonification claimed'}

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--input',default=str(ROOT/'annual_nasa_gistemp_1880_2025.csv'));p.add_argument('--output',default=str(ROOT/'LA_CIFRA_INVISIBLE.mp4'))
    args=p.parse_args();print(json.dumps(compile_video(args.input,args.output),ensure_ascii=False,indent=2))
