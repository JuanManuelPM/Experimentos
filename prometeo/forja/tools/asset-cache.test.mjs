import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {AssetCache,describeAsset,sha256} from './asset-cache.mjs';
const COMMIT='3ddcc695adbba9fb918cf31b7c139b3f95b76910';
const model={source:'kenney',commit:COMMIT,path:'packs/car-kit/sedan.glb'};
const doc=Buffer.from(JSON.stringify({asset:{version:'2.0'},scenes:[{}]}));
const json=Buffer.concat([doc,Buffer.alloc((4-doc.length%4)%4,32)]);
const payload=Buffer.alloc(20+json.length);payload.write('glTF',0,'ascii');payload.writeUInt32LE(2,4);payload.writeUInt32LE(payload.length,8);payload.writeUInt32LE(json.length,12);payload.write('JSON',16,'ascii');json.copy(payload,20);
let tmp;
async function fresh(fn){tmp=await mkdtemp(join(tmpdir(),'c106-'));try{return await fn(tmp)}finally{await rm(tmp,{recursive:true,force:true})}}
function stub(onFetch){return async url=>{onFetch?.(url);return new Response(payload,{status:200,headers:{'content-length':String(payload.length)}})}}
test('only pinned approved public source path and license',()=>{
 const d=describeAsset(model);
 assert.equal(d.url,'https://raw.githubusercontent.com/Hidencod/tge-assets/'+COMMIT+'/packs/car-kit/sedan.glb');
 assert.equal(d.license,'CC0-1.0');assert.equal(d.ext,'.glb');
});
test('reject unsafe sources, traversal, scripts and unpinned URL',()=>{
 for(const bad of [{...model,source:'private'}, {...model,path:'../secret.glb'},{...model,path:'/etc/passwd.glb'}, {...model,path:'packs//sedan.glb'},{...model,path:'evil.js'}, {...model,commit:'main'}, {...model,path:'a%2fb.glb'}])assert.throws(()=>describeAsset(bad));
});
test('lazy download and content-addressed sha256, then cache hit without fetching',async()=>fresh(async dir=>{
 let fetches=0;const c=new AssetCache(dir,{fetchFn:stub(()=>fetches++)});assert.equal(fetches,0);
 const a=await c.getAsset(model);assert.equal(a.kind,'DOWNLOADED');assert.equal(fetches,1);assert.equal(a.sha256,sha256(payload));
 assert.deepEqual(await readFile(a.path),payload);
 const b=await c.getAsset(model);assert.equal(b.kind,'CACHE_HIT');assert.equal(fetches,1);assert.equal(b.path,a.path);
}));
test('concurrent duplicate requests share one download',async()=>fresh(async dir=>{
 let count=0;const c=new AssetCache(dir,{fetchFn:async url=>{count++;await new Promise(r=>setTimeout(r,10));return stub()(url)}});
 const result=await Promise.all(Array.from({length:8},()=>c.getAsset(model)));
 assert.equal(count,1);assert.equal(new Set(result.map(x=>x.sha256)).size,1);
}));
test('corrupt cache content detected and downloaded again',async()=>fresh(async dir=>{
 let count=0;const c=new AssetCache(dir,{fetchFn:stub(()=>count++)});const a=await c.getAsset(model);await writeFile(a.path,'tampered');
 const b=await c.getAsset(model);assert.equal(count,2);assert.equal(b.sha256,a.sha256);assert.deepEqual(await readFile(b.path),payload);
}));
test('reject mismatch against provided trusted expected hash',async()=>fresh(async dir=>{
 const c=new AssetCache(dir,{fetchFn:stub()});await assert.rejects(()=>c.getAsset({...model,expectedSha256:'0'.repeat(64)}),/CHECKSUM_MISMATCH/);
}));
test('stream size limit rejects oversized input even without size header',async()=>fresh(async dir=>{
 const c=new AssetCache(dir,{fetchFn:async()=>new Response(payload,{status:200}),maxBytes:10});
 await assert.rejects(()=>c.getAsset(model),/STREAM_SIZE_LIMIT/);
}));
test('network failure does not create false cache success',async()=>fresh(async dir=>{
 const c=new AssetCache(dir,{fetchFn:async()=>new Response('No',{status:404})});await assert.rejects(()=>c.getAsset(model),/FETCH_FAILED_404/);
}));

test('reject HTML response disguised as .glb',async()=>fresh(async dir=>{
 const c=new AssetCache(dir,{fetchFn:async()=>new Response(Buffer.from('<html>error</html>'),{status:200})});
 await assert.rejects(()=>c.getAsset(model),/INVALID_GLB/);
}));
test('explicit placeholder on blocked network never passes as a verified asset',async()=>fresh(async dir=>{
 const c=new AssetCache(dir,{fetchFn:async()=>{throw Error('DNS_DISABLED')}});
 const result=await c.getAssetOrFallback(model,()=>({type:'geometry',shape:'box'}));
 assert.equal(result.kind,'FALLBACK_NOT_VERIFIED_ASSET');assert.equal(result.verified,false);
 assert.equal(result.resource.type,'geometry');assert.match(result.error,/DNS_DISABLED/);
}));
