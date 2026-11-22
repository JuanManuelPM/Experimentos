import assert from 'node:assert/strict';
import {readFile,mkdir,stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import { chromium } from 'playwright';

const root=dirname(fileURLToPath(import.meta.url));
const server=createServer(async(req,res)=>{
 try{
  const target=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  assert.ok(target.startsWith(root),'Path escape');
  const file=target===root?join(root,'index.html'):target;
  const data=await readFile(file);
  const ext=file.split('.').pop();
  res.setHeader('Content-Type',ext==='html'?'text/html;charset=utf-8':ext==='mjs'?'text/javascript;charset=utf-8':'application/json');
  res.writeHead(200);res.end(data);
 }catch(err){res.writeHead(404);res.end(String(err))}
});
await new Promise(resolve=>server.listen(8765,'127.0.0.1',resolve));
const browser=await chromium.launch({
 channel:'chrome',headless:true,
 args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
});
await mkdir(join(root,'qa'),{recursive:true});
const reports=[];
try{
 for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1,acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__PROMETEO_W7_10?.status==='WEBGL_INITIALIZED',{timeout:45000});
  await page.waitForTimeout(1200);
  const original=await page.evaluate(()=>window.__PROMETEO_W7_10.renderState());
  assert.ok(original.drawCalls>0,'Renderer must draw real meshes');
  assert.equal(original.mode,'assembled');
  const w=viewport.width;
  await page.screenshot({path:join(root,'qa','opening-'+w+'.png')});
  await page.locator('[data-mode="folded"]').click();
  await page.waitForFunction(()=>window.__PROMETEO_W7_10.renderState().fold>.96,{timeout:10000});
  await page.screenshot({path:join(root,'qa','folded-'+w+'.png')});
  await page.locator('[data-mode="exploded"]').click();
  await page.waitForFunction(()=>window.__PROMETEO_W7_10.renderState().explode>.95,{timeout:12000});
  assert.equal(await page.locator('#bom li').count(),14,'BOM / scene must match');
  await page.screenshot({path:join(root,'qa','exploded-'+w+'.png')});
  await page.locator('#variant').click();
  assert.equal(await page.locator('#variant').textContent(),'VELOZ');
  await page.locator('[data-palette="copper"]').click();
  assert.equal(await page.locator('#finish').textContent(),'ARCILLA');
  assert.equal(errors.length,0,'Page JS error: '+errors.join('; '));
  reports.push({viewport:w,openDrawCalls:original.drawCalls,fold:'PASS',explosion:'PASS',variant:'PASS',palette:'PASS'});
  if(w===1440){
   const [download]=await Promise.all([
    page.waitForEvent('download',{timeout:20000}),
    page.locator('#exportGlb').click()
   ]);
   const data=await readFile(await download.path());
   assert.ok(data.length>1000,'GLB must have bytes');
   assert.equal(data.subarray(0,4).toString(),'glTF','GLB magic header');
   reports[reports.length-1].exportedGLBBytes=data.length;
  }
  await page.close();
 }
 console.log(JSON.stringify({result:'PASS_BROWSER_WITH_SCREENSHOTS',reports},null,2));
}finally{await browser.close();server.close()}
