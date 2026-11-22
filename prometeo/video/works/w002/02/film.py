#!/usr/bin/env python3
"""VERTICE L1: single-asset product commercial. Original procedural model + camera/pose recipe.
Python 3.11+, VTK 9, Pillow, NumPy, SciPy and FFmpeg. Deterministic and offline.
"""
import os, sys, json, math, subprocess, argparse, wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import vtk
from vtk.util.numpy_support import vtk_to_numpy
from scipy.signal import butter, sosfilt

ROOT=Path(__file__).resolve().parent
FPS=24
DURATION=16
W,H=640,360
F=FPS*DURATION
VERSION='video-w002-20261122-02'

# Geometry (centimeters). Three revolute joints, one authoritative asset.
GEOMETRY={'baseRadiusCm':7.2,'baseHeightCm':1.6,'lowerArmCm':17.0,
          'upperArmCm':18.0,'lightHeadCm':19.0,'stemDiameterCm':1.35,
          'hingeDiameterCm':3.5,'headWidthCm':2.2}
SHOT_SYSTEM=[
  {'id':'S01','start':0,'end':2.75,'type':'SILHOUETTE','focus':'folded','focalMmEquivalent':75},
  {'id':'S02','start':2.75,'end':5.1,'type':'HINGE_MACRO','focus':'joint1','focalMmEquivalent':110},
  {'id':'S03','start':5.1,'end':7.6,'type':'MECHANISM','focus':'full','focalMmEquivalent':50},
  {'id':'S04','start':7.6,'end':10.15,'type':'LIGHT_REVEAL','focus':'full','focalMmEquivalent':60},
  {'id':'S05','start':10.15,'end':12.5,'type':'EMITTER_DETAIL','focus':'head','focalMmEquivalent':110},
  {'id':'S06','start':12.5,'end':16,'type':'HERO_END','focus':'full','focalMmEquivalent':65}
]

def smooth(t):
    q=min(1,max(0,t));return q*q*(3-2*q)
def mix(a,b,t):return a*(1-t)+b*t

def anim_state(t):
    # Folded stance -> an articulated triple hinge. Angles measured in global x/z plane.
    a=smooth((t-3.0)/3.7)
    b=smooth((t-4.2)/3.4)
    c=smooth((t-5.0)/3.0)
    a1=mix(22,70,a)
    a2=mix(199,63,b)
    a3=mix(2,178,c)
    lit=smooth((t-7.9)/.65)
    return a1,a2,a3,lit

def pose_points(a1,a2,a3):
    p0=np.array([0.,0.,1.72]);
    p1=p0+GEOMETRY['lowerArmCm']*np.array([math.cos(math.radians(a1)),0,math.sin(math.radians(a1))]);
    p2=p1+GEOMETRY['upperArmCm']*np.array([math.cos(math.radians(a2)),0,math.sin(math.radians(a2))]);
    p3=p2+GEOMETRY['lightHeadCm']*np.array([math.cos(math.radians(a3)),0,math.sin(math.radians(a3))]);
    return p0,p1,p2,p3

def color(c):return tuple(v/255 for v in c)

def actor_from(source,rgb,ambient=.30,diffuse=.75,specular=.48,power=42):
    m=vtk.vtkPolyDataMapper();m.SetInputConnection(source.GetOutputPort());a=vtk.vtkActor();a.SetMapper(m)
    p=a.GetProperty();p.SetColor(*color(rgb));p.SetAmbient(ambient);p.SetDiffuse(diffuse)
    p.SetSpecular(specular);p.SetSpecularPower(power)
    return a

def box(size,rgb,center=(0,0,0),**kw):
    src=vtk.vtkCubeSource();src.SetXLength(size[0]);src.SetYLength(size[1]);src.SetZLength(size[2]);src.SetCenter(*center)
    return actor_from(src,rgb,**kw)

def cylinder(rad,length,rgb,center=(0,0,0),res=80,**kw):
    src=vtk.vtkCylinderSource();src.SetRadius(rad);src.SetHeight(length);src.SetResolution(res);src.CappingOn();src.SetCenter(*center)
    return actor_from(src,rgb,**kw)

def cylinder_z(rad,length,rgb,center=(0,0,0),res=100,**kw):
    src=vtk.vtkCylinderSource();src.SetRadius(rad);src.SetHeight(length);src.SetResolution(res);src.CappingOn()
    act=actor_from(src,rgb,**kw);act.SetOrientation(90,0,0);act.SetPosition(*center)
    return act

