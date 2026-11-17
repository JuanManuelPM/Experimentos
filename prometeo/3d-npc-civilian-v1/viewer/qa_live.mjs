import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const ROOT='https://juanmanuelpm.github.io/Experimentos/prometeo/3d-npc-civilian-v1/';
const VIEWER=ROOT+'viewer/';
const expected={
 'civil_azul.glb':'8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b',
 'civil_granate.glb':'09c5cb4646059bff4547849c332a87273203d193a31637974be4ff1d8bca0e3b'
};
const out=resolve('prometeo/3d-npc-civilian-v1/evidence/live');
await mkdir(out,{recursive:true});
const report={schema:'prometeo.3d.public-live-verification/v1',target:ROOT,status:'FAIL',assetChecks:{},desktop:null,mobile:null,errors:[],review:'HUMAN_ART_PENDING'};
let browser;
const grab=async(page,name)=>{
 const file=resolve(out,name);await page.locator('#viewport').screenshot({path:file,type:'jpeg',quality:82});
 return createHash('sha256').update(await readFile(file)).digest('hex');
};
try {
 const root=await fetch(ROOT);if(!root.ok||!(await root.text()).includes('./viewer/'))throw Error('ROOT_REDIRECT_OR_HTTP_FAILED');
 for(const [name,sha] of Object.entries(expected)){
   const res=await fetch(ROOT+'dist/'+name);
   if(!res.ok)throw Error('LIVE_GLB_HTTP_'+name+'_'+res.status);
   const bytes=Buffer.from(await res.arrayBuffer());
   const observed=createHash('sha256').update(bytes).digest('hex');
   if(bytes.subarray(0,4).toString()!=='glTF'||observed!==sha)throw Error('LIVE_GLB_BYTES_CHANGED '+name);
   report.assetChecks[name]={http:res.status,bytes:bytes.length,sha256:observed,validHeader:true};
 }
 browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']});
 const desktop=await browser.newContext({viewport:{width:1280,height:840}});
 const page=await desktop.newPage();
 page.on('pageerror',e=>report.errors.push('desktop pageerror: '+e.message));
 page.on('console',e=>{if(e.type()==='error'&&!e.text().includes('favicon'))report.errors.push('desktop console: '+e.text())});
 const response=await page.goto(VIEWER,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.PROMETEO_QA?.glbLoaded===true,null,{timeout:90000});
 const evidence=await page.evaluate(()=>{
   const c=document.querySelector('#viewport canvas');if(!c)throw Error('no canvas');
   const gl=c.getContext('webgl2');if(!gl)throw Error('no webgl2');
   const s=96,buf=new Uint8Array(s*s*4);gl.readPixels(Math.max(0,gl.drawingBufferWidth/2-s/2|0),Math.max(0,gl.drawingBufferHeight/2-s/2|0),s,s,gl.RGBA,gl.UNSIGNED_BYTE,buf);
   const colors=new Set();for(let i=0;i<buf.length;i+=4)colors.add(buf[i]+'/'+buf[i+1]+'/'+buf[i+2]);
   return {loaded:window.PROMETEO_QA.glbLoaded,variants:window.PROMETEO_QA.variantsLoaded,uv:window.PROMETEO_QA.uvMeshes,skinned:window.PROMETEO_QA.skinnedMeshes,webgl2:true,uniqueRGB:colors.size};
 });
 if(evidence.variants!==2||evidence.uv<10||evidence.skinned<10||evidence.uniqueRGB<12)throw Error('LIVE_WEBGL_PIXELS_MISSING');
 report.desktop={status:response.status(),...evidence};
 report.desktop.fullScreenshotSha256=await grab(page,'public_full_azul.jpg');
 await page.locator('[data-view="face"]').click();
 report.desktop.faceScreenshotSha256=await grab(page,'public_face_azul.jpg');
 await page.locator('[data-skin="granate"]').click();
 report.desktop.faceGranateScreenshotSha256=await grab(page,'public_face_granate.jpg');
 await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const mp=await mobile.newPage();
 mp.on('pageerror',e=>report.errors.push('mobile pageerror: '+e.message));
 const mr=await mp.goto(VIEWER,{waitUntil:'domcontentloaded',timeout:60000});
 await mp.waitForFunction(()=>window.PROMETEO_QA?.glbLoaded===true,null,{timeout:90000});
 await mp.locator('[data-view="face"]').tap();
 report.mobile={status:mr.status(),faceSha256:await grab(mp,'public_mobile_face.jpg'),dims:await mp.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}))};
 if(report.mobile.dims.scrollWidth>report.mobile.dims.viewport+2)throw Error('MOBILE_OVERFLOW');
 await mobile.close();
 if(report.errors.length)throw Error('CONSOLE_ERRORS');
 report.status='PASS';report.result='PUBLIC_URL_WEBGL_AND_ASSET_SHA_VERIFIED_HUMAN_ART_PENDING';
} catch(e){report.errors.push(String(e?.stack||e));console.error(report.errors);}
finally{
 if(browser)await browser.close();
 await writeFile(resolve(out,'LIVE_QA.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({status:report.status,assets:report.assetChecks,desktop:report.desktop,mobile:report.mobile,errors:report.errors}));
 if(report.status!=='PASS')process.exitCode=1;
}
