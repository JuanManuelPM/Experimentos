import concurrent.futures, hashlib, json, pathlib, shutil, subprocess, tempfile, urllib.request, zipfile, struct, html
ROOT=pathlib.Path("prometeo/assets-library")
SRC="trebeljahr/quaternius-showcase"
PACKS=[
 ("house_interior_pack","ultimate-house-interior","Ultimate House Interior Pack","ultimatehomeinterior"),
 ("street_pack","modular-streets","Modular Streets Pack","modularstreets"),
 ("medieval_village_pack","medieval-village","Medieval Village Pack","medievalvillage"),
 ("modular_medieval_buildings_pack","modular-medieval-buildings","Modular Medieval Building Pack","modularmedievalbuildings"),
 ("modular_women","ultimate-modular-women","Ultimate Modular Women Pack","ultimatemodularwomen"),
 ("modular_dungeon_pack","modular-dungeons","Modular Dungeons Pack","modulardungeon"),
 ("nature_pack","ultimate-nature","Ultimate Nature Pack","ultimatenature"),
 ("animals_pack","ultimate-animated-animals","Ultimate Animated Animal Pack","ultimateanimatedanimals"),
 ("cyberpunk_pack","cyberpunk-game-kit","Cyberpunk Game Kit","cyberpunkgamekit"),
]
MEGA=("modular-sci-fi-megakit","Modular Sci-Fi MegaKit (Standard)","modularscifimegakit")
def run(*a): subprocess.run(a,check=True)
def download(url,dst):
    req=urllib.request.Request(url,headers={"User-Agent":"PROMETEO-CC0-import/1.0"})
    with urllib.request.urlopen(req,timeout=120) as res,open(dst,"wb") as out: shutil.copyfileobj(res,out)
def check_license(official):
    url="https://raw.githubusercontent.com/Quaternius/quaternius.github.io/main/packs/"+official+".html"
    with urllib.request.urlopen(url,timeout=30) as r: source=r.read().decode()
    if "creativecommons.org/publicdomain/zero/1.0" not in source: raise ValueError("CC0 not verified: "+official)
def blobsha(p):
    d=p.read_bytes()
    return hashlib.sha1(b"blob "+str(len(d)).encode()+b"\0"+d).hexdigest()
def validate(p):
    if p.suffix.lower()==".glb":
        with p.open("rb") as f: h=f.read(12)
        assert len(h)==12 and h[:4]==b"glTF" and struct.unpack("<I",h[8:12])[0]==p.stat().st_size,p
    else:
        j=json.loads(p.read_text())
        assert j["asset"]["version"].startswith("2"),p
        for entry in j.get("buffers",[])+j.get("images",[]):
            u=entry.get("uri")
            if u and not u.startswith("data:"):
                assert not "://" in u and (p.parent/u).is_file(),(p,u)
def finalize(folder,name,official,source,models,edition):
    rows=[]
    for p in sorted(models):
        validate(p)
        rows.append(dict(name=p.stem,file=p.relative_to(folder).as_posix(),sha=blobsha(p),bytes=p.stat().st_size))
    if not rows: raise ValueError("No models")
    cat=dict(pack=name,author="Quaternius",license="CC0-1.0",official="https://quaternius.com/packs/"+official+".html",source=source,edition=edition,models=rows)
    (folder/"catalog.json").write_text(json.dumps(cat,indent=2))
    (folder/"README.md").write_text("# "+name+"\n\n"+edition+"\nSource: "+source+"\nLicense: CC0; see "+cat["official"]+"\n")
    title=html.escape(name)
    page='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' · PROMETEO</title><link rel="stylesheet" href="../pack-viewer.css"><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.181.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.181.0/examples/jsm/"}}</script></head><body><header><h1>'+title+'</h1><p>Quaternius · CC0 · '+str(len(rows))+' modelos</p><a href="../batch-03.html">Biblioteca</a> · <a href="catalog.json">Catálogo</a></header><main><aside><input id="filter" placeholder="Buscar modelo"><div id="items"></div></aside><section id="view"><div id="info">Cargando</div><div id="anim"></div></section></main><script type="module" src="../pack-viewer.mjs"></script></body></html>'
    (folder/"index.html").write_text(page)
    return dict(slug=folder.name,name=name,count=len(rows),bytes=sum(p.stat().st_size for p in folder.rglob("*") if p.is_file()),status="imported",edition=edition)
def mirror_import(mirror,record):
    source,slug,name,official=record
    target=ROOT/slug
    if target.exists():
        cat=json.loads((target/"catalog.json").read_text())
        assert all(blobsha(target/m["file"])==m["sha"] for m in cat["models"])
        return dict(slug=slug,name=name,count=len(cat["models"]),bytes=sum(p.stat().st_size for p in target.rglob("*") if p.is_file()),status="imported",edition=cat["edition"])
    check_license(official)
    original=mirror/"public/glb"/source
    with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
        folder=pathlib.Path(tmp)/slug
        shutil.copytree(original,folder/"models")
        models=list((folder/"models").glob("*.glb"))
        for p in models:
            expected=subprocess.check_output(["git","-C",str(mirror),"rev-parse","HEAD:public/glb/"+source+"/"+p.name],text=True).strip()
            assert blobsha(p)==expected,(p,expected)
        receipt=finalize(folder,name,official,"https://github.com/"+SRC+"/tree/main/public/glb/"+source,models,"Full GLB directory in community mirror")
        target=ROOT/slug
        if target.exists(): raise ValueError("Destination already exists: "+slug)
        shutil.move(folder,target)
        return receipt
