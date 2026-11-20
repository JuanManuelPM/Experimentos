import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateReceipt} from './validate-run.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const flow=read('./FLOW_3D_MASTER.json'),v11=read('./versions/1.1.0/flow.json'),v10=read('./versions/1.0.0/flow.json'),v12=read('./versions/1.2.0/flow.json'),idx=read('./FLOW_INDEX.json'),creations=read('./CREATIONS.json'),ui=read('./PRESENTATION.json');
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
const sha=f=>{const {sha256Canonical,...canonical}=f;return createHash('sha256').update(JSON.stringify(sort(canonical))).digest('hex')};
const node=id=>flow.nodes.find(n=>n.id===id);
const connected=(from,to)=>flow.edges.some(e=>e.from===from&&e.to===to);
test('257 nodes, 346 edges, 17 unchanged stages and all reachable',()=>{
 assert.equal(flow.version,'1.2.0');assert.equal(flow.nodes.length,257);assert.equal(flow.edges.length,346);assert.equal(flow.stages.length,17);
 const ids=new Set(flow.nodes.map(n=>n.id));assert.equal(ids.size,257);assert.ok(flow.edges.every(e=>ids.has(e.from)&&ids.has(e.to)));
 const g=new Map(flow.nodes.map(n=>[n.id,[]]));for(const e of flow.edges)g.get(e.from).push(e.to);
 const seen=new Set(['I0']),stack=['I0'];while(stack.length){for(const to of g.get(stack.pop()))if(!seen.has(to)){seen.add(to);stack.push(to)}}
 assert.equal(seen.size,257);assert.deepEqual([...g].filter(([,x])=>!x.length).map(x=>x[0]).sort(),['END0','END1']);
});
test('new current 1.2.0 hash and older immutable graphs remain intact',()=>{
 assert.deepEqual(flow,v12);assert.equal(sha(flow),flow.sha256Canonical);assert.equal(idx.current,'1.2.0');assert.equal(idx.sha256Canonical,flow.sha256Canonical);
 assert.equal(v11.nodes.length,244);assert.equal(v11.edges.length,328);assert.equal(sha(v11),v11.sha256Canonical);assert.equal(v10.nodes.length,224);assert.equal(sha(v10),v10.sha256Canonical);
 assert.equal(idx.versions.length,3);
});
test('preventive nodes required on path before acquisition, classification and camera',()=>{
 for(const id of ['PF0','PF1','PF2','PF3','D39','PP0','D40','PP1','D41','PP2','PP3','CAM0','D42'])assert.ok(node(id));
 assert.ok(connected('P9','PF0'));assert.ok(!connected('P9','A0'));
 assert.ok(connected('A12','PP0'));assert.ok(!connected('A12','B0'));
 assert.ok(connected('D41','B0'));assert.ok(connected('D41','PP2'));assert.ok(connected('D41','PP3'));
 assert.ok(connected('C1','CAM0'));assert.ok(!connected('C1','C2'));
 assert.equal(flow.nodes.filter(n=>n.preflightGate).length,4);
});
test('all 10 existing QA gates still include FAIL/NOT_RUN links',()=>{
 const gates=flow.nodes.filter(n=>n.type==='decision'&&n.gate&&/^D(29|3[0-8])$/.test(n.id));
 assert.equal(gates.length,10);
 for(const n of gates){const edges=flow.edges.filter(e=>e.from===n.id);assert.equal(edges.length,3);assert.ok(edges.some(e=>e.label==='FAIL'&&e.to===n.gate.onFailure));assert.ok(edges.some(e=>e.label==='NOT_RUN'&&e.to==='QA17'));}
});
test('subflows keep ownership and stage coverage',()=>{
 assert.equal(flow.subflows.length,8);for(const s of flow.subflows){assert.ok(node(s.start));for(const stage of s.stages)assert.ok(flow.stages.some(x=>x.id===stage));}
 assert.deepEqual(new Set(ui.route.flatMap(g=>g.stages||[g.stage])),new Set(flow.stages.map(x=>x.id)));
});
test('historical works remain pinned to old version',()=>{
 assert.equal(creations.records.find(c=>c.id==='cocina-umbria-001').flowVersionUsed,null);
 const c=creations.records.find(c=>c.id==='cocina-umbria-002');
 assert.equal(c.flowVersionUsed,'1.1.0');assert.equal(c.flowSha256,v11.sha256Canonical);assert.equal(c.artApproval,'NOT_REVIEWED');
});
test('scaled scene without early gates cannot be verified',()=>{
 const r={schema:'prometeo.3d.flow-run/v1',creationId:'test-001',flow:{id:flow.id,version:'1.2.0',sha256Canonical:flow.sha256Canonical},status:'CANDIDATE',buildScope:'SCALED',cameraMode:'MOVING',nodeResults:[],provenance:{sourceRepo:'owner/repo',sourceRef:'candidate/test',sourceCommit:'a'.repeat(40)},preventiveBlueprint:{path:'plan.json',gitBlob:'b'.repeat(40)}};
 const bad=validateReceipt(r,flow);assert.equal(bad.ok,false);assert.ok(bad.errors.includes('EARLY_GATE_UNPROVEN_D41'));
});
test('static scene does not need fabricated moving camera PASS',()=>{
 const r={schema:'prometeo.3d.flow-run/v1',creationId:'test-001',flow:{id:flow.id,version:'1.2.0',sha256Canonical:flow.sha256Canonical},status:'CANDIDATE',buildScope:'FIRST_ARTICLE',cameraMode:'STATIC',nodeResults:[],provenance:{sourceRepo:'owner/repo',sourceRef:'candidate/test',sourceCommit:'a'.repeat(40)},preventiveBlueprint:{path:'plan.json',gitBlob:'b'.repeat(40)}};
 assert.equal(validateReceipt(r,flow).ok,true);
});
test('all v1.2 prevention nodes documented',()=>{
 const d=readFileSync(new URL('./versions/1.2.0/PREVENTION_CONTRACT.md',import.meta.url),'utf8');
 for(const n of flow.nodes.filter(n=>n.id.startsWith('PF')||n.id.startsWith('PP')||n.id==='D39'||n.id==='D40'||n.id==='D41'||n.id==='CAM0'||n.id==='D42'))assert.ok(d.includes('### '+n.id));
});
