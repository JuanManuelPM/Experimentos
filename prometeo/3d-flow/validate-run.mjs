import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function validateReceipt(receipt,flow){
 const errors=[],warnings=[];
 const qaGates=flow.nodes.filter(n=>n.stage==='qa'&&n.type==='decision'&&n.gate&&/^D(29|3[0-8])$/.test(n.id));
 const earlyIds=['D39','D40','D41'],isPrevention=flow.version==='1.2.0';
 if(receipt?.schema!=='prometeo.3d.flow-run/v1')errors.push('SCHEMA');
 if(!receipt?.creationId)errors.push('CREATION_ID');
 if(receipt?.flow?.version!==flow.version||receipt?.flow?.sha256Canonical!==flow.sha256Canonical||receipt?.flow?.id!==flow.id)errors.push('FLOW_LOCK_MISMATCH');
 if(!Array.isArray(receipt?.nodeResults))errors.push('RESULTS_MISSING');
 const byId=new Map(),ids=new Set(flow.nodes.map(x=>x.id));
 for(const r of receipt?.nodeResults||[]){
  if(!ids.has(r.nodeId))errors.push('UNKNOWN_NODE_'+r.nodeId);
  if(byId.has(r.nodeId))errors.push('DUPLICATE_NODE_'+r.nodeId);
  byId.set(r.nodeId,r);
  if(!['PASS','FAIL','NOT_RUN',...(isPrevention&&r.nodeId==='D42'?['NOT_APPLICABLE']:[])].includes(r.status))errors.push('INVALID_STATUS_'+r.nodeId);
  if(r.status==='PASS'&&(!Array.isArray(r.evidenceRefs)||!r.evidenceRefs.length))errors.push('PASS_MISSING_EVIDENCE_'+r.nodeId);
 }
 const ready=['2.0.0','2.1.0','2.2.0','2.2.1'].includes(flow.version)?receipt?.status==='VERIFIED':['READY_FOR_ART_REVIEW','VERIFIED'].includes(receipt?.status);
 const scale=false; // v1.3: artistic diagnostics cannot cancel FULL_ATTEMPT delivery.
 if(isPrevention&&receipt?.status!=='NOT_STARTED'){
   if(!['FIRST_ARTICLE','SCALED','FULL_ATTEMPT'].includes(receipt?.buildScope))errors.push('BUILD_SCOPE_REQUIRED');
   if(!['STATIC','MOVING','INTERACTIVE','EDITED'].includes(receipt?.cameraMode))errors.push('CAMERA_MODE_REQUIRED');
   if(!receipt?.preventiveBlueprint?.path||!/^[a-f0-9]{40}$/.test(receipt?.preventiveBlueprint?.gitBlob||''))errors.push('PREVENTIVE_BLUEPRINT_GIT_BLOB_REQUIRED');
   if(ready&&!['SCALED','FULL_ATTEMPT'].includes(receipt?.buildScope))errors.push('NOT_SCALED_CANNOT_CLAIM_ART_READY');
   if(scale||(ready&&receipt.artApproval==='APPROVED')){
    for(const id of earlyIds){
      const r=byId.get(id);if(r?.status!=='PASS')errors.push('EARLY_GATE_UNPROVEN_'+id);
      if(r?.status==='PASS'&&!r.sourceSha&&!r.assetSha)errors.push('EARLY_GATE_NO_HASH_'+id);
    }
    if(receipt?.cameraMode==='MOVING'){
      const r=byId.get('D42');
      if(r?.status!=='PASS')errors.push('EARLY_GATE_UNPROVEN_D42');
      if(r?.status==='PASS'&&!r.sourceSha&&!r.assetSha)errors.push('EARLY_GATE_NO_HASH_D42');
    }
   }
 }
 if(ready){
  for(const gate of qaGates){
   const r=byId.get(gate.id);if(r?.status!=='PASS')errors.push('REQUIRED_GATE_UNPROVEN_'+gate.id);
   if(r?.status==='PASS'&&!r.sourceSha&&!r.assetSha)errors.push('REQUIRED_GATE_NO_HASH_'+gate.id);
  }
  for(const id of ['QA2','D19','D20','D21','D22','D23','D24','D28'])if(byId.get(id)?.status!=='PASS')errors.push('REQUIRED_QA_UNPROVEN_'+id);
  if(!receipt?.provenance?.sourceCommit||receipt.provenance.sourceCommit==='PENDING_RUN')errors.push('SOURCE_COMMIT_UNRESOLVED');
 }
 if(receipt?.status==='VERIFIED'){
  if(receipt.artApproval!=='APPROVED')errors.push('ART_APPROVAL_REQUIRED');
  if(!/^https:\/\//.test(receipt.url||''))errors.push('PUBLIC_URL_REQUIRED');
  if(receipt.publicHTTPVerified!==true)errors.push('PUBLIC_HTTP_NOT_VERIFIED');
 }
 if(['1.4.0','2.0.0','2.1.0','2.2.0','2.2.1','2.2.0'].includes(flow.version)){
  if(!receipt?.briefLock?.briefId||!receipt?.briefLock?.sha256)warnings.push('BRIEF_LOCK_MISSING__COMPARE_WITH_CAUTION');
  if(!receipt?.stageTrace?.path)warnings.push('STAGE_TRACE_MISSING__LEARNING_INCOMPLETE');
 }
 if(['2.0.0','2.1.0','2.2.0','2.2.1'].includes(flow.version)){
  if(!receipt?.compiledContract?.path)warnings.push('COMPILED_CONTRACT_MISSING');
  if(receipt?.buildScope==='FIRST_ARTICLE')warnings.push('FIRST_ARTICLE_NOT_FULL_SCENE__PUBLISH_AS_PARTIAL_NOT_COMPLETE');
  if(!receipt?.scopeAudit?.scopeStatus)warnings.push('SCOPE_AUDIT_MISSING');
  if(receipt?.scopeAudit?.scopeStatus==='DELIVERED_WITH_GAPS')warnings.push('SCOPE_GAPS_VISIBLE__DO_NOT_CENSOR');
  if(!receipt?.componentReview?.path)warnings.push('COMPONENT_REVIEW_MISSING');
  if(receipt?.status==='READY_FOR_ART_REVIEW'&&receipt?.buildScope==='FIRST_ARTICLE')warnings.push('REVIEWABLE_BUT_PARTIAL');
 }

 if(['2.1.0','2.2.0','2.2.1'].includes(flow.version)){
  const hasActor=receipt?.characterCoverage?.hasVisibleHumans===true;
  if(hasActor){
   if(!receipt?.characterDecision?.strategyId)warnings.push('CHARACTER_VISUAL_STRATEGY_UNRECORDED');
   if(!receipt?.characterDecision?.visualSourceId)warnings.push('CHARACTER_VISUAL_SOURCE_UNRECORDED');
   if(!receipt?.characterDecision?.alternativeSources?.length||receipt.characterDecision.alternativeSources.length<2)warnings.push('CHARACTER_TWO_ALTERNATIVES_NOT_DOCUMENTED');
   if(!receipt?.characterDecision?.separateMotionPackId)warnings.push('CHARACTER_MOTION_NOT_SEPARATE');
   if(receipt?.characterDecision?.artisticStatus!=='USER_APPROVED')warnings.push('CHARACTER_VISUAL_NOT_USER_APPROVED');
   if(receipt.status==='VERIFIED'&&receipt.characterDecision?.artisticStatus!=='USER_APPROVED')errors.push('CHARACTER_VISUAL_ART_APPROVAL_REQUIRED');
  }
 }
 if(['2.2.0','2.2.1'].includes(flow.version)){
  const q=receipt?.productionQuality||{},keys=['avatarExperiment','castMotion','ui','touch','latentRisks'];
  for(const k of keys){
   if(!['PASS','FAIL','NOT_RUN','N/A'].includes(q[k]))warnings.push('QUALITY_EVIDENCE_MISSING_'+k);
   if(receipt.status==='VERIFIED'&&q[k]!=='PASS'&&!(q[k]==='N/A'&&q.notApplicableReasons?.[k]&&['avatarExperiment','castMotion','touch'].includes(k)))errors.push('QUALITY_NOT_VERIFIED_'+k);
  }
  if(receipt.status==='VERIFIED'&&(!Array.isArray(q.evidenceRefs)||!q.evidenceRefs.length))errors.push('QUALITY_RUNTIME_EVIDENCE_MISSING');
  if(receipt.characterCoverage?.hasVisibleHumans===true&&q.avatarExperiment==='N/A')errors.push('VISIBLE_ACTORS_REQUIRE_AUTHORING');
  if(receipt.status==='VERIFIED'&&typeof receipt.characterCoverage?.hasVisibleHumans!=='boolean')errors.push('CHARACTER_COVERAGE_UNCLASSIFIED');
 }
 if(flow.version==='2.2.1'){
  if(!receipt?.qualityDelta?.path||!receipt?.qualityDelta?.evidenceRefs?.length)warnings.push('QUALITY_DELTA_MISSING');
  if(receipt.status==='VERIFIED'&&(!receipt?.qualityDelta?.path||receipt?.qualityDelta?.finishStatus!=='EXECUTED'||!receipt?.qualityDelta?.evidenceRefs?.length))errors.push('QUALITY_FINISH_UNVERIFIED');
 }
 return{ok:errors.length===0,errors,warnings,mustContinueProduction:true,requiredGateIds:qaGates.map(x=>x.id),earlyGateIds:isPrevention?earlyIds:[]};
}
if(process.argv[1]===fileURLToPath(import.meta.url)&&process.argv[2]){
 const r=JSON.parse(readFileSync(process.argv[2],'utf8'));
 const f=JSON.parse(readFileSync(new URL('./FLOW_3D_MASTER.json',import.meta.url),'utf8'));
 const report=validateReceipt(r,f);console.log(JSON.stringify(report,null,2));if(!report.ok)process.exitCode=1;
}
