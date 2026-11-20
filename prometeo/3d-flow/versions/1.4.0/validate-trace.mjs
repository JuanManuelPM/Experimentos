// PROMETEO Studio-3D · stage trace validator 1.4.0
// This is a LEARNING DIAGNOSTIC, not a license to abort an ugly or unfinished scene.
export const STAGES=['scope','recovery','planning','acquisition','classification','humanoid','props','environment','fx','assembly','orientation','acting','cinema','qa','repair','persistence','publish'];
const sha64=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const str=x=>typeof x==='string'&&x.trim().length>0;
export function validateStageTrace(trace,expectedFlowHash){
 const errors=[],warn=[];
 if(trace?.schema!=='prometeo.3d.stage-trace/v1')errors.push('TRACE_SCHEMA');
 if(!str(trace?.projectId)||!str(trace?.version))errors.push('WORK_ID');
 if(trace?.flow?.version!=='1.4.0'||!sha64(trace?.flow?.sha256Canonical))errors.push('FLOW_LOCK');
 if(expectedFlowHash&&trace?.flow?.sha256Canonical!==expectedFlowHash)errors.push('FLOW_HASH_MISMATCH');
 if(!str(trace?.briefLock?.rawText)||!sha64(trace?.briefLock?.sha256)||!str(trace?.briefLock?.briefId))errors.push('HUMAN_BRIEF_NOT_LOCKED');
 if(!str(trace?.product?.sourceRef)||!str(trace?.product?.scopeDelivered))errors.push('PRODUCT_NOT_REFERENCED');
 if(!['PUBLIC_PREVIEW','SOURCE_ONLY_TECHNICAL_BLOCKER','NOT_PUBLISHED_WITH_REASON'].includes(trace?.product?.previewStatus))errors.push('PREVIEW_STATUS');
 if(!Array.isArray(trace?.stages))errors.push('STAGES_MISSING');
 const seen=new Set();
 for(const row of trace?.stages||[]){
   const id=row?.stage;
   if(!STAGES.includes(id))errors.push('UNKNOWN_STAGE_'+id);
   if(seen.has(id))errors.push('DUPLICATE_STAGE_'+id);
   seen.add(id);
   if(!['EXECUTED','SKIPPED','NOT_RUN'].includes(row?.status))errors.push('STATUS_'+id);
   if(!str(row?.conclusion))errors.push('CONCLUSION_'+id);
   if(row?.status==='EXECUTED'&&(!str(row?.action)||!str(row?.decision)))errors.push('ACTUAL_WORK_MISSING_'+id);
   if(row?.status!=='EXECUTED'&&!str(row?.action))errors.push('SKIP_REASON_'+id);
   if(!Array.isArray(row?.evidenceRefs))errors.push('EVIDENCE_REFS_'+id);
   if(row?.status==='EXECUTED'&&(!Array.isArray(row?.evidenceRefs)||row.evidenceRefs.length===0))warn.push('UNSUPPORTED_WORK_CLAIM_'+id);
   if(row?.evidenceLevel==='GPU_RENDER'&&!(row.evidenceRefs||[]).some(x=>/\.png$|\.jpe?g$|\.webp$|\.mp4$|\.webm$|browser-capture|screenshot/i.test(x)))warn.push('GPU_RENDER_WITHOUT_IMAGE_PROOF_'+id);
 }
 for(const id of STAGES)if(!seen.has(id))errors.push('MISSING_STAGE_'+id);
 if(Array.isArray(trace?.stages)&&trace.stages.length!==17)errors.push('STAGE_COUNT');
 return{ok:errors.length===0,errors,warnings:warn,mustContinueProduction:true,neverSelfRejectArt:true};
}