def sphere(rad,rgb,center=(0,0,0),**kw):
    src=vtk.vtkSphereSource();src.SetRadius(rad);src.SetThetaResolution(38);src.SetPhiResolution(28);src.SetCenter(*center)
    return actor_from(src,rgb,**kw)

def make_matrix(point,angle):
    a=math.radians(angle);ca,sa=math.cos(a),math.sin(a)
    m=vtk.vtkMatrix4x4();m.Identity()
    for i,col in enumerate(((ca,0,sa),(0,1,0),(-sa,0,ca))):
        for k in range(3):m.SetElement(k,i,col[k])
    for k in range(3):m.SetElement(k,3,float(point[k]))
    return m

class Model:
 def __init__(self,ren):
    self.ren=ren
    self.parts={'lower':[],'upper':[],'head':[],'joint0':[],'joint1':[],'joint2':[]}
    self.base=[]
    def add(a,group=None):
        ren.AddActor(a)
        (self.parts[group] if group else self.base).append(a)
        return a
    # low-profile puck. Stratified layers and concentric ring accents
    add(cylinder_z(7.2,1.25,(60,65,70),center=(0,0,.72),specular=.85,power=76))
    add(cylinder_z(6.95,.22,(130,139,144),center=(0,0,1.39),specular=.98,power=120))
    add(cylinder_z(6.55,.20,(33,40,46),center=(0,0,1.53),specular=.66,power=92))
    add(cylinder_z(6.3,.06,(87,96,101),center=(0,0,1.66),specular=.75,power=110))
    add(cylinder_z(1.35,.17,(166,133,99),center=(0,0,1.8),specular=.8,power=100))
    # Each arm is made of paired satin-machined rails with visible edge detailing.
    for group,le in [('lower',17.0),('upper',18.0)]:
        for y in [-.52,.52]:
            add(box((le-2.0,.82,1.15),(116,130,137),center=(le/2,y,0),specular=.86,power=75),group)
            add(box((le-2.4,.10,.07),(211,211,192),center=(le/2,y-.43,.54),specular=.95,power=100),group)
            add(box((le-2.4,.10,.07),(48,58,63),center=(le/2,y-.43,-.52),specular=.9,power=100),group)
        # inset matte spine, not floating disconnected parts
        add(box((le-2.5,.21,.75),(39,48,54),center=(le/2,0,0),specular=.30,power=50),group)
    # Single rigid head, lighting recess attached to the head; long-form etched rails.
    le=GEOMETRY['lightHeadCm']
    add(box((le-1.4,2.3,1.65),(52,59,64),center=(le/2,0,0),specular=.85,power=80),'head')
    add(box((le-2.6,1.6,.28),(174,171,153),center=(le/2,0,.85),specular=.7,power=50),'head')
    add(box((le-2.8,1.5,.1),(25,29,32),center=(le/2,0,1.04),specular=.42,power=50),'head')
    self.emitter=add(box((le-2.4,1.45,.14),(245,200,149),center=(le/2,0,1.00),ambient=.62,diffuse=.32,specular=.05,power=8),'head')
    self.emitter_side=add(box((le-2.6,.10,.26),(245,196,128),center=(le/2,-1.19,.30),ambient=.86,diffuse=.3,specular=.05,power=8),'head')
    # bulb ends: machined caps
    for x in [0.8,le-0.8]:
        add(cylinder(1.0,2.3,(137,148,148),center=(x,0,0),specular=.95,power=110),'head')
    # real cylindrical joints with collars and inner rotary core. No shape regeneration between shots.
    for group in ['joint0','joint1','joint2']:
        add(cylinder(1.73,3.05,(45,52,58),center=(0,0,0),specular=.65,power=75),group)
        for y in [-1.55,1.55]:
            add(cylinder(1.53,.20,(160,151,125),center=(0,y,0),specular=.95,power=120),group)
            add(cylinder(1.22,.235,(65,74,80),center=(0,y+(.1 if y>0 else -.1),0),specular=.8,power=95),group)
            add(cylinder(.48,.25,(19,25,29),center=(0,y+(.25 if y>0 else -.25),0),specular=.45,power=110),group)
    # Touch control on base is a real sphere pinned to local surface.
    add(sphere(.21,(194,152,109),center=(-3.8,-1.0,1.81),specular=.9,power=85))
    self.pool=[]
    for i in range(14):
        rad=4+i*1.4
        a=cylinder_z(rad,.001,(226,137,65),center=(5.0,0,0.035+i*.001),res=92,ambient=1,diffuse=0,specular=0)
        a.GetProperty().SetOpacity(0.015)
        add(a);self.pool.append(a)
    # Matte seamless ground stage
    ground=vtk.vtkPlaneSource();ground.SetOrigin(-150,-150,.0);ground.SetPoint1(150,-150,.0);ground.SetPoint2(-150,150,.0)
    ga=actor_from(ground,(17,21,26),ambient=.43,diffuse=.5,specular=.25,power=50);ren.AddActor(ga)

 def update(self,t):
    a1,a2,a3,lit=anim_state(t)
    p0,p1,p2,p3=pose_points(a1,a2,a3)
    for group,pt,ang in [('lower',p0,a1),('upper',p1,a2),('head',p2,a3)]:
        mat=make_matrix(pt,ang)
        for act in self.parts[group]:act.SetUserMatrix(mat)
    for group,p in [('joint0',p0),('joint1',p1),('joint2',p2)]:
        m=vtk.vtkMatrix4x4();m.Identity()
        for i in range(3):m.SetElement(i,3,float(p[i]))
        for act in self.parts[group]:act.SetUserMatrix(m)
    self.emitter.GetProperty().SetColor(*(mix(a,b,lit) for a,b in zip(color((115,110,95)),color((255,211,158)))))
    self.emitter.GetProperty().SetAmbient(mix(.18,1,lit))
    self.emitter_side.GetProperty().SetColor(*(mix(a,b,lit) for a,b in zip(color((56,65,70)),color((255,215,159)))))
    self.emitter_side.GetProperty().SetAmbient(mix(.14,1,lit))
    for i,a in enumerate(self.pool):a.GetProperty().SetOpacity(lit*max(.0,.044*(1-i/14)**1.5))
    return p0,p1,p2,p3,lit


