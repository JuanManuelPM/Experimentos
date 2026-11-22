#!/usr/bin/env python3
"""PROMETEO Video W002 / 04: typography-timeline engine. Original graphic+sound composition.
Usage: python temporal_type_engine.py --spike | --render | --frame SEC --vertical
Dependencies: Pillow, NumPy, FFmpeg. Font files are system dependencies, never bundled.
"""
from __future__ import annotations
import argparse, functools, json, math, pathlib, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE = pathlib.Path(__file__).resolve().parent
FPS = 24
DURATION = 23.0
PHRASE = 'NO PASA NADA.'
SCENES = [
    dict(id='portada', a=0.0, b=2.0, meaning='pregunta', label='MISMAS PALABRAS'),
    dict(id='alivio', a=2.0, b=6.5, meaning='alivio', label='DESPUÉS DEL SUSTO'),
    dict(id='negacion', a=6.5, b=11.0, meaning='encubrimiento', label='EN EL INFORME'),
    dict(id='amenaza', a=11.0, b=15.5, meaning='amenaza', label='DEL OTRO LADO DE LA PUERTA'),
    dict(id='tesis', a=15.5, b=18.8, meaning='reflexión', label='MISMAS LETRAS'),
    dict(id='cierre', a=18.8, b=23.0, meaning='conclusión', label='EL CONTEXTO CAMBIA TODO'),
]
assert [s['a'] for s in SCENES]==[0,2,6.5,11,15.5,18.8]
assert len({PHRASE for s in SCENES if s['id'] in ('alivio','negacion','amenaza')})==1
COLORS = {
    'paper': (237,231,220),'ivory':(247,242,229),'ink':(21,25,26),
    'red': (229,67,50),'subtle':(121,119,110),'cool':(196,207,204),
    'midnight':(17,22,27),'charcoal':(28,32,36),'ruled':(200,196,184),
    'grey':(132,141,145),'warm':(205,155,122),
}
FONTS = {
 'black':'/usr/share/fonts/opentype/inter/InterDisplay-Black.otf',
 'medium':'/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf',
 'serif':'/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf',
}
for path in FONTS.values():
    assert pathlib.Path(path).exists(), 'Missing system font: '+path

@functools.lru_cache(maxsize=128)
def fnt(face:str, size:int): return ImageFont.truetype(FONTS[face], max(7,int(size)))

def clamp(x): return max(0.0,min(1.0,float(x)))
def ease(x):
    x=clamp(x); return x*x*(3-2*x)
def out(x):
    x=clamp(x); return 1-(1-x)**3

def scene_at(t):
    return next((s for s in SCENES if s['a']<=t<s['b']), SCENES[-1])

def fit(text, face, maxw, size, minsize=13):
    while size>minsize and fnt(face,size).getlength(text)>maxw: size -= 1
    return fnt(face,size)

def x_text(d:ImageDraw.ImageDraw, text, x, y, face, size, fill, anchor='lt', maxw=None):
    ff=fit(text,face,maxw,int(size)) if maxw else fnt(face,int(size))
    d.text((round(x),round(y)), text,font=ff, fill=fill, anchor=anchor)
    return ff.getlength(text)

def hline(d, y, x1, x2, fill, width=1):d.line((int(x1),int(y),int(x2),int(y)),fill=fill,width=max(1,int(width)))

def metadata(d,w,h,t,step,label,color):
    u=min(w/720,h/720)
    pad=int(w*.066); top=int(h*.068); fs=int(15*u)
    x_text(d,'PROMETEO  /  VIDEO EXPERIMENTAL',pad,top,'medium',fs,color,maxw=w*.72)
    right=f'{step:02d} / 06'
    fw=fnt('medium',fs).getlength(right)
    x_text(d,right,w-pad-fw,top,'medium',fs,color)
    hline(d,top+int(32*u),pad,w-pad,color,1)
    x_text(d,label,pad,h-int(h*.084),'medium',fs,color,maxw=w*.75)
    # Progress track: cumulative step indicator, no platform UI.
    tick_y=h-int(h*.064); interval=(w-pad*2)/6
    for j in range(6):
        x=pad+j*interval
        hline(d,tick_y,x,x+min(24*u,interval*.6),color if j<step else COLORS['subtle'],max(1,2*u))

