import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {chromium} from 'playwright';

const OUT='prometeo/cocina-umbria-002/qa/evidence';
const ROOT=process.cwd();
const MIME={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.mjs':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.glb':'model/gltf-binary','.png':'image/png'};
const report={schema:'prometeo.cocina-umbria-002.browser-qa/1',created:new Date().toISOString(),flowVersion:'1.1.0',status:'NOT_RUN',environment:{node:process.version,playwright:'playwright',gpu:'SWIFTSHADER_SOFTWARE_NOT_PHYSICAL_ANDROID'},attempts:{},errors:[],artApproval:'NOT_REVIEWED'};
await fs.mkdir(OUT,{recursive:true});
const server=http.createServer(async(req,res)=>{
 try{
  const uri=decodeURI(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(ROOT,'.'+uri);
  if(file!==ROOT&&!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
  let st=await fs.stat(file).catch(()=>null);
  const resolved=st?.isDirectory()?path.join(file,'index.html'):file;
  const bytes=await fs.readFile(resolved);
  res.writeHead(200,{'content-type':MIME[path.extname(resolved)]||'application/octet-stream','access-control-allow-origin':'*'}).end(bytes);
 }catch(e){res.writeHead(404).end('NOT FOUND '+String(e));}
});
await new Promise(resolve=>server.listen(8879,'127.0.0.1',resolve));
let browser=null;
const MAX=120000;
async function runCase(kind,viewport,mobile){
 const page=await browser.newPage({viewport,deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
 const errors=[],failedRequests=[];
 page.on('pageerror',e=>errors.push('PAGE:'+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE:'+m.text().slice(0,240));});
 page.on('requestfailed',r=>{if(failedRequests.length<50)failedRequests.push({url:r.url().slice(0,220),error:r.failure()?.errorText});});
 const result={kind,viewport,errors,failedRequests,status:'NOT_RUN',captures:[],frames:0,started:Date.now()};
 try{
  await page.goto('http://127.0.0.1:8879/prometeo/cocina-umbria-002/',{waitUntil:'domcontentloaded',timeout:50000});
  result.webgl=await page.evaluate(()=>({webgl:!!document.createElement('canvas').getContext('webgl'),webgl2:!!document.createElement('canvas').getContext('webgl2')}));
  if(!result.webgl.webgl2)throw Error('CHROMIUM_WEBGL2_UNAVAILABLE');
  await page.waitForFunction(()=>{
    const q=window.__UMBRIA_QA__?.();
    return q && (q.actor.loaded || q.actor.loadError || q.errors.length>10);
  },null,{timeout:MAX});
  await page.waitForTimeout(2500);
  const q=await page.evaluate(()=>window.__UMBRIA_QA__?.()||null);
  result.initialTelemetry=q;
  if(!q?.actor?.loaded)throw Error('ACTOR_NOT_LOADED:'+JSON.stringify(q?.errors));
  if(Object.values(q.loadedAssets||{}).some(x=>x==='FAILED'))throw Error('GLB_ASSET_LOAD_FAILED');
  for(const [label,second] of [['general',1],['walk',5],['turn',8],['hands',14],['final',19]]){
   await page.locator('#seek').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},second);
   await page.waitForTimeout(450);
   const q=await page.evaluate(()=>window.__UMBRIA_QA__?.()||null);
   result.captures.push({label,second,shot:await page.locator('#shot').innerText(),phase:q?.motion?.phase,actorOrientation:q?.actorOrientation,frontDotMin:q?.motion?.frontDotMin,chairs:q?.chairProfiles,roof:q?.roof,collisions:q?.collisions,errors:q?.errors});
   await page.screenshot({path:path.join(OUT,kind+'-'+label+'.png'),animations:'disabled'});
   if((kind==='desktop'&&['general','walk','turn','hands','final'].includes(label))||(kind==='mobile'&&label==='general')){
    const data=await page.screenshot({type:'jpeg',quality:68,animations:'disabled'});
    await fs.writeFile(path.join(OUT,kind+'-'+label+'.jpg'),data);
    await fs.writeFile(path.join(OUT,kind+'-'+label+'.jpg.b64.txt'),data.toString('base64'));
   }
  }
  await page.locator('#mode').click();const editor=await page.evaluate(()=>window.__UMBRIA_QA__?.().roof);
  await page.screenshot({path:path.join(OUT,kind+'-cutaway.png'),animations:'disabled'});
  await page.locator('#mode').click();
  result.cutawaySwitch={editor,back:await page.evaluate(()=>window.__UMBRIA_QA__?.().roof)};
  result.status='WEBGL_AND_ASSETS_OBSERVED';
  // reload and test GLB reconnection; this does not imply artistic/pose QA.
  await page.reload({waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.__UMBRIA_QA__?.().actor.loaded===true,{timeout:MAX});
  result.roundtrip={secondLoad:true,actor:await page.evaluate(()=>window.__UMBRIA_QA__?.().actor)};
 }catch(e){result.status='FAIL';result.error=String(e);}
 result.elapsedMs=Date.now()-result.started;
 await page.close();return result;
}
async function forjaCase(){
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const result={status:'NOT_RUN',errors:[]};page.on('pageerror',e=>result.errors.push(String(e)));
 try{
  await page.goto('http://127.0.0.1:8879/prometeo/cocina-umbria-002/forja/?empty=1&umbria=002',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.__FORJA__?.diagnostic?.().instances>=17,{timeout:MAX});
  result.first=await page.evaluate(()=>window.__FORJA__?.diagnostic?.()||null);
  result.status='EDITABLE_17_INSTANCES_OBSERVED';
  await page.screenshot({path:path.join(OUT,'forja-editable.png')});
  const jpg=await page.screenshot({type:'jpeg',quality:68});
  await fs.writeFile(path.join(OUT,'forja-editable.jpg'),jpg);
  await fs.writeFile(path.join(OUT,'forja-editable.jpg.b64.txt'),jpg.toString('base64'));
  await page.reload({waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.__FORJA__?.diagnostic?.().instances>=17,{timeout:MAX});
  result.second=await page.evaluate(()=>window.__FORJA__?.diagnostic?.()||null);
  result.secondLoad=true;
 }catch(e){result.status='FAIL';result.error=String(e)}
 await page.close();return result;
}
try{
 browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-gpu-sandbox','--disable-dev-shm-usage']});
 report.attempts.desktop=await runCase('desktop',{width:1280,height:800},false);
 report.attempts.mobile=await runCase('mobile',{width:390,height:844},true);
 report.attempts.forja=await forjaCase();
 report.status=Object.values(report.attempts).every(x=>!['FAIL','NOT_RUN'].includes(x.status))?'BROWSER_CANARY_OBSERVED_NOT_ART_APPROVED':'BROWSER_CANARY_PARTIAL_OR_FAILED';
}catch(e){report.status='BROWSER_LAUNCH_FAILED';report.errors.push(String(e))}
finally{
 await fs.writeFile(path.join(OUT,'QA_REPORT.json'),JSON.stringify(report,null,2)+'\n');
 console.log('UMBRIA_002_QA_REPORT='+JSON.stringify({status:report.status,attempts:Object.fromEntries(Object.entries(report.attempts).map(([k,v])=>[k,{status:v.status,error:v.error,elapsedMs:v.elapsedMs,initialTelemetry:v.initialTelemetry?{webgl:v.initialTelemetry.webgl,actor:v.initialTelemetry.actor,orientation:v.initialTelemetry.actorOrientation,assets:v.initialTelemetry.loadedAssets,chairs:v.initialTelemetry.chairProfiles,collisions:v.initialTelemetry.collisions,roof:v.initialTelemetry.roof}:undefined}]))}));
 await browser?.close();await new Promise(resolve=>server.close(resolve));
}
if(report.status!=='BROWSER_CANARY_OBSERVED_NOT_ART_APPROVED')process.exitCode=1;