def init_scene():
    ren=vtk.vtkRenderer();ren.SetBackground(.009,.013,.020);ren.SetBackground2(.036,.046,.059);ren.GradientBackgroundOn()
    win=vtk.vtkRenderWindow();win.AddRenderer(ren);win.SetSize(W,H);win.SetOffScreenRendering(1);win.SetMultiSamples(4)
    lights=[((22,-35,48),(0,0,14),(1,.95,.84),165),((-32,19,38),(8,0,16),(.63,.77,1),100),((12,17,38),(8,0,12),(1,.88,.66),88)]
    for pos,focus,c,inten in lights:
        l=vtk.vtkLight();l.SetLightTypeToSceneLight();l.SetPosition(*pos);l.SetFocalPoint(*focus);l.SetColor(*c)
        l.SetIntensity(inten/100);l.SetPositional(True);l.SetConeAngle(80);ren.AddLight(l)
    model=Model(ren)
    ren.SetUseDepthPeeling(0)
    cam=ren.GetActiveCamera();cam.SetViewUp(0,0,1);cam.SetClippingRange(.1,250)
    return win,ren,cam,model


def camera_at(t,points):
    p0,p1,p2,p3,_=points
    s=next(s for s in SHOT_SYSTEM if s['start']<=t<s['end'])
    sid=s['id'];v=(t-s['start'])/(s['end']-s['start'])
    # Camera positions and focal targets are tied to the same geometric reference.
    if sid=='S01': pos=(25-v*3,-37+v,22);foc=(8,0,5.5);fov=30
    elif sid=='S02': pos=tuple(p1+np.array((8-v*2,-22,10-v*2)));foc=tuple(p1);fov=25
    elif sid=='S03': pos=(42-v*5,-64+v*4,42);foc=(11,0,18);fov=37
    elif sid=='S04': pos=(40-v*4,-61+v*5,38);foc=(9,0,17);fov=37
    elif sid=='S05': pos=tuple((p2+p3)/2+np.array((7-v*3,-22,9)));foc=tuple((p2+p3)/2);fov=27
    else: pos=(42-v*4,-66+v*3,40);foc=(9,0,18);fov=36
    return pos,foc,fov,sid,v

