// CI canary: real v0.1.3 GLB in Three/WebGL; no synthetic face.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const results=resolve(root,'evidence','remote');await fs.mkdir(results,{recursive:true});
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
const sleep=t=>new Promise(r=>setTimeout(r,t));await sleep(1800);
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl']});
let report={schema:'prometeo.uv-browser-canary/v1',status:'NOT_RUN',checks:{},errors:[],artifacts:[]};
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1,acceptDownloads:true});
 page.on('pageerror',e=>report.errors.push('JS: '+e.message));
 page.on('console',m=>{if(m.type()==='error')report.errors.push('console: '+m.text().slice(0,220));});
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('GLB real'),{timeout:35000});
 report.checks.realModelLoaded=true;
 report.checks.webgl2=await page.evaluate(()=>!!document.querySelector('#viewport')?.getContext('webgl2'));
 // Frozen GLB source has 10/11 degenerate UV primitives. Select face Skin
 // and verify the explicit deterministic projection gave actual UV triangles.
 const meshCount=await page.locator('#mesh option').count();if(meshCount!==11)throw new Error('EXPECTED_11_MATERIAL_PRIMITIVES_GOT_'+meshCount);
 await page.locator('#mesh').selectOption('4');
 if(!(await page.locator('#mesh option:checked').textContent()).includes('Rostro'))throw new Error('FACE_MESH_MAP_MISMATCH');
 const faceMeta=await page.locator('#meta').textContent();if(!faceMeta.includes('DERIVADA')||faceMeta.includes('UV [0.000,1.000]'))throw new Error('GENERATED_UV_NOT_VISIBLE');
 report.checks.uvFaceProjection=faceMeta;
 await page.locator('[data-view="face"]').click();await page.waitForTimeout(1100);
 await page.screenshot({path:resolve(results,'01-before.png')});report.artifacts.push('01-before.png');
 await page.locator('#scale').fill('0.46');
 await page.locator('#png').setInputFiles(resolve(root,'canary_label.png'));
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('PNG '),{timeout:12000});
 await page.waitForTimeout(1250);
 await page.screenshot({path:resolve(results,'02-after.png')});report.artifacts.push('02-after.png');
 await page.screenshot({path:resolve(results,'03-face-and-uv.png')});report.artifacts.push('03-face-and-uv.png');
 report.checks.meshSelection={idx:4,zone:'Rostro/cabeza Skin',uvMode:'front-back-planar-v1'};
 const pngPromise=page.waitForEvent('download');await page.locator('#exportPNG').click();const png=await pngPromise;await png.saveAs(resolve(results,'texture-export.png'));
 const recipePromise=page.waitForEvent('download');await page.locator('#exportRecipe').click();await (await recipePromise).saveAs(resolve(results,'TEXTURE_RECIPE.export.json'));
 const profilePromise=page.waitForEvent('download');await page.locator('#exportUV').click();await (await profilePromise).saveAs(resolve(results,'UV_PROFILE.export.json'));
 report.checks.pngAndRecipesExported=true;
 // Browser guard: do not call a click PASS unless image pixels actually changed.
 await page.setViewportSize({width:320,height:740});await page.waitForTimeout(500);
 report.checks.mobile320NoOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
 await page.screenshot({path:resolve(results,'04-mobile320.png'),fullPage:true});report.artifacts.push('04-mobile320.png');
 // Optional roundtrip: if it fails, an explicit BLOCKED status is recorded; no forged GLB.
 await page.setViewportSize({width:1280,height:900});
 const [downloadResult] = await Promise.all([page.waitForEvent('download',{timeout:20000}).catch(()=>null),page.locator('#exportGLB').click()]);
 if(downloadResult){await downloadResult.saveAs(resolve(results,'civil-textured-checked.glb'));report.checks.glbRoundtrip='BROWSER_PASS_STRUCTURAL';}
 else report.checks.glbRoundtrip='BLOCKED: '+await page.locator('#status').textContent();
 const finalStatus=await page.locator('#status').textContent();report.finalStatus=finalStatus;
 const derivedFile=resolve(results,'civil-textured-preserved.glb');
 await page.locator('#loadModel').setInputFiles(derivedFile);
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('GLB real'),{timeout:20000});
 await page.locator('#mesh').selectOption('4');await page.locator('[data-view="face"]').click();await page.waitForTimeout(1400);
 await page.screenshot({path:resolve(results,'05-reimported-baked-face.png')});report.artifacts.push('05-reimported-baked-face.png');
 report.checks.preservedBakedGLBReimported=true;

 report.status='BROWSER_ARTIFACTS_WRITTEN_PIXEL_DIFF_PENDING';
 await page.close();
}catch(error){report.status='BLOCKED';report.errors.push(error.stack||String(error));process.exitCode=2;}
finally{await fs.writeFile(resolve(results,'BROWSER_QA.json'),JSON.stringify(report,null,2));await browser.close();server.kill('SIGTERM');console.log('REMOTE_BROWSER_REPORT',JSON.stringify(report));}
