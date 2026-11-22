#!/usr/bin/env python3
"""ANTES DE LA TORMENTA / CoupledAtmosphereCompositor v1.
Original procedural coastal lighthouse film. CC0 original code/imagery/sound.
Requires Python numpy, opencv-python-headless, Pillow, FFmpeg.
Usage: python render.py --output out.mp4 [--seconds 14] [--width 800] [--fps 24]
"""
import argparse, json, math, os, subprocess, tempfile, wave
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

RNG = np.random.default_rng(90662026)

def clamp(x): return np.clip(x, 0., 1.)
def smooth(a,b,x):
    z=clamp((x-a)/(b-a))
    return z*z*(3-2*z)

def climate(t):
    """Shared physical envelope. Cloud, lighting, gusts, water, rain and audio use it."""
    storm=float(smooth(2.7,11.2,t))
    gust=(0.13 + .87*storm)*(0.80+.20*math.sin(1.13*t+.3)**2)
    rain=float(smooth(4.6,10.1,t)**1.28)
    flash=0.0
    for start, amplitude in [(10.35,.95),(10.53,.58),(12.93,.40)]:
        flash += amplitude*math.exp(-((t-start)/.063)**2)
    return dict(storm=storm,wind=gust,rain=rain,flash=min(1,flash),fog=.09+.58*storm,
                exposure=.94-.53*storm+.81*flash, blue=storm)

def field(w,h,seed):
    r=np.random.default_rng(seed); f=np.zeros((h,w),np.float32)
    for scale,amp in [(9,.36),(23,.28),(53,.20),(108,.11),(239,.06)]:
        small=r.random((max(2,int(h/scale)),max(2,int(w/scale)))).astype('float32')
        f+=amp*cv2.resize(small,(w,h),interpolation=cv2.INTER_CUBIC)
    return (f-f.min())/(f.max()-f.min())

