#!/usr/bin/env python3
"""ANDÉN CERO. Original deterministic thriller titles, 12 s @ 24 fps.
Requires Pillow and FFmpeg. Only generated geometry, type and sound are used.
"""
import argparse, math, os, random, struct, subprocess, wave
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W,H,FPS,DURATION = 960,540,24,12
ROOT=os.path.dirname(os.path.abspath(__file__))
FONT_BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'
FONT_REG='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def clamp(x,lo=0,hi=1): return max(lo,min(hi,x))
def smooth(x):
    x=clamp(x)
    return x*x*(3-2*x)
def ease_out(x): return 1-(1-clamp(x))**3

def font(size,bold=True):
    path=FONT_BOLD if bold else FONT_REG
    if os.path.isfile(path): return ImageFont.truetype(path,size)
    return ImageFont.truetype('DejaVuSans.ttf',size)

def text_center(draw, s, y, size, fill, tracking=0, bold=True, x=None):
    f=font(size,bold)
    widths=[draw.textbbox((0,0),c,font=f)[2] for c in s]
    total=sum(widths)+max(0,len(s)-1)*tracking
    pos=(W-total)/2 if x is None else x-total/2
    for c,tw in zip(s,widths):
        draw.text((round(pos),round(y)),c,font=f,fill=fill,stroke_width=0)
        pos+=tw+tracking

def background():
    im=Image.new('RGB',(W,H))
    dr=ImageDraw.Draw(im)
    for y in range(H):
        k=y/H
        dr.line((0,y,W,y),fill=(int(4+5*k),int(10+8*k),int(18+13*k)))
    return im
BG=background()

def frame(t):
    im=BG.copy(); d=ImageDraw.Draw(im,'RGBA')
    drift=11*math.sin(t*.42)
    vx,vy=W*.50+drift,H*.44
    for k in range(11):
        q=(k/11 + t*.085)%1
        dep=q*q
        yy=vy+dep*H*.67
        a=int(18+57*dep)
        d.line([(0,yy),(W,yy)],fill=(83,120,143,a),width=1)
        xx= vx + (k-5)*42*(1+dep*1.0)
        d.line([(xx,H),(vx+(xx-vx)*.10,vy)],fill=(62,93,118,38),width=1)
    d.polygon([(0,H),(0,vy),(vx-90,vy),(vx-150,H)], fill=(2,4,8,95))
    d.polygon([(W,H),(W,vy),(vx+90,vy),(vx+150,H)],fill=(2,4,8,95))
    glow=Image.new('RGBA',(W,H)); gd=ImageDraw.Draw(glow,'RGBA')
    visibility=.6+ .4*math.sin(t*4.6)**2
    for r in range(105,0,-10):
        alpha=round((106-r)/106*2.0*visibility)
        gd.ellipse((vx-r,vy-r*.68,vx+r,vy+r*.68),fill=(240,42,60,alpha))
    im=Image.alpha_composite(im.convert('RGBA'),glow)
    d=ImageDraw.Draw(im,'RGBA')
    d.ellipse((vx-6,vy-6,vx+6,vy+6),fill=(237,50,64,150))
    beats=[2.60,5.82,8.50]
    flash=max([math.exp(-abs(t-b)/.045) for b in beats]+[0])
    if flash>.02:
        d.rectangle((0,0,W,H),fill=(194,214,230,int(95*flash)))
    d.line((58,45,W-58,45),fill=(142,155,165,135),width=1)
    d.text((58,19),'P / FILMS',font=font(15),fill=(210,219,221,215))
    d.text((W-182,19),'03:17  /  NOCHE',font=font(12,False),fill=(180,197,206,170))
    d.line((58,H-43,W-58,H-43),fill=(142,155,165,130),width=1)
    d.text((58,H-35),'LÍNEA 00  —  ACCESO RESTRINGIDO',font=font(11,False),fill=(175,184,191,200))
    d.text((W-138,H-35),'12 SEG / 24 FPS',font=font(10,False),fill=(175,184,191,170))
    if t<3.08:
        enter=smooth((t-.32)/1.02); leave=1-smooth((t-2.42)/.48)
        a=int(255*enter*leave)
        d.rectangle((W*.50-22,154,W*.50+22,157),fill=(241,60,73,a))
        text_center(d,'ÚLTIMO SERVICIO',194,52,(240,241,238,a),tracking=3)
        text_center(d,'EL TREN QUE NUNCA LLEGÓ',276,16,(201,218,226,int(a*.72)),tracking=2,bold=False)
    elif t<6.18:
        enter=smooth((t-3.14)/.75); leave=1-smooth((t-5.72)/.35)
        a=int(255*enter*leave)
        d.rectangle((W*.5-155,158,W*.5+155,160),fill=(210,44,61,a))
        text_center(d,'NO MIRES',191,74,(235,238,236,a),tracking=2)
        text_center(d,'ATRÁS',286,91,(233,53,70,a),tracking=5)
    elif t<8.83:
        enter=smooth((t-6.29)/.48); leave=1-smooth((t-8.32)/.36)
        a=int(255*enter*leave)
        text_center(d,'EL ANDÉN ESTÁ VACÍO',208,41,(223,231,229,a),tracking=2)
        text_center(d,'PERO ALGUIEN RESPONDIÓ.',280,20,(235,68,83,int(a*.88)),tracking=2)
    else:
        enter=smooth((t-8.89)/.65); leave=1-smooth((t-11.64)/.36)
        a=int(255*enter*leave)
        text_center(d,'ANDÉN',171,91,(241,242,237,a),tracking=3)
        text_center(d,'CERO',267,110,(237,52,68,a),tracking=9)
        text_center(d,'UNA HISTORIA QUE EMPIEZA DESPUÉS DEL FINAL',405,15,(201,215,215,int(a*.8)),tracking=1,bold=False)
    rng=random.Random(91827+round(t*FPS))
    for i in range(170):
        x=rng.randrange(W); y=rng.randrange(H)
        c=rng.randint(100,235)
        d.point((x,y),fill=(c,c,c,round(rng.randrange(6,24))))
    d.rectangle((0,0,W,7),fill=(1,2,4,255))
    d.rectangle((0,H-7,W,H),fill=(1,2,4,255))
    return im.convert('RGB')

