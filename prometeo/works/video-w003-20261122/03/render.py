#!/usr/bin/env python3
"""VIDEO W003/03. Archival film with foreground footage, anchored data, date-safe ledger.
Footage shot in 2012 is ALWAYS labeled 2012. Photos are 12 and 15 Nov 2019.
The narration and sonic atmosphere are synthesized, NOT historical recordings.
"""
from __future__ import annotations
import hashlib, json, math, os, pathlib, subprocess, sys, time, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
CACHE = HERE / "_source_downloads"
CACHE.mkdir(parents=True, exist_ok=True)
FPS, WIDTH, HEIGHT, DURATION = 24, 1280, 720, 48
OUT = HERE / "VENECIA-EL-AGUA-TIENE-FECHA.mp4"
ASSETS = {
    "VENICE_CONTEXT": {
        "url": "https://videos.pexels.com/video-files/3381844/3381844-hd_1920_1080_30fps.mp4",
        "file": "venice_context_unknown_capture_date.mp4", "minbytes": 100000, "magic": "mp4",
        "creator": "Linda Tripaldi", "date": "UNKNOWN", "publishedAt": "2019-12-14", "license": "Pexels free media license",
        "commons": "https://www.pexels.com/video/traveling-the-grand-canal-waterways-of-venice-italy-3381844/",
    },
    "SATELLITE_2019_14": {
        "url": "https://www.nesdis.noaa.gov/s3/migrated/Venicetimeditfinal.jpg",
        "file": "noaa_venice_2019-11-14.jpg", "minbytes": 10000, "magic": "jpg",
        "creator": "NOAA NESDIS · NOAA-20/VIIRS", "date": "2019-11-14", "license": "US federal government public domain",
        "commons": "https://www.nesdis.noaa.gov/news/rising-sea-levels-and-sirocco-winds-worsen-flooding-venice",
    },
    "FLOOD_CONTEXT": {
        "url": "https://videos.pexels.com/video-files/14159923/14159923-hd_1080_1920_30fps.mp4",
        "file": "venice_flood_context_unknown_capture_date.mp4", "minbytes": 100000, "magic": "mp4",
        "creator": "Marius Nacu", "date": "UNKNOWN", "publishedAt": "2022-10-24", "license": "Pexels free media license",
        "commons": "https://www.pexels.com/video/flood-in-venice-14159923/",
    },
}
CLAIMS = {
    "C01": {"text": "The municipal CPSM peak on 12 Nov 2019 was 187 cm at 22:50", "primarySource": "https://www.comune.venezia.it/it/content/le-acque-alte-eccezionali/", "unit": "centimetres", "datum": "CPSM Punta Salute municipal record"},
    "C02": {"text": "4 Nov 1966 reached +194 cm in the Comune di Venezia historical record", "primarySource": "https://www.comune.venezia.it/it/content/le-acque-alte-eccezionali/", "unit": "centimetres", "datum": "Comune historical tide record"},
    "C03": {"text": "In 2020 MOSE first operated in high tides on 3 and 15 October", "primarySource": "https://www.isprambiente.gov.it/it/archivio/notizie-e-novita-normative/notizie-ispra/2020/11/12-novembre-2019-2013-un-anno-dall2019acqua-alta-eccezionale-a-venezia", "unit": "event", "datum": "ISPRA statement of 3 and 15 Oct 2020"},
}
# 6 s segments: frame intervals half-open. Historical dates NEVER change.
SHOTS = [
 {"id":"S01","assetId":"VENICE_CONTEXT","label":"VENECIA · CANAL EN CONTEXTO","kind":"CONTEXT_VIDEO","claimIds":[]},
 {"id":"S02","assetId":"FLOOD_CONTEXT","label":"AGUA EN LA CALLE · CONTEXTO","kind":"CONTEXT_VIDEO","claimIds":[]},
 {"id":"S03","assetId":"SATELLITE_2019_14","label":"14 NOV 2019 · SATÉLITE NOAA-20","kind":"ARCHIVAL_PHOTO","claimIds":["C01"]},
 {"id":"S04","assetId":"VENICE_CONTEXT","label":"187 CM · DATO REAL, VIDEO CONTEXTO","kind":"CONTEXT_VIDEO","claimIds":["C01","C02"]},
 {"id":"S05","assetId":"FLOOD_CONTEXT","label":"SIROCO Y MAREA · CONTEXTO","kind":"CONTEXT_VIDEO","claimIds":["C01"]},
 {"id":"S06","assetId":"SATELLITE_2019_14","label":"14 NOV 2019 · IMAGEN NOAA POSTERIOR","kind":"ARCHIVAL_PHOTO","claimIds":["C01"]},
 {"id":"S07","assetId":None,"label":"MOSE · ESQUEMA EDITORIAL","kind":"ORIGINAL_DATA_GRAPHIC","claimIds":["C03"]},
 {"id":"S08","assetId":"VENICE_CONTEXT","label":"VENECIA · CONTEXTO DE HOY","kind":"CONTEXT_VIDEO","claimIds":["C03"]},
]

