// FORJA V7: native regression for exception-safe import reporting.
// Run: node --test prometeo/forja/tests/replace-scene-reporting.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const file=fileURLToPath(new URL('../forge.mjs',import.meta.url));
const source=readFileSync(file,'utf8');
const start=source.indexOf('async function replaceScene(');
const end=source.indexOf('\nconst PRESETS=',start);
assert.ok(start>=0&&end>start,'exact replaceScene function must exist');
const functionSource=source.slice(start,end);
function fixture(opts={}){
 const state={busy:false,webgl:!opts.noWebgl,request:0,byId:new Map([['a',{id:'a'}]]),objects:[],selected:null,sceneName:'old',history:[],cursor:0,world:{add(){},remove(){}},transform:{detach(){}}};
 const input={value:'old'};
 const env={state,$:()=>input,validateProject:()=>{if(opts.invalid)throw Error('INVALID');return {name:'new',items:[{id:'a'}]}},
 status:()=>{if(opts.statusFail)throw Error('STATUS_FAILED')},
 toast:()=>{if(opts.toastFail)throw Error('TOAST_FAILED')},
 setBusy:value=>{state.busy=value},setLoading:()=>{},
 addAsset:async()=>{if(opts.loadFail)throw Error('LOAD_FAILED');return {root:{}}},
 metrics:()=>{},renderObjects:()=>{},updateInspector:()=>{},resetCamera:()=>{},
 historyPush:()=>{if(opts.commitFail)throw Error('COMMIT_FAILED');return true},
 saveLocal:()=>true,historyButtons:()=>{},console:{warn(){},error(){}}};
 const keys=Object.keys(env);
 const replaceScene=Function(...keys,functionSource+'; return replaceScene;')(...keys.map(key=>env[key]));
 return {state,replaceScene};
}
const scenarios=[
 ['load failure with broken status',{loadFail:true,statusFail:true},false],
 ['load failure with broken toast',{loadFail:true,toastFail:true},false],
 ['invalid project with broken toast',{invalid:true,toastFail:true},false],
 ['no WebGL with broken reporters',{noWebgl:true,statusFail:true,toastFail:true},false],
 ['successful load',{},true],
 ['commit failure with broken status',{commitFail:true,statusFail:true},false],
];
for(const [name,options,expected] of scenarios){
 test(name,async()=>{
  const {state,replaceScene}=fixture(options);
  assert.equal(await replaceScene({}),expected);
  assert.equal(state.busy,false);
  if(options.loadFail||options.commitFail)assert.equal(state.sceneName,'old');
 });
}
