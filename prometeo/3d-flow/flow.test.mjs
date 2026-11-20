import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateReceipt} from './validate-run.mjs';
const rd=x=>JSON.parse(readFileSync(new URL(x,import.meta.url),'utf8'));
const f=rd('./FLOW_3D_MASTER.json'),v13=rd('./versions/1.3.0/flow.json'),v12=rd('./versions/1.2.0/flow.json'),idx=rd('./FLOW_INDEX.json');
const sort=x=>Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;
const hash=x=>{const {sha256Canonical,...a}=x;return createHash('sha256').update(JSON.stringify(sort(a))).digest('hex')};
const routes=id=>f.edges.filter(e=>e.from===id);
test('latest 1.3 immutable master, hash and prior version',()=>{
 assert.equal(f.version,'1.3.0');assert.deepEqual(f,v13);assert.equal(hash(f),f.sha256Canonical);assert.equal(idx.current,'1.3.0');assert.equal(idx.sha256Canonical,f.sha256Canonical);assert.equal(v12.version,'1.2.0');assert.equal(v12.nodes.length,257);
});
test('257 nodes, 17 stages, reachable and 2 terminal nodes',()=>{
 assert.equal(f.nodes.length,257);assert.equal(f.stages.length,17);
 const adj=new Map(f.nodes.map(n=>[n.id,[]]));
 for(const e of f.edges){assert.ok(adj.has(e.from));assert.ok(adj.has(e.to));adj.get(e.from).push(e.to)}
 const seen=new Set(['I0']),stack=['I0'];while(stack.length)for(const x of adj.get(stack.pop()))if(!seen.has(x)){seen.add(x);stack.push(x)}
 assert.equal(seen.size,257);assert.deepEqual([...adj].filter(([k,a])=>!a.length).map(x=>x[0]).sort(),['END0','END1']);
});
test('FAIL first-article never ends/restarts full production',()=>{
 assert.ok(routes('D41').some(e=>e.label==='FAIL'&&e.to==='PP2'));
 assert.ok(routes('D41').some(e=>e.label==='NOT_RUN'&&e.to==='PP3'));
 assert.ok(routes('PP2').some(e=>e.to==='B0'));assert.ok(routes('PP3').some(e=>e.to==='B0'));
 for(const id of ['D39','D40','D41','D42'])assert.equal(f.nodes.find(n=>n.id===id).preflightGate.blocking,false);
});
test('late QA failures record and move forward, no self-repair in same run',()=>{
 const forbidden=['FIX0','QA0','A0'];
 for(let i=29;i<=38;i++){const id='D'+i;assert.equal(f.nodes.find(n=>n.id===id).gate.blocking,false);const gate=routes(id);assert.ok(gate.every(e=>e.label!=='PASS'||!forbidden.includes(e.to)))}
 for(let i=18;i<=27;i++)assert.ok(routes('QA'+i).every(e=>e.to!=='FIX0'));
});
test('full attempt with negative D40 is not rejected as candidate',()=>{
 const rc={schema:'prometeo.3d.flow-run/v1',creationId:'train-v3',status:'CANDIDATE',buildScope:'FULL_ATTEMPT',cameraMode:'MOVING',flow:{id:f.id,version:f.version,sha256Canonical:f.sha256Canonical},nodeResults:[{nodeId:'D40',status:'FAIL'}],provenance:{sourceCommit:'a'.repeat(40)}};
 assert.equal(validateReceipt(rc,f).ok,true);
 assert.equal(validateReceipt({...rc,status:'VERIFIED'},f).ok,false);
});
test('contract explicitly forbids canary-as-final and aesthetic veto',()=>{
 const s=readFileSync(new URL('./versions/1.3.0/PRODUCTION_CONTRACT.md',import.meta.url),'utf8');
 assert.match(s,/NO CANCELAR/);assert.match(s,/NO ACORTAR/);assert.match(s,/primera pasada|primer intento/i);
});
