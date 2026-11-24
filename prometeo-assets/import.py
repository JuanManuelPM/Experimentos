import os, re, json, hashlib, shutil, subprocess, tempfile, zipfile, pathlib, concurrent.futures, urllib.parse, time
import requests, bs4, gdown
P=pathlib.Path(__file__).resolve().parent
ROOT=P/'packs'; ROOT.mkdir(exist_ok=True)
TMP=pathlib.Path(tempfile.mkdtemp(prefix='quaternius-'))
SELECTION=json.loads((P/'selection.json').read_text())
PREVIOUS=json.loads((P/'catalog.json').read_text()).get('results',[]) if (P/'catalog.json').exists() else []
DONE=[r for r in PREVIOUS if r['status']=='IMPORTED' and (P/r['folder']).is_dir()]
DONE_IDS={r['id'] for r in DONE}
SELECTION=[x for x in SELECTION if x['id'] not in DONE_IDS]
REQUESTED=len(SELECTION)+len(DONE)
BASE='https://quaternius.com/'
UA={'User-Agent':'PROMETEO asset importer (public CC0 packs)'}
def get(url):
    for i in range(3):
        try:
            r=requests.get(url,headers=UA,timeout=(12,40)); r.raise_for_status(); return r
        except Exception:
            if i==2: raise
            time.sleep(i+1)
def norm(s): return re.sub('[^a-z0-9]','',s.lower())
def slugs(soup):
    return sorted(set(urllib.parse.urljoin(BASE,m) for m in re.findall(r'(?:https://quaternius\.com/)?packs/[a-zA-Z0-9_-]+\.html',str(soup))))
def parse(url):
    r=get(url); return bs4.BeautifulSoup(r.text,'html.parser')
try:
    index=parse(BASE+'index.html')
    pages=slugs(index)
except Exception as e:
    print('index:',e,flush=True); pages=[]
# Index official pack titles, resolving legacy irregular URL names.
def title_page(url):
    try:
        s=parse(url); title=s.title.get_text(' ',strip=True) if s.title else ''
        keys=[norm(title.split('•')[-1]),norm(title.replace('Quaternius',''))]
        for x in s.find_all(['h1','h2','h3','h4']): keys.append(norm(x.get_text(' ',strip=True)))
        return [(k,url) for k in keys if k]
    except Exception: return []
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
    lookup=dict(x for result in ex.map(title_page,pages) for x in result)
# Public CC0 mirrors, pinned to checked out commit and retained in provenance.
mirrors={}
for key,url in [('m1','https://github.com/trebeljahr/quaternius-showcase.git'),('m2','https://github.com/tilakpatell/tilakverse-assets.git')]:
    dst=TMP/key
    try:
        subprocess.run(['git','clone','--depth','1','--filter=blob:none','--sparse',url,str(dst)],check=True,timeout=240)
        paths=['public/glb'] if key=='m1' else ['quaternius/'+x['mirror2'] for x in SELECTION if x['mirror2']]
        subprocess.run(['git','-C',str(dst),'sparse-checkout','set',*paths],check=True,timeout=500)
        mirrors[key]=(dst,subprocess.check_output(['git','-C',str(dst),'rev-parse','HEAD'],text=True).strip(),url)
    except Exception as e: print('mirror',key,e,flush=True)
# Free itch download, no API key, no paid content. Package installed in disposable dir.
itchdir=TMP/'itch-tool'; itchdir.mkdir()
try:
    subprocess.run(['npm','install','--prefix',str(itchdir),'--omit=dev','--ignore-scripts','itchio-downloader'],check=True,timeout=180)
    (itchdir/'fetch.cjs').write_text("const {downloadGameDirect}=require('itchio-downloader'); (async()=>{const r=await downloadGameDirect({itchGameUrl:process.argv[2],downloadDirectory:process.argv[3],retries:2,writeMetaData:false});if(!r.status)throw Error(r.message);console.log(r.filePath)})().catch(e=>{console.error(e.message);process.exitCode=1})")
