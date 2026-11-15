import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../forge.mjs',import.meta.url),'utf8');
const code=source.slice(source.indexOf('async function replaceScene('),source.indexOf('const PRESETS='));
const factory=new Function('state','validateProject','setBusy','setLoading','status','toast','addAsset',
 'metrics','renderObjects','updateInspector','resetCamera','historyPush','saveLocal','historyButtons','$','console',
 code+';return replaceScene');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
function fixture({load,uiFail=false,historyFail=false}={}){
 const old={uid:'old',root:{id:'old'},mixer:{stopped:0,stopAllAction(){this.stopped++}}};
 const world=new Set([old.root]);
 const elements={'scene-name':{value:'OLD'}};
 const state={busy:false,webgl:true,objects:[old],selected:'old',sceneName:'OLD',
  history:[{name:'OLD'}],cursor:0,request:0,
  byId:new Map(['a','b','c'].map(id=>[id,{id}])),
  world:{add(x){world.add(x)},remove(x){world.delete(x)}},
  transform:{detach(){}}};
 let histories=0;
 const fn=factory(state,x=>{if(!x||!Array.isArray(x.items))throw Error('invalid');return x;},
  x=>{state.busy=x},()=>{},()=>{},()=>{},
  async(asset,item,silent,staging)=>{
   assert.equal(staging,true);
   if(load)return load(asset,item);
   return {uid:item.id,root:{id:item.id},mixer:{stopAllAction(){}}};
  },
  ()=>{if(uiFail)throw Error('UI_FAIL')},()=>{},()=>{},()=>{},
  ()=>{histories++;if(historyFail)throw Error('HISTORY_FAIL');state.history.push({name:state.sceneName});state.cursor++},
  ()=>true,()=>{},id=>elements[id],{warn(){},error(){}});
 return {state,world,old,fn,histories:()=>histories,elements};
}
const scene={name:'NEW',items:[{id:'a'},{id:'b'},{id:'c'}]};
test('success preserves source order despite reverse completion',async()=>{
 const waits=Object.fromEntries(['a','b','c'].map(x=>[x,deferred()]));
 const f=fixture({load:async(asset,item)=>{await waits[item.id].promise;return {uid:item.id,root:{id:item.id}}}});
 const pending=f.fn(scene);
 waits.c.resolve();waits.b.resolve();waits.a.resolve();
 assert.equal(await pending,true);
 assert.deepEqual(f.state.objects.map(x=>x.uid),['a','b','c']);
 assert.equal(f.old.mixer.stopped,1);
});
test('worker rejection does not release busy before other loads settle',async()=>{
 const waits=Object.fromEntries(['a','b','c'].map(x=>[x,deferred()]));
 const f=fixture({load:async(asset,item)=>{await waits[item.id].promise;return {uid:item.id,root:{id:item.id,mixer:{stopAllAction(){}}}}}});
 const pending=f.fn(scene);
 waits.a.reject(Error('network'));await Promise.resolve();await Promise.resolve();
 assert.equal(f.state.busy,true);
 waits.b.resolve();waits.c.resolve();
 assert.equal(await pending,false);
 assert.equal(f.state.busy,false);
 assert.equal(f.state.objects[0],f.old);
 assert.equal(f.old.mixer.stopped,0);
});
test('UI failure rolls back world and scene',async()=>{
 const f=fixture({uiFail:true});
 assert.equal(await f.fn(scene),false);
 assert.deepEqual([...f.world],[f.old.root]);
 assert.equal(f.state.objects[0],f.old);
 assert.equal(f.state.sceneName,'OLD');
 assert.equal(f.old.mixer.stopped,0);
 assert.equal(f.histories(),0);
});
test('history failure restores previous state and history',async()=>{
 const f=fixture({historyFail:true});
 assert.equal(await f.fn(scene),false);
 assert.deepEqual([...f.world],[f.old.root]);
 assert.equal(f.state.history.length,1);
 assert.equal(f.state.cursor,0);
 assert.equal(f.elements['scene-name'].value,'OLD');
});
test('empty import commits an empty scene',async()=>{
 const f=fixture();
 assert.equal(await f.fn({name:'EMPTY',items:[]}),true);
 assert.equal(f.state.objects.length,0);
 assert.equal(f.old.mixer.stopped,1);
});
