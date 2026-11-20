// PROMETEO 3D 1.4.0 · Diagnostic-only prevention. Errors NEVER authorize scope reduction, cancellation or refusal to publish a candidate; keep full production.
const validId = s=>typeof s==='string'&&/^[a-z0-9][a-z0-9-]{2,60}$/.test(s);
const nonempty = s=>typeof s==='string'&&s.trim().length>0;
const hash40 = s=>typeof s==='string'&&/^[a-f0-9]{40}$/.test(s);
const high = e=>e.visibility==='HERO'||e.visibility==='CLOSEUP';
const human = e=>e.kind==='human'||e.kind==='npc'||e.kind==='animal';
const technical = e=>e.kind==='mechanism'||e.kind==='educational-part';
const direct3d = new Set(['LICENSED_TEXTURED_ASSET','EDITABLE_MODELED_ASSET','TEXTURED_IMPOSTOR']);
const techniques = new Set([...direct3d,'MECHANICAL_PARAMETRIC','BLOCKOUT_ONLY','RUNTIME_PRIMITIVE_COMPOSITE']);
const status = new Set(['PLANNED','SOURCE_VERIFIED','FIRST_ARTICLE_ACCEPTED','SOURCE_ONLY']);
function checkBase(plan){
 const errors=[];
 if(plan?.schema!=='prometeo.3d.preventive-blueprint/v1')errors.push('SCHEMA');
 if(!validId(plan?.sceneId))errors.push('SCENE_ID');
 if(plan?.flowVersion!=='1.4.0')errors.push('FLOW_VERSION');
 if(!status.has(plan?.status))errors.push('STATUS');
 if(!Array.isArray(plan?.entities)||!plan.entities.length)errors.push('ENTITIES_EMPTY');
 const seen=new Set();
 for(const e of plan?.entities||[]){
   const id=validId(e?.id)?e.id:'invalid-entity';
   if(!validId(e?.id)||seen.has(id))errors.push('ENTITY_ID_'+id);
   seen.add(id);
   if(!['HERO','CLOSEUP','SUPPORT','BACKGROUND','BLOCKING','TECHNICAL'].includes(e?.visibility))errors.push('VISIBILITY_'+id);
   if(!techniques.has(e?.technique))errors.push('TECHNIQUE_'+id);
   if(!nonempty(e?.intent)||!nonempty(e?.rejectionRisk))errors.push('ACCEPTANCE_INTENT_'+id);
   if(high(e)){
     if(e.technique==='BLOCKOUT_ONLY'||e.technique==='RUNTIME_PRIMITIVE_COMPOSITE')errors.push('HIGH_SALIENCE_PROCEDURAL_FALLBACK_'+id);
     if(human(e)&&!direct3d.has(e.technique))errors.push('HUMAN_SOURCE_STRATEGY_'+id);
     if(!Array.isArray(e.alternatives)||e.alternatives.length<2||!e.alternatives.every(x=>nonempty(x.option)&&nonempty(x.reason)))errors.push('ALTERNATIVES_'+id);
     if(!nonempty(e.closeupAcceptance)||!nonempty(e.firstArticleShot))errors.push('FIRST_ARTICLE_CONTRACT_'+id);
     if(e.technique==='LICENSED_TEXTURED_ASSET'&&(!nonempty(e.asset?.origin)||!nonempty(e.asset?.rights)||!nonempty(e.asset?.editableOrGlb)))errors.push('ASSET_DECISION_'+id);
     if(e.technique==='EDITABLE_MODELED_ASSET'&&(!nonempty(e.asset?.editableSource)||!nonempty(e.asset?.texturePlan)||!nonempty(e.asset?.tool)))errors.push('MODEL_SOURCE_AND_TEXTURE_'+id);
     if(e.technique==='TEXTURED_IMPOSTOR'&&(!nonempty(e.asset?.textureOrigin)||!nonempty(e.asset?.anglesSupported)))errors.push('IMPOSTOR_LIMITS_'+id);
     if(e.technique==='MECHANICAL_PARAMETRIC'&&!technical(e))errors.push('MECHANICAL_EXCEPTION_MISUSED_'+id);
   }
   if(technical(e)&&high(e)&&e.technique==='MECHANICAL_PARAMETRIC'&&(!nonempty(e.clearanceContract)||!nonempty(e.assemblyContract)))errors.push('MECHANISM_FIT_REQUIRED_'+id);
 }
 if(plan?.camera?.mode==='MOVING'){
   if(plan.camera.motionPolicy!=='CONTINUITY_OR_INTENTIONAL_CUT'||!Array.isArray(plan.camera.beats)||!plan.camera.beats.length)errors.push('CAMERA_MOTION_PLAN');
   for(const [i,b] of (plan.camera.beats||[]).entries()){
     if(!Number.isFinite(b.start)||!Number.isFinite(b.end)||b.end<=b.start)errors.push('CAMERA_TIME_'+i);
     if(b.kind==='HOLD'&&!nonempty(b.motivation))errors.push('UNINTENTIONAL_CAMERA_STOP_'+i);
     if(b.kind!=='HOLD'&&b.kind!=='TRAVEL'&&b.kind!=='CUT')errors.push('CAMERA_BEAT_'+i);
   }
   const beats=plan.camera.beats||[];
   for(let i=1;i<beats.length;i++){
     if(beats[i].start!==beats[i-1].end)errors.push('CAMERA_GAP_OR_OVERLAP_'+i);
     if(beats[i].kind==='TRAVEL'&&beats[i-1].kind==='TRAVEL'&&
        beats[i].startVelocity===0&&beats[i-1].endVelocity===0&&!nonempty(beats[i].motivation))errors.push('UNINTENTIONAL_FULL_STOP_'+i);
   }
 }
 if(!nonempty(plan?.earlyRender?.targetPlatform)||!nonempty(plan?.earlyRender?.shot)||!nonempty(plan?.earlyRender?.minimumVisible))errors.push('EARLY_RENDER_ENVELOPE');
 return [...new Set(errors)];
}
export function validatePreflightPlan(plan){const errors=checkBase(plan);return{ok:errors.length===0,errors,phase:'BEFORE_BUILD',advisoryOnly:true,mayScale:true,mustContinueProduction:true};}
const placeholderLicense=s=>typeof s==='string'&&/(pending|pendiente|unknown|desconocid|por verificar|sin comproba|tbd|no verific)/i.test(s);
export function validateAcquiredAssets(plan){
 const errors=checkBase(plan);
 for(const e of plan?.entities||[]){
   if(!high(e))continue;
   const p=e.proof||{};
   if(!hash40(p.sourceGitBlob)||!nonempty(p.license)||!nonempty(p.artifactPath)||placeholderLicense(p.license))errors.push('ASSET_BYTES_AND_RIGHTS_UNPROVEN_'+e.id);
   if(!nonempty(p.instanceRef))errors.push('ACTUAL_INSTANCE_NOT_LINKED_'+e.id);
   if(p.usedTechnique!==e.technique)errors.push('DECLARED_TECHNIQUE_NOT_ACTUALLY_USED_'+e.id);
   if(e.technique==='LICENSED_TEXTURED_ASSET'&&placeholderLicense(e.asset?.rights))errors.push('RIGHTS_STILL_PENDING_'+e.id);
   if(e.technique==='MECHANICAL_PARAMETRIC'&&!nonempty(p.fitEvidence))errors.push('MECHANICAL_FIT_NOT_MEASURED_'+e.id);
 }
 return{ok:errors.length===0,errors:[...new Set(errors)],phase:'AFTER_ACQUISITION',advisoryOnly:true,mayBuildFirstArticle:true,mustContinueProduction:true};
}
export function validateFirstArticle(plan){
 const errors=[...validateAcquiredAssets(plan).errors];
 for(const e of plan?.entities||[]){
   if(!high(e))continue;
   if(!nonempty(e?.proof?.renderRef)||e?.proof?.renderStatus!=='PASS')errors.push('FIRST_ARTICLE_NOT_VISUALLY_VERIFIED_'+e.id);
   if(e?.proof?.acceptance!==true)errors.push('FIRST_ARTICLE_NOT_ACCEPTED_'+e.id);
 }
 if(!nonempty(plan?.earlyRender?.renderRef)||plan?.earlyRender?.renderStatus!=='PASS')errors.push('SCENE_VISIBILITY_NOT_VERIFIED');
 return{ok:errors.length===0,errors:[...new Set(errors)],phase:'BEFORE_REPLICATION',artAcceptanceProven:errors.length===0,advisoryOnly:true,mayScale:true,mustContinueProduction:true};
}
