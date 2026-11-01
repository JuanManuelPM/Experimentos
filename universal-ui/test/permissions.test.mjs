import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';

const src = readFileSync(fileURLToPath(new URL('../extension/popup/env-extension.js', import.meta.url)), 'utf8');
const app = {id:'chatgpt', hosts:['chatgpt.com','chat.openai.com']};
function setup(consent=true, previous=[]) {
  const permissions=new Set(previous), registrations=new Map();
  const calls={requested:[],registered:[],injected:[]};
  let injected=false,env;
  const browser={
    storage:{local:{}},
    tabs:{
      query:async()=>[{id:7,url:'https://chatgpt.com/c/abc'}],
      sendMessage:async()=>{if(!injected)throw Error('No receiver');return {ok:true};}
    },
    permissions:{
      contains:async({origins})=>origins.every(o=>permissions.has(o)),
      request:async({origins})=>{
        calls.requested.push(...origins);
        if(consent)origins.forEach(o=>permissions.add(o));
        return consent;
      }
    },
    scripting:{
      getRegisteredContentScripts:async({ids})=>ids.filter(id=>registrations.has(id)).map(id=>registrations.get(id)),
      registerContentScripts:async list=>{for(const s of list){registrations.set(s.id,s);calls.registered.push(s);}},
      executeScript:async arg=>{calls.injected.push(arg);injected=true;}
    }
  };
  const UUI={
    store:{Store:class{}},
    adapters:{adapterForHost:h=>app.hosts.includes(h)?app:null},
    mountPanel:(node,e)=>{env=e;}
  };
  runInNewContext(src,{browser,UUI,document:{getElementById:()=>({})},URL,Blob,setTimeout});
  return {env,calls,permissions};
}

test('opt-in on active host, persisted registration and one injection',async()=>{
  const {env,calls}=setup();
  const ctx=await env.getContext();
  assert.equal(ctx.permitted,false);
  assert.equal(calls.injected.length,0);
  assert.equal(await env.requestPermission(ctx.adapter),true);
  assert.deepEqual(calls.requested,['https://chatgpt.com/*']);
  assert.equal(calls.registered.length,1);
  assert.equal(calls.registered[0].persistAcrossSessions,true);
  assert.deepEqual(Array.from(calls.registered[0].matches),['https://chatgpt.com/*']);
  assert.equal(calls.injected.length,1);
  assert.equal((await env.getReport()).ok,true);
  assert.equal(calls.injected.length,1);
});
test('denied permission makes no changes to page',async()=>{
  const {env,calls}=setup(false);
  const ctx=await env.getContext();
  assert.equal(await env.requestPermission(ctx.adapter),false);
  assert.equal(calls.registered.length,0);
  assert.equal(calls.injected.length,0);
});
test('previous permission is recovered, but the other host remains unauthorized',async()=>{
  const {env,calls}=setup(true,['https://chat.openai.com/*']);
  const ctx=await env.getContext();
  assert.equal(ctx.permitted,false);
  assert.equal(await env.hasPermission(app),true);
  assert.equal(calls.injected.length,0);
  assert.equal(await env.requestPermission(app),true);
  await env.getContext();
  assert.equal(calls.registered.length,1);
});
test('an already-approved host gets registered and open tab receives script',async()=>{
  const {env,calls}=setup(true,['https://chatgpt.com/*']);
  const ctx=await env.getContext();
  assert.equal(ctx.permitted,true);
  assert.equal(calls.registered.length,1);
  assert.equal(calls.injected.length,0);
  assert.equal((await env.getReport()).ok,true);
  assert.equal(calls.injected.length,1);
  await env.getContext();
  assert.equal(calls.registered.length,1);
});
