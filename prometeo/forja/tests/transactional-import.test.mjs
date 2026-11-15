import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../forge.mjs',import.meta.url),'utf8');
const code=source.slice(source.indexOf('async function replaceScene('),source.indexOf('const PRESETS='));
const factory=new Function('state','validateProject','setBusy','setLoading','status','toast','addAsset','metrics','renderObjects','updateInspector','resetCamera','historyPush','saveLocal','historyButtons','$','console',code+';return replaceScene');
function make(fail){
 const old={uid:'old',root:{},mixer:{stopAllAction(){}}};
 const state={busy:false,webgl:true,objects:[old],sceneName:'OLD',selected:'old',request:0,
 byId:new Map([['good',{id:'good'}],['bad',{id:'bad'}]]),
 world:{add(){},remove(){}},transform:{detach(){}}};
 let history=0,stopped=0;
 const fn=factory(state,x=>{if(!x||!Array.isArray(x.items))throw Error('invalid');return x;},v=>state.busy=v,()=>{},()=>{},()=>{},
 async(asset,item,silent,staging)=>{
  assert.equal(staging,true);
  if(fail&&asset.id==='bad')return null;
  return {uid:asset.id,root:{},mixer:{stopAllAction(){stopped++}}};
 },()=>{},()=>{},()=>{},()=>{},()=>history++,()=>{},()=>{},()=>({value:''}),console);
 return {state,fn,history:()=>history,stopped:()=>stopped,old};
}
const incoming={name:'NEW',items:[{id:'good'},{id:'bad'}]};
test('failed asset load leaves previous scene and history untouched',async()=>{
 const a=make(true);assert.equal(await a.fn(incoming),false);
 assert.equal(a.state.objects.length,1);assert.equal(a.state.objects[0],a.old);
 assert.equal(a.state.sceneName,'OLD');assert.equal(a.history(),0);assert.equal(a.stopped(),1);
});
test('successful import commits all objects once',async()=>{
 const a=make(false);assert.equal(await a.fn(incoming),true);
 assert.equal(a.state.objects.length,2);assert.equal(a.state.sceneName,'NEW');assert.equal(a.history(),1);
});
test('empty import commits empty scene',async()=>{
 const a=make(false);assert.equal(await a.fn({name:'EMPTY',items:[]}),true);
 assert.equal(a.state.objects.length,0);assert.equal(a.history(),1);
});
test('invalid input does not mutate old scene',async()=>{
 const a=make(false);assert.equal(await a.fn(null),false);
 assert.equal(a.state.objects[0],a.old);assert.equal(a.history(),0);
});
test('staging addAsset is guarded from world and state mutation',()=>{
 assert.match(source,/if\(!staging\)\{state\.world\.add\(root\);state\.objects\.push\(entry\)\}/);
 assert.match(source,/if\(!staging\)\{metrics\(\);renderObjects\(\)\}return entry/);
});