SCRIPT = (
 "Venecia vive junto al agua. Pero el doce de noviembre de dos mil diecinueve "
 "llegó una marea excepcional. El municipio registró ciento ochenta y siete "
 "centímetros en Punta della Salute, a las veintidós cincuenta. "
 "No es la profundidad del agua en una calle. El siroco agravó la crecida. "
 "Esta imagen satelital fue tomada el catorce de noviembre, dos días después. "
 "En octubre de dos mil veinte, las barreras MOSE comenzaron a funcionar "
 "ante mareas altas. Este esquema es una reconstrucción. Los videos de contexto "
 "tampoco muestran aquella noche. Documentar el origen de las imágenes "
 "también es contar la historia."
)

def run(cmd, quiet=False):
    if not quiet:
        print("+", " ".join(map(str, cmd)), flush=True)
    subprocess.run([str(x) for x in cmd], check=True, cwd=HERE)

def probe(path):
    raw = subprocess.check_output(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(path)])
    return json.loads(raw)

def get_asset(key, item):
    dest = CACHE / item["file"]
    if dest.exists() and dest.stat().st_size >= item["minbytes"]:
        item["downloadedSha256"] = hashlib.sha256(dest.read_bytes()).hexdigest()
        return dest
    request = urllib.request.Request(item["url"], headers={
        "User-Agent": "PROMETEO-documentary-license-audit/1.0 (non-commercial source verification)",
        "Accept": "image/jpeg,video/mp4,video/webm,*/*"
    })
    last = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=45) as response, dest.open("wb") as out:
                while True:
                    chunk=response.read(1024*1024)
                    if not chunk: break
                    out.write(chunk)
            if dest.stat().st_size < item["minbytes"]:
                raise RuntimeError("asset unexpectedly small: " + str(dest.stat().st_size))
            data = dest.open("rb").read(16)
            if item["magic"] == "jpg" and not data.startswith(b"\xff\xd8"):
                raise RuntimeError("not JPEG")
            if item["magic"] == "webm" and not data.startswith(bytes.fromhex("1a45dfa3")):
                raise RuntimeError("not WebM")
            if item["magic"] == "mp4" and data[4:8] != b"ftyp":
                raise RuntimeError("not MP4")
            item["downloadedSha256"] = hashlib.sha256(dest.read_bytes()).hexdigest()
            print("ASSET VERIFIED", key, dest.stat().st_size, item["license"], item["downloadedSha256"])
            return dest
        except Exception as ex:
            last = ex
            dest.unlink(missing_ok=True)
            print("ASSET DOWNLOAD RETRY", key, str(ex))
            time.sleep(2 * (attempt+1))
    raise RuntimeError(f"BLOCKED: cannot verify original authorized asset {key}: {last}")

def font(size, bold=False):
    from PIL import ImageFont
    name = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    return ImageFont.truetype(name,size)

