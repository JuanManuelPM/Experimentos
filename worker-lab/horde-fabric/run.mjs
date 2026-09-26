import fs from "node:fs/promises";import path from "node:path";
const out=path.resolve("worker-lab/horde-fabric/out");await fs.mkdir(out,{recursive:true});
const headers={"content-type":"application/json","apikey":"0000000000","Client-Agent":"worker-lab-fabric:0.2:https://github.com/JuanManuelPM/Experimentos"};
async function fj(url,opt={},timeout=180000){const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{...opt,signal:c.signal}),tx=await r.text();let b;try{b=JSON.parse(tx)}catch{b={raw:tx}};if(!r.ok)throw new Error("HTTP "+r.status+" "+tx.slice(0,300));return b}finally{clearTimeout(t)}}
function firstJson(text){const s=String(text||"").replace(/^\s*```(?:json)?/i,"").replace(/```\s*$/,"");let start=s.indexOf("{");if(start<0)throw new Error("No JSON object");let depth=0,str=false,esc=false;for(let i=start;i<s.length;i++){const ch=s[i];if(str){if(esc)esc=false;else if(ch==="\\")esc=true;else if(ch==='"')str=false;continue}if(ch==='"'){str=true;continue}if(ch==="{")depth++;else if(ch==="}"&&--depth===0)return JSON.parse(s.slice(start,i+1))}throw new Error("Truncated JSON")}
function modelScore(x){const n=String(x.name||"");let s=x.count||0;if(/123b|120b/i.test(n))s+=10000;else if(/72b|70b/i.test(n))s+=9000;else if(/34b|32b/i.test(n))s+=7000;else if(/27b|24b/i.test(n))s+=6000;else if(/14b|12b/i.test(n))s+=4000;return s}
async function runOne(label,prompt,model,max){const started=Date.now();const rec={label,model_requested:model.name,active_threads:model.count??null,max_length:max,started_at:new Date().toISOString()};try{const s=await fj("https://aihorde.net/api/v2/generate/text/async",{method:"POST",headers,body:JSON.stringify({prompt,params:{n:1,max_length:max,max_context_length:3072,temperature:.18,top_p:.9,rep_pen:1.04},models:[model.name],slow_workers:true,trusted_workers:false,validated_backends:false})},30000);if(!s.id)throw new Error("No request id");rec.request_id=s.id;const deadline=Date.now()+165000;let final=null;while(Date.now()<deadline){await new Promise(r=>setTimeout(r,4000));const st=await fj("https://aihorde.net/api/v2/generate/text/status/"+s.id,{},30000);rec.queue_position=st?.queue_position??null;rec.wait_time=st?.wait_time??null;if(st?.done){final=st;break}}if(!final)throw new Error("Timeout");const g=final.generations?.[0];rec.model=g?.model||model.name;rec.output=String(g?.text??g?.generation??"").trim();rec.parsed=firstJson(rec.output);rec.status="PASS"}catch(e){rec.status="FAIL";rec.error=String(e?.message||e)}rec.duration_ms=Date.now()-started;rec.finished_at=new Date().toISOString();return rec}
const [snapshot,repair]=await Promise.all([
 fj("https://juanmanuelpm.github.io/Experimentos/visual-snapshot/results/latest.json",{},30000),
 fj("https://juanmanuelpm.github.io/Experimentos/asset-repair/results/latest.json",{},30000).catch(()=>null)
]);
const failures=(snapshot.results||[]).filter(x=>(x.errors||[]).length||(x.badResponses||[]).length).map(x=>({id:x.id,mode:x.mode,errors:x.errors,badResponses:x.badResponses}));
const repairEvidence=repair?.status==="PASS"?{status:repair.status,spaces:{title:repair.selected?.spaces?.title,kind:repair.selected?.spaces?.kind,license:repair.selected?.spaces?.license,browser:repair.browser_verification?.status},eye:{title:repair.selected?.eye?.title,kind:repair.selected?.eye?.kind,license:repair.selected?.eye?.license,browser:repair.browser_verification?.status}}:null;
const active=await fj("https://aihorde.net/api/v2/status/models?type=text&min_count=1",{},30000);const models=(Array.isArray(active)?active:[]).filter(x=>x?.name).sort((a,b)=>modelScore(b)-modelScore(a));if(!models.length)throw new Error("No active text models");
const mA=models[0],mB=models.find(x=>x.name!==mA.name)||mA,mS=mA;
const evidence=JSON.stringify({failures,verified_repair:repairEvidence,rules:["no ACTIVE=>alive","no fake movement","HTTP 200 is not visual proof","mobile required"]});
const pA=`### Instruction:
Revisá esta evidencia real READ-ONLY: ${evidence}
Entregá un packet MUY CORTO de reparación. No inventes verificación. Cada string <= 14 palabras.
JSON exacto, sin markdown:
{"spaces":{"cause":"x","fix":"x","verify":["x","x"]},"eye":{"cause":"x","fix":"x","verify":["x","x"]}}
### Response:`;
const pB=`### Instruction:
Diseñá el mínimo protocolo causal worker->artifact->dependency->worker usando esta evidencia: ${evidence}
No dashboard; ningún movimiento sin evento real. Cada string <= 6 palabras.
JSON exacto, sin markdown:
{"events":["x"],"states":["x"],"checks":["x","x"],"replay":["x"]}
### Response:`;
const parallelStart=Date.now();const [a,b]=await Promise.all([runOne("asset-reviewer",pA,mA,360),runOne("causal-critic",pB,mB,360)]);const parallel_wall_ms=Date.now()-parallelStart;
const synthPrompt=`### Instruction:
Juzgá y sintetizá dos candidate artifacts.
A=${JSON.stringify(a.parsed||{error:a.error})}
B=${JSON.stringify(b.parsed||{error:b.error})}
Conservá sólo acciones concretas respaldadas por evidencia. Cada string <= 12 palabras.
JSON exacto, sin markdown:
{"decision":"x","repairs":["x","x"],"flow":["x","x","x"],"checks":["x","x","x"],"rejected":["x"]}
### Response:`;
await new Promise(r=>setTimeout(r,1500));const synth=await runOne("synthesizer-judge",synthPrompt,mS,420);
let schema_valid=false;try{const j=synth.parsed;schema_valid=typeof j?.decision==="string"&&Array.isArray(j?.repairs)&&j.repairs.length>=2&&Array.isArray(j?.flow)&&j.flow.length>=2&&Array.isArray(j?.checks)&&j.checks.length>=2&&Array.isArray(j?.rejected)}catch{}
const report={run_id:"horde-fabric-"+(process.env.GITHUB_RUN_ID||Date.now()),generated_at:new Date().toISOString(),cost_usd:0,account_required:false,human_actions:0,input:{visual_snapshot_generated_at:snapshot.generated_at,failures,verified_repair:repairEvidence},anonymous_constraints:{max_output_tokens_observed:"<=512 avoids KudosUpfront in current conditions",submission_rate_observed:"<=2 per second"},models_considered:models.slice(0,8).map(x=>({name:x.name,count:x.count})),parallel_wall_ms,workers:[a,b],synthesis:synth,independent_worker_models:(a.model&&b.model)?a.model!==b.model:mA.name!==mB.name,synthesis_reuses_best_model:true,schema_valid,status:a.status==="PASS"&&b.status==="PASS"&&synth.status==="PASS"&&schema_valid?"PASS":"CHECK"};
await fs.writeFile(path.join(out,"latest.json"),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,parallel_wall_ms,workers:report.workers.map(x=>({status:x.status,model:x.model,error:x.error})),synthesis:{status:synth.status,model:synth.model,error:synth.error},schema_valid},null,2));