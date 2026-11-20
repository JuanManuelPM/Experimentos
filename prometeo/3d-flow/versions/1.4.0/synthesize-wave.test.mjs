import test from 'node:test';
import assert from 'node:assert/strict';
import {synthesizeWave} from './synthesize-wave.mjs';
const issues=[
{projectId:'arcade',pattern:'SCOPE',stages:['assembly'],userObservation:'single cabinet'},
{projectId:'submarine',pattern:'SCOPE',stages:['assembly'],userObservation:'single window'},
{projectId:'station',pattern:'BROWSER_BOOT',stages:['publish'],userObservation:'unsupported on device'}];
test('two independent projects reveal general assembly pattern',()=>{
 const r=synthesizeWave(issues,{assembly:'objects-sets',publish:'web-runtime-portability'});
 const p=r.proposals.find(x=>x.pattern==='SCOPE');
 assert.equal(p.projectCount,2);assert.equal(p.status,'CROSS_PROJECT_REVIEW');assert.equal(p.subflow,'objects-sets');
});
test('singleton remains hypothesis, not ungrounded universal change',()=>{
 const r=synthesizeWave(issues);assert.equal(r.proposals.find(x=>x.pattern==='BROWSER_BOOT').status,'SINGLE_CASE_HYPOTHESIS');
});
test('fixes must be a new version, no automatic mutation',()=>{
 const r=synthesizeWave(issues);assert.equal(r.doesNotEditFlow,true);assert.equal(r.needsNewVersionForFixes,true);
});