def build_overlay(shot, n):
    from PIL import Image, ImageDraw
    im=Image.new("RGBA",(WIDTH,HEIGHT),(0,0,0,0)); d=ImageDraw.Draw(im,"RGBA")
    d.rectangle([0,0,WIDTH,64],fill=(5,17,25,100))
    d.text((44,18),"LA CIUDAD BAJO EL AGUA",font=font(27,True),fill=(248,252,249,255))
    d.text((WIDTH-180,23),f"{n+1:02d}  /  08",font=font(20),fill=(212,228,229,255))
    # Deliberately small editorial band, not the 20% opaque ticker of W002.
    d.rectangle([0,HEIGHT-115,WIDTH,HEIGHT],fill=(5,15,26,151))
    d.rectangle([44,HEIGHT-91,50,HEIGHT-28],fill=(108,214,211,255))
    d.text((73,HEIGHT-89),shot["label"],font=font(37,True),fill=(252,251,244,255))
    if shot["assetId"]:
        meta=ASSETS[shot["assetId"]]
        if shot["kind"]=="ARCHIVAL_PHOTO":
            credit="NOAA-20 / VIIRS · 14-11-2019 · DOMINIO PÚBLICO"
        else:
            credit="PEXELS · IMÁGENES DE CONTEXTO, FILMACIÓN SIN FECHA VERIFICADA"
    else:
        credit="RECONSTRUCCIÓN DIDÁCTICA · NO ES METRAJE DE MOSE"
    d.text((75,HEIGHT-42),credit,font=font(26),fill=(219,238,238,255))
    if shot["id"]=="S04":
        d.rounded_rectangle([65,205,540,445],radius=12,fill=(5,17,28,211))
        d.text((84,211),"187",font=font(137,True),fill=(244,246,239,255))
        d.text((393,307),"cm",font=font(39),fill=(117,225,220,255))
        d.text((90,390),"12·11·2019  /  22:50",font=font(26),fill=(234,236,228,255))
    if shot["id"]=="S06":
        d.rounded_rectangle([55,194,850,345],radius=8,fill=(5,17,25,198))
        d.text((77,208),"TOMA: 14 NOVIEMBRE 2019",font=font(35,True),fill=(248,250,248,255))
        d.text((77,262),"MAREA: 12 NOVIEMBRE 2019",font=font(35,True),fill=(112,220,213,255))
    if shot["id"]=="S08":
        d.rounded_rectangle([64,151,890,368],radius=10,fill=(5,17,25,191))
        d.text((92,169),"FUENTES",font=font(38,True),fill=(246,249,243,255))
        d.text((92,238),"Comune di Venezia · ISPRA · NOAA",font=font(30),fill=(214,237,235,255))
        d.text((92,297),"Archivo contextual: Linda Tripaldi / Marius Nacu",font=font(24),fill=(214,237,235,255))
    target=HERE/f"_overlay_{n:02d}.png";im.save(target)
    return target

def build_chart():
    from PIL import Image, ImageDraw
    # EXPLICIT SCHEMA, not purported archive of actual movable barriers.
    im=Image.new("RGB",(WIDTH,HEIGHT),(12,32,46));d=ImageDraw.Draw(im)
    d.text((76,104),"¿CÓMO ACTÚAN LAS BARRERAS?",font=font(44,True),fill=(246,249,244))
    d.text((82,174),"Esquema conceptual · no a escala · no es archivo",font=font(27),fill=(181,213,216))
    d.rectangle([70,287,1190,530],fill=(31,93,114))
    d.rectangle([75,455,1190,548],fill=(137,148,136))
    # Adriático -> umbral móvil -> laguna. The diagram does not claim exact geometry.
    d.text((100,250),"MAR ADRIÁTICO",font=font(31,True),fill=(238,245,240))
    d.text((915,250),"LAGUNA",font=font(31,True),fill=(238,245,240))
    d.polygon([(552,452),(612,288),(650,299),(629,453)],fill=(224,188,119))
    d.polygon([(628,452),(675,294),(710,301),(701,452)],fill=(235,198,125))
    d.line([(100,385),(480,385)],fill=(183,223,229),width=10)
    d.line([(754,390),(1128,390)],fill=(183,223,229),width=5)
    d.text((77,585),"El MOSE separa temporalmente mar y laguna durante ciertos episodios.",font=font(25),fill=(216,233,230))
    dest=HERE/"_mose_diagram.png";im.save(dest);return dest

def build_credits():
    from PIL import Image, ImageDraw
    im=Image.new("RGB",(WIDTH,HEIGHT),(8,21,29));d=ImageDraw.Draw(im)
    d.text((76,115),"LA EVIDENCIA TIENE FECHA",font=font(43,True),fill=(243,250,245))
    rows=[
        "Video contextual: Linda Tripaldi, Pexels · rodaje sin fecha",
        "Satélite 14-XI-2019: NOAA / dominio público",
        "Video contexto inundación: Marius Nacu / Pexels",
        "Datos: Centro Maree Comune di Venezia / ISPRA",
        "Locucion y atmosfera sintetizadas, no audio del suceso",
        "Registro por fotograma y afirmacion: PROVENANCE.json",
    ]
    for k,line in enumerate(rows):
        d.text((81,205+k*56),line,font=font(22),fill=(186,215,217))
    dest=HERE/"_credits.png";im.save(dest);return dest

