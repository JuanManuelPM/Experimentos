#!/usr/bin/env python3
"""TIDAL // Señal. Two variants from ONE locked 12-second procedural recipe."""
import argparse
import hashlib
import json
import math
import shutil
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = Path(__file__).resolve().parent
RECIPE = json.loads((HERE / "recipe.json").read_text(encoding="utf-8"))
W, H = RECIPE["size"]
FPS = RECIPE["fps"]
FRAMES = round(RECIPE["durationSeconds"] * FPS)

def rgb(value):
    return tuple(bytes.fromhex(value.removeprefix("#")))

def mix(a, b, k):
    return tuple(round(a[i] * (1 - k) + b[i] * k) for i in range(3))

def font(size, bold=False):
    names = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if bold else ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for name in names:
        try: return ImageFont.truetype(name, size)
        except OSError: pass
    return ImageFont.load_default()

FONT_BIG = font(76, True)
FONT_MID = font(23, True)
FONT_SMALL = font(16, False)

def background(p):
    top, bottom = rgb(p["backgroundTop"]), rgb(p["backgroundBottom"])
    im = Image.new("RGB", (W,H))
    dr = ImageDraw.Draw(im)
    for y in range(H):
        shade = mix(top,bottom,min(1,(y/H)**1.3))
        dr.line((0,y,W,y),fill=shade)
    return im

def draw_frame(t,p,kind,base):
    im=base.copy().convert("RGBA")
    layer=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(layer)
    line=rgb(p["line"]); accent=rgb(p["accent"]); ground=rgb(p["ground"])
    cx,cy=W*0.52,H*0.51
    m=min(1,t/1.7,(12-t)/1.8)
    m=max(0,m)
    # All trajectories and scene timings are identical; only art direction differs.
    if kind=="nocturne":
        for i in range(9):
            y=H*0.51+i*31
            d.line((0,y,W,y-14),fill=(*line,max(0,22-i*2)),width=1)
        for i in range(5):
            y=H*0.75+i*19
            d.line((0,y,W,y),fill=(*accent,18),width=2)
    else:
        for i in range(28):
            a=i*math.tau/28
            r=530
            d.line((cx+math.cos(a)*190,cy+math.sin(a)*190,cx+math.cos(a)*r,cy+math.sin(a)*r),
                   fill=(*line,17),width=2)
        d.ellipse((cx-355,cy-355,cx+355,cy+355),outline=(*accent,25),width=2)
    # Repeated circular transmission pulses.
    for idx in range(4):
        q=((t*0.19+idx/4)%1)
        r=78+q*330
        alpha=int(60*(1-q)*m)
        d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=(*line,alpha),width=2)
    # Orbit paths and calibration strokes.
    for r,alpha,width in [(156,140,2),(202,48,1),(237,28,1)]:
        d.ellipse((cx-r,cy-r*.69,cx+r,cy+r*.69),outline=(*line,int(alpha*m)),width=width)
    for a in range(0,360,15):
        angle=math.radians(a)
        x0=cx+math.cos(angle)*160
        y0=cy+math.sin(angle)*111
        x1=cx+math.cos(angle)*(170 if a%45 else 183)
        y1=cy+math.sin(angle)*(120 if a%45 else 128)
        d.line((x0,y0,x1,y1),fill=(*accent,int(105*m)),width=2)
    # Original monolithic object (no external assets).
    floaty=math.sin(t*math.tau/6.2)*7
    verts=[(cx,cy-133+floaty),(cx+56,cy-88+floaty),(cx+71,cy+93+floaty),
           (cx,cy+128+floaty),(cx-68,cy+79+floaty),(cx-54,cy-89+floaty)]
    d.polygon(verts,fill=(*ground,255))
    d.line([verts[0],verts[1],verts[2],verts[3]],fill=(*line,int(160*m)),width=3)
    d.line([verts[0],(cx,cy+128+floaty)],fill=(*accent,int(100*m)),width=2)
    d.polygon([verts[0],(cx+56,cy-88+floaty),(cx,cy+128+floaty)],
              fill=(*line,int(11*m)))
    # Primary signal traces share positions, speed, phase and amplitude.
    angle=t*math.tau/8.6 - math.pi/2
    ox=cx+156*math.cos(angle)
    oy=cy+108*math.sin(angle)
    for r,a in [(33,9),(22,22),(12,50)]:
        d.ellipse((ox-r,oy-r,ox+r,oy+r),fill=(*accent,int(a*m)))
    d.ellipse((ox-5,oy-5,ox+5,oy+5),fill=(*accent,int(250*m)))
    for i in range(62):
        x=45+i*14
        amp=5+13*abs(math.sin(i*.17+t*2.6))
        d.line((x,H-53-amp,x,H-53+amp),fill=(*line,int((55+i%3*20)*m)),width=2)
    # Slow-reveal editorial typography.
    d.text((54,45),"P R O T O C O L   /   1 0",font=FONT_SMALL,fill=(*accent,190))
    d.line((54,76,294,76),fill=(*line,160),width=2)
    d.text((W-253,48),p["label"].upper(),font=FONT_SMALL,fill=(*accent,185))
    caption = "ANOMALÍA" if t<3.8 else "SEÑAL" if t<8.1 else "PERSISTE"
    d.text((52,H-158),caption,font=FONT_BIG,fill=(*accent,int(228*m)))
    d.text((57,H-92),"T I D A L   /   S E Ñ A L",font=FONT_MID,fill=(*line,int(210*m)))
    d.line((56,H-31,W-55,H-31),fill=(*accent,80),width=1)
    d.rectangle((56,H-33,56+(W-112)*t/12,H-29),fill=(*accent,160))
    result=Image.alpha_composite(im,layer)
    # Deliberate fade on both versions.
    fade=min(1,t/1.2,(12-t)/1.3)
    if fade<1:
        black=Image.new("RGBA",(W,H),(0,0,0,round((1-max(0,fade))*255)))
        result=Image.alpha_composite(result,black)
    return result.convert("RGB")

