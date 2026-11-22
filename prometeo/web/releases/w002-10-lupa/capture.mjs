#!/usr/bin/env node
/**
 * LUPA · captura real controlada de dos fuentes A/B con Chromium.
 * NO ejecuta en el frontend, NO evita CORS, NO permite dominios externos
 * salvo lista de hosts autorizados por el operador.
 *
 * npm install
 * npx playwright install chromium
 * node capture.mjs --a-html fixtures/a.html --b-html fixtures/b.html --viewports 320x700,768x700,1440x700 --out captures
 *
 * Para un sitio autorizado:
 * LUPA_ALLOW_HOSTS=mi-sitio.example node capture.mjs --a-url https://mi-sitio.example/v1 --b-url https://mi-sitio.example/v2
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const opts=Object.create(null);
for(let i=2;i<process.argv.length;i++){
  const item=process.argv[i];
  if(!/^--[\w-]+$/.test(item) || !process.argv[i+1] || process.argv[i+1].startsWith('--')){
    throw Error('Argumento incorrecto: '+item);
  }
  opts[item.slice(2)]=process.argv[++i];
}
const sha = (x)=>createHash('sha256').update(x).digest('hex');
const parseViewports = (str) => (str||'320x700,768x700,1440x700').split(',').map((pair)=>{
  const match=/^(\d{2,4})x(\d{2,4})$/.exec(pair);
  if(!match)throw Error('Viewport inválido: '+pair+'. Usá AnchoXAlto.');
  const width=+match[1],height=+match[2];
  if(width<240||width>2560||height<240||height>2400)throw Error('Viewport fuera de rango: '+pair);
  return {width,height};
});
const hosts = new Set(['localhost','127.0.0.1','[::1]',...((process.env.LUPA_ALLOW_HOSTS||'').split(',').map((h)=>h.trim()).filter(Boolean))]);
function allowed(target){
  let url;
  try{url=new URL(target);}catch{throw Error('URL inválida: '+target);}
  if(!['https:','http:'].includes(url.protocol) || !hosts.has(url.hostname)){
    throw Error('Host no autorizado: '+url.hostname+'. Declaralo explícitamente en LUPA_ALLOW_HOSTS, solo si tenés permiso de captura.');
  }
  return url;
}
const sources=[
 {slot:'A',url:opts['a-url'],html:opts['a-html']},
 {slot:'B',url:opts['b-url'],html:opts['b-html']}
];
for(const s of sources){
  if(Boolean(s.url)===Boolean(s.html))throw Error('Usá exactamente uno de --'+s.slot.toLowerCase()+'-url o --'+s.slot.toLowerCase()+'-html');
  if(s.url)allowed(s.url);
}
const viewports=parseViewports(opts.viewports);
const base=resolve(opts.out||'captures');
const threshold=opts.threshold===undefined?32:Number(opts.threshold);
if(!Number.isInteger(threshold)||threshold<0||threshold>255)throw Error('Threshold debe ser entero 0..255');
const executable=process.env.LUPA_CHROMIUM_PATH||undefined;
const browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
let completed=0;
try {
  for(const viewport of viewports){
    const context=await browser.newContext({
      viewport,deviceScaleFactor:1,locale:'es-AR',timezoneId:'UTC',reducedMotion:'reduce',
      colorScheme:'light',serviceWorkers:'block'
    });
    // No permite tráfico lateral a hosts que el operador no autorizó.
    await context.route('**/*', async (route)=>{
      try{allowed(route.request().url());await route.continue();}catch{await route.abort('blockedbyclient');}
    });
    const results=[];
    const location=join(base,viewport.width+'x'+viewport.height);
    await mkdir(location,{recursive:true});
    for(const source of sources){
      const page=await context.newPage();
      try{
        if(source.html){
          const document=await readFile(resolve(source.html),'utf8');
          await page.setContent(document,{waitUntil:'load'});
        }else{
          await page.goto(source.url,{waitUntil:'domcontentloaded',timeout:30000});
          allowed(page.url()); // valida redirecciones también
        }
        await page.evaluate(async()=>{
          if(document.fonts?.ready)await document.fonts.ready;
          await Promise.all(Array.from(document.images).map((im)=>im.decode().catch(()=>{})));
        });
        const png=await page.screenshot({type:'png',fullPage:false,scale:'css',animations:'disabled',caret:'hide'});
        const decoded=PNG.sync.read(png);
        if(decoded.width!==viewport.width||decoded.height!==viewport.height)throw Error('Dimensiones imprevistas en '+source.slot);
        await writeFile(join(location,source.slot+'.png'),png);
        results.push({slot:source.slot,file:source.slot+'.png',sha256:sha(png),bytes:png.length,buffer:png,
          source:source.url||'local-html:'+resolve(source.html)});
      }finally{await page.close();}
    }
    const a=PNG.sync.read(results[0].buffer),b=PNG.sync.read(results[1].buffer);
    const diff=new PNG({width:a.width,height:a.height});
    let changedPixels=0;
    for(let i=0;i<a.data.length;i+=4){
      const delta=Math.max(Math.abs(a.data[i]-b.data[i]),Math.abs(a.data[i+1]-b.data[i+1]),Math.abs(a.data[i+2]-b.data[i+2]));
      if(delta>threshold){
        diff.data[i]=255;diff.data[i+1]=171;diff.data[i+2]=84;diff.data[i+3]=225;
        changedPixels++;
      }else{diff.data[i]=0;diff.data[i+1]=0;diff.data[i+2]=0;diff.data[i+3]=0;}
    }
    const diffData=PNG.sync.write(diff);
    await writeFile(join(location,'diff.png'),diffData);
    const manifest={
      schema:'lupa.capture.v1',
      createdAt:new Date().toISOString(),
      viewport:{...viewport,deviceScaleFactor:1,unit:'CSS px'},
      capture:{engine:'Playwright + Chromium',fullPage:false,animations:'disabled',caret:'hide',scale:'css',
        reducedMotion:'reduce',colorScheme:'light',timezone:'UTC',captureMethod:sources.some((s)=>s.html)?'setContent local HTML':'browser URL navigation'},
      images:results.map(({slot,file,sha256,bytes,source})=>({slot,file,sha256,bytes,source})),
      difference:{file:'diff.png',sha256:sha(diffData),changedPixels,totalPixels:a.width*a.height,
        changedPercent:+(changedPixels/(a.width*a.height)*100).toFixed(4),
        threshold,algorithm:'max_absolute_rgb_channel_delta',comparison:'>',alphaIgnored:true},
      limitations:['Pixel differences do not establish user-visible severity or root cause.','Host permission is asserted by the runner operator, not independently audited.','No unmeasured performance or Lighthouse claims.']
    };
    await writeFile(join(location,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    console.log('[LUPA] '+viewport.width+'x'+viewport.height+': '+manifest.difference.changedPercent+'% · '+changedPixels+' changed px · '+location);
    completed++;
    await context.close();
  }
} finally {await browser.close();}
if(completed!==viewports.length)process.exitCode=1;
