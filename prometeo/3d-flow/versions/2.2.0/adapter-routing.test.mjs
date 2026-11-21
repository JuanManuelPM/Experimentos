import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAdapterDefinition,routeProductionTool,verifyAcquiredAsset} from './adapter-routing.mjs';
const a=JSON.parse(readFileSync(new URL('./ADAPTER_INTERFACES.json',import.meta.url),'utf8'));
const t=JSON.parse(readFileSync(new URL('./TOOLCHAIN_ROUTING.json',import.meta.url),'utf8'));
test('all 12 adapter contracts have methods and truthful maturity',()=>{assert.equal(a.interfaces.length,12);for(const i of a.interfaces)assert.equal(validateAdapterDefinition(i).ok,true)});
test('research-only Blender is not available as an installed tool',()=>{
 const x=routeProductionTool('CHARACTER',[],t);assert.equal(x.status,'NO_CONNECTED_TOOL');assert.equal(x.mustContinueScene,true);
});
test('connected verified tooling can be selected without claiming any other provider ran',()=>{
 const x=routeProductionTool('WEB_RUNTIME',[{id:'threejs',connected:true,tested:true}],t);
 assert.equal(x.chosen,'threejs');assert.equal(x.doNotClaimExecuted,false);
});
test('false adapter implementation claim rejected',()=>{
 const x={...a.interfaces[0],adapterImplemented:true};assert.ok(validateAdapterDefinition(x).errors.includes('FALSE_IMPLEMENTED_CLAIM'));
});
test('unacquired catalogue listing is not a verified downloaded asset',()=>{
 const x=verifyAcquiredAsset({assetId:'cow',sourceUrl:'https://example.com',acquired:true,rights:'CC0'});
 assert.ok(x.issues.includes('CLAIMED_ACQUIRED_WITHOUT_BYTES_PROOF'));assert.equal(x.continuesEvenIfMissing,true);
});
test('runtime instance is required to claim asset was actually used',()=>{
 const x=verifyAcquiredAsset({assetId:'cow',sourceUrl:'https://example.com',acquired:true,imported:true,rights:'CC0',bytesSha256:'a'.repeat(64)});
 assert.ok(x.issues.includes('CLAIMED_USED_BUT_NOT_VERIFIED_IMPORT'));
});
