#!/usr/bin/env python3
"""LUPA / Reproducible authorized-source screenshot runner.

Usage: python capture.py --a http://127.0.0.1:8000/fixtures/a.html --b http://127.0.0.1:8000/fixtures/b.html --widths 390,1440 --height 900 --out evidence
Dependencies: playwright, Pillow. Python >=3.10. Browser must be installed with `python -m playwright install chromium`.
"""
import argparse, hashlib, json, os, pathlib, sys
from datetime import datetime, timezone
from urllib.parse import urlparse
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

def digest(data): return hashlib.sha256(data).hexdigest()
def permitted(u, allow_hosts):
    p=urlparse(u)
    return p.scheme in ('http','https') and p.hostname in allow_hosts and not p.username and not p.password

def diff_count(a,b,threshold):
    # Pillow reads exact PNG RGB pixels. This is deliberately not a perceptual similarity score.
    a=Image.open(a).convert('RGB'); b=Image.open(b).convert('RGB')
    if a.size!=b.size: raise ValueError('Screenshots have different raster dimensions')
    ba=a.tobytes(); bb=b.tobytes(); total=a.width*a.height; changed=0
    for i in range(0,len(ba),3):
        if max(abs(ba[i]-bb[i]),abs(ba[i+1]-bb[i+1]),abs(ba[i+2]-bb[i+2]))>threshold:changed+=1
    return changed,total

def main():
    p=argparse.ArgumentParser(description='Capture 2 authorized pages with matching viewport settings')
    p.add_argument('--a',help='Authorized HTTP(S) URL of revision A')
    p.add_argument('--b',help='Authorized HTTP(S) URL of revision B')
    p.add_argument('--a-html',help='Authorized self-contained local HTML of revision A (works in restricted browsers)')
    p.add_argument('--b-html',help='Authorized self-contained local HTML of revision B (works in restricted browsers)')
    p.add_argument('--out',default='evidence')
    p.add_argument('--widths',default='390,1440')
    p.add_argument('--height',type=int,default=900)
    p.add_argument('--threshold',type=int,default=32)
    p.add_argument('--allow-host',action='append',default=['127.0.0.1','localhost'],help='Explicitly approve an additional host (can repeat)')
    p.add_argument('--browser-executable',default=None,help='Optional Chromium binary path')
    args=p.parse_args();widths=[int(x) for x in args.widths.split(',')]
    if not widths or any(w<280 or w>4000 for w in widths) or args.height<300 or args.height>4000 or not 0<=args.threshold<=255:p.error('Viewport/threshold out of supported range')
    html_mode=bool(args.a_html or args.b_html)
    if html_mode and not (args.a_html and args.b_html) or (html_mode and (args.a or args.b)) or (not html_mode and not (args.a and args.b)):
        p.error('Provide either --a/--b for authorized URLs or --a-html/--b-html for self-contained local HTML')
    if not html_mode and any(not permitted(u,set(args.allow_host)) for u in (args.a,args.b)):
        p.error('Only explicitly authorized HTTP(S) hosts; default localhost. No file:// or cross-origin bypass')
    sources={}
    if html_mode:
        for label,path in [('a',args.a_html),('b',args.b_html)]:
            source=pathlib.Path(path).resolve()
            if not source.is_file() or source.stat().st_size>5_000_000:p.error('Local HTML must exist and be at most 5 MB')
            content=source.read_text(encoding='utf-8')
            sources[label]=dict(content=content,sourceSha256=digest(content.encode('utf-8')),sourceFile=source.name)
    out=pathlib.Path(args.out);out.mkdir(parents=True,exist_ok=True)
    report={'schema':'lupa.capture/v1','createdAt':datetime.now(timezone.utc).isoformat(),'runner':'capture.py/v1','sourceType':'self-contained-html' if html_mode else 'authorized-url','urls':({'a':None,'b':None} if html_mode else {'a':args.a,'b':args.b}),'htmlSourceHashes':({label:sources[label]['sourceSha256'] for label in sources} if html_mode else None),'conditions':{'height':args.height,'widths':widths,'deviceScaleFactor':1,'reducedMotion':'reduce','colorScheme':'light','animations':'disabled','threshold':args.threshold,'fullPage':False},'samples':[]}
    with sync_playwright() as pl:
        launch={'headless':True};
        if args.browser_executable:launch['executable_path']=args.browser_executable
        browser=pl.chromium.launch(**launch)
        try:
            for width in widths:
                pair={}
                for label,url in [('a',args.a),('b',args.b)]:
                    page=browser.new_page(viewport={'width':width,'height':args.height},device_scale_factor=1,color_scheme='light',reduced_motion='reduce')
                    try:
                        if html_mode:
                            page.set_content(sources[label]['content'],wait_until='load',timeout=25000)
                            response=None
                        else:
                            response=page.goto(url,wait_until='networkidle',timeout=25000)
                            if response is None or not response.ok:raise RuntimeError(f'Navigation failed: {url}, HTTP {response.status if response else "none"}')
                        data=page.screenshot(type='png',full_page=False,animations='disabled')
                    finally:page.close()
                    filename=f'{label}-{width}x{args.height}.png';(out/filename).write_bytes(data)
                    pair[label]={'filename':filename,'sha256':digest(data),'bytes':len(data),'httpStatus':(response.status if response else None),'contentType':'image/png'}
                changed,total=diff_count(out/pair['a']['filename'],out/pair['b']['filename'],args.threshold)
                report['samples'].append({'width':width,'height':args.height,**pair,'changedPixels':changed,'totalPixels':total,'changedPercent':round(100*changed/total,6)})
        finally:browser.close()
    manifest=out/'lupa-capture.json';manifest.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps({'manifest':str(manifest),'viewports':len(report['samples']),'results':[{'width':s['width'],'changedPixels':s['changedPixels'],'changedPercent':s['changedPercent']} for s in report['samples']]},ensure_ascii=False))
if __name__=='__main__':
    try:main()
    except Exception as exc:
        print('CAPTURE_FAILED:',str(exc),file=sys.stderr);raise SystemExit(1)