import fs from "node:fs/promises";import path from "node:path";
const out=path.resolve("worker-lab/horde-fabric/out");await fs.mkdir(out,{recursive:true});
const headers={"content-type":"application/json","apikey":"0000000000","Client-Agent":"worker-lab-fabric:0.1:https://github.com/JuanManuelPM/Experimentos"};
async function fj(url,opt={},timeout=180000){const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{...opt,signal:c.signal}),tx=await r.text();let b;try{b=JSON.parse(tx)}catch{b={raw:tx}};if(!r.ok)throw new Error("HTTP "+r.status+" "+tx.slice(0,300));return b}finally{clearTimeout(t)}}
function cleanJson(text){return JSON.parse(String(text||"").replace(/^\s*\`\`\`(?:json)?/i,"").replace(/\`\`\`\s*$/,"").trim())}
function modelScore(x){const n=String(x.name||"");let s=x.count||0;if(/123b|120b/i.test(n))s+=10000;else if(/72b|70b/i.test(n))s+=9000;else if(/34b|32b/i.test(n))s+=7000;else if(/27b|24b/i.test(n))s+=6000;else if(/14b|12b/i.test(n))s+=4000;return s}
async function runOne(label,prompt,model,max=650){const started=Date.now();const rec={label,model_requested:model.name,active_threads:model.count??null,started_at:new Date().toISOString()};try{const s=await fj("https://aihorde.net/api/v2/generate/text/async",{method:"POST",headers,body:JSON.stringify({prompt,params:{n:1,max_length:max,max_context_length:4096,temperature:.25,top_p:.92,rep_pen:1.03},models:[model.name],slow_workers:true,trusted_workers:false,validated_backends:false})},30000);if(!s.id)throw new Error("No request id");rec.request_id=s.id;const deadline=Date.now()+180000;let final=null;while(Date.now()<deadline){await new Promise(r=>setTimeout(r,4000));const st=await fj("https://aihorde.net/api/v2/generate/text/status/"+s.id,{},30000);rec.queue_position=st?.queue_position??null;rec.wait_time=st?.wait_time??null;if(st?.done){final=st;break}}if(!final)throw new Error("Timeout");const g=final.generations?.[0];rec.model=g?.model||model.name;rec.output=String(g?.text??g?.generation??"").trim();rec.parsed=cleanJson(rec.output);rec.status="PASS"}catch(e){rec.status="FAIL";rec.error=String(e?.message||e)}rec.duration_ms=Date.now()-started;rec.finished_at=new Date().toISOString();return rec}
const snapshot=await fj("https://juanmanuelpm.github.io/Experimentos/visual-snapshot/results/latest.json",{},30000);
const failures=(snapshot.results||[]).filter(x=>(x.errors||[]).length||(x.badResponses||[]).length).map(x=>({id:x.id,mode:x.mode,errors:x.errors,badResponses:x.badResponses}));
const active=await fj("https://aihorde.net/api/v2/status/models?type=text&min_count=1",{},30000);const models=(Array.isArray(active)?active:[]).filter(x=>x?.name).sort((a,b)=>modelScore(b)-modelScore(a));if(!models.length)throw new Error("No active text models");
const mA=models[0],mB=models.find(x=>x.name!==mA.name)||mA,mS=models.find(x=>x.name!==mA.name&&x.name!==mB.name)||mA;
const context=JSON.stringify({observed_failures:failures,visual_rules:["No animar ACTIVE sin señal real","Objeto visible debe corresponder a estado durable real o estar marcado SYNTHETIC DEMO","HTTP 200 no equivale a visual correcto","mobile importa","assets reales y causalidad visible"]});
const pA=`### Instruction:
Sos worker A de un laboratorio aislado. Consumí esta evidencia real: ${context}
Tu entregable es un packet de reparación READ-ONLY para los dos fallos visuales observados. No modifiques Prometeo ni inventes que un asset funciona.
Devolvé JSON válido y nada más:
{"findings":["..."],"repair_packet":{"spaces":{"requirements":["..."],"verification":["..."]},"mask_eye":{"requirements":["..."],"verification":["..."]}},"acceptance":["..."]}
### Response:
`;
const pB=`### Instruction:
Sos worker B, crítico independiente. Consumí esta evidencia real: ${context}
Diseñá un experimento mínimo para probar causalidad worker -> artifact -> dependencia -> siguiente worker sin dashboard genérico ni movimiento falso.
Devolvé JSON válido y nada más:
{"risks":["..."],"fabric_spec":{"events":["..."],"states":["..."],"replay":["..."]},"acceptance":["..."]}
### Response:
`;
const parallelStart=Date.now();const [a,b]=await Promise.all([runOne("asset-worker",pA,mA),runOne("causal-critic",pB,mB)]);const parallel_wall_ms=Date.now()-parallelStart;
const synthPrompt=`### Instruction:
Sos el synthesizer/judge. Tenés dos artifacts candidate de workers independientes.
A=${JSON.stringify(a.parsed||{error:a.error})}
B=${JSON.stringify(b.parsed||{error:b.error})}
Generá un único packet acotado, útil para un builder posterior. No digas que algo fue verificado si no lo fue. Rechazá propuestas vagas.
JSON válido y nada más:
{"decision":"...","asset_repair":{"spaces":["..."],"mask_eye":["..."]},"causal_flow":{"events":["..."],"render_rules":["..."],"replay":["..."]},"experiment":{"input":"...","artifact":"...","browser_checks":["..."]},"acceptance":["..."],"rejected":["..."]}
### Response:
`;
const synth=await runOne("synthesizer",synthPrompt,mS,900);
let schema_valid=false;try{const j=synth.parsed;schema_valid=typeof j?.decision==="string"&&Array.isArray(j?.acceptance)&&Array.isArray(j?.rejected)&&j?.asset_repair&&j?.causal_flow&&j?.experiment}catch{}
const report={run_id:"horde-fabric-"+(process.env.GITHUB_RUN_ID||Date.now()),generated_at:new Date().toISOString(),cost_usd:0,account_required:false,human_actions:0,input:{visual_snapshot_generated_at:snapshot.generated_at,failures},models_considered:models.slice(0,8).map(x=>({name:x.name,count:x.count})),parallel_wall_ms,workers:[a,b],synthesis:synth,independent_models:new Set([a.model,b.model,synth.model].filter(Boolean)).size>=2,schema_valid,status:a.status==="PASS"&&b.status==="PASS"&&synth.status==="PASS"&&schema_valid?"PASS":"CHECK"};
await fs.writeFile(path.join(out,"latest.json"),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,parallel_wall_ms,models:[a.model,b.model,synth.model],schema_valid},null,2));