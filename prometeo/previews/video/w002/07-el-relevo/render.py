#!/usr/bin/env python3
"""EL RELEVO · original dialogue-free frame animation + original designed audio.
Only dependency beyond stdlib: numpy, Pillow, OpenCV, ffmpeg executable.
Deterministic: every frame derives from t, no external assets.
"""
import os, math, json, wave, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
ROOT=os.path.dirname(os.path.abspath(__file__))
W,H,FPS=960,540,16
DURATION=28
CUTS=[0,3.6,6.5,9.3,12.8,16.2,20.5,23.7,28]
SHOTS=["place","cold","keepsake","handoff","notice","cover","recognition","together"]

def sm(a,b,t):
 z=np.clip((t-a)/(b-a),0,1);return float(z*z*(3-2*z))
def lerp(a,b,w):return a+(b-a)*w

def ellipse(draw,box,fill,outline=None,width=1):draw.ellipse(tuple(map(int,box)),fill=fill,outline=outline,width=width)
def line(draw,pts,fill,width=2,joint='curve'):draw.line([(int(a),int(b)) for a,b in pts],fill=fill,width=width,joint=joint)
def poly(draw,pts,fill):draw.polygon([(int(a),int(b)) for a,b in pts],fill=fill)
def ellipse_rotated(img,center,axes,angle,color):
 arr=np.asarray(img);cv2.ellipse(arr,tuple(map(int,center)),tuple(map(int,axes)),int(angle),0,360,color,-1,cv2.LINE_AA)

def background():
 yy=np.linspace(0,1,H)[:,None]
 xx=np.linspace(0,1,W)[None,:]
 b=np.empty((H,W,3),dtype=np.uint8)
 for i,(a,c) in enumerate([(17,44),(25,55),(38,64)]):b[:,:,i]=np.clip(a+(c-a)*yy+11*xx,0,255)
 im=Image.fromarray(b);d=ImageDraw.Draw(im,'RGBA')
 # Station behind scene: three lit windows and architecture, physical perspective.
 for x in [60,215,770,906]:
  d.rectangle((x,82,x+11,435),fill=(28,38,49,190))
  d.rectangle((x+2,91,x+6,410),fill=(94,111,118,55))
 d.rectangle((4,51,951,94),fill=(21,35,48,255))
 d.polygon([(0,0),(960,0),(960,71),(0,112)],fill=(11,20,29,255))
 d.line([(0,108),(960,67)],fill=(142,148,147,100),width=3)
 # city background silhouettes
 for x,y,w,h in [(0,194,145,178),(150,139,86,230),(236,184,106,187),(350,113,84,252),(446,156,137,202),(680,136,95,235),(785,167,111,210),(907,99,80,280)]:
  d.rectangle((x,y,x+w,y+h),fill=(24,37,49,210))
  for col in range(x+13,x+w-4,19):
   for row in range(y+22,y+h-10,27):
    warm=(198,146,98,135) if (col*5+row*3)%7==0 else (74,109,125,65)
    d.rectangle((col,row,col+7,row+11),fill=warm)
 # rear glass grid, smudges and reflected vertical lines
 for x in [174,382,582,779]:d.line([(x,92),(x,403)],fill=(113,142,154,66),width=3)
 d.line([(26,404),(938,404)],fill=(179,182,166,63),width=3)
 # Floor platform, with pooled reflections
 d.polygon([(0,410),(960,410),(960,540),(0,540)],fill=(31,47,57,245))
 for j in range(16):
  y=415+j*10
  d.line([(0,y),(960,y)],fill=(109,129,134,max(10,47-j*2)),width=1)
 for x0 in [160,275,392,605,773,856]:
  d.line([(x0,410),(x0+(x0-480)*.5,540)],fill=(128,142,148,34),width=2)
 # Bench: wood slats, legs, iron hardware
 d.rounded_rectangle((268,365,628,391),radius=10,fill=(93,70,67),outline=(165,119,86),width=2)
 for dy in [0,9,17]:d.line([(274,368+dy),(620,368+dy)],fill=(177,133,100,130),width=2)
 d.rounded_rectangle((252,395,654,409),radius=5,fill=(121,85,65),outline=(193,142,97),width=2)
 for x in (278,624):
  d.polygon([(x-7,403),(x+9,403),(x+3,461),(x-13,461)],fill=(39,43,51))
  d.line([(x-7,405),(x-10,457)],fill=(123,139,146,75),width=2)
 # illuminated stop sign: no words, plain translucent glass
 d.rounded_rectangle((665,121,681,398),radius=5,fill=(71,84,91),outline=(155,171,170),width=2)
 d.rounded_rectangle((641,107,706,160),radius=9,fill=(41,55,64),outline=(177,181,150),width=3)
 d.ellipse((661,121,685,145),fill=(241,204,128))
 # street trees drifting behind glass
 for xx0 in (41,935):
  d.line([(xx0,420),(xx0+19,260)],fill=(30,49,45),width=10)
  for i in range(9):
   ang=i*math.tau/9;px=xx0+math.cos(ang)*70;py=278+math.sin(ang)*64
   ellipse(d,(px-38,py-17,px+38,py+17),(36,66,60,130))
 return im