def text_block(d,w,h,lines,face,size,color,y=None,leading=1.18,align='left',maxw=None):
    u=min(w/720,h/720); maxw=maxw or w*.85
    height=len(lines)*size*leading
    y=(h-height)*.5 if y is None else y
    x0=int(w*.07)
    for i,line in enumerate(lines):
        ff=fit(line,face,maxw,size)
        xx=x0 if align=='left' else (w-ff.getlength(line))*.5
        d.text((xx,y+i*size*leading),line,font=ff,fill=color,anchor='lt')
    return y+height

def tracked(d,text,center_x,y,face,size,fill,tracking,progress=1.0,start_offset=30):
    ff=fnt(face,size); lengths=[ff.getlength(ch) for ch in text]
    total=sum(lengths)+tracking*(len(text)-1)
    x=center_x-total/2
    for i,(ch,adv) in enumerate(zip(text,lengths)):
        local=out((progress-(i/max(len(text),1))*.30)/.72)
        if local>.008:
            # Staggered glyph lift conveys a physical setting action, not a preset whole-line transition.
            dy=(1-local)*start_offset*(1 if i%2 else -.55)
            d.text((x,y+dy),ch,font=ff,fill=fill,anchor='lt')
        x+=adv+tracking

def draw_frame(t,w,h):
    s=scene_at(t); local=t-s['a']; u=min(w/720,h/720); portrait=h>w
    paper=COLORS['paper']; ink=COLORS['ink']; red=COLORS['red']; ivory=COLORS['ivory']
    name=s['id']
    bg = {'portada':paper,'alivio':ivory,'negacion':(204,209,201),'amenaza':COLORS['midnight'],'tesis':paper,'cierre':COLORS['charcoal']}[name]
    im=Image.new('RGB',(w,h),bg); d=ImageDraw.Draw(im)
    pad=w*.066
    col=COLORS['cool'] if name in ('amenaza','cierre') else ink
    metadata(d,w,h,t,1+SCENES.index(s),s['label'],col)
    # Time-indexed main compositions: layout is independently responsive, never center-cropped.
    if name=='portada':
        a=out(local/.9)
        x_text(d,'UN EXPERIMENTO SOBRE EL SENTIDO',pad,h*.24,'medium',19*u,red,maxw=w*.83)
        major=['MISMAS','PALABRAS.']
        maxw=w*.84
        sz=int((84 if portrait else 120)*u)
        for j,v in enumerate(major):
            ff=fit(v,'black',maxw,sz)
            xx=pad + (1-a)*w*(.15 if j==0 else -.10)
            yy=h*(.36+j*(.125 if portrait else .19))
            d.text((xx,yy),v,font=ff,fill=ink,anchor='lt')
        hline(d,h*.71,pad,pad+(w-pad*2)*ease(local/1.65),red,3*u)
        x_text(d,'TRES CONTEXTOS / UNA SOLA FRASE',pad,h*.745,'medium',15*u,ink,maxw=w*.84)
    elif name=='alivio':
        fade=out(local/.75)
        d.ellipse((w*.68-w*.20*fade,h*.20-w*.18*fade,w*.68+w*.20*fade,h*.20+w*.18*fade),outline=(222,210,193),width=max(1,int(1*u)))
        # The paper's whitespace and serif breathe, contrasted against the later reports.
        sz=int((70 if portrait else 92)*u)
        lines=['NO PASA','NADA.'] if portrait else [PHRASE]
        for j,v in enumerate(lines):
            ff=fit(v,'serif',w*.87,sz)
            yy=h*(.455 if portrait else .48)+j*sz*1.30
            tracked(d,v,w/2,yy,'serif',ff.size,ink,tracking=2*u,progress=fade)
        yb=h*(.69 if portrait else .65)
        hline(d,yb,pad,pad+(w-2*pad)*ease((local-.7)/2.25),(187,153,125),2*u)
        x_text(d,'01  /  ALIVIO',pad,h*.305,'medium',18*u,COLORS['subtle'],maxw=w*.7)
        x_text(d,'DICHO PARA TRANQUILIZAR.',pad,h*.745,'medium',17*u,ink,maxw=w*.83)
    elif name=='negacion':
        # Type as official report evidence, with a paced scanning hairline.
        for i in range(4):
            yy=h*(.23+i*.105)
            x_text(d,'NO PASA NADA.  /  NO PASA NADA.',pad,yy,'medium',17*u,(156,164,158),maxw=w*.86)
        x_text(d,'02  /  NEGACIÓN',pad,h*.21,'black',20*u,red,maxw=w*.77)
        content_lines=[PHRASE] if not portrait else ['NO PASA','NADA.']
        main=int((90 if portrait else 105)*u)
        for j,v in enumerate(content_lines):
            ff=fit(v,'black',w*.88,main)
            xx=pad; yy=h*(.50 if not portrait else .48)+j*main*1.16
            d.text((xx,yy),v,font=ff,fill=ink,anchor='lt')
        # The scanner never fully obscures the phrase; it suspects rather than removes evidence.
        scan_x=pad+(w-2*pad)*((local*.32)%1)
        d.line((scan_x,h*.385,scan_x,h*.745),fill=red,width=max(2,int(3*u)))
        d.rectangle((pad,h*.775,pad+(w-2*pad)*out(local/3.0),h*.787),fill=red)
        x_text(d,'ARCHIVO / SIN INCIDENTES',pad,h*.825,'medium',16*u,ink,maxw=w*.87)
    elif name=='amenaza':
        # The same phrase is an aggressive physical object, not a different sentence.
        pulse = max(math.exp(-((t-b)/.16)**2) for b in (11.,12.5,14.))
        d.rectangle((0,0,int(w*.028 +w*.015*pulse),h),fill=red)
        x_text(d,'03  /  AMENAZA',pad,h*.20,'medium',20*u,red,maxw=w*.78)
        lines=['NO','PASA','NADA.']
        size=int((105 if portrait else 127)*u)
        line_h = size*(1.07 if portrait else 1.02)
        start_y=h*(.37 if portrait else .31)
        for j,v in enumerate(lines):
            ff=fit(v,'black',w*.85,size)
            xx=pad + (1-out((local-j*.25)/.65))*w*.15
            yy=start_y+j*line_h
            d.text((xx,yy),v,font=ff,fill=ivory,anchor='lt')
        ymark=start_y+2*line_h+size*.93
        hline(d,ymark,pad,pad+(w-2*pad)*out((local-2)/1.6),red,5*u)
        x_text(d,'TAN CERCA QUE YA NO ES CONSUELO.',pad,h*.845,'medium',17*u,ivory,maxw=w*.84)
    elif name=='tesis':
        a=out(local/.7)
        x_text(d,'Y SIN EMBARGO...',pad,h*.26,'medium',19*u,red,maxw=w*.86)
        sz=int((74 if portrait else 112)*u)
        lines=['LAS LETRAS','NO CAMBIARON.']
        text_block(d,w,h,lines,'black',sz,ink,y=h*.43,leading=1.20,maxw=w*.86)
        yline=h*.41
        hline(d,yline,pad,pad+(w-2*pad)*a,red,3*u)
        # Faint trace of three meanings along the bottom; one sentence, no semantic drift in glyphs.
        x_text(d,'ALIVIO     /     NEGACIÓN     /     AMENAZA',pad,h*.77,'medium',16*u,ink,maxw=w*.86)
    elif name=='cierre':
        a=out(local/.8)
        x_text(d,'NO ES LA FRASE.',pad,h*.245,'medium',19*u,COLORS['cool'],maxw=w*.85)
        size=int((98 if portrait else 135)*u)
        for j,(word,fill) in enumerate([('EL',ivory),('CONTEXTO',red),('SÍ.',ivory)]):
            ff=fit(word,'black',w*.87,size)
            yy=h*(.355 if portrait else .33)+j*size*1.02
            xx=pad + (1-out((local-j*.32)/.9))*w*.14
            d.text((xx,yy),word,font=ff,fill=fill,anchor='lt')
        # Closing film credit comes into view with enough hold time for the eye.
        if local>2.6:
            x_text(d,'UNA PALABRA CAMBIA TODO',pad,h*.83,'medium',17*u,ivory,maxw=w*.86)
    return im

