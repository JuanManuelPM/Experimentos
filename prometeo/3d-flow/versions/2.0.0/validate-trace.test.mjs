import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,validateStageTrace,sha256Utf8} from './validate-trace.mjs';
const h='a'.repeat(64);
function good(){
 return{schema:'prometeo.3d.stage-trace/v1',projectId:'arcade-retro',version:'V2',
 flow:{version:'2.0.0',sha256Canonical:h},briefLock:{briefId:'arcade-v1',rawText:'Quiero un salón arcade completo.',sha256:sha256Utf8('Quiero un salón arcade completo.')},
 product:{sourceRef:'repo@commit:path',scopeDelivered:'Three dimensional arcade hall',previewStatus:'PUBLIC_PREVIEW',previewUrl:'https://example.com'},
 stages:STAGES.map(stage=>({stage,status:'EXECUTED',action:'authored',decision:'asset-first',conclusion:'done',evidenceLevel:'SOURCE_READ',evidenceRefs:['src/scene.mjs']}))};
}
test('17 complete stage trace with immutable brief accepted',()=>assert.equal(validateStageTrace(good(),h).ok,true));
test('missing per-stage decision spotted',()=>{let x=good();x.stages[5].decision='';assert.ok(validateStageTrace(x,h).errors.includes('ACTUAL_WORK_MISSING_humanoid'))});
test('missing stage does not fake coverage',()=>{let x=good();x.stages.pop();assert.ok(validateStageTrace(x,h).errors.includes('MISSING_STAGE_publish'))});
test('duplicate or renamed stage rejected',()=>{let x=good();x.stages[1].stage='scope';assert.ok(validateStageTrace(x,h).errors.includes('DUPLICATE_STAGE_scope'))});
test('unverified claims warn but never abort production',()=>{let x=good();x.stages[0].evidenceRefs=[];const r=validateStageTrace(x,h);assert.equal(r.mustContinueProduction,true);assert.ok(r.warnings.some(y=>y.includes('UNSUPPORTED_WORK_CLAIM')))});
test('wrong flow hash rejected as comparison evidence, not as artwork',()=>{let x=good();assert.ok(validateStageTrace(x,'b'.repeat(64)).errors.includes('FLOW_HASH_MISMATCH'))});

test('same natural brief remains byte-for-byte identical across method versions',()=>{
 const x=good();x.briefLock.rawText+=' Añadí neón obligatorio.';
 assert.ok(validateStageTrace(x,h).errors.includes('HUMAN_BRIEF_HASH_CHANGED'));
});
test('SHA-256 exact known vector',()=>assert.equal(sha256Utf8('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));
