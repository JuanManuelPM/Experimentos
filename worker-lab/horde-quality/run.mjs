import fs from "node:fs/promises";import path from "node:path";
const out=path.resolve("worker-lab/horde-quality/out");await fs.mkdir(out,{recursive:true});
const prompt=`### Instruction:
Actuá como crítico de diseño de una interfaz experimental de workers.
Contexto: una pantalla muestra veinte agentes moviéndose todo el tiempo aunque muchos estén esperando. Hay texto pequeño, cinco paneles, dos gráficos, estados ACTIVE que no garantizan liveness, y una vista visual tipo juego con objetos reales.
Objetivo: proponer una mejora concreta que haga visible causalidad real trabajo → artifact → dependencia sin convertir la pantalla en un dashboard corporativo.
Devolvé JSON válido y nada más:
{"problems":["...","...","..."],"proposal":"...","acceptance":["...","...","..."]}
### Response:
`;
const headers={"content-type":"application/json","apikey":"0000000000","Client-Agent":"worker-lab-quality:0.1:https://github.com/JuanManuelPM/Experimentos"};
async function fj(url,opt={},timeout=180000){const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{...opt,signal:c.signal}),tx=await r.text();let b;try{b=JSON.parse(tx)}catch{b={raw:tx}};if(!r.ok)throw new Error("HTTP "+r.status+" "+tx.slice(0,300));return b}finally{clearTimeout(t)}}
const started=Date.now();let report={run_id:"horde-quality-"+(process.env.GITHUB_RUN_ID||Date.now()),started_at:new Date().toISOString(),human_actions:0,cost_usd:0,account_required:false};
try{
 const active=await fj("https://aihorde.net/api/v2/status/models?type=text&min_count=1",{},30000);
 const candidates=(Array.isArray(active)?active:[]).filter(x=>x?.name).sort((a,b)=>(b.count||0)-(a.count||0));
 if(!candidates.length)throw new Error("No active text model");
 const chosen=candidates[0];report.requested_model=chosen.name;report.active_threads=chosen.count??null;
 const s=await fj("https://aihorde.net/api/v2/generate/text/async",{method:"POST",headers,body:JSON.stringify({prompt,params:{n:1,max_length:500,max_context_length:2048,temperature:.35,top_p:.92,rep_pen:1.03},models:[chosen.name],slow_workers:true,trusted_workers:false,validated_backends:false})},30000);
 if(!s.id)throw new Error("No request id");
 report.request_id=s.id;const deadline=Date.now()+150000;let final=null;
 while(Date.now()<deadline){await new Promise(r=>setTimeout(r,5000));const st=await fj("https://aihorde.net/api/v2/generate/text/status/"+s.id,{},30000);report.queue_position=st?.queue_position??null;report.wait_time=st?.wait_time??null;if(st?.done){final=st;break}}
 if(!final)throw new Error("Timeout after 150s");
 const g=final.generations?.[0];const text=String(g?.text??g?.generation??"").trim();report.model=g?.model||chosen.name;report.output=text;
 let parsed=null,valid=false;try{parsed=JSON.parse(text.replace(/^\`\`\`(?:json)?/i,"").replace(/\`\`\`$/,"").trim());valid=Array.isArray(parsed?.problems)&&typeof parsed?.proposal==="string"&&Array.isArray(parsed?.acceptance)}catch{}
 report.parsed=parsed;report.schema_valid=valid;report.status=valid?"PASS":"OUTPUT_NOT_JSON";
}catch(e){report.status="UNAVAILABLE";report.error=String(e?.message||e)}
report.duration_ms=Date.now()-started;report.finished_at=new Date().toISOString();await fs.writeFile(path.join(out,"latest.json"),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));