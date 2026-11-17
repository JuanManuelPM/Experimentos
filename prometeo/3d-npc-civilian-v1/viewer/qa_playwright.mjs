import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root=resolve('prometeo/3d-npc-civilian-v1');
const evidence=resolve(root,'evidence');
await mkdir(evidence,{recursive:true});
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
const errors=[];
let browser;
const pause=ms=>new Promise(res=>setTimeout(res,ms));
async function snap(page,filename,selector='#viewport'){
 await pause(650);
 const path=resolve(evidence,filename);
 await page.locator(selector).screenshot({path,type:'jpeg',quality:78});
 return createHash('sha256').update(await readFile(path)).digest('hex');
}
async function inspectPixels(page){
 return await page.evaluate(()=>{
 const c=document.querySelector('#viewport canvas');
 if(!c)throw Error('MISSING_CANVAS');
 const gl=c.getContext('webgl2');
 if(!gl)throw Error('NO_WEBGL2_CONTEXT');
 const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,side=Math.min(128,w,h);
 const x=Math.max(0,Math.floor((w-side)/2)),y=Math.max(0,Math.floor((h-side)/2));
 const buf=new Uint8Array(side*side*4);
 gl.readPixels(x,y,side,side,gl.RGBA,gl.UNSIGNED_BYTE,buf);
 const colors=new Set();
 for(let i=0;i<buf.length;i+=4)colors.add(buf[i]+'/'+buf[i+1]+'/'+buf[i+2]);
 return {webgl2:true,buffer:[w,h],sampleSide:side,uniqueRGB:colors.size};
 });
}
async function ready(page){
 await page.goto('http://127.0.0.1:8765/viewer/',{waitUntil:'domcontentloaded',timeout:55000});
 await page.waitForFunction(()=>window.PROMETEO_QA?.glbLoaded===true,null,{timeout:60000});
 return page.evaluate(()=>({loaded:window.PROMETEO_QA.glbLoaded,variants:window.PROMETEO_QA.variantsLoaded,uv:window.PROMETEO_QA.uvMeshes,skinned:window.PROMETEO_QA.skinnedMeshes,meshes:window.PROMETEO_QA.meshes,triangles:window.PROMETEO_QA.faces}));
}
const report={schema:'prometeo.3d.webgl-qa/v1',status:'FAIL',source:'Actual Chromium browser screenshots',desktop:{},androidViewport:{},errors,sourceGLB:'real separate generated two variants',artApproval:'NOT_RUN'};
try{
 await pause(1300);
 browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']});
 const desktop=await browser.newContext({viewport:{width:1280,height:840},deviceScaleFactor:1});
 const page=await desktop.newPage();
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon.ico'))errors.push('console: '+m.text())});
 report.desktop.geometry=await ready(page);
 report.desktop.pixels=await inspectPixels(page);
 if(report.desktop.geometry.variants!==2||report.desktop.geometry.uv<1||report.desktop.geometry.skinned<1)throw Error('MESH_UV_RIG_VIEWER_GATE_FAIL');
 if(report.desktop.pixels.uniqueRGB<12)throw Error('FRAME_PIXEL_DIVERSITY_FAIL '+report.desktop.pixels.uniqueRGB);
 report.desktop.fullBlueSha256=await snap(page,'full_azul.jpg');
 await page.locator('[data-view="face"]').click();
 report.desktop.faceSha256=await snap(page,'face_azul.jpg');
 await page.locator('[data-view="hands"]').click();
 report.desktop.handsSha256=await snap(page,'hands_azul.jpg');
 await page.locator('[data-view="outfit"]').click();
 report.desktop.outfitSha256=await snap(page,'outfit_azul.jpg');
 await page.locator('[data-view="full"]').click();
 await page.locator('[data-skin="granate"]').click();
 report.desktop.granateSha256=await snap(page,'full_granate.jpg');
 if(report.desktop.fullBlueSha256===report.desktop.granateSha256)throw Error('VARIANTS_VISUALLY_IDENTICAL');
 await page.locator('[data-view="back"]').click();
 report.desktop.backSha256=await snap(page,'back_granate.jpg');
 await page.locator('#spin').click();
 await pause(1250);
 report.desktop.orbitSha256=await snap(page,'orbit_granate.jpg');
 await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const mp=await mobile.newPage();
 mp.on('pageerror',e=>errors.push('mobile pageerror: '+e.message));
 report.androidViewport.geometry=await ready(mp);
 await mp.locator('[data-view="face"]').tap();
 report.androidViewport.faceSha256=await snap(mp,'android_face.jpg');
 report.androidViewport.overflow=await mp.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth,buttons:[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width<40||r.height<40}).length}));
 if(report.androidViewport.overflow.scrollWidth>report.androidViewport.overflow.innerWidth+2)throw Error('ANDROID_HORIZONTAL_OVERFLOW');
 if(report.androidViewport.overflow.buttons>0)throw Error('ANDROID_SMALL_BUTTONS');
 await mobile.close();
 if(errors.length)throw Error('BROWSER_CONSOLE_ERRORS '+JSON.stringify(errors));
 report.status='WEBGL_CAPTURED';report.verdict='TECHNICAL_PASS_ART_HUMAN_PENDING';
}catch(err){
 errors.push('QA_FAILED: '+(err?.stack||String(err)));
 console.error(errors.join('\n'));
}finally{
 if(browser)await browser.close();
 server.kill('SIGTERM');
 await writeFile(resolve(evidence,'WEBGL_QA.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({status:report.status,desktop:report.desktop,android:report.androidViewport,errors:report.errors},null,2));
 if(report.status!=='WEBGL_CAPTURED')process.exitCode=1;
}