def probe(path):
    raw=subprocess.check_output(["ffprobe","-v","error","-show_entries",
        "stream=codec_name,codec_type,width,height,nb_frames,r_frame_rate:format=duration",
        "-of","json",str(path)],text=True)
    return json.loads(raw)

def render(kind, out):
    pal=RECIPE["variants"][kind]
    base=background(pal)
    poster=draw_frame(5.1,pal,kind,base)
    poster.save(out/(kind+".jpg"),quality=87,optimize=True)
    if shutil.which("ffmpeg") is None: raise SystemExit("ffmpeg not found: render NOT_RUN")
    dest=out/(kind+".mp4")
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","rawvideo","-pix_fmt","rgb24",
         "-s:v",f"{W}x{H}","-r",str(FPS),"-i","pipe:0",
         "-an","-c:v","libx264","-preset","veryfast","-crf","22",
         "-pix_fmt","yuv420p","-movflags","+faststart",str(dest)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    try:
        for i in range(FRAMES):
            proc.stdin.write(draw_frame(i/FPS,pal,kind,base).tobytes())
        proc.stdin.close()
        if proc.wait()!=0: raise RuntimeError("ffmpeg failed for "+kind)
    except Exception:
        proc.kill()
        raise
    data=probe(dest)
    stream=next(s for s in data["streams"] if s["codec_type"]=="video")
    assert stream["codec_name"]=="h264"
    assert stream["width"]==W and stream["height"]==H
    assert int(stream["nb_frames"])==FRAMES
    assert abs(float(data["format"]["duration"])-12)<0.06
    return {"variant":kind,"video":dest.name,"sha256":hashlib.sha256(dest.read_bytes()).hexdigest(),
            "bytes":dest.stat().st_size,"probe":data,"framesExpected":FRAMES,
            "result":"VIDEO_FILE_ENCODED_VERIFIED","audio":"no audio track by design"}

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--out-dir",default="output")
    cli.add_argument("--variant",choices=["nocturne","solstice","both"],default="both")
    args=cli.parse_args()
    out=Path(args.out_dir);out.mkdir(parents=True,exist_ok=True)
    variants=list(RECIPE["variants"]) if args.variant=="both" else [args.variant]
    reports=[render(v,out) for v in variants]
    (out/"evidence.json").write_text(json.dumps({
        "id":RECIPE["id"],"recipeSha256":hashlib.sha256((HERE/"recipe.json").read_bytes()).hexdigest(),
        "duration":12,"fps":FPS,"size":RECIPE["size"],"rendered":reports,
        "humanArtApproval":False,"browserQA":"NOT_RUN","audioSync":"NOT_APPLICABLE_SILENT"
    },indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"result":"ENCODED","variants":[x["variant"] for x in reports],
                      "framesEach":FRAMES,"duration":12},ensure_ascii=False))

if __name__=="__main__":
    main()
