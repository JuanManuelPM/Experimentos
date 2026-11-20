import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOperationalFlow} from './flow-audit.mjs';
const read=x=>JSON.parse(readFileSync(new URL('./'+x,import.meta.url),'utf8'));
const f=read('flow.json'),s=read('STAGE_OPERATIONS.json'),c=read('SCENE_INTENT_CATALOG.json'),r=read('COMPONENT_REFERENCE_MATRIX.json'),t=read('TOOLCHAIN_ROUTING.json');
test('full operational graph is valid',()=>{const a=auditOperationalFlow(f,s,c,r,t);assert.equal(a.ok,true,JSON.stringify(a));assert.equal(a.counts.reachable,269)});
test('a node without a stage procedure is not executable',()=>{
 const copy=JSON.parse(JSON.stringify(f));copy.nodes[0].procedureRef='STAGE_OPERATIONS.json#/scope';
 assert.ok(auditOperationalFlow(copy,s,c,r,t).errors.some(x=>x.startsWith('INVALID_STAGE_PROCEDURE')));
});
test('unreachable nodes are found',()=>{
 const copy=JSON.parse(JSON.stringify(f));copy.edges=copy.edges.filter(e=>e.to!=='BR0');
 assert.ok(auditOperationalFlow(copy,s,c,r,t).errors.some(x=>x.includes('BR0')));
});
test('canary veto regression is rejected',()=>{
 const copy=JSON.parse(JSON.stringify(f));copy.edges.find(e=>e.from==='PP2').to='END0';
 assert.ok(auditOperationalFlow(copy,s,c,r,t).errors.includes('CANARY_STILL_BLOCKS_FULL_SCENE'));
});
test('ambiguous alias is not silently accepted',()=>{
 const copy=JSON.parse(JSON.stringify(c));copy.proposals[1].aliases.push('arcade');
 assert.ok(auditOperationalFlow(f,s,copy,r,t).errors.some(x=>x.includes('COLLIDING_ALIAS')));
});
test('missing full-scene contract is rejected',()=>{
 const copy=JSON.parse(JSON.stringify(f));copy.executionSpec.fullSceneRequired=false;
 assert.ok(auditOperationalFlow(copy,s,c,r,t).errors.includes('MISSING_FULL_SCENE_POLICY'));
});
