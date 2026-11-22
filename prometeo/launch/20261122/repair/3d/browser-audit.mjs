/**
 * PROMETEO W6 · auditoría visual reproducible (candidato).
 * No genera arte. El PNG es una captura de navegador real, no una imagen sintética.
 * Uso: npm install playwright pngjs && npx playwright install chromium && node browser-audit.mjs
 * Requiere red pública y Chromium con WebGL. NEVER stamp HUMAN_APPROVED.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base='https://juanmanuelpm.github.io/Experimentos/';
const works=[
  ['01','prometeo/launch/20261122/next/3d/works/01/'],
  ['02','prometeo/previews/3d/w6/02/'],
  ['03','prometeo/previews/3d/w6/03/'],
  ['04','prometeo/works/3d-w6-20261122-04/'],
  ['05','prometeo/launch/20261122/next/3d/works/05-maquina-de-leva/'],
  ['06','prometeo/works/3d-w6-20261122/06/'],
  ['07','prometeo/3d/releases/w6-07-una-habitacion-verdadera/'],
  ['08','prometeo/previews/w6/08-atlas-cuenca/'],
  ['09','prometeo/launch/20261122/next/3d/work-09/']
];
const qaRoot=path.resolve('QA');
const manifest={schema:'prometeo.3d.autocritica.browser/v1',batchId:'3d-w6-20261122',capturedAt:new Date().toISOString(),environment:{engine:'Chromium/Playwright',mode:'software-or-GPU-unknown'},notReviewed:['10'],entries:[]};
await mkdir(path.join(qaRoot,'screens'),{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
const viewports=[{name:'mobile390',width:390,height:844,hasTouch:true,isMobile:true},{name:'desktop1440',width:1440,height:900,hasTouch:false,isMobile:false}];
for(const [n,route] of works){
 for(const v of viewports){
  const e={taskNumber:n,viewport:v.name,url:base+route,states:[],errors:[],requestsFailed:[],httpStatus:null,webgl:null,method:'REAL_BROWSER_CAPTURE_NOT_HUMAN_ART_APPROVAL'};
  const context=await browser.newContext({viewport:{width:v.width,height:v.height},hasTouch:v.hasTouch,isMobile:v.isMobile,deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',x=>e.errors.push(String(x).slice(0,500)));
  page.on('console',x=>{if(x.type()==='error')e.errors.push(x.text().slice(0,500))});
  page.on('requestfailed',x=>e.requestsFailed.push(x.url().slice(0,250)));
  const dir=path.join(qaRoot,'screens',n);
  await mkdir(dir,{recursive:true});
  async function capture(state){
   await page.waitForTimeout(900);
   const dest=path.join(dir,v.name+'-'+state+'.png');
   const buffer=await page.screenshot({path:dest,fullPage:false,animations:'disabled',timeout:15000});
   let colorVariance=null;
   try{
    const p=PNG.sync.read(buffer);let count=0,sum=0,sumsq=0;
    for(let y=Math.floor(p.height*.2);y<p.height;y+=11)for(let x=0;x<p.width;x+=11){
     const off=(p.width*y+x)*4;
     const luminosity=.2126*p.data[off]+.7152*p.data[off+1]+.0722*p.data[off+2];
     sum+=luminosity;sumsq+=luminosity*luminosity;count++;
    }
    colorVariance=Math.round((sumsq/count-(sum/count)**2)*100)/100;
   }catch{}
   e.states.push({state,path:path.relative(qaRoot,dest),bytes:buffer.length,colorVariance,observation:'SCREENSHOT_CAPTURED; QUALITY_NOT_JUDGED'});
  }
  try{
   const response=await page.goto(e.url,{waitUntil:'domcontentloaded',timeout:30000});
   e.httpStatus=response?.status()??null;
   await page.waitForTimeout(3500);
   e.webgl=await page.evaluate(()=>{
    const canvases=[...document.querySelectorAll('canvas')];
    return canvases.map(c=>{
      let gl=null,renderer=null;
      try{gl=c.getContext('webgl2')||c.getContext('webgl');renderer=gl?.getParameter(gl.RENDERER)}catch{}
      return {width:c.width,height:c.height,clientWidth:c.clientWidth,clientHeight:c.clientHeight,context:gl?'WEBGL':c.getContext('2d')?'2D':'UNKNOWN',renderer};
    });
   });
   await capture('initial');
   if(n==='01'){
    for(const [label,selector] of [['front','[data-view="front"]'],['profile','[data-view="profile"]'],['closeup','[data-view="close"]']]){
      try{await page.locator(selector).first().click({timeout:3500});await capture(label)}catch(err){e.errors.push('VIEW_'+label+': '+String(err).slice(0,200))}
    }
   }
   if(n==='02'){
     try{await page.locator('#enter').click({timeout:3500})}catch{}
     for(const idx of [0,1,2]){
      try{await page.locator('[data-room="'+idx+'"]').click({timeout:3500});await capture('room-'+idx)}catch(err){e.errors.push('ROOM_'+idx+': '+String(err).slice(0,200))}
     }
   }
   if(n==='06'){
    for(const idx of [0,1,2,3]){
      try{await page.locator('[data-season="'+idx+'"]').click({timeout:3500});await page.waitForTimeout(1300);await capture('season-'+idx)}catch(err){e.errors.push('SEASON_'+idx+': '+String(err).slice(0,200))}
    }
   }
   if(n==='07')e.errors.push('EXTERNAL_IFRAME_MESH_AND_CAMERA_NOT_INDEPENDENTLY_INSPECTED');
   e.status=e.httpStatus===200&&e.states.length>0?'SCREENSHOT_CAPTURED_NOT_APPROVED':'BLOCKED';
  }catch(err){e.status='NOT_RUN_OR_FAILED';e.errors.push(String(err).slice(0,550))}
  manifest.entries.push(e);
  await context.close();
 }
}
await browser.close();
manifest.summary={
 positionsWithScreenshot:[...new Set(manifest.entries.filter(x=>x.states.length).map(x=>x.taskNumber))].sort(),
 viewportRuns:manifest.entries.length,
 screenshots:manifest.entries.reduce((sum,x)=>sum+x.states.length,0),
 failures:manifest.entries.filter(x=>x.status!=='SCREENSHOT_CAPTURED_NOT_APPROVED').length,
 humanApproved:false,
 caveat:'No perceptual quality judgement, mobile hardware or complete end-to-end interaction. Chromium browser screenshots only.'
};
await writeFile(path.join(qaRoot,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify(manifest.summary,null,2));
if(manifest.summary.failures)process.exitCode=1;
