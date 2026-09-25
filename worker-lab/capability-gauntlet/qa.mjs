import {chromium} from 'playwright';import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';
const root=path.resolve('worker-lab/capability-gauntlet'),out=path.join(root,'out');await fs.mkdir(out,{recursive:true});const srv=spawn('python3',['-m','http.server','4182','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});await new Promise(r=>setTimeout(r,700));const browser=await chromium.launch({headless:true});const results=[];
async function check(name,url,viewport,action){const c=await browser.newContext({viewport});const p=await c.newPage();const errors=[];p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('pageerror',e=>errors.push(String(e)));const t=Date.now();await p.goto(url,{waitUntil:'networkidle'});if(action)await action(p);await p.screenshot({path:path.join(out,name+'.png'),fullPage:false});results.push({name,ms:Date.now()-t,errors,title:await p.title(),size:viewport});await c.close()}
await check('index-mobile','http://127.0.0.1:4182/',{width:390,height:844});
await check('visual-desktop','http://127.0.0.1:4182/visual-world.html',{width:1280,height:720},async p=>{await p.waitForTimeout(1800);await p.mouse.click(500,300);await p.waitForTimeout(300);await p.click('[data-mode="eye"]');await p.waitForTimeout(250);await p.click('[data-mode="bell"]');await p.waitForTimeout(250)});
await check('visual-mobile','http://127.0.0.1:4182/visual-world.html',{width:390,height:844},async p=>{await p.waitForTimeout(1800);await p.tap?null:null;await p.click('[data-mode="eye"]');await p.waitForTimeout(250)});
await check('voice-mobile','http://127.0.0.1:4182/voice-local.html',{width:390,height:844});
await check('provider-mobile','http://127.0.0.1:4182/provider-gauntlet.html',{width:390,height:844});

{
 const c=await browser.newContext({viewport:{width:390,height:844}});
 const p=await c.newPage();const errors=[];p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('pageerror',e=>errors.push(String(e)));
 const t=Date.now();await p.goto('http://127.0.0.1:4182/voice-local.html',{waitUntil:'networkidle'});
 await p.click('#piperBtn');
 let status='';try{
   await p.waitForFunction(()=>{const s=document.querySelector('#piperStatus')?.textContent||'';return /^listo/i.test(s)||/^ERROR/i.test(s)},null,{timeout:180000});
   status=await p.locator('#piperStatus').textContent();
 }catch(e){status='TIMEOUT · '+String(e?.message||e)}
 await p.screenshot({path:path.join(out,'piper-smoke.png'),fullPage:false});
 results.push({name:'piper-local-smoke',ms:Date.now()-t,errors,title:await p.title(),size:{width:390,height:844},status});
 await c.close();
}
await browser.close();srv.kill('SIGTERM');const report={generated_at:new Date().toISOString(),verdict:results.every(r=>r.errors.length===0)?'TECHNICAL_PASS':'CHECK',results};await fs.writeFile(path.join(out,'latest.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));