BASE=background()

def mitten(draw,x,y,k=1,theta=0):
 # well-defined iconic red knitted mitten with ivory star and ribbing
 w=21*k; h=31*k
 # cuff, hand, thumb and seam in consistent orientation
 draw.rounded_rectangle((int(x-13*k),int(y+10*k),int(x+13*k),int(y+29*k)),radius=max(2,int(5*k)),fill=(126,48,53),outline=(237,135,112),width=max(1,int(2*k)))
 draw.rounded_rectangle((int(x-17*k),int(y-21*k),int(x+16*k),int(y+14*k)),radius=max(5,int(12*k)),fill=(169,57,65),outline=(247,153,132),width=max(1,int(2*k)))
 poly(draw,[(x-16*k,y-7*k),(x-28*k,y+1*k),(x-24*k,y+15*k),(x-11*k,y+14*k)],(166,58,63))
 line(draw,[(x-23*k,y+9*k),(x-17*k,y+13*k)],(247,162,132),max(1,int(2*k)))
 for z in (14,19,24):line(draw,[(x-10*k,y+z*k),(x+10*k,y+z*k)],(224,119,99),max(1,int(k)))
 # embroidered snowflake (its unique shape makes the object trackable in cuts)
 for ang in [0,math.pi/3,2*math.pi/3]:
  dx=math.cos(ang)*7*k;dy=math.sin(ang)*7*k
  line(draw,[(x-dx,y-5*k-dy),(x+dx,y-5*k+dy)],(252,205,153),max(1,int(1.8*k)))

