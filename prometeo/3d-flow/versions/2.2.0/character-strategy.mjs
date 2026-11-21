// PROMETEO 3D Character Strategy 2.2.0
// Functions choose/check methods and evidence; NEVER synthesize a rig/model or pretend it rendered.
export const CHARACTER_ROLES=['HERO','DIALOGUE','SUPPORT_NPC','VISIBLE_CROWD','BACKGROUND','DEBUG_PROXY'];
export const CHARACTER_METHOD='2.2.0';
export function requiredActorProjects(matrix){
 const ids=new Set((matrix.wave002ActorSceneIds||[]).filter(Boolean));
 return [...ids];
}
export function assignDistinctStrategies(projectIds,matrix){
 const available=(matrix.strategies||[]),assigned=[],warnings=[],missing=[];
 const selectedId=new Set(),selectedFingerprint=new Set();
 const nonActor=new Set(matrix.wave002NoActorRequired||[]);
 for(const projectId of projectIds){
  if(nonActor.has(projectId)){assigned.push({projectId,status:'NO_ACTOR_REQUIRED',strategyId:null});continue}
  const preferences=available.filter(s=>(s.assignedProjects||[]).includes(projectId));
  const candidates=preferences.length?preferences:available.filter(s=>!(s.assignedProjects||[]).length);
  const winner=candidates.find(s=>!selectedId.has(s.id)&&!selectedFingerprint.has(s.visualFingerprint));
  if(!winner){missing.push(projectId);assigned.push({projectId,status:'NEEDS_NEW_ROUTE',strategyId:null});continue}
  selectedId.add(winner.id);selectedFingerprint.add(winner.visualFingerprint);
  assigned.push({projectId,status:'PROPOSED_NOT_EXECUTED',strategyId:winner.id,visualFingerprint:winner.visualFingerprint,authoringFamily:winner.authoringFamily,faceMethod:winner.faceMethod,toolStatus:winner.status,notApproved:true});
 }
 if(selectedFingerprint.size<selectedId.size)warnings.push('OVERLAPPING_VISUAL_FINGERPRINTS');
 return{schema:'prometeo.3d.character-wave-allocation/v1',assigned,missing,warnings,attemptDifferentVisualFamilies:true,actualModelsCreated:0,artisticApproval:'NOT_RUN'};
}
export function verifyWaveDiversity(assignments,registry){
 const problems=[],seenStrategies=new Map(),seenFingerprints=new Map(),byId=new Map((registry.strategies||[]).map(x=>[x.id,x]));
 for(const row of assignments||[]){
  if(row.status==='NO_ACTOR_REQUIRED')continue;
  const strategy=byId.get(row.strategyId);
  if(!strategy){problems.push('UNKNOWN_STRATEGY_'+row.projectId);continue}
  if(seenStrategies.has(row.strategyId))problems.push('STRATEGY_REPEATED_'+row.strategyId);
  if(seenFingerprints.has(strategy.visualFingerprint))problems.push('VISUAL_FAMILY_REPEATED_'+strategy.visualFingerprint);
  seenStrategies.set(row.strategyId,row.projectId);seenFingerprints.set(strategy.visualFingerprint,row.projectId);
 }
 return{ok:problems.length===0,problems,characterProjects:seenStrategies.size,notes:'Unique assigned hypotheses do not prove distinct meshes or actual art success.'};
}
function matchesNegative(visual,entry){
 if(!entry)return false; if(entry.target==='FINAL_VISIBLE_HUMAN')return visual?.isInternalProxy===true||visual?.meshTechnique==='PRIMITIVE_HUMAN';
 return visual?.visualSourceId===entry.id
 ||(visual?.sourceRef&&entry.source&&visual.sourceRef.includes(entry.source))
 ||(visual?.negativeId===entry.id);
}
export function inspectCharacterChoice(candidate,registry){
 const problems=[],warnings=[],v=candidate?.visual||{},role=candidate?.role||'HERO';
 const negatives=(registry?.entries||[]).filter(n=>matchesNegative(v,n));
 for(const n of negatives){
  if(n.status==='REJECTED_VISUAL'||n.status==='INTERNAL_DEBUG_ONLY'&&role!=='DEBUG_PROXY'||n.status==='REJECTED_FOR_CLOSEUP'&&['HERO','DIALOGUE','HERO_CLOSEUP','DIALOGUE_CLOSEUP'].includes(role)){
   problems.push('VISUAL_REJECTED_'+n.id);
  }
 }
 if(candidate?.role!=='DEBUG_PROXY'&&(v.isInternalProxy===true||v.meshTechnique==='PRIMITIVE_HUMAN')){
  problems.push('PROXY_NOT_FINAL_HUMAN');
 }
 if(new Set(candidate?.selectionEvidence?.alternatives||[]).size<2)problems.push('NO_COMPARATIVE_SOURCE_DECISION');
 if(!candidate?.selectionEvidence?.selectedBecause||candidate.selectionEvidence.selectedBecause.length<20)problems.push('NO_REAL_SELECTION_RATIONALE');
 if(!candidate?.visual?.sourceRef)problems.push('NO_VISUAL_ASSET_SOURCE');
 if(!candidate?.visual?.license)problems.push('RIGHTS_UNVERIFIED');
 if(!candidate?.selectionEvidence?.actualModelBytesRead)warnings.push('BINARY_NOT_INSPECTED');
 if(!candidate?.selectionEvidence?.lookdevImageRefs?.length)warnings.push('NO_REAL_NEUTRAL_LOOKDEV_PROOF');
 if(!candidate?.rig?.boneMapRef)warnings.push('RIG_BONE_MAP_UNVERIFIED');
 const verdict=problems.length?'CHANGE_VISUAL_STRATEGY_BEFORE_ASSEMBLY_WHEN_POSSIBLE':'SOURCE_CANDIDATE_VISUAL_NOT_YET_HUMAN_APPROVED';
 return{verdict,problems,warnings,allowedToClaimApproved:false,productionMayContinue:true,
 shouldTryAlternateBeforeAssembly:problems.length>0,
 policy:'Do not promote or reuse rejected visual as completed art. If no viable alternative or runtime, still finish the full scene, label character FAIL and show results.'};
}
export function inspectMotionTransfer({sourceRig,targetRig,clip,boneMap,frontDot,footDriftMeters,poseEvidence}={}){
 const issues=[];
 if(!sourceRig||!targetRig||!clip)issues.push('MOTION_SOURCE_OR_TARGET_MISSING');
 if(!boneMap||Object.keys(boneMap).length<8)issues.push('BONE_MAP_UNVERIFIED');
 if(!sourceRig?.restPose||!targetRig?.restPose)issues.push('REST_POSE_UNVERIFIED');
 if(!Number.isFinite(frontDot)||frontDot<0.8)issues.push('FACING_NOT_CALIBRATED');
 if(!Number.isFinite(footDriftMeters)||footDriftMeters>0.06)issues.push('FOOT_CONTACT_UNVERIFIED');
 if(!poseEvidence?.length)issues.push('NO_REAL_POSE_EVIDENCE');
 return{motionReadyForScene:issues.length===0,issues,
 motionAndVisualIndependent:true,
 note:'Source/target rig compatibility verified by external measured evidence, not by matching strings alone. User liked motion in Cruce, not the visual mesh.'};
}
export function evaluateCharacterPromotion({humanArtVerdict,renderEvidence,assetHash,license,motionReport,secondConsumerEvidence}={}){
 const reasons=[];
 if(humanArtVerdict!=='APPROVED')reasons.push('HUMAN_ART_APPROVAL_MISSING');
 if(!Array.isArray(renderEvidence)||renderEvidence.length<3)reasons.push('MULTIVIEW_RENDER_EVIDENCE_MISSING');
 if(!/^[0-9a-f]{64}$/.test(assetHash||''))reasons.push('ASSET_BYTES_HASH_MISSING');
 if(!license)reasons.push('ASSET_LICENSE_MISSING');
 const visuallyApproved=reasons.length===0;
 if(motionReport&&motionReport.motionReadyForScene!==true)reasons.push('MOTION_NOT_COMPATIBLE');
 const shareable=visuallyApproved&&(motionReport==null||motionReport.motionReadyForScene===true)&&Array.isArray(secondConsumerEvidence)&&secondConsumerEvidence.length>0;
 return{visualCandidateApproved:visuallyApproved,sharedReusableApproved:shareable,reasons:shareable?[]:reasons.concat(secondConsumerEvidence?.length?[]:['SECOND_CONSUMER_NOT_TESTED']),libraryState:shareable?'APPROVED_REUSABLE':visuallyApproved?'HUMAN_APPROVED_PENDING_REUSE':'RESEARCH_CANDIDATE'};
}

// The old allocation helper is only historical experimental inspiration. The production route is open.
export function planOpenAvatarExperiment(projectId,registry,{actorNeeded=true,availableRouteIds=[]}={}){return{projectId,actorNeeded,fixedStrategy:false,approvedVisualBase:null,authorMayInventNewRoute:true,suggestions:(registry?.strategies||[]).filter(s=>availableRouteIds.includes(s.id)).map(s=>s.id),requiresComparativeAuthoring:actorNeeded}}
