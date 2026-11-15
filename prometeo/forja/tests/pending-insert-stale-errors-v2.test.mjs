import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Exercise the actual addAsset function shipped with FORJA, not a copied rewrite.
// Three/WebGL are mocked: these tests prove commit ordering, not GPU rendering.
const source=readFileSync(new URL('../forge.mjs',import.meta.url),'utf8');
const start=source.indexOf('async function addAsset(');
const end=source.indexOf('function select(uid)',start);
assert.ok(start>=0 && end>start,'source function anchors must remain recognizable');
const implementation=source.slice(start,end);
function pending(){
 let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j});
 return {promise,resolve,reject};
}
function fixture(){
 const queue=pending(), added=[], selected=[], histories=[], statuses=[], toasts=[];
 const state={webgl:true,busy:false,request:0,objects:[],failed:0,world:{add(root){added.push(root)}}};
 const THREE={
  Box3:class{min={y:0};setFromObject(){return this}getSize(size){size.y=1;return size}getCenter(center){center.x=center.y=center.z=0;return center}},
  Vector3:class{x=0;y=0;z=0},
  Group:class{userData={};position={set(){}};rotation={y:0};scale={set(){}};add(){}}
 };
 const fakeConsole={warn(){},error(){}};
 const add=new Function('state','modelTemplate','SkeletonUtils','THREE','clamp','finite','defaultHeight','status','short','toast','select','historyPush','metrics','renderObjects','console','idCounter',
   implementation+';return addAsset')(
    state,()=>queue.promise,{clone:()=>({position:{set(){}}})},THREE,
    (x,lo,hi)=>Math.min(hi,Math.max(lo,x)),
    (x,fallback=0)=>Number.isFinite(Number(x))?Number(x):fallback,
    ()=>2,v=>statuses.push(v),x=>x,v=>toasts.push(v),uid=>selected.push(uid),()=>histories.push(true),
    ()=>{},()=>{},fakeConsole,0);
 return {state,queue,added,selected,histories,statuses,toasts,add};
}
const asset={id:'nature-kit/tree',pack:'nature-kit'};
const loaded={scene:{},animations:[]};

test('late insert during import never writes into the replacing scene',async()=>{
 const f=fixture();
 const insertion=f.add(asset,{},false,false);
 f.state.request++;f.state.busy=true;
 f.queue.resolve(loaded);
 assert.equal(await insertion,null);
 assert.equal(f.state.objects.length,0);
 assert.equal(f.added.length,0);
 assert.equal(f.histories.length,0);
});
test('late insert after import finishes does not contaminate new scene',async()=>{
 const f=fixture();
 const insertion=f.add(asset,{},false,false);
 f.state.request++;f.state.busy=false;
 f.queue.resolve(loaded);
 assert.equal(await insertion,null);
 assert.equal(f.state.objects.length,0);
 assert.equal(f.added.length,0);
});
test('transient busy without revision also rejects stale insert',async()=>{
 const f=fixture();
 const insertion=f.add(asset,{},true,false);
 f.state.busy=true;
 f.queue.resolve(loaded);
 assert.equal(await insertion,null);
 assert.equal(f.state.objects.length,0);
});
test('ordinary add still commits to scene and undo history',async()=>{
 const f=fixture();
 const insertion=f.add(asset,{},false,false);
 f.queue.resolve(loaded);
 const entry=await insertion;
 assert.ok(entry);
 assert.equal(f.state.objects.length,1);
 assert.equal(f.added.length,1);
 assert.equal(f.selected.length,1);
 assert.equal(f.histories.length,1);
});
test('replaceScene staging loads while busy without mutating live world',async()=>{
 const f=fixture();
 f.state.busy=true;
 const staging=f.add(asset,{},true,true);
 f.state.request++;
 f.queue.resolve(loaded);
 const entry=await staging;
 assert.ok(entry);
 assert.equal(f.state.objects.length,0);
 assert.equal(f.added.length,0);
});

// Independent verifier found stale rejected asset loads still corrupted scene error state.
test('stale rejection during replacement does not pollute new scene',async()=>{
 const f=fixture();const pending=f.add(asset,{},false,false);
 f.state.request++;f.state.busy=true;
 const previousStatus=f.statuses.length;
 f.queue.reject(Error('old scene network failed'));
 assert.equal(await pending,null);
 assert.equal(f.state.failed,0);
 assert.equal(f.statuses.length,previousStatus);
 assert.equal(f.toasts.length,0);
});
test('stale rejection after replacement finishes still ignored',async()=>{
 const f=fixture();const pending=f.add(asset,{},false,false);
 f.state.request++;f.state.busy=false;
 f.queue.reject(Error('old request 404'));
 assert.equal(await pending,null);
 assert.equal(f.state.failed,0);
 assert.equal(f.toasts.length,0);
});
test('genuine current-scene load error remains visible',async()=>{
 const f=fixture();const pending=f.add(asset,{},false,false);
 f.queue.reject(Error('current 404'));
 assert.equal(await pending,null);
 assert.equal(f.state.failed,1);
 assert.ok(f.statuses.some(v=>v.includes('FALLÓ LA CARGA')));
 assert.ok(f.toasts.some(v=>v.includes('No se pudo cargar')));
});
test('staging load rejection still reports error for transaction abort',async()=>{
 const f=fixture();f.state.busy=true;const pending=f.add(asset,{},true,true);
 f.state.request++;f.queue.reject(Error('broken staged asset'));
 assert.equal(await pending,null);
 assert.equal(f.state.failed,1);
 assert.ok(f.statuses.some(v=>v.includes('FALLÓ LA CARGA')));
});
test('temporary busy flag suppresses outdated live-load error',async()=>{
 const f=fixture();const pending=f.add(asset,{},true,false);
 f.state.busy=true;f.queue.reject(Error('obsolete'));
 assert.equal(await pending,null);
 assert.equal(f.state.failed,0);
});
