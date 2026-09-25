import {chromium} from "playwright";import fs from "node:fs/promises";import path from "node:path";
const out=path.resolve("worker-lab/visual-snapshot/out");await fs.mkdir(out,{recursive:true});
const routes=[
 ["visual-index","https://juanmanuelpm.github.io/prometeo/visuals/"],
 ["trail","https://juanmanuelpm.github.io/prometeo/visuals/trail-lab/"],
 ["spaces","https://juanmanuelpm.github.io/prometeo/visuals/spaces-lab/"],
 ["player","https://juanmanuelpm.github.io/prometeo/visuals/player-lab/"],
 ["mask-eye","https://juanmanuelpm.github.io/prometeo/visuals/mask-eye-lab/"],
 ["audio-hand","https://juanmanuelpm.github.io/prometeo/strategy/audio-viz-hand/"]
];
const browser=await chromium.launch({headless:true});const results=[];
for(const [id,url] of routes){
 for(const [suffix,vp] of [["desktop",{width:1280,height:720}],["mobile",{width:390,height:844}]]){
  const c=await browser.newContext({viewport:vp});const p=await c.newPage();const errors=[],badResponses=[];p.on("console",m=>{if(m.type()==="error")errors.push(m.text())});p.on("pageerror",e=>errors.push(String(e)));p.on("response",r=>{if(r.status()>=400)badResponses.push({status:r.status(),url:r.url()})});p.on("requestfailed",r=>badResponses.push({status:"FAILED",url:r.url(),error:r.failure()?.errorText||""}));
  const t=Date.now();let status=null,title="";try{const resp=await p.goto(url,{waitUntil:"domcontentloaded",timeout:30000});status=resp?.status()??null;await p.waitForTimeout(2500);title=await p.title();await p.screenshot({path:path.join(out,id+"-"+suffix+".png"),fullPage:false})}catch(e){errors.push(String(e?.message||e))}
  results.push({id,mode:suffix,url,http_status:status,title,ms:Date.now()-t,errors,badResponses});await c.close();
 }
}
await browser.close();const report={generated_at:new Date().toISOString(),source:"READ_ONLY_PUBLIC_PROMETEO",results,pass:results.filter(x=>x.http_status===200&&x.errors.length===0).length,total:results.length};await fs.writeFile(path.join(out,"latest.json"),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));