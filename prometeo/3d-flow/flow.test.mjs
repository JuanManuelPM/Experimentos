import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateReceipt} from './validate-run.mjs';
const read=x=>JSON.parse(readFileSync(new URL(x,import.meta.url),'utf8'));
const f=read('./FLOW_3D_MASTER.json'),v14=read('./versions/1.4.0/flow.json'),idx=read('./FLOW_INDEX.json'),v13=read('./versions/1.3.0/flow.json');
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
const sha=f=>{const {sha256Canonical,...obj}=f;return createHash('sha256').update(JSON.stringify(sort(obj))).digest('hex');};
const node=id=>f.nodes.find(x=>x.id===id);
const route=(from,to)=>f.edges.some(x=>x.from===from&&x.to===to);
test('flow 1.4 is current and cryptographically locked',()=>{
 assert.equal(idx.current,'1.4.0');assert.equal(f.version,'1.4.0');assert.deepEqual(f,v14);
 assert.equal(sha(f),f.sha256Canonical);assert.equal(idx.sha256Canonical,f.sha256Canonical);
 assert.equal(v13.version,'1.3.0');assert.equal(v13.nodes.length,257);
});
test('one graph, 17 original stages, 262 nodes, 352 edges, all reachable',()=>{
 assert.equal(f.stages.length,17);assert.equal(f.nodes.length,262);assert.equal(f.edges.length,352);
 const g=new Map(f.nodes.map(n=>[n.id,[]]));for(const e of f.edges){assert.ok(g.has(e.from));assert.ok(g.has(e.to));g.get(e.from).push(e.to)}
 const seen=new Set(['I0']),stack=['I0'];while(stack.length){for(const t of g.get(stack.pop()))if(!seen.has(t)){seen.add(t);stack.push(t)}}
 assert.equal(seen.size,262);
 assert.deepEqual([...g].filter(([k,a])=>a.length===0).map(x=>x[0]).sort(),['END0','END1']);
});
test('immutable human brief precedes compiled planning and quality reference',()=>{
 assert.ok(route('I1','BR0'));assert.ok(route('BR0','I2'));
 assert.ok(route('P0','BR1'));assert.ok(route('BR1','P1'));
 assert.ok(route('PF3','QL0'));assert.ok(route('QL0','D39'));
 assert.equal(f.humanBriefPolicy.immutable,true);assert.equal(f.humanBriefPolicy.singleBriefMultipleFlows,true);
});
test('browser checks during build, telemetry during persistence',()=>{
 assert.ok(route('S0','WEB0'));assert.ok(route('WEB0','S1'));
 assert.ok(route('G0','TR0'));assert.ok(route('TR0','G1'));
 assert.equal(f.stageInstrumentation.stages.length,17);
});
test('quality reference is transferable not palette copy',()=>{
 assert.equal(f.qualityTransfer.secondConsumerRequiredForReusablePromotion,true);
 assert.ok(f.qualityTransfer.principle.includes('not copying'));
 assert.equal(f.subflows.length,9);
});
test('no cancellation via failed first article and scene incomplete',()=>{
 assert.ok(route('PP2','B0'));assert.ok(route('PP3','B0'));
 for(const id of ['D39','D40','D41','D42'])assert.equal(node(id).preflightGate.blocking,false);
});
test('candidate with artistic FAIL and missing trace can still be delivered',()=>{
 const r={schema:'prometeo.3d.flow-run/v1',creationId:'scene-full',flow:{id:f.id,version:f.version,sha256Canonical:f.sha256Canonical},status:'CANDIDATE',buildScope:'FULL_ATTEMPT',cameraMode:'MOVING',nodeResults:[{nodeId:'D40',status:'FAIL'}],provenance:{sourceCommit:'a'.repeat(40)}};
 const q=validateReceipt(r,f);assert.equal(q.ok,true);assert.equal(q.mustContinueProduction,true);
 assert.ok(q.warnings.includes('BRIEF_LOCK_MISSING__COMPARE_WITH_CAUTION'));
 assert.ok(q.warnings.includes('STAGE_TRACE_MISSING__LEARNING_INCOMPLETE'));
});
