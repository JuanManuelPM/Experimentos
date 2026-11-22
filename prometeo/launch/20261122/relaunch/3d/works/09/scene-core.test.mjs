// FORJA W7 · deterministic gates before browser/perceptual assessment.
// Run: node --test scene-core.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCHEMA,validateDocument,sampleTrack,putKey,compareDocuments} from './scene-core.mjs';
import {createFixtureGLB,describeFixtureGLB} from './fixture-glb.mjs';
const project=()=>JSON.parse(readFileSync(new URL('./DEMO_PROJECT.json',import.meta.url),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const fails=(change)=>{const d=project();change(d);assert.throws(()=>validateDocument(d))};
test('01 | portable V2 project has real GLB',()=>{
  const d=project(),r=validateDocument(d);
  assert.equal(d.schema,SCHEMA);assert.equal(r.nodes,13);assert.equal(r.assets,1);assert.equal(r.tracks,3);
});
test('02 | GLB fixture header, source mesh and animation tree',()=>{
  const b=createFixtureGLB(),meta=describeFixtureGLB(b);
  assert.equal(meta.nodes,4);assert.equal(meta.meshes,2);assert.equal(meta.animations,1);
  assert.ok(b.byteLength>10000);
});
test('03 | exact generated binary in published project',()=>{
  const b=Buffer.from(createFixtureGLB()),inside=Buffer.from(project().assets.original_kinetic_glb,'base64');
  assert.equal(Buffer.compare(b,inside),0);
});
test('04 | nested pivot is preserved in project',()=>{
  const root=project().nodes.find(n=>n.kind==='glb');
  const scene=root.children[0],source=scene.children[0],pivot=source.children[0];
  assert.equal(pivot.uid,'w7_pivot');assert.equal(pivot.children.length,2);
});
test('05 | keyframes on imported GLB survive JSON wire',()=>{
  const d=project(),copy=JSON.parse(JSON.stringify(d));
  assert.ok(compareDocuments(d,copy));
  assert.deepEqual(d.tracks.find(t=>t.uid==='w7_glb').keys.map(k=>k.t),[0,8]);
});
test('06 | midpoint motion on real import track',()=>{
  const d=project(),keys=d.tracks.find(t=>t.uid==='w7_glb').keys;
  const q=sampleTrack(keys,4).q;
  assert.ok(Math.abs(Math.hypot(...q)-1)<1e-6);assert.ok(q[1]>.5&&q[1]<.6);
});
test('07 | endpoint motion is deterministic',()=>{
  const keys=project().tracks.find(t=>t.uid==='w7_glb').keys;
  assert.deepEqual(sampleTrack(keys,8).q,keys[1].q);
});
test('08 | key overwrite does not duplicate time',()=>{
  const keys=project().tracks[0].keys;
  assert.equal(putKey(keys,{...keys[0]}).length,keys.length);
});
test('09 | independent base scene retained',()=>{
  const d=project();assert.ok(d.nodes.some(n=>n.uid==='g1'));assert.ok(d.nodes.some(n=>n.uid==='c1'));
});
test('10 | reject duplicate tree UID',()=>fails(d=>{d.nodes[0].uid='w7_glb'}));
test('11 | reject missing original GLB bytes',()=>fails(d=>{d.assets={}}));
test('12 | reject fake asset advertised as GLB',()=>fails(d=>{d.assets.original_kinetic_glb='ZmFrZQ=='}));
test('13 | reject GLB without imported hierarchy',()=>fails(d=>{d.nodes.find(n=>n.kind==='glb').children=[]}));
test('14 | reject duplicate track on same node',()=>fails(d=>{d.tracks.push(clone(d.tracks[0]))}));
test('15 | reject reversed keyframe chronology',()=>fails(d=>{d.tracks[0].keys.reverse()}));
test('16 | reject missing tracked node',()=>fails(d=>{d.tracks[0].uid='does_not_exist'}));
test('17 | reject invalid quaternion length',()=>fails(d=>{d.nodes[0].q=[0,1,0]}));
test('18 | reject excessive tree depth',()=>fails(d=>{let n=d.nodes[0];for(let i=0;i<42;i++){let c={uid:'depth'+i,kind:'group',name:'depth',p:[0,0,0],q:[0,0,0,1],s:[1,1,1],children:[]};n.children=[c];n=c}}));
test('19 | old asset-free W6 schema remains readable',()=>{
  const d=project();d.nodes=d.nodes.filter(n=>n.kind!=='glb');d.assets={};d.tracks=d.tracks.filter(t=>t.uid!=='w7_glb');
  assert.equal(validateDocument(d).assets,0);
});
test('20 | three sampled poses stable after serialisation',()=>{
  const d=project(),c=clone(d),a=d.tracks.find(t=>t.uid==='w7_glb'),b=c.tracks.find(t=>t.uid==='w7_glb');
  for(const t of [0,1.25,4,6.75,8])assert.ok(compareDocuments(sampleTrack(a.keys,t),sampleTrack(b.keys,t)));
});
// Browser/GPU interaction, GLTFLoader render, source animation playback and Android touch NOT_RUN here.