except Exception as e: print('itch tool:',e,flush=True)
def official(x):
    url=lookup.get(norm(x['name']),BASE+'packs/'+x['slug']+'.html')
    soup=parse(url)
    title=soup.title.get_text(' ',strip=True) if soup.title else ''
    if norm(x['name']) not in norm(title):
        if not any(norm(t.get_text(' ',strip=True))==norm(x['name']) for t in soup.find_all(['h1','h2','h3','h4'])):
            raise ValueError('official title mismatch: '+title)
    cc0=any(('creativecommons.org/publicdomain/zero/' in a.get('href','') or a.get_text(strip=True).upper()=='CC0') for a in soup.find_all('a'))
    if not cc0: raise ValueError('CC0 not confirmed on individual pack page')
    return url,soup
def safe_extract(z,dst):
    with zipfile.ZipFile(z) as f:
        if sum(i.file_size for i in f.infolist())>5_000_000_000: raise ValueError('archive exceeds safety limit')
        for i in f.infolist():
            p=(dst/i.filename).resolve()
            if not p.is_relative_to(dst.resolve()): raise ValueError('unsafe zip path')
        f.extractall(dst)
def download_official(x,url,soup,dst):
    urls=list(dict.fromkeys(urllib.parse.urljoin(url,a.get('href','')) for a in soup.find_all('a',href=True)))
    # Some pack pages use JS onclick for download buttons.
    urls+=re.findall(r'https?://(?:quaternius\.itch\.io|drive\.google\.com|www\.dropbox\.com)/[^"\'<>\s]+',str(soup))
    itch=[u for u in urls if 'quaternius.itch.io/' in u and len(urllib.parse.urlparse(u).path.strip('/'))>0]
    if x['itch']: itch.append('https://quaternius.itch.io/'+x['itch'])
    for u in dict.fromkeys(itch):
        try:
            subprocess.run(['node',str(itchdir/'fetch.cjs'),u,str(dst)],check=True,timeout=400)
            if list(dst.rglob('*.zip')): return u
        except Exception as e: print(x['name'],'itch:',str(e),flush=True)
    for u in dict.fromkeys(urls):
        try:
            if 'drive.google.com' in u:
                if '/folders/' in u: gdown.download_folder(url=u,output=str(dst),quiet=True)
                else:
                    match=re.search(r'/d/([^/]+)',u)
                    file_id=match.group(1) if match else urllib.parse.parse_qs(urllib.parse.urlparse(u).query).get('id',[None])[0]
                    if file_id: gdown.download(id=file_id,output=str(dst/'source.zip'),quiet=True)
                    else: gdown.download(url=u,output=str(dst/'source.zip'),quiet=True)
                if any(p.is_file() for p in dst.rglob('*')): return u
            elif urllib.parse.urlparse(u).path.lower().endswith('.zip') and urllib.parse.urlparse(u).scheme=='https':
                with requests.get(u,stream=True,timeout=(15,90),headers=UA) as r:
                    r.raise_for_status()
                    with (dst/'source.zip').open('wb') as f:
                        for chunk in r.iter_content(1024*1024): f.write(chunk)
                return u
        except Exception as e: print(x['name'],'official:',str(e),flush=True)
    raise ValueError('no usable free archive link')
def copy_models(src,dst):
    # Preserve relative references (gltf .bin and textures), prefer web formats.
    files=[p for p in src.rglob('*') if p.is_file()]
    model_ext={'.glb','.gltf'}
    models=[p for p in files if p.suffix.lower() in model_ext]
    if not models:
        model_ext={'.fbx'}
        models=[p for p in files if p.suffix.lower() in model_ext]
    if not models:
        model_ext={'.obj'}
        models=[p for p in files if p.suffix.lower() in model_ext]
    if not models: raise ValueError('no supported real 3D model files')
    allowed=model_ext|{'.bin','.png','.jpg','.jpeg','.webp','.tga','.bmp','.ktx2','.dds','.mtl','.txt','.md'}
    count=0; total=0; inventory=[]; omitted=[]
    for p in files:
        if p.suffix.lower() not in allowed: continue
        if p.stat().st_size>=95*1024*1024: omitted.append(str(p.relative_to(src))); continue
        if p.suffix.lower()=='.glb':
            with p.open('rb') as f:
                if f.read(4)!=b'glTF': continue
        if p.suffix.lower()=='.gltf':
            try:
                if 'asset' not in json.loads(p.read_text(encoding='utf-8-sig')): continue
            except Exception: continue
        q=dst/p.relative_to(src); q.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(p,q)
        total+=q.stat().st_size
        if p.suffix.lower() in model_ext:
            count+=1
            inventory.append({'path':str(q.relative_to(dst)), 'bytes':q.stat().st_size,'sha256':hashlib.file_digest(q.open('rb'),'sha256').hexdigest()})
    if not count: raise ValueError('all model files rejected')
    return count,total,inventory,omitted,sorted(model_ext)