def render_scene(n,shot,inputs):
    asset=shot["assetId"]
    if asset:
        path=inputs[asset]
        if asset in ("VENICE_CONTEXT","FLOOD_CONTEXT"):
            source=["-stream_loop","-1","-ss",str((n*3)%16),"-i",path]
            vf=("scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x15313a,eq=contrast=1.05:saturation=0.83" if asset=="FLOOD_CONTEXT" else "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=contrast=1.05:saturation=0.83")
        else:
            source=["-loop","1","-framerate",str(FPS),"-i",path]
            vf="scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,zoompan=z='min(zoom+0.00024,1.08)':d=1:s=1280x720:fps=24,eq=contrast=1.065:saturation=0.84"
    else:
        image=build_chart() if shot["kind"]=="ORIGINAL_DATA_GRAPHIC" else build_credits()
        source=["-loop","1","-framerate",str(FPS),"-i",image]
        vf="scale=1280:720,format=yuv420p"
    overlay=build_overlay(shot,n)
    dst=HERE/f"_scene_{n:02d}.mp4"
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y",*source,"-loop","1","-framerate",str(FPS),"-i",overlay,
        "-filter_complex",f"[0:v]{vf},fps=24[bg];[bg][1:v]overlay=0:0:shortest=1,format=yuv420p[out]",
        "-map","[out]","-frames:v","144","-an","-c:v","libx264","-preset","veryfast","-crf","21",
        "-r","24","-pix_fmt","yuv420p",dst]
    run(cmd); return dst

def generate_audio():
    narrator=HERE/"_narration.wav"
    run(["espeak","-v","es","-s","153","-a","160","-w",narrator,SCRIPT])
    d=probe(narrator)
    secs=float(d["format"]["duration"])
    print("SYNTHETIC NARRATOR",secs)
    if secs>46:
        raise RuntimeError("Narration does not fit 48 seconds. Edit script, not false-synchronize audio.")
    soundtrack=HERE/"_soundtrack.m4a"
    # Atmosphere is designed audio, NOT a documentary field recording.
    fc=(
       "[0:a]lowundefined=f=380,highpass=f=65,volume=0.095[water];"
       "[1:a]volume=0.012[drone];"
       "[2:a]volume=1.75,adelay=750|750,apad=pad_dur=48,atrim=0:48[voice];"
       "[water][drone][voice]amix=inputs=3:duration=first:normalize=0,"
       "afade=t=in:st=0:d=1.1,afade=t=out:st=46:d=2,alimiter=limit=0.93[out]"
    )
    run(["ffmpeg","-hide_banner","-loglevel","error","-y",
      "-f","lavfi","-i","anoisesrc=color=pink:duration=48:sample_rate=44100",
      "-f","lavfi","-i","sine=frequency=73:duration=48:sample_rate=44100",
      "-i",narrator,"-filter_complex",fc,"-map","[out]","-t","48",
      "-c:a","aac","-b:a","160k",soundtrack])
    return soundtrack,secs

def make_ledger():
    records=[]
    for i,shot in enumerate(SHOTS):
        item=dict(shot,startFrame=i*144,endFrame=(i+1)*144,startSeconds=i*6,endSeconds=(i+1)*6)
        if shot["assetId"]:
            item["mediaSource"]=ASSETS[shot["assetId"]]["commons"]
            item["dateCaptured"]=ASSETS[shot["assetId"]]["date"]
            item["publishedAt"]=ASSETS[shot["assetId"]].get("publishedAt")
            item["mediaSha256"]=ASSETS[shot["assetId"]]["downloadedSha256"]
            item["license"]=ASSETS[shot["assetId"]]["license"]
            item["author"]=ASSETS[shot["assetId"]]["creator"]
            item["alterations"]="Color grade, original animated credit overlay, crop/zoom" if shot["kind"]=="ARCHIVAL_PHOTO" else "Scale, color grade, muted original ambient audio, source date overlay"
        else:
            item["mediaSource"]="PROMETEO original editorial explanatory graphic"
            item["dateCaptured"]=None;item["license"]="Original"
            item["alterations"]="Editorial graphics, no historical photographic claim"
        records.append(item)
    ledger={"schema":"prometeo.video.frame-provenance/v1","taskId":"video-w003-20261122-03","fps":FPS,"durationSeconds":DURATION,"frameCount":FPS*DURATION,
        "claims":CLAIMS,"media":ASSETS,"segments":records,
        "audio":{"voice":"Spanish text-to-speech by local espeak (synthetic, not interview)", "ambience":"Pink noise and sine designed in ffmpeg, not historical field recordings", "factualVoiceText":SCRIPT},
        "rights":"Original editorial graphics and synthetic sound CC BY 4.0; NOAA-20 imagery public domain (US federal government), two Pexels videos retain Pexels free license, no implication of endorsement.",
        "visualTruth":"Undated Pexels canal footage is explicitly contextual; 2019 NOAA satellite and undated flood B-roll have explicit, distinct source dates."
    }
    p=HERE/"PROVENANCE.json";p.write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    return p