FONTDIR='/usr/share/fonts/truetype/clear-sans'
try: FB=ImageFont.truetype(FONTDIR+'/ClearSans-Bold.ttf',40);FN=ImageFont.truetype(FONTDIR+'/ClearSans-Regular.ttf',20);FS=ImageFont.truetype(FONTDIR+'/ClearSans-Regular.ttf',15);FM=ImageFont.truetype(FONTDIR+'/ClearSans-Light.ttf',70)
except:FB=FN=FS=FM=ImageFont.load_default()

def draw_overlay(arr,t,sid,v):
    im=Image.fromarray(arr,'RGB').resize((960,540),Image.Resampling.BICUBIC).convert('RGBA')
    lay=Image.new('RGBA',(960,540),(0,0,0,0));d=ImageDraw.Draw(lay)
    # optical matte: no opaque information banners; titles appear in scene pauses.
    d.text((49,38),'VERTICE / PRODUCT FILM 01',font=FS,fill=(240,231,219,188))
    d.line(((49,67),(147,67)),fill=(227,182,132,158),width=2)
    d.text((816,40),'L1 / 2026',font=FS,fill=(242,232,223,178))
    if sid=='S01':
        a=smooth((t-.2)/.65)*(1-smooth((t-1.9)/.5))
        d.text((49,393),'UNA FORMA.',font=FB,fill=(248,240,228,int(238*a)))
        d.text((50,447),'INFINITAS POSIBILIDADES.',font=FN,fill=(226,211,191,int(197*a)))
    if sid=='S03':
        a=smooth((t-5.4)/.4)*(1-smooth((t-7.0)/.5))
        d.text((49,440),'TRES ARTICULACIONES. UN SOLO GESTO.',font=FN,fill=(247,237,217,int(a*220)))
    if sid=='S04':
        a=smooth((t-8.15)/.6)*(1-smooth((t-9.45)/.5))
        d.text((49,442),'LA LUZ ENCUENTRA SU LUGAR.',font=FN,fill=(247,231,207,int(a*224)))
    if sid=='S06':
        a=smooth((t-12.95)/1.1)
        d.text((49,362),'VÉRTICE',font=FM,fill=(253,242,225,int(a*246)))
        d.text((54,447),'L1   /   LUZ EN MOVIMIENTO',font=FN,fill=(237,226,205,int(a*229)))
        d.line(((52,488),(278,488)),fill=(226,183,124,int(a*218)),width=2)
    im=Image.alpha_composite(im,lay)
    return np.array(im.convert('RGB').resize((W,H),Image.Resampling.LANCZOS))


def render_keyframe(t,out):
    win,ren,cam,model=init_scene();pts=model.update(t);pos,foc,fov,sid,v=camera_at(t,pts)
    cam.SetPosition(*pos);cam.SetFocalPoint(*foc);cam.SetViewAngle(fov);ren.ResetCameraClippingRange();win.Render()
    wi=vtk.vtkWindowToImageFilter();wi.SetInput(win);wi.ReadFrontBufferOff();wi.Update();vtk_im=wi.GetOutput()
    a=vtk_to_numpy(vtk_im.GetPointData().GetScalars()).reshape((H,W,-1))[::-1,:,:3]
    im=draw_overlay(a,t,sid,v);Image.fromarray(im).save(out)
    win.Finalize()