def old_man(im,t,arm=0,smile=0,look=0,body=0):
 d=ImageDraw.Draw(im,'RGBA');x,y=342,363+body
 # trousers, shoes (knees forward, not placeholder sticks)
 for side in [-1,1]:
  sx=x+side*18
  line(d,[(sx,387),(sx+side*13,417),(sx+side*10,450)],(58,64,75),20)
  ellipse(d,(sx+side*10-18,443,sx+side*10+19,455),(38,37,40,255))
 # fabric jacket, lapel and collar
 d.polygon([(x-44,y-30),(x-33,y-56),(x+25,y-58),(x+48,y-29),(x+40,y+49),(x-49,y+49)],fill=(116,85,70,255))
 poly(d,[(x-22,y-53),(x-3,y-22),(x-19,y+21),(x-29,y-33)],(188,149,113,255))
 poly(d,[(x+14,y-54),(x-2,y-22),(x+17,y+22),(x+26,y-33)],(169,121,93,255))
 line(d,[(x-5,y-24),(x+8,y+42)],(81,61,57),3)
 for by in (365,385,408):ellipse(d,(x+8,by,x+12,by+4),(235,178,123,255))
 # stationary left sleeve, fingers on lap
 line(d,[(x-37,y-31),(x-52,y+6),(x-13,y+25)],(106,73,64),19)
 ellipse(d,(x-23,y+15,x-5,y+31),(218,167,132,255))
 # right arm moves towards child's outstretched hand
 elbow=(x+42+arm*56,y+3+arm*4)
 hand=(x+23+arm*245,y+21-arm*5)
 line(d,[(x+39,y-34),elbow,hand],(110,77,69),19)
 line(d,[elbow,hand],(175,119,91),6)
 ellipse(d,(hand[0]-10,hand[1]-8,hand[0]+12,hand[1]+9),(214,166,129,255))
 # face/head lower and cranial silhouette
 ellipse(d,(x-29,y-108,x+28,y-48),(201,154,122,255))
 ellipse(d,(x+18,y-82,x+34,y-66),(190,141,115,255))
 # ears and hair irregular silhouette
 poly(d,[(x-27,y-75),(x-34,y-90),(x-26,y-115),(x-8,y-124),(x+13,y-118),(x+25,y-103),(x+20,y-112),(x+4,y-110),(x-14,y-105)],(174,180,175,255))
 line(d,[(x-17,y-103),(x-6,y-109),(x+7,y-107)],(215,216,196),3)
 # glasses, looking to kid/dog
 eyey=y-79; eyeoffset=look*3
 for ex in (-13,13):
  ellipse(d,(x+ex-10,eyey-8,x+ex+8,eyey+4),(19,38,50,85),outline=(214,184,149),width=2)
  ellipse(d,(x+ex+eyeoffset-2,eyey-3,x+ex+eyeoffset+2,eyey+1),(36,40,45,255))
 line(d,[(x-4,eyey-1),(x+4,eyey-1)],(204,179,154),2)
 # nose, silver moustache and expressive mouth
 ellipse(d,(x+15,y-70,x+28,y-60),(197,143,115,255))
 line(d,[(x-10,y-58),(x+1,y-62),(x+15,y-57)],(174,175,159),5)
 if smile: d.arc((x-6,y-61,x+18,y-44),0,180,fill=(105,57,55),width=2)
 else:line(d,[(x-1,y-51),(x+13,y-53)],(110,69,66),2)
 # cap brim, wool irregular seam
 poly(d,[(x-31,y-108),(x-30,y-122),(x-16,y-135),(x+5,y-136),(x+27,y-126),(x+29,y-107)],(54,80,84,255))
 line(d,[(x-37,y-108),(x+31,y-107)],(39,58,63),7)
 line(d,[(x-22,y-121),(x+11,y-125)],(93,113,115),2)
 return hand

def child(im,t,shiver=0,reach=0,kneel=0,smile=0,lookDown=0,entry=1):
 d=ImageDraw.Draw(im,'RGBA');x=lerp(995,655,entry); y=351+3*shiver*math.sin(t*22)+kneel*48
 # feet + boots; knees bend when kneeling
 for side in (-1,1):
  xp=x+side*13
  xk=xp+side*(kneel*26)
  line(d,[(xp,y+31),(xk,y+62),(xp+side*9,y+103-27*kneel)],(39,63,74),17)
  ellipse(d,(xp+side*9-16,y+94-27*kneel,xp+side*9+21,y+107-27*kneel),(203,151,70,255))
 # teal raincoat and hood
 poly(d,[(x-33,y-51),(x-45,y-18),(x-37,y+53),(x+36,y+53),(x+42,y-23),(x+27,y-53)],(60,117,119,255))
 poly(d,[(x-16,y-50),(x-2,y-25),(x-9,y+52),(x-30,y+48)],(79,141,134,255))
 line(d,[(x,y-26),(x+1,y+48)],(199,190,137),3)
 for yy in (y+2,y+21):ellipse(d,(x+6,yy,x+10,yy+4),(226,199,133,255))
 # rear sleeve hugging body, front sleeve reaching to old man or dog
 line(d,[(x+31,y-37),(x+45,y+3),(x+30,y+32)],(50,103,112),18)
 ellipse(d,(x+23,y+25,x+38,y+38),(232,177,135,255))
 wristx=lerp(x-28,x-90,reach) if not kneel else lerp(x-28,766,sm(16.3,18.5,t))
 wristy=lerp(y+14,y+23,reach) if not kneel else lerp(y+14,425,sm(16.3,18.5,t))
 line(d,[(x-32,y-29),(x-46,y+4),(wristx,wristy)],(62,117,119),19)
 ellipse(d,(wristx-9,wristy-8,wristx+10,wristy+10),(235,179,137,255))
 # visible hood and face, orientation down expressed via head offset
 headx=x-4+lookDown*9;heady=y-80+lookDown*12
 ellipse(d,(headx-31,heady-39,headx+31,heady+20),(38,94,101,255))
 ellipse(d,(headx-23,heady-28,headx+25,heady+16),(233,176,138,255))
 # hair curls high contrast and natural asymmetry
 for dx,dy,r in [(-17,-24,8),(-7,-28,10),(6,-27,9),(17,-18,8),(-24,-16,6)]:ellipse(d,(headx+dx-r,heady+dy-r,headx+dx+r,heady+dy+r),(50,44,49,255))
 # nose eyebrows pupils orientation, blink over time
 blink=(math.sin(t*1.43)>0.995)
 for e in (-10,10):
  line(d,[(headx+e-5,heady-8),(headx+e+5,heady-9)],(75,59,54),2)
  if blink:line(d,[(headx+e-3,heady-3),(headx+e+4,heady-2)],(68,56,52),2)
  else:ellipse(d,(headx+e-2,heady-5+lookDown*3,headx+e+3,heady+1+lookDown*3),(44,45,47,255))
 ellipse(d,(headx+18,heady,headx+25,heady+7),(218,154,122,255))
 for fx,fy in [(-9,8),(-4,6),(12,8)]:ellipse(d,(headx+fx,heady+fy,headx+fx+2,heady+fy+2),(155,91,80,205))
 if smile:d.arc((headx-6,heady+2,headx+13,heady+17),0,175,fill=(149,72,76),width=2)
 else:line(d,[(headx-1,heady+11),(headx+9,heady+11)],(155,94,83),2)
 # coat drawstrings
 line(d,[(x-11,y-42),(x-12,y-17)],(235,206,149),2)
 return (wristx,wristy)

