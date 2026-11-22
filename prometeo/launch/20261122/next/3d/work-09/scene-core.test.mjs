// Execute with: node --test scene-core.test.mjs
// Pure structural tests. Browser/GPU/GLB import require separate perceptual QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCHEMA,validateDocument,sampleTrack,putKey,compareDocuments} from './scene-core.mjs';

const p=[0,0,0],q=[0,0,0,1],s=[1,1,1];
const key0={t:0,p:[0,0,0],q:[0,0,0,1],s:[1,1,1]};
const key8={t:8,p:[8,4,0],q:[0,1,0,0],s:[3,1,1]};
function fixture(){
 return {schema:SCHEMA,name:'test',duration:8,time:0,assets:{},
  nodes:[{uid:'parent',kind:'group',name:'parent',p,q,s,children:[
   {uid:'child',kind:'primitive',name:'child',p,q,s,shape:'box',color:'#c69d65',children:[]}
  ]}],tracks:[{uid:'child',keys:[key0,key8]}]};
}
function fails(change){
 const doc=structuredClone(fixture());change(doc);assert.throws(()=>validateDocument(doc));
}
test('valid scene tree',()=>assert.equal(validateDocument(fixture()).nodes,2));
test('position interpolation at midpoint',()=>assert.equal(sampleTrack([key0,key8],4).p[0],4));
test('scale interpolation at midpoint',()=>assert.equal(sampleTrack([key0,key8],4).s[0],2));
test('unit quaternion at midpoint',()=>assert.ok(Math.abs(Math.hypot(...sampleTrack([key0,key8],4).q)-1)<1e-6));
test('endpoint is exact',()=>assert.equal(sampleTrack([key0,key8],8).p[0],8));
test('key overwrite does not duplicate',()=>assert.equal(putKey([key0,key8],{...key0,p:[2,1,1]}).length,2));
test('canonical roundtrip',()=>assert.equal(compareDocuments(fixture(),JSON.parse(JSON.stringify(fixture()))),true));
test('rejects duplicate node IDs',()=>fails(d=>{d.nodes[0].children[0].uid='parent'}));
test('rejects unsorted keys',()=>fails(d=>{d.tracks[0].keys.reverse()}));
test('rejects absent binary asset',()=>fails(d=>{d.nodes[0].kind='glb';d.nodes[0].asset='missing'}));
test('rejects excessive depth',()=>fails(d=>{let n=d.nodes[0];for(let i=0;i<42;i++){const c={uid:'deep'+i,kind:'group',name:'deep',p,q,s,children:[]};n.children=[c];n=c}}));
test('authored demo JSON is valid',()=>{
 const file=JSON.parse(readFileSync(new URL('./DEMO_PROJECT.json',import.meta.url),'utf8'));
 assert.equal(validateDocument(file).nodes,7);assert.equal(file.tracks.length,2);
});