def mix_audio(outpath:pathlib.Path):
    sr=48000;n=int(DURATION*sr);t=np.arange(n,dtype=np.float64)/sr
    left=np.zeros(n,dtype=np.float64);right=np.zeros_like(left)
    def add(sig,at,level=1,pan=0):
        start=max(0,int(at*sr)); stop=min(n,start+len(sig))
        if stop>start:
            left[start:stop]+=sig[:stop-start]*level*math.sqrt((1-pan)/2)
            right[start:stop]+=sig[:stop-start]*level*math.sqrt((1+pan)/2)
    # Long-form designed score, with sections, not copied loops, presets or samples.
    bed=np.sin(2*np.pi*(108*t+1.1*np.sin(2*np.pi*.071*t)))*.055
    bed+=np.sin(2*np.pi*(162*t+.35*np.sin(2*np.pi*.041*t)))*.026
    bed*= (.30+.7*np.clip(t/3,0,1))*np.clip((21.7-t)/2.0,0,1)
    bed*= np.where((t>=15.5)&(t<18.8),.22,1)
    left+=bed*.75;right+=bed*.9
    rng=np.random.default_rng(404)
    def click(at,amp=.15,pitch=1600,pan=0):
        z=np.arange(int(.13*sr))/sr
        noise=rng.standard_normal(len(z)); noise=(noise-np.convolve(noise,np.ones(23)/23,'same'))
        sig=(noise*.23+np.sin(2*np.pi*pitch*z)*.7)*np.exp(-z*43)
        add(sig,at,amp,pan)
    def thump(at,amp=.35,freq=85):
        z=np.arange(int(.9*sr))/sr
        phase=2*np.pi*(freq*z+21*z*np.exp(-z*12))
        tone=np.sin(phase)*np.exp(-z*8.0)
        breath=rng.standard_normal(len(z))*np.exp(-z*23)*.08
        add(tone+breath,at,amp,-.15)
    # Warm independent glints in the relief scene.
    for k,at in enumerate((2.08,3.35,4.8,5.6)):
        z=np.arange(int(.45*sr))/sr
        sig=np.sin(2*np.pi*(440+110*k/4)*z)*np.exp(-z*9)*.1
        add(sig,at,.65,(-.4 if k%2 else .4))
    for k,at in enumerate((6.5,7.2,7.9,8.6,9.3,10.0,10.65)):
        click(at,.23,1450+80*k,(-.35 if k%2 else .35))
    for at in (11.,12.5,14.):
        thump(at,.43,68)
        click(at+.05,.12,470,-.3)
    for k,at in enumerate((18.8,19.15,19.75,20.35,20.95,21.45)):
        z=np.arange(int(.9*sr))/sr
        base=(196,247,294,392,494,587)[k]
        sig=(np.sin(2*np.pi*base*z)+.32*np.sin(2*np.pi*base*2.003*z))*.17*np.exp(-z*4.0)
        add(sig,at,1,(-.22 if k%2 else .22))
    thump(18.8,.15,93)
    arr=np.stack((left,right),axis=-1)
    peak=np.max(np.abs(arr)); arr*=min(1,.82/peak)
    pcm=(np.clip(arr,-1,1)*32767).astype('<i2')
    with wave.open(str(outpath),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())
    return {'sample_rate':sr,'duration':DURATION,'channels':2,'peak_dbfs':round(20*math.log10(max(peak,1e-12)),2),'events':{'reports':[6.5,7.2,7.9,8.6,9.3,10.,10.65],'threat':[11.,12.5,14.],'final':[18.8,19.15,19.75,20.35,20.95,21.45]}}

