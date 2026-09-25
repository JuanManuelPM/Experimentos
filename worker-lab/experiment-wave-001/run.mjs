import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve('worker-lab/experiment-wave-001');
const out=path.join(root,'out');
await fs.mkdir(out,{recursive:true});
const server=spawn('python3',['-m','http.server','4173','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
await new Promise(r=>setTimeout(r,900));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({permissions:['notifications'],viewport:{width:1280,height:720}});
const page=await context.newPage();
const errors=[];
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.screenshot({path:path.join(out,'tv-screen.png'),fullPage:false});
const caps=await page.evaluate(()=>window.__wave001.capabilities);
await page.click('#done');
await page.waitForTimeout(350);
await page.click('#blocked');
await page.waitForTimeout(350);
await page.click('#notify');
await page.waitForTimeout(350);
const state=await page.evaluate(()=>window.__wave001.state);
const media=await page.evaluate(async()=>{
  const urls=['generated/bell.wav','generated/voice-dry.wav','generated/voice-fast.wav','generated/voice-low.wav'];
  const results=[];
  for(const src of urls){
    const a=new Audio(src);
    const r=await new Promise(resolve=>{
      const timer=setTimeout(()=>resolve({src,ok:false,error:'metadata timeout'}),5000);
      a.onloadedmetadata=()=>{clearTimeout(timer);resolve({src,ok:true,duration:a.duration})};
      a.onerror=()=>{clearTimeout(timer);resolve({src,ok:false,error:'media error'})};
    });
    results.push(r);
  }
  return results;
});
const result={
  run_id:'WAVE001-'+new Date().toISOString(),
  browser_load:true,
  capabilities:caps,
  interactions:state,
  media,
  console_errors:errors,
  screenshot:'tv-screen.png',
  technical_status:(errors.length===0 && media.every(x=>x.ok) && state.doneClicks===1 && state.blockedClicks===1)?'PASS':'CHECK'
};
await fs.writeFile(path.join(out,'browser-result.json'),JSON.stringify(result,null,2));
await browser.close();
server.kill('SIGTERM');
console.log(JSON.stringify(result,null,2));