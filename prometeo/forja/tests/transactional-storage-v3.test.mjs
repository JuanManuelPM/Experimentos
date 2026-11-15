import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../forge.mjs',import.meta.url),'utf8');
const historyCode=source.slice(source.indexOf('function historyPush(){'),source.indexOf('function historyButtons(){'));
const replaceCode=source.slice(source.indexOf('async function replaceScene('),source.indexOf('const PRESETS='));
function fixture(storageOK=true){
 const old={uid:'old',root:{id:'old'},mixer:{stopAllAction(){}}};
 const world=new Set([old.root]),elements={'scene-name':{value:'OLD'}};
 const state={busy:false,webgl:true,objects:[old],selected:'old',sceneName:'OLD',
  history:[{name:'OLD'}],cursor:0,request:0,
  byId:new Map([['a',{id:'a'}],['b',{id:'b'}]]),
  world:{add(x){world.add(x)},remove(x){world.delete(x)}},transform:{detach(){}}};
 let writes=0;
 const snapshot=()=>({name:state.sceneName,items:state.objects.map(e=>e.uid)});
 const saveLocal=()=>{writes++;return storageOK};
 const historyButtons=()=>{};
 const historyPush=new Function('state','snapshot','saveLocal','historyButtons',
  historyCode+';return historyPush')(state,snapshot,saveLocal,historyButtons);
 const replaceScene=new Function('state','validateProject','setBusy','setLoading','status','toast','addAsset',
  'metrics','renderObjects','updateInspector','resetCamera','historyPush','saveLocal','historyButtons','$','console',
  replaceCode+';return replaceScene')(state,x=>x,x=>{state.busy=x},()=>{},()=>{},()=>{},
   async(asset,item)=>({uid:item.id,root:{id:item.id},mixer:{stopAllAction(){}}}),
   ()=>{},()=>{},()=>{},()=>{},historyPush,saveLocal,historyButtons,id=>elements[id],{warn(){},error(){}});
 return {state,world,old,elements,replaceScene,writes:()=>writes};
}
test('failed localStorage write rolls back scene, history, cursor and input',async()=>{
 const f=fixture(false);
 assert.equal(await f.replaceScene({name:'NEW',items:[{id:'a'}]}),false);
 assert.deepEqual([...f.world],[f.old.root]);
 assert.equal(f.state.sceneName,'OLD');
 assert.equal(f.state.objects[0],f.old);
 assert.equal(f.state.history.length,1);
 assert.equal(f.state.cursor,0);
 assert.equal(f.elements['scene-name'].value,'OLD');
 assert.equal(f.writes(),1);
 assert.equal(f.state.busy,false);
});
test('successful localStorage write commits exactly one history entry',async()=>{
 const f=fixture(true);
 assert.equal(await f.replaceScene({name:'NEW',items:[{id:'a'},{id:'b'}]}),true);
 assert.deepEqual(f.state.objects.map(x=>x.uid),['a','b']);
 assert.equal(f.state.history.length,2);
 assert.equal(f.state.cursor,1);
 assert.equal(f.writes(),1);
});
test('remember:false still fails safely when localStorage rejects',async()=>{
 const f=fixture(false);
 assert.equal(await f.replaceScene({name:'NEW',items:[{id:'a'}]},{remember:false}),false);
 assert.deepEqual([...f.world],[f.old.root]);
 assert.equal(f.state.history.length,1);
});
