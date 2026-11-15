import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../forge.mjs',import.meta.url),'utf8');
const history=source.slice(source.indexOf('function historyPush(){'),source.indexOf('function historyButtons(){'));
const code=source.slice(source.indexOf('async function replaceScene('),source.indexOf('const PRESETS='));
function make({storage=true,mixer=false,loading=false,historyUI=false}={}){
 const old={uid:'old',root:{id:'old'},mixer:{stopAllAction(){}}},world=new Set([old.root]);
 const state={busy:false,webgl:true,objects:[old],selected:'old',sceneName:'OLD',history:[{name:'OLD'}],cursor:0,request:0,byId:new Map([['a',{id:'a'}]]),world:{add(x){world.add(x)},remove(x){world.delete(x)}},transform:{detach(){}}};
 const saveLocal=()=>storage,historyButtons=()=>{if(historyUI)throw Error('HISTORY_UI_FAILED')};
 const historyPush=new Function('state','snapshot','saveLocal','historyButtons','console',history+';return historyPush')(state,()=>({name:state.sceneName,items:state.objects.map(x=>x.uid)}),saveLocal,historyButtons,{warn(){},error(){}});
 const run=new Function('state','validateProject','setBusy','setLoading','status','toast','addAsset','metrics','renderObjects','updateInspector','resetCamera','historyPush','saveLocal','historyButtons','$','console',code+';return replaceScene')(
  state,x=>x,x=>state.busy=x,x=>{if(!x&&loading)throw Error('LOADING_FAILED')},()=>{},()=>{},
  async(asset,item)=>({uid:item.id,root:{id:item.id},mixer:{stopAllAction(){if(mixer)throw Error('MIXER_FAILED')}}}),
  ()=>{},()=>{},()=>{},()=>{},historyPush,saveLocal,historyButtons,id=>({value:'OLD'}),{warn(){},error(){}});
 return {state,world,old,run};
}
test('staged mixer cleanup failure does not trap busy after failed persistence',async()=>{
 const f=make({storage:false,mixer:true});
 assert.equal(await f.run({name:'NEW',items:[{id:'a'}]}),false);
 assert.equal(f.state.busy,false);assert.deepEqual([...f.world],[f.old.root]);
});
test('loading overlay cleanup failure does not overturn committed import',async()=>{
 const f=make({loading:true});
 assert.equal(await f.run({name:'NEW',items:[{id:'a'}]}),true);
 assert.equal(f.state.busy,false);assert.equal(f.state.sceneName,'NEW');
});
test('history button UI cleanup failure does not overturn committed import',async()=>{
 const f=make({historyUI:true});
 assert.equal(await f.run({name:'NEW',items:[{id:'a'}]}),true);
 assert.equal(f.state.busy,false);assert.equal(f.state.sceneName,'NEW');
});
