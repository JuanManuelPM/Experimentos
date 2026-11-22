#!/usr/bin/env python3
"""MATERIA / 008. Original audiovisual montage, 12 s / 24 fps.
Two original procedural source plates (PAPER / METAL), hard editorial cuts.
Usage: python render.py. Requires Pillow, numpy and ffmpeg.
"""
import json, math, os, shutil, subprocess, wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
W,H,FPS,DURATION = 960,540,24,12
N = FPS*DURATION
CUTS = [0,36,72,111,150,198,240,264,288]
SHOTS = [
    ("PAPER","01 / FIBRA","LA MATERIA","se pliega"),
    ("METAL","02 / ACERO","LA MATERIA","se mide"),
    ("PAPER","03 / HUELLA","FIBRA","memoria del roce"),
    ("METAL","04 / PRESIÓN","ACERO","precisión del golpe"),
    ("PAPER","05 / FLEXIÓN","ALGO CEDE","sin romperse"),
    ("METAL","06 / ESTRUCTURA","ALGO RESISTE","sin detenerse"),
    ("PAPER","07 / RITMO","DOS MATERIAS","un movimiento"),
    ("METAL","08 / SÍNTESIS","MATERIA / 008","corto editorial · 2026"),
]
PAPER="#d9ceb8"; INK="#28241f"; RUST="#c76a42"; STEEL="#122833"; CYAN="#92b9ac"
FONT_PATHS=[
"/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
"/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"]
FONT_REG=[
"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
"/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"]
def font(sz,regular=False):
    paths=FONT_REG if regular else FONT_PATHS
    for path in paths:
        if os.path.exists(path): return ImageFont.truetype(path,sz)
    return ImageFont.load_default()
BIG=font(69); MID=font(40); SMALL=font(15); MICRO=font(12,True); SUB=font(20,True)
rng=np.random.default_rng(808)
# Two independently authored original media plates. No external photo/video/font.
def paper_plate():
    im=Image.new("RGB",(1200,760),PAPER); d=ImageDraw.Draw(im)
    # layers of actual paper-like contour geometry
    for j in range(14):
        x=600+34*math.sin(j*0.72); y=380+17*math.cos(j*0.52)
        rx=90+j*36; ry=72+j*24
        pts=[]
        for k in range(241):
            a=k*math.tau/240
            fluct=1+.022*math.sin(5*a+j*.3)+.013*math.cos(11*a+j*.47)
            pts.append((x+rx*math.cos(a)*fluct,y+ry*math.sin(a)*fluct))
        d.line(pts,fill=INK if j%3 else RUST,width=2 if j%2 else 3,joint="curve")
    for i in range(8):
        x=132+i*118;d.line((x,0,x-80,760),fill="#aa9a80",width=1)
    # grain microdots, ink coordinates & registration marks
    for i in range(11500):
        x=int(rng.integers(0,1200));y=int(rng.integers(0,760))
        color="#b4a78e" if i%5 else "#e7decf"
        d.point((x,y),fill=color)
    d.text((92,115),"ARCHIVE / MATERIAL STUDIES",font=font(16,True),fill=INK)
    for i in range(11):
        y=600+i*10;d.line((90,y,250 if i%3==0 else 180,y),fill=INK,width=2)
    return im
def metal_plate():
    im=Image.new("RGB",(1200,760),STEEL);d=ImageDraw.Draw(im)
    # machined and brushed-metal sheet
    d.polygon([(0,0),(770,0),(450,760),(0,760)],fill="#19323b")
    d.polygon([(450,0),(1200,0),(1200,760),(260,760)],fill="#1e3b43")
    for i in range(0,1200,4):
        c="#2a4b50" if i%20 else "#416267"
        d.line((i,0,i-190,760),fill=c,width=1)
    cx,cy=640,375
    for rad in [295,268,238,205,177,147,122,89]:
        d.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),outline=CYAN if rad in (238,147) else "#4d7378",width=5 if rad in (295,205) else 2)
    for a in np.arange(0,360,15):
        t=math.radians(float(a))
        x1,y1=cx+245*math.cos(t),cy+245*math.sin(t)
        x2,y2=cx+(264 if a%45==0 else 255)*math.cos(t),cy+(264 if a%45==0 else 255)*math.sin(t)
        d.line((x1,y1,x2,y2),fill=CYAN,width=3)
    d.ellipse((cx-77,cy-77,cx+77,cy+77),fill="#0b1a22",outline="#b4cec4",width=5)
    d.ellipse((cx-28,cy-28,cx+28,cy+28),fill=RUST,outline="#f5c1a8",width=3)
    for dx,dy in [(-350,-230),(350,-230),(-350,230),(350,230)]:
        x,y=cx+dx,cy+dy
        d.ellipse((x-11,y-11,x+11,y+11),fill="#0b1a22",outline=CYAN,width=2)
        d.line((x-7,y+5,x+7,y-5),fill=CYAN,width=2)
    d.text((50,100),"SPECIMEN / 008  |  FE - 18",font=font(15,True),fill=CYAN)
    return im