def sound(path):
    rate=22050; rng=random.Random(20261122)
    with wave.open(path,'wb') as wav:
        wav.setnchannels(1); wav.setsampwidth(2); wav.setframerate(rate)
        data=bytearray()
        for n in range(rate*DURATION):
            t=n/rate
            fade=min(1,t/.5,(DURATION-t)/.55)
            drone=(math.sin(2*math.pi*(49*t+.022*math.sin(t*.6)))+ .32*math.sin(2*math.pi*73.4*t))*.095
            air=(rng.random()*2-1)*.008
            hits=0
            for b in [0.12,2.60,5.82,8.50,9.24]:
                dt=t-b
                if 0<=dt<.85:
                    hits+=.29*math.exp(-dt*9)*math.sin(2*math.pi*(72*dt-21*dt*dt))
            x=clamp(abs(drone+air+hits)*max(.0,fade),0,.95)
            sign=-1 if drone+air+hits<0 else 1
            data+=struct.pack('<h',int(sign*x*32767))
        wav.writeframes(data)

def render(out, poster_only=False):
    frame(9.67).save(os.path.join(ROOT,'poster.png'),optimize=True)
    if poster_only:return
    wav=os.path.join(ROOT,'_temp_original_sound.wav')
    sound(wav)
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}', '-framerate',str(FPS),'-i','-', '-i',wav,'-c:v','libx264','-preset','veryfast','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-ar','22050','-t',str(DURATION),'-movflags','+faststart',out]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    try:
        for i in range(FPS*DURATION):p.stdin.write(frame(i/FPS).tobytes())
        p.stdin.close(); code=p.wait()
        if code: raise RuntimeError(f'ffmpeg exited {code}')
    finally:
        if p.poll() is None:p.kill()
        if os.path.exists(wav):os.unlink(wav)

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--poster-only',action='store_true')
    args=parser.parse_args()
    render(os.path.join(ROOT,'film.mp4'),args.poster_only)
