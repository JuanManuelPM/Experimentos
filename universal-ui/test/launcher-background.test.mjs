import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const require=createRequire(import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('../extension/manifest.json',import.meta.url),'utf8'));
const source=readFileSync(new URL('../extension/background/open-launcher.js',import.meta.url),'utf8');
function setup(tabs=[]){
 const log=[],listeners=[],root={};
 const api={
  action:{onClicked:{addListener(fn){listeners.push(fn)}}},
  runtime:{getURL:relative=>'moz-extension://abcd1234/'+relative},
  tabs:{
   async query(){return tabs;},
   async create(params){log.push(['tabs.create',params]);return {id:99,windowId:11,...params};},
   async update(id,params){log.push(['tabs.update',id,params]);}
  },
  windows:{async update(id,params){log.push(['windows.update',id,params]);}}
 };
 const context={browser:api,console:{error(...args){log.push(['error',args[0]])}}};
 context.globalThis=context;
 runInNewContext(source,context);
 return {api,log,listeners,context,tabs};
}
test('Firefox button cannot open the broken popup anymore',()=>{
 assert.equal(manifest.version,'0.4.0');
 assert.equal(Object.hasOwn(manifest.action,'default_popup'),false);
 assert.deepEqual(manifest.background.scripts,['background/open-launcher.js']);
});
test('action listener registered exactly once',()=>{
 const x=setup();
 assert.equal(x.listeners.length,1);
});
test('toolbar click opens the bundled launcher tab',async()=>{
 const x=setup();
 x.listeners[0]();
 await new Promise(r=>setTimeout(r,20));
 assert.deepEqual(JSON.parse(JSON.stringify(x.log)),[['tabs.create',{url:'moz-extension://abcd1234/launcher/index.html',active:true}]]);
});
test('second toolbar click reuses existing launcher tab',async()=>{
 const x=setup([{id:18,windowId:4,url:'moz-extension://abcd1234/launcher/index.html'}]);
 const result=await x.context.UUI_openLauncher();
 assert.equal(result.reused,true);
 assert.deepEqual(JSON.parse(JSON.stringify(x.log)),[['windows.update',4,{focused:true}],['tabs.update',18,{active:true}]]);
});
test('action launcher error is logged, no silent disappearance',async()=>{
 const x=setup();
 x.api.tabs.create=async()=>{throw Error('blocked')};
 x.listeners[0]();await new Promise(r=>setTimeout(r,20));
 assert.equal(x.log[0][0],'error');
});
test('settings remain reachable from the launcher without popup',()=>{
 const launcher=readFileSync(new URL('../extension/launcher/index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../extension/launcher/launcher.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../extension/popup/popup.css',import.meta.url),'utf8');
 assert.match(launcher,/id="settings"/);
 assert.match(js,/popup\/popup\.html/);
 assert.match(css,/body \{ width:390px; min-width:390px/);
});