def dog(im,t,warm=0,notice=0):
 d=ImageDraw.Draw(im,'RGBA');x=780;y=432
 trem=math.sin(t*31)*2*(1-warm)
 # paws/front legs and curled tail
 line(d,[(x+18,y-1),(x+37,y+10),(x+46,y-3)],(113,88,77),11)
 for xx0 in (x-18,x+18):
  line(d,[(xx0,y-4),(xx0+4,y+21)],(121,98,79),10)
  ellipse(d,(xx0-7,y+14,xx0+13,y+25),(128,106,89,255))
 ellipse(d,(x-43,y-26+trem,x+37,y+17+trem),(113,89,75,255))
 ellipse(d,(x-46,y-27+trem,x-5,y-1+trem),(152,120,91,255))
 ellipse(d,(x-48,y-65+trem,x+2,y-14+trem),(147,110,88,255))
 # folded ears, eyebrows, muzzle and moist nose
 poly(d,[(x-42,y-52+trem),(x-59,y-67+trem),(x-56,y-30+trem)],(84,67,65,255))
 poly(d,[(x-8,y-50+trem),(x+12,y-67+trem),(x+6,y-28+trem)],(98,75,69,255))
 ellipse(d,(x-50,y-43+trem,x-28,y-22+trem),(176,140,113,255))
 ellipse(d,(x-51,y-43+trem,x-43,y-37+trem),(31,36,40,255))
 ellipse(d,(x-29,y-48+trem,x-23,y-42+trem),(26,34,36,255))
 if notice:line(d,[(x-29,y-55+trem),(x-20,y-58+trem)],(83,72,66),2)
 if warm:
  ellipse(d,(x-32,y-22,x-15,y-17),(184,143,114,255))
  # tail happy motion
  line(d,[(x+27,y),(x+48,y-9-9*math.sin(t*9))],(111,87,73),11)
 return x,y

def glove_position(t):
 if t<9.3:return (370+12*sm(6.6,8.9,t),378-10*sm(6.6,8.9,t),0.90)
 if t<12.8:
  w=sm(9.7,11.9,t);return lerp(382,609,w),lerp(372,373,w),0.88
 if t<16.2:return 607,372,0.92
 if t<20.5:
  w=sm(16.7,19.2,t);return lerp(610,752,w),lerp(372,420,w),0.87
 return 791,418,0.86

