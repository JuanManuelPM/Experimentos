#!/usr/bin/env python3
"""BAJO LA LLUVIA. Procedural animated rainy-city atmosphere, entirely original.
Run: python render.py (requires pillow, numpy, ffmpeg). 11s, 960x540, 24fps.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random, subprocess, wave, struct, os
import numpy as np

W,H,FPS,SECONDS=960,540,24,11
ROOT=os.path.dirname(os.path.abspath(__file__))
SEED=230517
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf'

def lerp(a,b,t): return a+(b-a)*t
def glow(im,shapes):
    layer=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(layer,'RGBA')
    for kind,coords,rgb,a in shapes:
        if kind=='ellipse': d.ellipse(coords,fill=(*rgb,a))
        else: d.rectangle(coords,fill=(*rgb,a))
    blur=layer.filter(ImageFilter.GaussianBlur(22))
    return Image.alpha_composite(im.convert('RGBA'),blur)

def scene():
    im=Image.new('RGB',(W,H));p=im.load()
    for y in range(H):
        for x in range(W):
            v=(y/H); tide=3*math.sin(x/W*3.8)
            p[x,y]=(int(9+8*v+tide),int(18+12*v),int(28+15*v))
    d=ImageDraw.Draw(im,'RGBA'); r=random.Random(SEED)
    # Far skyline softened by rain haze.
    for i in range(36):
        x=i*34-25; hh=r.randint(94,260)
        d.rectangle((x,310-hh,x+r.randint(24,58),333),fill=(19,35,45,210))
        for j in range(20):
            xx=x+8+(j%3)*10; yy=325-hh+12+(j//3)*19
            if 0<xx<W and 70<yy<300 and r.random()<.36:
                d.rectangle((xx,yy,xx+3,yy+6),fill=(127,156,147,r.randint(35,90)))
    # A centered vanishing point; geometric curb leads to the viewer.
    vx,vy=510,286
    d.polygon([(0,H),(960,H),(544,vy),(479,vy)],fill=(16,31,39,255))
    for k in range(16):
        dep=(k/16)**1.85
        yy=int(vy+dep*(H-vy))
        d.line((0,yy,W,yy),fill=(90,133,138,int(4+17*dep)),width=max(1,int(2*dep)))
    # Perspective sidewalk edges / clear foreground geometry.
    d.polygon([(0,540),(0,305),(412,284),(455,290),(236,540)],fill=(22,36,42,255))
    d.polygon([(960,540),(960,303),(588,283),(560,291),(784,540)],fill=(26,38,44,255))
    d.line((236,539,456,286),fill=(89,124,128,180),width=4)
    d.line((785,539,560,287),fill=(92,126,126,180),width=5)
    # Main facades with consistent planes, lintels, awnings.
    d.polygon([(0,0),(313,0),(398,303),(0,357)],fill=(20,31,38,255))
    d.polygon([(0,0),(105,0),(232,332),(0,376)],fill=(33,43,49,230))
    d.polygon([(960,0),(694,0),(617,301),(960,364)],fill=(22,33,40,255))
    d.polygon([(960,0),(850,0),(741,341),(960,395)],fill=(37,46,49,220))
    # Windows on left (solid, carefully aligned)
    for row in range(4):
        y=61+row*56
        for col in range(3):
            x=48+col*74+row*7
            lit=(row+col)%3==0
            d.polygon([(x,y),(x+35,y),(x+42,y+32),(x+7,y+32)],fill=(51,74,75,255) if lit else (10,24,32,255))
            d.line((x+7,y+16,x+37,y+16),fill=(76,97,96,90),width=1)
            if lit:d.polygon([(x+6,y+2),(x+33,y+2),(x+39,y+30),(x+13,y+30)],fill=(220,170,95,105))
    # Windows on right with warm human presence.
    for row in range(4):
        for col in range(3):
            x=725+col*68-row*6;y=54+row*60
            lit=(row+col)%2==0
            d.polygon([(x,y),(x+34,y),(x+28,y+33),(x-6,y+33)],fill=(186,135,83,140) if lit else (7,22,31,255))
            d.line((x+14,y,x+8,y+33),fill=(53,71,73,230),width=3)
    # Roof, shopfronts, signage, cafe.
    d.polygon([(0,339),(230,305),(257,339),(0,392)],fill=(12,28,36,255))
    d.polygon([(960,350),(778,308),(754,351),(960,410)],fill=(9,27,32,255))
    d.polygon([(0,400),(215,359),(210,453),(0,506)],fill=(12,26,31,255))
    d.polygon([(960,413),(792,361),(810,483),(960,528)],fill=(11,24,30,255))
    d.polygon([(19,396),(171,368),(172,459),(23,489)],fill=(15,65,68,230))
    d.polygon([(807,393),(938,421),(941,491),(800,460)],fill=(134,72,51,180))
    # neon strips; reflections originate from these same geometry positions.
    d.line((21,394,172,367),fill=(58,222,204,235),width=4)
    d.line((798,387,947,424),fill=(251,140,94,235),width=4)
    d.rectangle((62,296,185,330),fill=(10,42,50,255),outline=(72,202,188,240),width=2)
    d.rectangle((790,297,913,332),fill=(54,30,35,255),outline=(240,143,94,210),width=2)
    f=ImageFont.truetype(FONT,24)
    d.text((75,298),'LUNA 24',font=f,fill=(124,244,224,255))
    d.text((810,298),'CAFÉ',font=f,fill=(247,190,132,255))
    # Light: sign, high street lamp, interior.
    d.line((633,120,633,360),fill=(16,30,38,255),width=5)
    d.line((633,127,674,105),fill=(16,30,38,255),width=5)
    d.ellipse((662,97,683,113),fill=(240,184,111,255))
    d.line((347,140,607,119),fill=(61,74,77,130),width=2)
    d.line((377,151,634,129),fill=(61,74,77,125),width=1)
    # Lamps and roads are glowy but texture remains legible.
    im=glow(im,[('ellipse',(628,71,717,160),(248,179,91),105),('rectangle',(28,353,203,412),(28,206,195),64),('rectangle',(784,371,960,448),(251,129,88),65)])
    d=ImageDraw.Draw(im,'RGBA')
    # Wet street liquid neon. Layered discrete streaks, not uniform stripes.
    for j in range(900):
        y=r.randrange(285,540); depth=(y-285)/255
        x=r.randrange(0,W)
        is_cyan=x<465 and x<lerp(500,270,depth)
        is_amber=x>555 and x>lerp(510,755,depth)
        if not (is_cyan or is_amber) or r.random()>.64:continue
        c=(51,200,186) if is_cyan else (235,142,97)
        spread=int(lerp(2,35,depth)*r.random())
        d.line((x,y,x+spread,y),fill=(*c,r.randint(15,int(35+55*depth))),width=r.choice([1,1,2]))
    for j in range(120):
        y=r.randrange(360,540);depth=(y-285)/255
        xx=510+r.randint(-1,1)*int(depth*110*r.random())
        d.line((xx,y,xx+r.randint(2,20),y),fill=(140,182,182,r.randint(15,55)),width=1)
    # distant car, anchored to centerline.
    d.rectangle((501,293,535,312),fill=(18,27,36,245))
    d.ellipse((502,303,511,312),fill=(242,212,164,240))
    d.ellipse((525,303,534,312),fill=(242,212,164,240))
    d.polygon([(496,309),(537,309),(558,344),(486,344)],fill=(222,167,109,14))
    return im.convert('RGB')
BASE=scene()

def frame(i):
    t=i/FPS;im=BASE.copy().convert('RGBA')
    # Single continuous dolly-in, 2.5% over 11 s, no camera cuts or direction flips.
    scale=1+.026*t/SECONDS
    if scale>1:
        sz=(round(W*scale),round(H*scale))
        large=im.resize(sz,Image.Resampling.BICUBIC)
        cx=round((sz[0]-W)/2 + 4*math.sin(t*.19));cy=round((sz[1]-H)/2)
        im=large.crop((cx,cy,cx+W,cy+H))
    overlay=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(overlay,'RGBA'); rain=random.Random(40711)
    # Stable drop IDs: deterministic physical trajectories rather than flashing random patterns.
    for j in range(550):
        x0=rain.random()*1080-50;y0=rain.random()*620-50
        sp=rain.uniform(135,490);phase=rain.uniform(0,1)
        y=(y0+sp*t+phase*H)%(H+100)-50
        x=(x0-37*t*sp/300)% (W+110)-55
        size=rain.uniform(5,23)*(sp/490)
        a=int(25+48*(sp/490)); shade=(123,166,173,a)
        d.line((int(x),int(y),int(x-size*.2),int(y+size)),fill=shade,width=1 if sp<340 else 2)
    # Pool ripples as elliptical arcs, on road only.
    for j in range(23):
        rng=random.Random(SEED+1000+j);x=rng.randrange(270,725);y=rng.randrange(345,531)
        age=(t*.7+rng.random())%1
        rr=1+age*(12+(y-320)/20)
        a=int(52*(1-age)**1.6)
        d.arc((x-rr*1.6,y-rr*.35,x+rr*1.6,y+rr*.35),180,345,fill=(165,215,214,a),width=1)
    # A slight rolling mist near the vanishing point.
    d.rectangle((365,273,616,310),fill=(68,98,98,round(13+4*math.sin(t*.6))))
    # The car lights pulse very subtly and reflections remain fixed in the world.
    glow_amt=int(34+14*math.sin(t*2))
    d.ellipse((498,300,512,314),fill=(255,219,170,glow_amt))
    d.ellipse((523,300,538,314),fill=(255,219,170,glow_amt))
    # Fine anamorphic vignette/frame; no intrusive title card.
    d.rectangle((0,0,W,3),fill=(3,10,14,220));d.rectangle((0,H-3,W,H),fill=(3,10,14,220))
    return Image.alpha_composite(im,overlay).convert('RGB')

def sound(out):
    rate=22050;rng=random.Random(7252);last=0.0;data=bytearray()
    with wave.open(out,'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate)
        for i in range(rate*SECONDS):
            t=i/rate
            white=rng.random()*2-1
            last=last*.985+white*.015
            rain=.06*white+.22*last
            hum=.034*math.sin(2*math.pi*48*t)+.009*math.sin(2*math.pi*61*t)
            rumble=.012*math.sin(2*math.pi*(7.2*t+.1*math.sin(t*.5)))
            fade=min(1,t/.65,(SECONDS-t)/.72)
            v=(rain+hum+rumble)*max(0,fade)
            data+=struct.pack('<h',int(max(-.93,min(.93,v))*32767))
        w.writeframes(data)

def run():
    frame(96).save(os.path.join(ROOT,'poster.png'),optimize=True)
    wav=os.path.join(ROOT,'_rain.wav');sound(wav)
    args=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','-','-i',wav,'-c:v','libx264','-preset','veryfast','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','-t',str(SECONDS),os.path.join(ROOT,'film.mp4')]
    p=subprocess.Popen(args,stdin=subprocess.PIPE)
    try:
        for i in range(FPS*SECONDS):p.stdin.write(frame(i).tobytes())
        p.stdin.close();assert p.wait()==0
    finally:
        if p.poll() is None:p.kill()
        if os.path.exists(wav):os.remove(wav)
if __name__=='__main__':run()
