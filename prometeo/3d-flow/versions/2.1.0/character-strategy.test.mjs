import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {requiredActorProjects,assignDistinctStrategies,verifyWaveDiversity,inspectCharacterChoice,inspectMotionTransfer,evaluateCharacterPromotion} from './character-strategy.mjs';
const s=JSON.parse(readFileSync(new URL('./CHARACTER_STRATEGIES.json',import.meta.url),'utf8')),n=JSON.parse(readFileSync(new URL('./NEGATIVE_CHARACTER_REGISTRY.json',import.meta.url),'utf8'));
test('seven actual actor scenes, not mechanical/arcade scenes',()=>{
 const x=requiredActorProjects(s);assert.equal(x.length,7);assert.ok(!x.includes('reloj-mecanico'));assert.ok(!x.includes('ventilador-explicado'));
});
test('10 distinct hypotheses documented and none falsely ready',()=>{assert.equal(s.strategies.length,10);assert.equal(s.strategies.filter(x=>x.ready).length,0)});
test('different visual sources for all seven required actor scenes',()=>{
 const alloc=assignDistinctStrategies([...s.wave002ActorSceneIds,...s.wave002NoActorRequired],s);
 assert.equal(alloc.missing.length,0);assert.equal(alloc.assigned.filter(x=>x.status==='PROPOSED_NOT_EXECUTED').length,7);
 assert.equal(verifyWaveDiversity(alloc.assigned,s).ok,true);
});
test('duplication of skin/family is diagnosed despite separate project IDs',()=>{
 const alloc=assignDistinctStrategies(s.wave002ActorSceneIds,s).assigned;
 alloc[1].strategyId=alloc[0].strategyId;
 assert.ok(verifyWaveDiversity(alloc,s).problems.some(x=>x.startsWith('STRATEGY_REPEATED')));
});
test('negative registry is not empty and no visual approved',()=>{assert.equal(n.entries.length,5);assert.equal(n.approvedVisualFamilies.length,0)});
test('Bondi primitive humans are rejected before final scene',()=>{
 const v={role:'SUPPORT_NPC',visual:{visualSourceId:'humanoid:seated-crowd-procedural-v0.1.0',meshTechnique:'PRIMITIVE_HUMAN',sourceRef:'asset',license:'Original'},selectionEvidence:{alternatives:['x','y'],selectedBecause:'This method was fast enough but visually poor.',actualModelBytesRead:true,lookdevImageRefs:['a']}};
 const res=inspectCharacterChoice(v,n);assert.ok(res.problems.some(x=>x.startsWith('VISUAL_REJECTED_')));assert.ok(res.problems.includes('PROXY_NOT_FINAL_HUMAN'));assert.equal(res.productionMayContinue,true);
});
test('technical Cesium skin rejected without rejecting its motion for retarget',()=>{
 const v={role:'HERO',visual:{visualSourceId:'humanoid:cesium-man-default-skin',sourceRef:'actor',license:'CC BY 4.0'},selectionEvidence:{alternatives:['real human','other'],selectedBecause:'Existing clip could be useful while visual not good.'}};
 const r=inspectCharacterChoice(v,n);assert.equal(r.shouldTryAlternateBeforeAssembly,true);assert.equal(n.candidateMotionComponents[0].status,'PARTIAL_POSITIVE_USER');
});
test('unknown lookdev cannot be accepted as finished art',()=>{
 const v={role:'HERO',visual:{visualSourceId:'new-sculpt',sourceRef:'new.glb',license:'CC0'},selectionEvidence:{alternatives:['A','B'],selectedBecause:'A has a different face morphology and UV atlas',actualModelBytesRead:false}};
 const r=inspectCharacterChoice(v,n);assert.ok(r.warnings.includes('NO_REAL_NEUTRAL_LOOKDEV_PROOF'));assert.equal(r.allowedToClaimApproved,false);
});
test('motion is independent and needs exact rig/measurements',()=>{
 const bad=inspectMotionTransfer({sourceRig:{restPose:'T'},targetRig:{restPose:'T'},clip:'Walk',boneMap:{hips:'hips'},frontDot:.99,footDriftMeters:.25});
 assert.equal(bad.motionReadyForScene,false);assert.ok(bad.issues.includes('FOOT_CONTACT_UNVERIFIED'));
});
test('compatible motion can pass without changing visual family',()=>{
 const boneMap=Object.fromEntries(['hips','spine','head','larm','rarm','lleg','rleg','neck'].map(x=>[x,x]));
 const res=inspectMotionTransfer({sourceRig:{restPose:'T'},targetRig:{restPose:'A'},clip:'walk.glb',boneMap,frontDot:.92,footDriftMeters:.02,poseEvidence:['real-frame']});
 assert.equal(res.motionReadyForScene,true);assert.equal(res.motionAndVisualIndependent,true);
});
test('art approved alone is insufficient to promote shared reusable character',()=>{
 const r=evaluateCharacterPromotion({humanArtVerdict:'APPROVED',renderEvidence:['front','side','back'],assetHash:'a'.repeat(64),license:'CC0'});
 assert.equal(r.visualCandidateApproved,true);assert.equal(r.sharedReusableApproved,false);assert.equal(r.libraryState,'HUMAN_APPROVED_PENDING_REUSE');
});
test('unapproved character cannot enter shared library',()=>{
 const r=evaluateCharacterPromotion({humanArtVerdict:'NOT_RUN',renderEvidence:[],assetHash:'',license:'',secondConsumerEvidence:[]});
 assert.equal(r.libraryState,'RESEARCH_CANDIDATE');
});
