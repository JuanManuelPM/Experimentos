"""LÚMINA W003/01: deterministic editorial layouts from an original AI-generated hero.
Requires Pillow. The master was rendered at 1536x1024. No upscaling is sold as extra optical detail.
"""
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageOps
from pathlib import Path
import json, hashlib, math

OUT=Path(__file__).parent
SOURCE=OUT/'hero_original.png' if (OUT/'hero_original.png').exists() else OUT/'00_hero_original.jpg'
M=Image.open(SOURCE).convert('RGB')
C={'ink':'#191d22','cream':'#e9e0cf','ivory':'#f3eadb','copper':'#b77a4c','grey':'#aaa69e','dark':'#171b20','paper':'#ebe2d4'}
SERIF='/usr/share/fonts/truetype/ebgaramond/EBGaramond08-Regular.ttf'
SANS='/usr/share/fonts/opentype/inter/InterDisplay-Regular.otf'
LIGHT='/usr/share/fonts/opentype/inter/InterDisplay-Light.otf'

def font(sz, serif=False, light=False): return ImageFont.truetype(SERIF if serif else LIGHT if light else SANS, sz)
def text(d,xy,s,size,color,serif=False,light=False,tracking=0):
    f=font(size,serif,light)
    if not tracking: d.text(xy,s,fill=color,font=f,stroke_width=0);return
    x,y=xy
    for c in s:
        d.text((x,y),c,font=f,fill=color)
        x+=d.textlength(c,font=f)+tracking

def cover(im, size, focus=(0.68,0.55)):
    W,H=size; w,h=im.size; s=max(W/w,H/h); ww,hh=round(w*s),round(h*s)
    img=im.resize((ww,hh),Image.Resampling.LANCZOS)
    x=max(0,min(ww-W,int(ww*focus[0]-W*focus[0])))
    y=max(0,min(hh-H,int(hh*focus[1]-H*focus[1])))
    return img.crop((x,y,x+W,y+H))

def save(name,im):
    im.save(OUT/name,format='JPEG',quality=91,subsampling=0,optimize=True,progressive=True)

def left_gradient(src,amount=190):
    im=src.convert('RGB'); pix=im.load(); W,H=im.size
    import numpy as np
    arr=np.asarray(im).copy().astype('float32')
    fade=np.linspace(0,1,W)
    fade=(1-fade)**1.55
    arr[:,:,:] *= (1-amount/255*fade[None,:,None])[:,:,None]
    return Image.fromarray(arr.clip(0,255).astype('uint8'))

# 00 master: original AI-generated still life, no post processing or false upscaling
save('00_hero_original.jpg',M)

# 01: editorial print spread / 3000x2000, asymmetric typographic left page
W,H=3000,2000
ed=Image.new('RGB',(W,H),C['cream']); d=ImageDraw.Draw(ed)
photo=cover(M,(1800,H),focus=(.64,.50))
ed.paste(photo,(1200,0))
d.rectangle((0,0,1200,H),fill=C['cream'])
d.line((112,142,1085,142),fill=C['copper'],width=2)
text(d,(120,174),'L Ú M I N A',48,C['ink'],light=True)
text(d,(120,465),'La forma',173,C['ink'],serif=True)
text(d,(120,650),'de la luz.',188,C['ink'],serif=True)
text(d,(125,990),'CERÁMICA / BRONCE / LUZ',32,C['copper'],tracking=4)
d.line((125,1075,1000,1075),fill=C['copper'],width=1)
text(d,(125,1140),'Una pieza que no ilumina',48,C['ink'],serif=True)
text(d,(125,1200),'un espacio. Lo transforma.',48,C['ink'],serif=True)
text(d,(125,1810),'SAVIA   ·   SERIE 01',31,C['ink'],tracking=3)
text(d,(945,1810),'01 / 03',24,C['ink'])
save('01_editorial_3000x2000.jpg',ed)

# 02: vertical street poster / 1500x2250; native image detail remains source-limited
W,H=1500,2250
poster=cover(M,(W,H),focus=(.70,.56))
# Transparent charcoal veil at bottom/top for legibility
ov=Image.new('RGBA',(W,H)); px=ov.load()
for y in range(H):
    u=y/H
    alpha=round(115*max(0,1-u/.24)+125*max(0,(u-.78)/.22))
    if alpha:
        for x in range(W): px[x,y]=(5,10,13,min(175,alpha))
poster=Image.alpha_composite(poster.convert('RGBA'),ov).convert('RGB')
d=ImageDraw.Draw(poster)
d.rectangle((65,65,1435,2185),outline=C['cream'],width=3)
text(d,(119,115),'LÚMINA',140,C['ivory'],serif=True)
text(d,(130,286),'OBJETOS DE LUZ',26,C['ivory'],tracking=5)
text(d,(124,1835),'SAVIA',170,C['ivory'],serif=True)
text(d,(131,2070),'MATERIA / LUZ / TIEMPO',27,C['ivory'],tracking=4)
save('02_poster_1500x2250.jpg',poster)

# 03: mobile social feed / 1080 x 1350, strong editorial hierarchy with image not just logo
W,H=1080,1350
social=Image.new('RGB',(W,H),C['paper'])
img=cover(M,(W,810),focus=(.65,.54))
social.paste(img,(0,0));d=ImageDraw.Draw(social)
d.rectangle((0,810,W,H),fill=C['paper'])
text(d,(68,846),'LÚMINA',63,C['ink'],serif=True)
text(d,(71,952),'Luz que tiene',97,C['ink'],serif=True)
text(d,(71,1054),'memoria.',103,C['ink'],serif=True)
d.line((72,1216,1000,1216),fill=C['copper'],width=2)
text(d,(72,1250),'SAVIA 01  /  CERÁMICA HECHA A MANO',22,C['ink'],tracking=1.8)
save('03_social_1080x1350.jpg',social)

# Quick brand system comparison/contact-sheet, preserving piece distinctions
small=[]
for f in ['01_editorial_3000x2000.jpg','02_poster_1500x2250.jpg','03_social_1080x1350.jpg']:
    im=Image.open(OUT/f); im.thumbnail((730,630)); small.append(im)
sh=Image.new('RGB',(2400,1060),C['cream']);d=ImageDraw.Draw(sh)
text(d,(95,70),'LÚMINA',115,C['ink'],serif=True)
text(d,(95,210),'UN OBJETO. TRES ENCUADRES. UNA ATMÓSFERA.',30,C['copper'],tracking=2)
for i,im in enumerate(small):
    x=100+i*770;y=300+(650-im.height)//2
    sh.paste(im,(x,y))
    d.rectangle((x-1,y-1,x+im.width+1,y+im.height+1),outline='#aaa397',width=2)
    text(d,(x,965),['01  /  EDITORIAL','02  /  AFICHE','03  /  SOCIAL'][i],25,C['ink'],tracking=2)
save('04_comparacion_2400x1060.jpg',sh)

files=[]
for path in sorted(OUT.glob('*.jpg')):
    im=Image.open(path)
    files.append({'name':path.name,'dimensions':im.size,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(OUT/'media_manifest.json').write_text(json.dumps({'taskId':'images-w003-20261122-01','firstArticle':'00_hero_original.jpg','sourceDimensions':[1536,1024],'colorPolicy':'RGB/sRGB intended; no ICC proof','sourceAI':'original AI-generated still life in this execution','files':files},indent=2,ensure_ascii=False))
print(json.dumps(files,ensure_ascii=False,indent=2))
