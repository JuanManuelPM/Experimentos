// DEEP-SPEC-1 · control estructural, no oráculo artístico.
function inspectDeepSpec(s){
 const errors=[], need=(ok,why)=>{if(!ok)errors.push(why)}, str=(v,n=15)=>typeof v==="string"&&v.trim().length>=n;
 const arr=(v)=>Array.isArray(v)?v:[], uniq=(a)=>new Set(a).size===a.length;
 need(s?.version==="DEEP-SPEC-1","version");
 need(str(s?.medium,2),"medium");need(["DIRECTO","OPERATIVO","SISTEMA"].includes(s?.depth),"depth");
 need(str(s?.brief,15),"brief");need(str(s?.intent?.experience,18),"intent.experience");need(str(s?.intent?.distinctAbility,18),"intent.distinctAbility");
 const refs=arr(s?.references),components=arr(s?.components),questions=arr(s?.questions),decisions=arr(s?.decisions),relations=arr(s?.relations),risks=arr(s?.risks),acceptance=arr(s?.acceptance);
 const n=s?.depth==="DIRECTO"?1:s?.depth==="SISTEMA"?3:2;
 need(refs.some(r=>r.status==="OBSERVED"&&str(r.url,12)&&str(r.observation,35))||str(s?.environmentLimits,45),"observed reference or explicit environmental limit");
 need(components.length>=n,"components by depth");need(questions.length>=n,"specific questions by depth");
 const ids=components.map(x=>x.id), qids=questions.map(x=>x.id),rids=refs.filter(x=>x.status==="OBSERVED").map(x=>x.id);
 need(uniq(ids)&&uniq(qids)&&uniq(rids),"unique ids");
 for(const c of components){need(str(c.id,2)&&str(c.role,15)&&str(c.strategy,15)&&str(c.constraints,25),"component "+(c.id||"?")+" incomplete")}
 for(const q of questions){
  need(str(q.id,2)&&ids.includes(q.target)&&str(q.question,30)&&arr(q.alternatives).length>=2&&str(q.finding,25)&&str(q.decisionImpact,25),"question "+(q.id||"?")+" not specific/actionable");
  need(rids.includes(q.evidenceRef)||str(s?.environmentLimits,45),"question "+(q.id||"?")+" lacks observed source");
 }
 need(decisions.length>=n,"decisions by depth");
 for(const d of decisions)need(str(d.id,2)&&qids.includes(d.questionId)&&arr(d.componentIds).some(id=>ids.includes(id))&&str(d.choice,12)&&str(d.rejected,12)&&str(d.productionChange,30)&&str(d.why,25),"decision "+(d.id||"?")+" not linked to production");
 need(relations.length>=1,"component relationships");
 for(const rel of relations)need((ids.includes(rel.from)||rel.from==="ENV")&&(ids.includes(rel.to)||rel.to==="ENV")&&rel.from!==rel.to&&str(rel.invariant,25)&&str(rel.failure,25)&&str(rel.test,20),"relation not verifiable");
 need(risks.length>=1,"risks");
 let spike=false,blocked=false;
 for(const risk of risks){
   need(arr(risk.componentIds).some(id=>ids.includes(id))&&["low","medium","high"].includes(risk.severity)&&str(risk.failure,22)&&str(risk.prevention,22)&&str(risk.test,22)&&["OBSERVED","NOT_RUN","FAILED"].includes(risk.status),"risk incomplete");
   if(risk.severity==="high"&&risk.status==="NOT_RUN")spike=true;
   if(risk.severity==="high"&&risk.status==="FAILED")blocked=true;
 }
 need(acceptance.length>=1,"acceptance");
 for(const a of acceptance)need(["logic","visual","audio","interactive","functional"].includes(a.kind)&&str(a.criterion,22)&&str(a.oracle,22)&&["OBSERVED","NOT_RUN","FAILED"].includes(a.status),"acceptance incomplete");
 need(str(s?.licensing,15),"licensing/source policy");
 need(str(s?.resources,15),"resources/tool choice");
 if(errors.length)return {gate:"INVALID",errors}; if(blocked)return {gate:"BLOCKED",errors}; if(spike)return {gate:"SPIKE_REQUIRED",errors};
 return {gate:"READY_FOR_FIRST_SLICE",errors};
}
export { inspectDeepSpec };