def render(w,h,name,secs=DURATION,spike=False):
    out=BASE/name; raw=BASE/(name+'.silent.mp4')
    frames=round(secs*FPS)
    cmd=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(FPS),'-i','pipe:0',
         '-c:v','libx264','-preset','veryfast','-crf','25','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart',str(raw)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    for k in range(frames):
        frame=draw_frame(k/FPS,w,h)
        try: proc.stdin.write(frame.tobytes())
        except BrokenPipeError: raise RuntimeError(proc.stderr.read().decode())
        if k%120==0: print(f'{name}: {k}/{frames}',flush=True)
    proc.stdin.close(); err=proc.stderr.read(); rc=proc.wait()
    if rc: raise RuntimeError(err.decode())
    wav=BASE/('spike.wav' if spike else 'ORIGINAL_SOUND.wav')
    if spike:
        # Spike validates real codec+audio before expensive full render.
        sr=48000
        with wave.open(str(wav),'wb') as wf:
            wf.setnchannels(2);wf.setsampwidth(2);wf.setframerate(sr)
            wf.writeframes(np.zeros((sr*round(secs),2),dtype='<i2').tobytes())
    elif not wav.exists():mix_audio(wav)
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-i',str(wav),'-c:v','copy','-c:a','aac','-b:a','160k',
        '-t',f'{secs:.3f}','-movflags','+faststart',str(out)],check=True)
    raw.unlink()
    if spike:wav.unlink()
    print('WROTE',out,out.stat().st_size,flush=True)
    return out

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--spike',action='store_true');ap.add_argument('--render',action='store_true')
    ap.add_argument('--frame',type=float);ap.add_argument('--vertical',action='store_true');args=ap.parse_args()
    if args.frame is not None:
        w,h=(720,1280) if args.vertical else (1280,720)
        dest=BASE/f"FRAME_{'V' if args.vertical else 'H'}_{args.frame:.1f}.png"
        draw_frame(args.frame,w,h).save(dest);print(dest);return
    if args.spike:
        out=render(640,360,'SPIKE.mp4',secs=1.0,spike=True)
        r=subprocess.run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name,width,height:format=duration',
                         '-of','json',str(out)],check=True,capture_output=True,text=True)
        meta=json.loads(r.stdout)
        assert set(s['codec_type'] for s in meta['streams'])=={'audio','video'},meta
        assert abs(float(meta['format']['duration'])-1.0)<.05,meta
        print('SPIKE_PASS',r.stdout);return
    if args.render:
        sound=mix_audio(BASE/'ORIGINAL_SOUND.wav')
        render(1280,720,'UNA_PALABRA_CAMBIA_TODO_16x9.mp4')
        render(720,1280,'UNA_PALABRA_CAMBIA_TODO_9x16.mp4')
        (BASE/'SOUND_EVENTS.json').write_text(json.dumps(sound,indent=2,ensure_ascii=False)+'\n')
        for tt in (1.,3.5,8.5,13.,17.,20.9):
            for vertical in (False,True):
                w,h=(720,1280) if vertical else (1280,720)
                draw_frame(tt,w,h).save(BASE/f"QA_{'vertical' if vertical else 'horizontal'}_{tt:.1f}.png")
        return
    ap.print_help()
if __name__=='__main__': main()