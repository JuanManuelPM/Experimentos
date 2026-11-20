import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyBootError,detectWebGL2,installContextListeners,bootScene} from './browser-boot.mjs';
test('gzip errors are not misreported as WebGL',()=>assert.equal(classifyBootError(new Error('DecompressionStream gzip unsupported'),'ASSETS'),'DECOMPRESSION'));
test('module MIME errors are distinct',()=>assert.equal(classifyBootError(new Error('MIME type is not JavaScript'),'MODULES'),'MODULE_IMPORT'));
test('GLB load errors distinguish assets',()=>assert.equal(classifyBootError(new Error('could not parse glb'),'ASSETS'),'ASSET_LOAD'));
test('no canvas reports no WebGL2 without pretending to render',()=>assert.equal(detectWebGL2(null).ok,false));
test('WebGL1 context is deliberately NOT attempted with modern Three',()=>{
 const calls=[];detectWebGL2({getContext:(x)=>{calls.push(x);return null}});
 assert.deepEqual(calls,['webgl2']);
});
test('missing WebGL2 invokes honest fallback and does not throw away complete source',async()=>{
 let fall=null;
 const r=await bootScene({canvas:{getContext:()=>null},showFallback:x=>fall=x});
 assert.equal(r.status,'FALLBACK_REQUIRED');assert.equal(r.sourceStillDeliverable,true);assert.equal(fall.artisticVerdict,'NOT_EVALUATED');
});
test('running scene reports running without any claim of art approval',async()=>{
 const r=await bootScene({canvas:{getContext:()=>({fake:true})},loadAssets:async()=>({a:1}),buildScene:async()=>({scene:true}),startPlayback:async()=>3});
 assert.equal(r.status,'RUNNING');assert.equal(r.result,3);assert.equal(r.artisticVerdict,'NOT_EVALUATED');
});
test('runtime exceptions report precise stage',async()=>{
 let diag=null;
 const r=await bootScene({canvas:{getContext:()=>({})},loadAssets:async()=>{throw Error('HTTP 404 asset')},showDiagnostic:x=>diag=x});
 assert.equal(r.status,'FAILED');assert.equal(r.errorCode,'NETWORK_FETCH');assert.equal(diag.phase,'ASSETS');
});
test('context lost cleanup detaches listeners',()=>{
 const registered=new Map(),removed=[];
 const canvas={addEventListener:(k,fn)=>registered.set(k,fn),removeEventListener:(k)=>removed.push(k)};
 let lost=false,restored=false;
 const teardown=installContextListeners(canvas,{onLost:()=>{lost=true},onRestored:()=>{restored=true}});
 registered.get('webglcontextlost')({preventDefault(){}});registered.get('webglcontextrestored')();
 assert.equal(lost,true);assert.equal(restored,true);teardown();assert.ok(removed.includes('webglcontextlost'));
});