PAPER_PLATE=paper_plate();METAL_PLATE=metal_plate()
def plate_crop(im,kind,shot,t):
    # slow motion within the shot, stable composition across a hard cut
    z=1.0+0.04*t+(0.055 if shot in (2,3) else 0)
    cw=int(W/z);ch=int(H/z)
    x0=(120 if kind=="PAPER" else 155)+int(42*t+8*math.sin(2*t))
    y0=(85 if kind=="PAPER" else 100)+int(26*t)
    x0=max(0,min(im.width-cw,x0));y0=max(0,min(im.height-ch,y0))
    return im.crop((x0,y0,x0+cw,y0+ch)).resize((W,H),Image.Resampling.BICUBIC)
def draw_frame(frame):
    shot=min(len(SHOTS)-1,next(i for i in range(len(CUTS)-1) if frame<CUTS[i+1]))
    kind,slug,head,foot=SHOTS[shot]
    local=(frame-CUTS[shot])/max(1,CUTS[shot+1]-CUTS[shot])
    im=plate_crop(PAPER_PLATE if kind=="PAPER" else METAL_PLATE,kind,shot,local)
    dark=kind=="METAL";fg="#ebdfcb" if dark else INK
    accent=RUST if dark else "#a8422e"
    d=ImageDraw.Draw(im,"RGBA")
    # predictable title-safe opaque bar, rather than text on busy footage
    d.rectangle((0,362,W,H),fill=(12,23,29,238) if dark else (225,216,197,241))
    d.rectangle((42,44,48,96),fill=RUST)
    d.text((66,45),slug,font=SMALL,fill=fg)
    # baseline / editorial graticule
    d.line((42,350,918,350),fill=fg,width=2)
    d.text((44,380),head,font=BIG if len(head)<15 else MID,fill=fg,stroke_width=0)
    d.text((48,482),foot.upper(),font=SUB,fill=accent)
    d.text((735,490),f"W001 / 08    {frame/FPS:05.2f}",font=MICRO,fill=fg)
    # flashed editing reference bars at boundaries: two frames only
    if frame in CUTS[1:-1]:
        d.rectangle((0,0,9,H),fill=RUST)
    # high contrast frame markers
    for i in range(4):
        x=43+i*19;d.rectangle((x,327,x+12,330),fill=accent if i==shot%4 else fg)
    return im
def make_sound():
    sr=24000;nn=sr*DURATION;t=np.arange(nn,dtype=np.float64)/sr
    # composed original score: subdrone, drifting high partial, beat at every cut
    signal=.10*np.sin(2*np.pi*(54*t+.33*t*t)) + .035*np.sin(2*np.pi*112*t)
    signal+=.016*np.sin(2*np.pi*(318*t+2.2*np.sin(t*1.1)))
    for idx,c in enumerate(CUTS[:-1]):
        start=int(c*sr/FPS);count=min(4200,nn-start)
        tt=np.arange(count)/sr
        click=(.25*np.sin(2*np.pi*(140-65*tt)*tt)+.12*np.sin(2*np.pi*960*tt))
        env=np.exp(-19*tt)
        signal[start:start+count]+=click*env
    # soft fade in/out, avoid hard clipping
    ramp=np.minimum(1,np.minimum(t/.12,(DURATION-t)/.32));signal*=np.clip(ramp,0,1)
    peak=np.max(np.abs(signal))
    if peak>.92:signal*=.92/peak
    pcm=(signal*32767).astype("<i2")
    with wave.open(str(ROOT/"soundtrack.wav"),"wb") as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
def encode():
    ffmpeg=shutil.which("ffmpeg")
    if not ffmpeg: raise SystemExit("FFmpeg missing: MP4 NOT_RUN")
    make_sound()
    out=ROOT/"MATERIA-008.mp4"
    cmd=[ffmpeg,"-y","-v","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
         "-i",str(ROOT/"soundtrack.wav"),"-c:v","libx264","-preset","veryfast","-crf","25","-pix_fmt","yuv420p",
         "-c:a","aac","-b:a","112k","-ar","24000","-movflags","+faststart","-t",str(DURATION),str(out)]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    for i in range(N):
        frame=draw_frame(i)
        if i==0:frame.save(ROOT/"poster.png")
        try:p.stdin.write(frame.tobytes())
        except BrokenPipeError:raise RuntimeError("FFmpeg closed early")
    p.stdin.close()
    if p.wait():raise RuntimeError("FFmpeg encode failed")
    probe=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(out)]))
    video=next(s for s in probe["streams"] if s["codec_type"]=="video")
    audio=next(s for s in probe["streams"] if s["codec_type"]=="audio")
    assert video["codec_name"]=="h264" and video["width"]==W and video["height"]==H
    assert int(video["nb_frames"])==N and abs(float(probe["format"]["duration"])-DURATION)<.08
    assert audio["codec_name"]=="aac"
    evidence={"videoCodec":video["codec_name"],"audioCodec":audio["codec_name"],"width":W,
      "height":H,"fps":FPS,"frames":N,"durationSeconds":float(probe["format"]["duration"]),
      "sizeBytes":out.stat().st_size,"cutFrames":CUTS[1:-1],"materialSources":["PAPER","METAL"],
      "audio":"original synthesized mono soundtrack; AAC", "render":"FFmpeg libx264"}
    (ROOT/"PROBE.json").write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(evidence,ensure_ascii=False))
if __name__=="__main__":encode()
