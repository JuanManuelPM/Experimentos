import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../forge.mjs',import.meta.url),'utf8');
const code=source.slice(source.indexOf('async function replaceScene('),source.indexOf('const PRESETS='));
const history=source.slice(source.indexOf('function historyPush(){'),source.indexOf('function historyButtons(){'));
function fixture({failStart=false,failFinish=false,failSave=false}={}){
 const root={id:'old'},old={uid:'old',root,mixer:{stopAllAction(){}}};
 const world=new Set([root]),events=[];
 const state={busy:false,webgl:true,objects:[old],selected:'old',sceneName:'OLD',history:[{name:'OLD'}],cursor:0,request:0,byId:new Map([['a',{id:'a'}]]),world:{add(x){world.add(x)},remove(x){world.delete(x)}},transform:{detach(){}}};
 const historyPush=new Function('state','snapshot','saveLocal','historyButtons','console',history+';return historyPush')(state,()=>({name:state.sceneName,items:state.objects.map(x=>x.uid)}),()=>!failSave,()=>{},{warn(){},error(){}});
 const run=new Function('state','validateProject','setBusy','setLoading','status','toast','addAsset','metrics','renderObjects','updateInspector','resetCamera','historyPush','saveLocal','historyButtons','$','console',code+';return replaceScene')(
  state,x=>x,x=>{state.busy=x;events.push('busy:'+x)},(show)=>{events.push('loading:'+show);if(show&&failStart)throw Error('OVERLAY_START_FAILED');if(!show&&failFinish)throw Error('OVERLAY_FINISH_FAILED')},()=>{},()=>{},
  async(asset,item)=>({uid:item.id,root:{id:item.id},mixer:{stopAllAction(){}}}),
  ()=>{},()=>{},()=>{},()=>{},historyPush,()=>!failSave,()=>{},()=>({value:'OLD'}),{warn(){},error(){}});
 return {run,state,world,root,events};
}
test('loading overlay startup failure does not trap busy or mutate original scene',async()=>{
 const f=fixture({failStart:true});
 assert.equal(await f.run({name:'NEW',items:[{id:'a'}]}),false);
 assert.equal(f.state.busy,false);
 assert.equal(f.state.sceneName,'OLD');
 assert.deepEqual([...f.world],[f.root]);
 assert.ok(f.events.includes('busy:false'));
});
test('overlay finish failure cannot overturn committed scene',async()=>{
 const f=fixture({failFinish:true});
 assert.equal(await f.run({name:'NEW',items:[{id:'a'}]}),true);
 assert.equal(f.state.busy,false);
 assert.equal(f.state.sceneName,'NEW');
});
test('persistence failure still rolls back and unlocks',async()=>{
 const f=fixture({failSave:true});
 assert.equal(await f.run({name:'NEW',items:[{id:'a'}]}),false);
 assert.equal(f.state.busy,false);
 assert.equal(f.state.sceneName,'OLD');
 assert.deepEqual([...f.world],[f.root]);
});
