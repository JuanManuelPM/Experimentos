import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const src=readFileSync(new URL('../forge.mjs',import.meta.url),'utf8');
const start=src.indexOf('async function moveHistory(direction){');
const end=src.indexOf('\nfunction wire(){',start);
assert.ok(start>=0&&end>start,'Extract the actual implementation from forge.mjs');
assert.match(src,/\$\('undo'\)\.addEventListener\('click',\(\)=>\{void moveHistory\(-1\)\}\)/);
assert.match(src,/\$\('redo'\)\.addEventListener\('click',\(\)=>\{void moveHistory\(1\)\}\)/);
const source=src.slice(start,end)+'\nmoveHistory';

function harness(cursor,replace) {
  const state={busy:false,cursor,history:[{id:'A'},{id:'B'},{id:'C'}]};
  const calls=[],notifications=[],errors=[];
  let buttons=0;
  const ctx=createContext({state,replaceScene:(...args)=>{calls.push(args);return replace(...args)},
    historyButtons:()=>{buttons++},status:message=>notifications.push(message),
    toast:message=>notifications.push(message),console:{error:(...args)=>errors.push(args)}});
  const moveHistory=new Script(source).runInContext(ctx);
  return {state,calls,notifications,errors,moveHistory,get buttons(){return buttons}};
}
for(const [name,cursor,direction,target,result] of [
  ['undo success',1,-1,0,true],['redo success',1,1,2,true],
  ['undo failed load',1,-1,1,false],['redo failed storage',1,1,1,false]
]){
  test(name,async()=>{
    const didLoad=name.endsWith('success');
    const h=harness(cursor,async()=>didLoad);
    assert.equal(await h.moveHistory(direction),result);
    assert.equal(h.state.cursor,target);
    assert.equal(h.calls.length,1);
    assert.equal(h.calls[0][1].remember,false);
    assert.equal(h.calls[0][0].id,direction===-1?'A':'C');
    assert.equal(h.buttons,1);
  });
}
for(const direction of [-1,1])test('rejected promise keeps cursor: '+direction,async()=>{
  const h=harness(1,async()=>{throw Error('disconnected')});
  assert.equal(await h.moveHistory(direction),false);
  assert.equal(h.state.cursor,1);
  assert.equal(h.calls.length,1);
  assert.equal(h.buttons,1);
  assert.equal(h.errors.length,1);
});
test('bounds and busy never call replaceScene',async()=>{
  for(const [cursor,direction,busy] of [[0,-1,false],[2,1,false],[1,1,true]]){
    const h=harness(cursor,async()=>true);h.state.busy=busy;
    assert.equal(await h.moveHistory(direction),false);
    assert.equal(h.calls.length,0);
    assert.equal(h.state.cursor,cursor);
  }
});
test('in-flight work is blocked, history remains unchanged until success',async()=>{
  let complete;
  const gate=new Promise(resolve=>{complete=resolve});
  const h=harness(2,async()=>{h.state.busy=true;return gate});
  const first=h.moveHistory(-1);
  assert.equal(h.state.cursor,2);
  assert.equal(await h.moveHistory(-1),false);
  complete(true);
  assert.equal(await first,true);
  assert.equal(h.state.cursor,1);
  assert.equal(h.calls.length,1);
});