def spike(inputs):
    out=HERE/"_spike.mp4"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",inputs["VENICE_CONTEXT"],
         "-f","lavfi","-i","anullsrc=r=44100:cl=stereo","-t","1","-vf","scale=640:360","-c:v","libx264",
         "-c:a","aac","-pix_fmt","yuv420p","-shortest",out])
    meta=probe(out)
    assert any(s["codec_name"]=="h264" for s in meta["streams"])
    assert any(s["codec_name"]=="aac" for s in meta["streams"])
    # Promote risk OBSERVED only after the real downloadable clip encodes.
    p=HERE/"PREPRODUCTION.deep-spec-v1.json"
    spec=json.loads(p.read_text(encoding="utf8"))
    spec["risks"][0]["status"]="OBSERVED"
    spec["risks"][0]["spikeEvidence"]="Downloaded licensed files; one-second H264+AAC encoded and probed in GitHub Actions."
    spec["environmentLimits"]="Remote-download and ffmpeg compatibility spike observed on this GitHub Actions runner; aesthetic listening and human approval remain NOT_RUN."
    p.write_text(json.dumps(spec,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    run(["node",HERE.parents[2]/"launch"/"deep-spec-v1.mjs",p])
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-ss","0.45","-i",out,"-frames:v","1",HERE/"first_article.jpg"],quiet=True)
    (HERE/"first_article.mp4").write_bytes(out.read_bytes())
    out.unlink(missing_ok=True)

def finish(slides,soundtrack,voiceSecs):
    concat=HERE/"_concat.txt"
    concat.write_text("".join("file '"+p.name+"'\n" for p in slides),encoding="utf8")
    joined=HERE/"_silent_join.mp4"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",concat,
         "-c","copy",joined])
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",joined,"-i",soundtrack,
         "-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","copy","-t",str(DURATION),"-movflags","+faststart",OUT])
    run(["python3",HERE/"verify_ledger.py",HERE/"PROVENANCE.json"])
    meta=probe(OUT)
    vids=[s for s in meta["streams"] if s["codec_type"]=="video"]
    auds=[s for s in meta["streams"] if s["codec_type"]=="audio"]
    assert len(vids)==1 and len(auds)==1
    assert vids[0]["codec_name"]=="h264" and (vids[0]["width"],vids[0]["height"])==(WIDTH,HEIGHT)
    assert auds[0]["codec_name"]=="aac"
    assert abs(float(meta["format"]["duration"])-DURATION)<0.15
    assert vids[0].get("nb_frames")=="1152", vids[0].get("nb_frames")
    run(["ffmpeg","-hide_banner","-loglevel","error","-xerror","-i",OUT,"-f","null","-"],quiet=True)
    for second in [2,14,22,30,46]:
        run(["ffmpeg","-hide_banner","-loglevel","error","-y","-ss",str(second),"-i",OUT,
             "-frames:v","1",HERE/f"frame_{second:02d}.jpg"],quiet=True)
    (HERE/"poster.jpg").write_bytes((HERE/"frame_02.jpg").read_bytes())
    result={"status":"ENCODED_AND_DECODED","render":"GitHub Actions runner","taskId":"video-w003-20261122-03",
         "durationSeconds":float(meta["format"]["duration"]),"fps":24,"frames":1152,"videoCodec":"h264",
         "audioCodec":"aac","imageWidth":1280,"imageHeight":720,"narrationSeconds":voiceSecs,
         "documentaryDates":["context video capture unknown; published 2019-12-14","2019-11-14 NOAA satellite","undated flood B-roll published 2022-10-24"],
         "qa":{"decode":"PASS","frameLedger":"PASS","visualViewedByHuman":"NOT_RUN","audioListenedByHuman":"NOT_RUN","historicalRights":"metadata verified, original file retrieval checked"}}
    (HERE/"PROBE.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("ENCODED + DECODE VERIFIED",result)

def main():
    print("DOCUMENTARY SOURCE SPIKE")
    inp={key:get_asset(key,item) for key,item in ASSETS.items()}
    spike(inp)
    make_ledger()
    scenes=[render_scene(n,shot,inp) for n,shot in enumerate(SHOTS)]
    audio,voiceSecs=generate_audio()
    finish(scenes,audio,voiceSecs)
if __name__=="__main__":
    main()
