import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {traceDecisionHealth,locateCharacterFailure,synthesizeRepairProposals,applyApprovedStagePatch,reviewFlowDelta,canPromoteMethod} from './flow-repair.mjs';
const audit=JSON.parse(readFileSync(new URL('./CHARACTER_DECISION_AUDIT.json',import.meta.url),'utf8'));
const ops=JSON.parse(readFileSync(new URL('./STAGE_OPERATIONS.json',import.meta.url),'utf8'));
test('source decision audit uses earliest selection stage, not just final screenshot',()=>{
 const x=locateCharacterFailure(audit.entries.find(x=>x.projectId==='transporte-retro'));
 assert.equal(x.stage,'recovery');assert.equal(x.status,'SOURCE_BACKED_HYPOTHESIS');assert.equal(x.causeProvenByVisualPixels,false);
});
test('root repair proposals are derived from actual project evidence',()=>{
 const x=synthesizeRepairProposals(audit);assert.ok(x.proposals.length>=5);
 assert.ok(x.proposals.every(p=>p.humanBriefChangeAllowed===false));
 assert.ok(x.proposals.find(x=>x.id==='PREVIOUS_REJECTION_IGNORED').projectIds.includes('cruce-urbano'));
});
test('boilerplate stage traces flagged despite being structurally valid',()=>{
 const q={stages:['recovery','planning','humanoid','acting'].map(stage=>({stage,status:'EXECUTED',action:'Execute stage against source',decision:'Reused previous model',conclusion:'Done',evidenceRefs:['source.js']}))};
 const r=traceDecisionHealth(q);assert.equal(r.ok,false);assert.equal(r.repeatClaims[0].stages.length,4);
});
test('distinct actual per-stage reports do not trigger generic re-use warnings',()=>{
 const q={stages:[{stage:'recovery',status:'EXECUTED',action:'Inspected two tools',decision:'Rejected repeated source',conclusion:'New asset chosen',evidenceRefs:['A']},{stage:'acting',status:'EXECUTED',action:'Retargeted and measured clip',decision:'Keep walk',conclusion:'Ready candidate',evidenceRefs:['B']}]};
 assert.equal(traceDecisionHealth(q).ok,true);
});
test('targeted stage patch modifies copy not original or any other stage',()=>{
 const before=JSON.stringify(ops),changed=applyApprovedStagePatch(ops,{fromVersion:'2.1.0',toVersion:'2.2.0',stage:'recovery',instruction:'Consult human negative asset registry',id:'CHAR_BAD_ASSET_001',approval:'USER_CHARACTER_FLOW_CHANGE'});
 assert.equal(JSON.stringify(ops),before);assert.equal(changed.next.version,'2.2.0');
 assert.ok(changed.next.stages[1].steps.at(-1).includes('CHAR_BAD_ASSET_001'));
 assert.deepEqual(changed.next.stages[6],ops.stages[6]);
});
test('cannot patch unrelated camera/environment stage in character-only revision',()=>{
 assert.throws(()=>applyApprovedStagePatch(ops,{fromVersion:'2.1.0',toVersion:'2.2.0',stage:'camera',instruction:'Change camera',id:'X',approval:'USER_CHARACTER_FLOW_CHANGE'}),/STAGE_OUTSIDE/);
});
test('unauthorized patch rejected, no GitHub mutation performed',()=>{
 assert.throws(()=>applyApprovedStagePatch(ops,{fromVersion:'2.1.0',toVersion:'2.2.0',stage:'humanoid',instruction:'Inspect assets',id:'X'}),/NO_USER_AUTHORIZATION/);
});
test('fixed human prompt fingerprint required for fair flow comparison',()=>{
 const a=reviewFlowDelta({currentVersion:'2.0.0',newVersion:'2.1.0',briefHashBefore:'a'.repeat(64),briefHashAfter:'b'.repeat(64),changedStages:['humanoid'],evidenceRefs:['source']});
 assert.equal(a.ok,false);assert.ok(a.errors.includes('HUMAN_BRIEF_CHANGED_OR_NOT_LOCKED'));
});
test('candidate can be released with source QA but never automatically shared',()=>{
 const x=canPromoteMethod({sourceTests:true,independentVisualTest:false,humanArtApproval:false,secondConsumer:false,evidenceRefs:['source']});
 assert.equal(x.mayPublishCandidate,true);assert.equal(x.mayPromoteShared,false);assert.equal(x.mayCallArtApproved,false);
});