def mega_import():
    slug,name,official=MEGA
    check_license(official)
    url="https://store.godotengine.org/asset/quaternius/modular-sci-fi-megakit/download/143/"
    with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
        tmp=pathlib.Path(tmp); z=tmp/"standard.zip";download(url,z)
        folder=tmp/slug;modelroot=folder/"models";modelroot.mkdir(parents=True)
        with zipfile.ZipFile(z) as archive:
            names=[pathlib.PurePosixPath(i.filename) for i in archive.infolist() if not i.is_dir()]
            paths=[p for p in names if p.suffix.lower() in (".gltf",".glb")]
            if not paths: raise ValueError("ZIP has no glTF")
            # Retain the glTF subtree and all binary/texture dependencies, not duplicate FBX/OBJ sources.
            allowed={".gltf",".glb",".bin",".png",".jpg",".jpeg",".webp",".ktx2",".tga",".dds"}
            for p in names:
                if p.is_absolute() or ".." in p.parts: raise ValueError("Unsafe ZIP path")
                if p.suffix.lower() not in allowed: continue
                if any(x.lower() in ("fbx","obj","blend","blender") for x in p.parts): continue
                out=modelroot.joinpath(*p.parts);out.parent.mkdir(parents=True,exist_ok=True)
                with archive.open(str(p)) as f,out.open("wb") as d: shutil.copyfileobj(f,d)
        models=[p for p in modelroot.rglob("*") if p.suffix.lower() in (".gltf",".glb")]
        # Resolve shared textures from the original archive by basename, preserving original bytes.
        from urllib.parse import unquote
        with zipfile.ZipFile(z) as archive:
            byname={}
            for member in archive.infolist():
                if not member.is_dir():
                    byname.setdefault(pathlib.PurePosixPath(member.filename).name.casefold(),[]).append(member)
            for p in models:
                if p.suffix.lower()!=".gltf": continue
                j=json.loads(p.read_text())
                for entry in j.get("buffers",[])+j.get("images",[]):
                    u=entry.get("uri")
                    if not u or u.startswith("data:"): continue
                    dest=p.parent/unquote(u)
                    if dest.is_file(): continue
                    if not dest.resolve().is_relative_to(modelroot.resolve()): raise ValueError("Unsafe resource path "+u)
                    candidates=byname.get(dest.name.casefold(),[])
                    if not candidates: raise ValueError("Missing resource: "+u)
                    contents=[archive.read(c) for c in candidates]
                    if len({hashlib.sha256(c).hexdigest() for c in contents})!=1:
                        preferred=[c for c in candidates if "/gltf/" in c.filename.casefold()]
                        if len(preferred)!=1: raise ValueError("Ambiguous resource "+u)
                        data=archive.read(preferred[0])
                    else: data=contents[0]
                    dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
        receipt=finalize(folder,name,official,url,models,"Official free Standard edition; not paid Pro/Source")
        target=ROOT/slug
        if target.exists(): raise ValueError("Destination exists")
        shutil.move(folder,target)
        return receipt
def attempt(fn,*a):
    try:
        r=fn(*a); print(json.dumps(r),flush=True);return r
    except Exception as e:
        name=a[-1][2] if a else MEGA[1]
        r={"name":name,"status":"failed","error":str(e)};print(json.dumps(r),flush=True);return r
def main():
    ROOT.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as temp:
        mirror=pathlib.Path(temp)/"mirror"
        run("git","clone","--depth=1","--filter=blob:none","--sparse","https://github.com/"+SRC+".git",str(mirror))
        run("git","-C",str(mirror),"sparse-checkout","set",*["public/glb/"+p[0] for p in PACKS])
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
            fs=[ex.submit(attempt,mirror_import,mirror,p) for p in PACKS]+[ex.submit(attempt,mega_import)]
            rows=[f.result() for f in fs]
    (ROOT/"batch-03.json").write_text(json.dumps(rows,indent=2,ensure_ascii=False))
    links="".join('<a href="'+r["slug"]+'/">'+html.escape(r["name"])+' · '+str(r["count"])+' modelos</a>' if r["status"]=="imported" else '<p>'+html.escape(r["name"])+' · no importado: '+html.escape(r["error"])+'</p>' for r in rows)
    (ROOT/"batch-03.html").write_text('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PROMETEO · Tanda 03</title><style>body{font:16px system-ui;max-width:720px;padding:20px;margin:auto;background:#e9e8e1;color:#223332}a{display:block;color:inherit;padding:14px;border-bottom:1px solid #aaa}</style><h1>Tanda 03</h1>'+links+'<a href="batch-02.html">Tanda anterior</a></html>')
    if any(r["status"]!="imported" for r in rows): raise SystemExit("Partial import; publish successes")
if __name__=="__main__": main()