def frame(t):
 im=BASE.copy();d=ImageDraw.Draw(im,'RGBA')
 # Draw rain behind characters, choreographed gusts. Deterministic per frame.
 rng=np.random.default_rng(4311);count=145
 for j in range(count):
  px=float(rng.uniform(-40,W+20));py=float(rng.uniform(65,H+20))
  yy=(py+t*(155+33*(j%4)))%H
  xx=(px+t*11*(0.8+j%3)/3)%W
  alpha=40 if j%3 else 84
  if yy>415:alpha=int(alpha*.7)
  line(d,[(xx,yy),(xx-3.4,yy+12)],(181,205,210,alpha),1)
 # Visible ploshes near dog
 for i in range(8):
  xx=70+i*113;yy=450+(i%3)*21
  v=(t*2.2+(i*.34))%1
  ellipse(d,(xx-8*v,yy-2*v,xx+8*v,yy+2*v),(131,186,192,int((1-v)*74)),width=1)
 # Appearance and action change shot-by-shot
 enter=sm(.45,3.1,t)
 shiver=1 if 3.6<=t<6.5 else sm(2.6,3.8,t)*(1-sm(8.5,9.5,t))
 arm=sm(8.85,11.15,t) * (1-sm(12.8,13.4,t))
 look=sm(2.9,5.5,t) # old looks across
 smile=sm(19.2,21,t)
 reach=sm(9.15,11.4,t)*(1-sm(13.1,14,t))
 kneel=sm(16.3,18.5,t)
 dogwarm=sm(18.9,20.5,t)
 old_man(im,t,arm,smile,look,0)
 child(im,t,shiver,reach,kneel,smile,sm(12.8,15.6,t),enter)
 dog(im,t,dogwarm,sm(12.8,14.6,t))
 d=ImageDraw.Draw(im,'RGBA')
 if t<23.7 or t>=23.7:mitten(d,*glove_position(t))
 # drifting breath on cold shots, not captions
 if 3<t<9 or 13<t<16:
  for k in range(3):
   z=(t*0.75+k/3)%1
   cx=670+z*27;cy=264-z*42
   ellipse(d,(cx-7-z*12,cy-3-z*3,cx+7+z*12,cy+3+z*3),(226,234,218,int((1-z)*44)))
 # train light approaches, motivated warm reflection in epilogue
 if t>23.7:
  w=sm(23.8,27.1,t)
  layer=Image.new('RGBA',(W,H));ld=ImageDraw.Draw(layer,'RGBA')
  ld.ellipse((-390+w*650,146,-180+w*690,350),fill=(245,181,111,int(w*95)))
  ld.polygon([(0,474),(800*w,412),(880*w,540),(0,540)],fill=(245,178,109,int(w*38)))
  ld.rectangle((12+w*185,259,27+w*185,376),fill=(245,201,141,int(w*165)))
  layer=layer.filter(ImageFilter.GaussianBlur(34));im=Image.alpha_composite(im.convert('RGBA'),layer)
 # Shot choreography: same objects in the same 2D geography, motivated reframes.
 idx=max(0,min(len(SHOTS)-1,np.searchsorted(CUTS[1:],t,side='right')))
 cams=[(1.0,480,283),(1.43,660,316),(1.67,420,364),(1.11,496,322),(1.48,744,367),(1.37,710,386),(1.27,440,321),(1.0,480,283)]
 zoom,cx,cy=cams[idx]
 arr=np.array(im.convert('RGB'))
 if zoom!=1:
  nw,nh=int(W/zoom),int(H/zoom);x0=int(np.clip(cx-nw/2,0,W-nw));y0=int(np.clip(cy-nh/2,0,H-nh))
  arr=cv2.resize(arr[y0:y0+nh,x0:x0+nw],(W,H),interpolation=cv2.INTER_CUBIC)
 # Film negative vignette and low-distraction grain
 yy,xx=np.ogrid[:H,:W]
 vign=np.clip(1-.22*(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2),.67,1)
 arr=np.clip(arr.astype(np.float32)*vign[:,:,None],0,255).astype(np.uint8)
 rng=np.random.default_rng(321+int(t*FPS));grain=rng.normal(0,1.4,(H,W,1))
 arr=np.clip(arr.astype(np.float32)+grain,0,255).astype(np.uint8)
 # clean letterbox: no dialogue, no text
 arr[:23]=[13,20,26];arr[-23:]=[13,20,26]
 return cv2.cvtColor(arr,cv2.COLOR_RGB2BGR)