def generate_audio(path):
    # Entirely original foley: sprung metal ticks, damped hinge resonance, air whoosh,
    # power relay and a restrained noise-floor/low harmonic bed. Stereo, 48 kHz.
    sr=48000;n=int(DURATION*sr);tt=np.arange(n)/sr
    rng=np.random.default_rng(222);L=np.zeros(n);R=np.zeros(n)
    def add(signal,start,pan=0):
        i=int(start*sr);m=min(len(signal),n-i)
        if i>=n:return
        L[i:i+m]+=signal[:m]*math.sqrt((1-pan)/2);R[i:i+m]+=signal[:m]*math.sqrt((1+pan)/2)
    def click(start,base=.12,pan=0):
        tm=np.arange(int(.31*sr))/sr
        sig=(np.sin(2*np.pi*(810*tm-420*tm*tm))*np.exp(-28*tm)+.38*rng.normal(size=len(tm))*np.exp(-68*tm))*base
        add(sig,start,pan)
    def whoosh(start,dur,amp=.08,pan=0):
        z=rng.normal(size=int(dur*sr));sos=butter(2,1600,fs=sr,output='sos');z=sosfilt(sos,z)
        tm=np.arange(len(z))/sr;env=np.sin(np.pi*tm/dur)**1.8
        add(z*env*amp,start,pan)
    # Movement is deliberate; sound cues at physical joints, not every frame.
    for sec,pan,amp in [(2.98,-.4,.11),(4.15,.25,.12),(5.03,-.1,.11),(6.12,.3,.08),(7.04,0,.16)]:click(sec,amp,pan)
    whoosh(3.0,4.5,.055,-.22)
    # Relay and warming bloom in sync with lit(t)
    click(7.94,.13,.18)
    bloom=smooth(np.arange(n)/sr-8) if False else None
    env=np.clip((tt-8.05)/.8,0,1);env=env*env*(3-2*env)
    low=(np.sin(2*np.pi*87*tt)+.23*np.sin(2*np.pi*174.1*tt)+.07*np.sin(2*np.pi*348*tt))*.012
    air=sosfilt(butter(2,3200,fs=sr,output='sos'),rng.normal(size=n))*0.007
    rise=(.35+.65*np.clip((tt-8.05)/2.5,0,1))*env
    L+=(low+air)*rise;R+=(low+air)*rise
    # Subtle end release, not a pop-song substitution.
    exit_env=1-np.clip((tt-15.2)/.8,0,1)**2
    L*=exit_env;R*=exit_env
    peak=max(np.max(np.abs(L)),np.max(np.abs(R)));gain=min(1,.82/peak)
    stereo=np.stack([L,R],axis=1)*gain
    v=np.int16(np.clip(stereo,-1,1)*32767)
    with wave.open(str(path),'wb') as wf:wf.setnchannels(2);wf.setsampwidth(2);wf.setframerate(sr);wf.writeframes(v.tobytes())
    return {'sampleRate':sr,'peakDbFS':round(20*np.log10(max(1e-7,float(np.max(np.abs(stereo))))),2),'audioSources':'Procedural original foley and synthesis; no third-party recording'}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--preview',action='store_true');parser.add_argument('--out',default=str(ROOT));parser.add_argument('--size',default='640x360');args=parser.parse_args()
    global W,H
    W,H=[int(x) for x in args.size.split('x')]
    out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    if args.preview:
        for sec in [1.3,3.6,5.85,8.9,11.1,14.3]:
            render_keyframe(sec,out/f'preview-{sec:.2f}.jpg');print('preview',sec,flush=True)
        return
    audioInfo=generate_audio(out/'FOLEY.wav')
    win,ren,cam,model=init_scene();wi=vtk.vtkWindowToImageFilter();wi.SetInput(win);wi.ReadFrontBufferOff()
    video0=out/'VERTICE_L1_SILENT.mp4';
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0', '-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(video0)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    for i in range(F):
        t=i/FPS;pts=model.update(t);pos,foc,fov,sid,v=camera_at(t,pts)
        cam.SetPosition(*pos);cam.SetFocalPoint(*foc);cam.SetViewAngle(fov);ren.ResetCameraClippingRange();win.Render();wi.Modified();wi.Update()
        raw=vtk_to_numpy(wi.GetOutput().GetPointData().GetScalars()).reshape((H,W,-1))[::-1,:,:3].copy()
        raw=draw_overlay(raw,t,sid,v)
        try:proc.stdin.write(raw.tobytes())
        except BrokenPipeError:raise RuntimeError('FFmpeg input pipe broke')
        if i%48==0:print('RENDER',i,'/',F,flush=True)
    proc.stdin.close();ret=proc.wait();win.Finalize()
    if ret!=0:raise RuntimeError('FFmpeg failed '+str(ret))
    final=out/'VERTICE_L1_FILM.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(video0),'-i',str(out/'FOLEY.wav'),'-c:v','copy','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',str(final)],check=True)
    for sec in [1.3,3.6,5.85,8.9,11.1,14.3]:
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(sec),'-i',str(final),'-frames:v','1',str(out/f'frame-{sec:.2f}.jpg')],check=True)
    (out/'PRODUCT_SHOTS.json').write_text(json.dumps({'taskId':VERSION,'product':'VÉRTICE L1','geometry':GEOMETRY,'shots':SHOT_SYSTEM,'fps':FPS,'durationSeconds':DURATION,'final':final.name,'audio':audioInfo,'movement':'Three physical joints in one xz coordinate system: lower, upper, head','export':'ffmpeg / libx264 + AAC'},ensure_ascii=False,indent=2))
    print('DONE',final,os.path.getsize(final))
if __name__=='__main__':main()