class Composer:
    def __init__(self,w=800,h=450,fps=24):
        self.w=w;self.h=h;self.fps=fps
        self.sky=field(w*2,h,13)
        self.detail=field(w*2,h,99)
        self.surf=field(w,h,29)
        self.X,self.Y=np.meshgrid(np.arange(w,dtype='float32')/w,np.arange(h,dtype='float32')/h)
        self.rainers=[(RNG.random(1900),RNG.random(1900),RNG.uniform(.4,1.,1900)) for _ in [0]]
        self.reflection=np.exp(-((self.X-.59)/(.014+.17*(self.Y-.60)))**2)*np.maximum(0,self.Y-.54)
        self.vignette=clamp(1.-.47*((self.X-.5)**2*3+(self.Y-.51)**2*3))
    def layer(self,t,s):
        w,h=self.w,self.h; X,Y=self.X,self.Y
        # Synoptic sky: cloud masses advect in the same direction as rain and reeds.
        dx=int(10*t+28*s['wind']*t)%(w)
        sky=np.roll(self.sky[:,:w],-dx,axis=1)
        cirrus=np.roll(self.detail[:,w:],-int(19*t)%(w),axis=1)
        band=clamp((sky*.80+cirrus*.20-.38)*2.1)
        cloud=clamp(band*(.37+.72*s['storm']) + .12*s['storm']*np.sin(12*Y+sky*8))
        skyTop=np.array([37.,69.,82.]); horizon=np.array([192.,151.,106.]); storm=np.array([31.,50.,65.])
        vertical=clamp(Y/.62)[...,None]
        color=(skyTop[None,None,:]*(1-vertical)+horizon[None,None,:]*vertical)
        color=color*(1-.75*s['storm'])+storm[None,None,:]*(.75*s['storm'])
        color*=1.-cloud[...,None]*(.67+.11*s['storm'])
        horizon_glow=(1-s['storm'])*np.exp(-((Y-.48)/.18)**2)
        color += (horizon_glow*16)[...,None]*np.array([1.0,.58,.24])
        color+=s['flash']*np.array([92.,114.,148.])[None,None,:]
        # Atmospheric perspective and volumetric fog, advected slowly at distant shore.
        horizonY=.585+.008*np.sin(X*17.+1.7)
        sea=Y>=horizonY
        yy=Y-horizonY
        phase=19*X+1.9*t+1.3*np.sin(X*21.-t)
        wave=np.sin(phase*6+Y*125.)*.40+np.sin(X*73-Y*125+t*4)*.25+np.sin(X*142+Y*280-t*8)*.1
        swell=.018*np.sin(13*X-3*t)+.006*np.sin(49*X-9*t)
        # Water specular highlights move with waves AND dim with occluded daylight.
        spec=np.maximum(0,wave*.75+swell*8+.19)**5
        wet=(s['rain']*.22)*np.abs(np.sin(X*90+Y*170-12*t))
        water=np.stack([32+23*spec+wet*60,62+22*spec+wet*60,70+24*spec+wet*68],axis=-1)
        water=water*(1-.47*s['storm'])+s['flash']*np.array([53.,70.,89.])[None,None,:]
        water+=(self.reflection*(1.3-s['storm']*.3)*125)[...,None]*np.array([1.0,.83,.56])
        color=np.where(sea[...,None],water,color)
        mist=clamp((s['fog']*(.25+.25*np.sin(X*14.+t*.24)+.24*self.surf))*np.exp(-((Y-.575)/.075)**2))
        mist_color=np.array([115.,132.,139.])*(1-.40*s['storm'])
        color=color*(1-mist[...,None]) + mist[...,None]*mist_color
        return np.uint8(clamp(color/255.)*255)
    def architecture(self,img,t,s):
        w,h=self.w,self.h; u=lambda x:int(x*w);v=lambda y:int(y*h)
        dx=.006*math.sin(.12*t); x=lambda z:u(z+dx)
        im=Image.fromarray(img,'RGB'); d=ImageDraw.Draw(im,'RGBA')
        # Island and breakwater: fixed geography, shifting shadow/illumination.
        rock=[(.43,.645),(.47,.624),(.51,.613),(.55,.624),(.59,.605),(.67,.629),(.71,.657),(.69,.70),(.45,.71)]
        d.polygon([(x(a),v(b)) for a,b in rock],fill=(24,33,35,248))
        for i in range(52):
            rr=np.random.default_rng(i*19+23)
            a=rr.uniform(.45,.69); b=rr.uniform(.641,.68); c=rr.uniform(.006,.025)
            d.line((x(a),v(b),x(a+c),v(b-.008)),fill=(92,105,105,int(35+65*s['flash'])),width=1)
        # Lighthouse: tapered, layered stone body with east-facing lit edge.
        d.polygon([(x(.552),v(.276)),(x(.615),v(.276)),(x(.624),v(.63)),(x(.542),v(.63))],fill=(155,158,143,255))
        d.polygon([(x(.552),v(.276)),(x(.567),v(.276)),(x(.561),v(.63)),(x(.542),v(.63))],fill=(83,99,101,255))
        d.polygon([(x(.607),v(.275)),(x(.615),v(.275)),(x(.624),v(.63)),(x(.614),v(.63))],fill=(211,180,142,int(58+85*s['flash'])))
        # Painted bands follow taper, same object through all frames.
        for y in [.365,.485]:
            width0=.56-.018*(y-.28)
            d.polygon([(x(width0),v(y)),(x(.617),v(y)),(x(.62),v(y+.041)),(x(width0-.001),v(y+.041))],fill=(49,69,72,235))
        for cy in [.335,.427,.549]:
            d.rounded_rectangle((x(.581),v(cy),x(.591),v(cy+.029)),radius=1,fill=(21,29,35,255))
            d.line((x(.581),v(cy+.025),x(.59),v(cy+.025)),fill=(163,143,116,125),width=1)
        # Lantern room, glass with warm Fresnel light responsive to fog and flash.
        d.rectangle((x(.541),v(.263),x(.627),v(.276)),fill=(34,43,47,255))
        d.rectangle((x(.561),v(.195),x(.606),v(.262)),fill=(26,37,44,255))
        d.polygon([(x(.549),v(.203)),(x(.582),v(.162)),(x(.618),v(.203))],fill=(30,40,46,255))
        d.line((x(.58),v(.159),x(.58),v(.136)),fill=(111,121,123,200),width=2)
        d.rectangle((x(.57),v(.209),x(.597),v(.253)),fill=(210,176,104,205))
        d.rectangle((x(.575),v(.214),x(.592),v(.245)),fill=(255,213,126,255))
        for q in [.56,.584,.605]:d.line((x(q),v(.199),x(q),v(.264)),fill=(24,31,38,255),width=2)
        # Struts and protective rail.
        d.line((x(.531),v(.262),x(.634),v(.262)),fill=(15,28,34,255),width=3)
        for q in np.arange(.536,.635,.015):d.line((x(q),v(.252),x(q),v(.268)),fill=(25,35,38,255),width=1)
        # Pier, line convergence and perspective. Wet planes reflect flash.
        d.polygon([(0,h),(u(.35),h),(x(.53),v(.662)),(x(.497),v(.662))],fill=(29,36,37,255))
        for k in range(14):
            z=(k/14)**1.9
            y=.671+.329*z
            left=.496*(1-z);right=.532-.182*z
            d.line((u(left),v(y),u(right),v(y)),fill=(114,111,99,int(68+95*s['flash']+60*s['rain'])),width=max(1,int(3*z)))
            if k%2==0:
                d.line((u(left),v(y),u(left),v(min(.999,y+.05*z+.013))),fill=(9,23,26,210),width=max(1,int(3*z)))
        # Reeds bend coherently with same wind and oscillate with gust.
        for i in range(150):
            rr=np.random.default_rng(i*7+441)
            bx=rr.uniform(0,.43); by=rr.uniform(.80,1.08); height=rr.uniform(.025,.115)*(1+.8*(by-.8))
            sway=(.009+.05*s['wind'])*(.65+.35*np.sin(1.8*t+i*.51))
            d.line((u(bx),v(by),u(bx+sway),v(by-height)),fill=(34+int(s['flash']*78),55,49,165),width=1 if i%3 else 2)
        # Structure is occluded by mist; strong halo scatters through fog.
        halo=Image.new('RGBA',(w,h)); hd=ImageDraw.Draw(halo)
        hx=x(.584);hy=v(.226);r=int(w*(.10+.11*s['fog']))
        for j in range(9,0,-1):
            rad=int(r*j/9)
            hd.ellipse((hx-rad,hy-rad,hx+rad,hy+rad),fill=(249,191,108,int((1-s['storm']*.2)*2.4)))
        halo=halo.filter(ImageFilter.GaussianBlur(max(4,int(w*.016))))
        im=Image.alpha_composite(im.convert('RGBA'),halo)
        return im
    def finish(self,im,t,s):
        w,h=self.w,self.h
        d=ImageDraw.Draw(im,'RGBA')
        # Rain sheets occupy depth strata; trajectories respond to wind, not random flicker.
        rrng=np.random.default_rng(622)
        for depth,count in [(.38,250),(.72,410),(1.,710)]:
            rain=s['rain']**1.4
            if rain<.012: continue
            phase=rrng.random(count); ys=rrng.random(count); alphas=rrng.random(count)
            speed=depth*(.80+.65*s['wind']);length=(.010+.05*depth)*rain
            for j in range(count):
                if alphas[j]>rain: continue
                px=(phase[j]+t*(.17+.18*s['wind'])*depth)%1
                py=(ys[j]+t*speed)%1
                slant=(.005+.034*s['wind'])*depth
                d.line((int(px*w),int(py*h),int((px+slant)*w),int((py+length)*h)),fill=(190,210,216,int(24+47*depth+int(s['flash']*90))),width=1)
        # Water strikes and sprays, present only when wind-driven rain reaches the surface.
        rrng=np.random.default_rng(922)
        for j in range(int(220*s['rain'])):
            x,y=rrng.random(), rrng.uniform(.61,1)
            x=(x+.013*t*(j%4+1))%1
            life=(t*(1+j%6)*2+rrng.random())%1
            if life<.2:
                ww=.002+.011*life; hi=.001+.004*life
                d.arc((int((x-ww)*w),int((y-hi)*h),int((x+ww)*w),int((y+hi)*h)),185,350,fill=(182,202,203,int((.3-life)*340)),width=1)
        frame=np.asarray(im.convert('RGB')).astype('float32')
        frame*=self.vignette[...,None]
        # Film grain fixed spatial phase then varies temporally; no temporal jumps.
        rng=np.random.default_rng(741+int(t*self.fps));grain=rng.standard_normal((h,w)).astype('float32')
        frame=frame*(.94-.10*s['storm'])+grain[...,None]*2.3
        frame=np.uint8(np.clip(frame,0,255))
        return frame
    def render_frame(self,frame):
        t=frame/self.fps;s=climate(t)
        frame=self.layer(t,s); im=self.architecture(frame,t,s)
        return self.finish(im,t,s)