def audio():
 sr=32000;n=int(DURATION*sr);tt=np.arange(n,dtype=np.float64)/sr
 rg=np.random.default_rng(924)
 rain=rg.normal(0,1,n)
 # soft steady rain and spatial swells; audio generated from synthesis only
 rain=np.convolve(rain,np.ones(23)/23,mode='same')
 rain=rain*(.11+.024*np.sin(2*np.pi*.13*tt))
 music=np.zeros(n,dtype=np.float64)
 # original minimalist harmonic motif, tension to kindness, avoiding stock assets
 notes=[(0,174.61,.08,3),(3,196,.07,2.8),(6.5,220,.06,2.8),(9.4,261.63,.07,3.8),(13,220,.04,3.0),(16.9,293.66,.07,4.5),(20.7,329.63,.085,4.2),(24,392,.07,3.9),(26,261.63,.06,1.6)]
 for start,f,amp,dur in notes:
  a=int(start*sr);b=min(n,int((start+dur)*sr)); tloc=np.arange(b-a)/sr
  attack=np.minimum(1,tloc/.04)
  env=attack*np.exp(-tloc*1.15/dur)*(1-np.exp(-np.maximum(dur-tloc,0)*3))
  wave0=np.sin(2*np.pi*f*tloc)+.27*np.sin(2*np.pi*f*2*tloc)+.06*np.sin(2*np.pi*f*3*tloc)
  music[a:b]+=amp*wave0*env
 # Foley: shivering coat, floor steps, mitten cloth and dog whine, all original synthesis
 foley=np.zeros(n)
 events=[(.8,'step'),(1.4,'step'),(2.2,'step'),(4.5,'cloth'),(9.6,'cloth'),(11.7,'cloth'),(16.8,'step'),(19,'cloth'),(21.1,'whine')]
 for a,kind in events:
  ix=int(a*sr);dur=.18 if kind=='step' else (.37 if kind=='cloth' else .75)
  nn=min(n-ix,int(dur*sr));u=np.arange(nn)/sr
  if nn<=0:continue
  noise=rg.normal(size=nn)
  if kind=='step':
   wave0=np.sin(2*np.pi*64*u)*np.exp(-20*u)+noise*.05*np.exp(-11*u);amp=.17
  elif kind=='cloth':
   wave0=np.convolve(noise,np.ones(17)/17,mode='same')*np.sin(np.pi*np.minimum(1,u/dur));amp=.10
  else:
   wave0=np.sin(2*np.pi*(560-135*u)*u)*(np.sin(np.pi*u/dur)**1.8);amp=.045
  foley[ix:ix+nn]+=wave0*amp
 final=np.clip(music+rain+foley,-.9,.9)
 stereo=np.stack([final*(.97+.02*np.sin(tt*0.5)),final*(.95-.02*np.sin(tt*.5))],axis=1)
 out=os.path.join(ROOT,'original_mix.wav')
 with wave.open(out,'wb') as wf:
  wf.setnchannels(2);wf.setsampwidth(2);wf.setframerate(sr);wf.writeframes((stereo*32767).astype('<i2').tobytes())
 return out

def main():
 out=os.path.join(ROOT,'EL_RELEVO_07.mp4');wav=audio()
 ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',wav,'-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',out],stdin=subprocess.PIPE)
 for i in range(int(DURATION*FPS)):
  t=i/FPS;f=frame(t)
  if i in (30,65,120,178,224,278,352,420):cv2.imwrite(os.path.join(ROOT,f'frame_{i:03d}.png'),f)
  ff.stdin.write(f.tobytes())
 ff.stdin.close();code=ff.wait();assert code==0, f'ffmpeg failed: {code}'
 print(out,os.stat(out).st_size)
if __name__=='__main__':main()
