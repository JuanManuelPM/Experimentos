// PROMETEO 3D 2.1 · method that corrects the method, not the human prompt.
// Explicit outputs are proposals; this module does NOT perform GitHub writes or autonomously approve artwork.
export const REPAIR_STAGES=['recovery','planning','acquisition','classification','humanoid','orientation','acting','assembly','cinema','qa','repair','persistence'];
export function traceDecisionHealth(stageTrace){
 const rows=stageTrace?.stages||[],seen=new Map(),generic=[],count=rows.length;
 for(const row of rows){
  if(row.status!=='EXECUTED')continue;
  const key=[row.action,row.decision,row.conclusion].join('|').toLowerCase().trim();
  if(!seen.has(key))seen.set(key,[]);seen.get(key).push(row.stage);
  if(!row.action||!row.decision||!row.evidenceRefs?.length)generic.push(row.stage);
 }
 const repeated=[...seen].filter(([,stages])=>stages.length>=3).map(([text,stages])=>({stages,text:text.slice(0,130)}));
 return{ok:repeated.length===0&&generic.length===0,repeatClaims:repeated,missingRealDecisions:generic,stagesInspected:count,
 note:'A stage trace repeated across many decisions can be structurally valid yet useless for causal analysis.'};
}
export function locateCharacterFailure(entry){
 const order=['recovery','planning','acquisition','classification','humanoid','acting','qa','repair','persistence'];
 const earliest=entry?.earliestCausalStage,affected=(entry?.downstream||[]).filter(x=>order.includes(x));
 const evidence=entry?.evidence||{};
 if(!earliest||!order.includes(earliest))return{status:'UNKNOWN_CAUSE',stage:null,traceRefs:[],needsSourceInspection:true};
 const refs=[evidence.publicPath,evidence.publicBlob,evidence.traceBlob,evidence.assetManifestBlob].filter(Boolean);
 return{status:refs.length>=2?'SOURCE_BACKED_HYPOTHESIS':'NEEDS_EVIDENCE',stage:earliest,affected,sourceProject:entry.projectId,
 traceRefs:refs,rootSymptom:entry.symptom||'',proposedFix:entry.fix||'',causeProvenByVisualPixels:false};
}
export function synthesizeRepairProposals(audit){
 const proposals=[],allowed=new Set(REPAIR_STAGES);
 for(const root of audit?.rootPatterns||[]){
  if(!allowed.has(root.stage))continue;
  const matched=(audit.entries||[]).filter(x=>(root.projects||[]).includes(x.projectId));
  const evidence=matched.map(locateCharacterFailure);
  const cited=evidence.filter(x=>x.status==='SOURCE_BACKED_HYPOTHESIS');
  const status=cited.length>=2?'CROSS_SCENE_SOURCE_SUPPORTED':cited.length===1?'SINGLE_SOURCE_HYPOTHESIS':'UNVERIFIED';
  proposals.push({id:root.id,stage:root.stage,status,projectIds:matched.map(x=>x.projectId),
   failureMechanism:root.mechanism,sourceEvidenceRefs:[...new Set(evidence.flatMap(x=>x.traceRefs))],
   neededAction:root.id==='MOTION_TIED_TO_VISUAL_ASSET'?'Separate motion from visual asset by rig map; preserve transferable movement only':
     root.id==='PREVIOUS_REJECTION_IGNORED'?'Read negative registry and compare two new visual sources before acquisition':
     root.id==='NO_VISUAL_DIVERSIFICATION'?'Allocate distinct visual strategies across active actor projects':
     root.id==='FACIAL_REQUIREMENTS_UNDERWEIGHTED'?'Preselect fit-for-shot face mesh/expressions and neutral 360 lookdev':
     'Capture source-specific selection decision with true stage evidence, not repetitive boilerplate',
   humanBriefChangeAllowed:false,artifactStatus:'PROPOSED_NEW_FLOW_VERSION_ONLY'});
 }
 return{schema:'prometeo.3d.flow-repair-proposals/v1',sourceFlow:audit?.method||null,proposals,
 noAutomaticPromotion:true,noHumanPromptChanges:true,allowedBlastRadius:'CHARACTER_DECISION_STAGES'};
}
export function applyApprovedStagePatch(oldOperations,{fromVersion,toVersion,stage,instruction,id,approval}={}){
 if(!REPAIR_STAGES.includes(stage))throw Error('STAGE_OUTSIDE_AUTHORIZED_3D_SCOPE');
 if(!['USER_CHARACTER_FLOW_CHANGE','USER_3D_FLOW_CHANGE'].includes(approval))throw Error('NO_USER_AUTHORIZATION_FOR_METHOD_PATCH');
 if(!fromVersion||!toVersion||fromVersion===toVersion)throw Error('VERSION_MUST_CHANGE');
 if(oldOperations?.version!==fromVersion)throw Error('OLD_FLOW_VERSION_MISMATCH');
 if(!instruction?.trim()||!id?.trim())throw Error('MISSING_ACTIONABLE_INSTRUCTION');
 if(/modify human brief|rewrite prompt|cambiar (?:el )?prompt humano/i.test(instruction))throw Error('HUMAN_BRIEF_IS_IMMUTABLE');
 const next=JSON.parse(JSON.stringify(oldOperations));
 const s=next.stages.find(x=>x.id===stage);
 if(!s)throw Error('STAGE_NOT_FOUND');
 s.steps=s.steps||[];
 if(!s.steps.some(x=>x.includes('['+id+']')))s.steps.push('['+id+'] '+instruction.trim());
 next.version=toVersion;
 return{next,patch:{id,stage,fromVersion,toVersion,description:instruction.trim(),status:'APPLIED_TO_NEW_OBJECT_NOT_PUBLISHED'},
 oldUnchanged:oldOperations.version===fromVersion,
 note:'A versioned JSON candidate is returned. GitHub publication requires explicit branch/QA CAS and does not occur here.'};
}
export function reviewFlowDelta({currentVersion,newVersion,briefHashBefore,briefHashAfter,changedStages,evidenceRefs}={}){
 const errors=[];
 if(!newVersion||!currentVersion||newVersion===currentVersion)errors.push('NO_VERSION_BUMP');
 if(!/^[a-f0-9]{64}$/.test(briefHashBefore||'')||briefHashAfter!==briefHashBefore)errors.push('HUMAN_BRIEF_CHANGED_OR_NOT_LOCKED');
 for(const stage of changedStages||[])if(!REPAIR_STAGES.includes(stage))errors.push('OUT_OF_SCOPE_STAGE_'+stage);
 if(!Array.isArray(evidenceRefs)||evidenceRefs.length===0)errors.push('NO_SOURCE_EVIDENCE');
 return{ok:errors.length===0,errors,studio3dOnly:true,neverAutowritesOtherBranches:true};
}
export function canPromoteMethod({sourceTests,independentVisualTest,humanArtApproval,secondConsumer,evidenceRefs}={}){
 const sourceVerified=sourceTests===true&&Array.isArray(evidenceRefs)&&evidenceRefs.length>0;
 return{mayPublishCandidate:sourceVerified,
  mayCallArtApproved:independentVisualTest===true&&humanArtApproval===true,
  mayPromoteShared:sourceVerified&&independentVisualTest===true&&humanArtApproval===true&&secondConsumer===true,
  caveat:'A source-tested character method may be current CANDIDATE without claiming that its characters or animation are approved.'};
}