def run(x):
    slug=f"{x['id']:02d}-"+re.sub(r'[^a-z0-9]+','-',x['name'].lower()).strip('-')
    dst=ROOT/slug
    item=dict(x,status='FAILED',folder=str(dst.relative_to(P)))
    try:
        url,soup=official(x); item.update(official=url,license='CC0-1.0')
        src=None
        if x['mirror'] and 'm1' in mirrors:
            root,sha,repo=mirrors['m1']; candidate=root/'public/glb'/x['mirror']
            if candidate.is_dir(): src=candidate; item['source']={'repo':repo,'commit':sha,'path':str(src.relative_to(root)),'edition':'mirror GLB; coverage not asserted'}
        if src is None and x['mirror2'] and 'm2' in mirrors:
            root,sha,repo=mirrors['m2']; candidate=root/'quaternius'/x['mirror2']
            if candidate.is_dir(): src=candidate; item['source']={'repo':repo,'commit':sha,'path':str(src.relative_to(root)),'edition':'mirror; coverage not asserted'}
        if src is None and x['id']==1:
            try:
                root=TMP/'base-standard'; repo='https://github.com/NafisRayan/Animate-Rigged-Humanoid-No-Blender.git'
                subprocess.run(['git','clone','--depth','1','--filter=blob:none','--sparse',repo,str(root)],check=True,timeout=240)
                folder='Universal Base Characters[Standard]'
                subprocess.run(['git','-C',str(root),'sparse-checkout','set',folder],check=True,timeout=300)
                candidate=root/folder
                if candidate.is_dir():
                    src=candidate; item['source']={'repo':repo,'commit':subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip(),'path':folder,'edition':'public Standard mirror'}
            except Exception as e: print('base mirror:',str(e),flush=True)
        if src is None:
            d=TMP/slug; d.mkdir(exist_ok=True)
            u=download_official(x,url,soup,d)
            for z in list(d.rglob('*.zip')):
                dest=z.parent/(z.stem+'-extracted'); dest.mkdir(exist_ok=True); safe_extract(z,dest)
            src=d; item['source']={'url':u,'edition':'public free download'}
        staging=TMP/(slug+'-staging'); staging.mkdir(exist_ok=True)
        count,total,inventory,omitted,formats=copy_models(src,staging)
        item.update(status='IMPORTED',models=count,bytes=total,files=inventory,omitted_large=omitted,formats=formats)
        if dst.exists(): shutil.rmtree(dst)
        shutil.copytree(staging,dst)
        (dst/'PROVENANCE.json').write_text(json.dumps({k:v for k,v in item.items() if k!='files'},indent=2,ensure_ascii=False))
        (dst/'LICENSE.txt').write_text('Quaternius — CC0 1.0 Universal\n'+url+'\nhttps://creativecommons.org/publicdomain/zero/1.0/\n')
    except Exception as e:
        item['error']=str(e)
    print(x['id'],x['name'],item['status'],item.get('models'),item.get('error',''),flush=True)
    return item
results=list(DONE)
def save():
    data={'requested':REQUESTED,'imported':sum(r['status']=='IMPORTED' for r in results),'models':sum(r.get('models',0) for r in results),'bytes':sum(r.get('bytes',0) for r in results),'results':sorted(results,key=lambda x:x['id'])}
    (P/'catalog.json').write_text(json.dumps(data,indent=2,ensure_ascii=False))
    (P/'README.md').write_text('# PROMETEO — Quaternius assets\n\nReal 3D files. Free CC0 packs only. Mirror coverage may differ from current editions; FBX/OBJ remain source formats when GLB/glTF unavailable.\n\n'+f"Imported: {data['imported']}/{data['requested']}; models: {data['models']}; bytes: {data['bytes']}\n\n"+'\n'.join(f"- {r['id']:02d} {r['name']}: {r['status']} ({r.get('models',0)} models) {r.get('error','')}" for r in sorted(results,key=lambda x:x['id']))+'\n')
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
    futures=[ex.submit(run,x) for x in SELECTION]
    for f in concurrent.futures.as_completed(futures):
        results.append(f.result()); save()
save()
