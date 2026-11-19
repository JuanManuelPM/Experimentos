import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const flow=read('./FLOW_3D_MASTER.json'),archive=read('./versions/1.0.0/flow.json'),idx=read('./FLOW_INDEX.json'),creations=read('./CREATIONS.json');
const canon=v=>JSON.stringify(Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))));
const sort=(v)=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
const sha=v=>createHash('sha256').update(JSON.stringify(sort(v))).digest('hex');
test('flow has 17 stages, 224 distinct nodes and 288 valid edges',()=>{
 assert.equal(flow.stages.length,17);assert.equal(flow.nodes.length,224);assert.equal(flow.edges.length,288);
 const ids=new Set(flow.nodes.map(n=>n.id));assert.equal(ids.size,flow.nodes.length);
 assert.ok(flow.edges.every(e=>ids.has(e.from)&&ids.has(e.to)));
 assert.ok(flow.nodes.every(n=>n.docRef?.includes('#'+n.id.toLowerCase())));
});
test('all nodes reachable and only two terminal sinks',()=>{
 const adj=new Map(flow.nodes.map(n=>[n.id,[]]));for(const edge of flow.edges)adj.get(edge.from).push(edge.to);
 const visited=new Set(['I0']);const stack=['I0'];while(stack.length){for(const id of adj.get(stack.pop()))if(!visited.has(id)){visited.add(id);stack.push(id)}}
 assert.equal(visited.size,flow.nodes.length);
 assert.deepEqual([...adj].filter(([,links])=>links.length===0).map(([id])=>id).sort(),['END0','END1']);
});
test('archived version exactly matches current and SHA-256 canonical digest',()=>{
 assert.deepEqual(flow,archive);const {sha256Canonical,...stripped}=flow;
 assert.equal(sha(stripped),flow.sha256Canonical);assert.equal(idx.sha256Canonical,flow.sha256Canonical);assert.equal(idx.current,flow.version);assert.equal(idx.currentFile,'./versions/1.0.0/flow.json');
});
test('visible flow includes orientation, roof, locomotion, camera, fixes and persisted version',()=>{
 const ids=new Set(flow.nodes.map(n=>n.id));for(const id of ['H4','H5','O8','E5','OR2','OR12','M10','M12','M15','QA2','QA6','QA8','QA9','FIX6','G8','PUB4'])assert.ok(ids.has(id));
 const edges=new Set(flow.edges.map(e=>e.from+'>'+e.to));for(const edge of ['OR13>OR11','M14>D16','QA8>FIX0','FIX8>D26','G8>D27'])assert.ok(edges.has(edge),edge);
});
test('historical creations have no invented flow version or PASS/FAIL overlap',()=>{
 assert.equal(creations.records.length,2);
 for(const c of creations.records){assert.equal(c.flowVersionUsed,null);assert.equal(c.flowSha256,null);const f=new Set(c.nodesFailed);assert.ok((c.nodesNotRun||[]).every(n=>!f.has(n)))}
 assert.deepEqual(creations.records.find(c=>c.id==='cocina-umbria-001').issues,flow.knownIssues.map(x=>x.id));
});
test('documentation references every node ID',()=>{
 const md=readFileSync(new URL('./FLOW_3D_MASTER.md',import.meta.url),'utf8');
 for(const n of flow.nodes)assert.ok(md.includes('### '+n.id+' ·'),n.id);
});