def sound(seconds,sr=48000):
    """Original stereo diegetic surf/wind/rain/thunder; mixed from shared climate clock."""
    n=int(seconds*sr); t=np.arange(n,dtype='float32')/sr
    storm=smooth(2.7,11.2,t);wind=(.13+.87*storm)*(.8+.2*np.sin(1.13*t+.3)**2)
    rain=smooth(4.6,10.1,t)**1.28
    rng=np.random.default_rng(551); z=rng.standard_normal(n).astype('float32')
    # Ocean surf lowpass with recurring swell; distant wind, close rain become distinct layers.
    surf=cv2.GaussianBlur(z.reshape(-1,1),(1,0),sigmaX=0,sigmaY=0)[:,0] if False else z
    def lp(x,ms):
        size=max(2,int(ms*sr/1000));kernel=np.ones(size,dtype='float32')/size
        return np.convolve(x,kernel,'same')
    # Fast wide-band coloured sound using cascaded one-pole lowpass.
    from scipy.signal import butter, sosfilt
    low=sosfilt(butter(2,380,fs=sr,output='sos'),z).astype('float32')
    mid=sosfilt(butter(2,[220,2600],fs=sr,btype='bandpass',output='sos'),z).astype('float32')
    hiss=sosfilt(butter(2,[1400,9000],fs=sr,btype='bandpass',output='sos'),z).astype('float32')
    wave_env=.64+.36*np.sin(2*np.pi*(.18*t+.03*t**1.1))**2
    bed=.08*low*wave_env+.08*mid*(.18+.82*wind)+.10*hiss*rain
    # Rolling thunder follows lightning with causal distance (~0.65 sec).
    thunder=np.zeros(n,np.float32)
    for strike,amp in [(11.02,1.0),(13.5,.44)]:
        dt=t-strike;m=(dt>=0)&(dt<2.0)
        thunder[m]+=amp*np.exp(-dt[m]*2.2)*np.sin(2*np.pi*(42*dt[m]+19*dt[m]**1.5))* .17
        thunder[m]+=amp*np.exp(-dt[m]*1.6)*low[m]*.30
    bed+=thunder
    left=bed*(.95+.05*np.sin(2*np.pi*.12*t));right=bed*(.95+.05*np.cos(2*np.pi*.12*t))
    # Slight stereo asymmetry in wind, conservative peaks.
    audio=np.stack([left,right],axis=1)
    audio=np.tanh(audio*1.75)*.80
    return np.int16(audio*32767)

def main():
    p=argparse.ArgumentParser();p.add_argument('--output',default='ANTES-DE-LA-TORMENTA-009.mp4');p.add_argument('--seconds',type=float,default=14.0);p.add_argument('--width',type=int,default=800);p.add_argument('--fps',type=int,default=24);a=p.parse_args()
    w=a.width;h=round(w*9/16);total=int(a.seconds*a.fps);os.makedirs(os.path.dirname(os.path.abspath(a.output)),exist_ok=True)
    c=Composer(w,h,a.fps)
    with tempfile.TemporaryDirectory() as folder:
        audio=os.path.join(folder,'sound.wav')
        with wave.open(audio,'wb') as wav:wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(48000);wav.writeframes(sound(a.seconds).tobytes())
        cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(a.fps),'-i','pipe:0','-i',audio,'-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-shortest',a.output]
        proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
        try:
            for i in range(total):proc.stdin.write(c.render_frame(i).tobytes())
            proc.stdin.close()
            if proc.wait():raise RuntimeError('FFmpeg encode failed')
        except Exception:
            proc.kill();raise
    print(json.dumps({'video':a.output,'frames':total,'width':w,'height':h,'fps':a.fps,'seconds':a.seconds}))
if __name__=='__main__':main()
