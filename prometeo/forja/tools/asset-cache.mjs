#!/usr/bin/env node
/** C106 - Pinned 3D asset on-demand cache. No downloads until getAsset() is called. */
import {createHash, randomUUID} from 'node:crypto';
import {readFile, writeFile, mkdir, rename, rm, stat} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const REGISTRY = Object.freeze({
 kenney: Object.freeze({owner:'Hidencod',repo:'tge-assets',license:'CC0-1.0',allowed:['.glb']}),
 quaternius: Object.freeze({owner:'trebeljahr',repo:'quaternius-showcase',license:'PACK_LICENSE_REVIEW',allowed:['.glb','.obj','.mtl']})
});
const HEX40=/^[0-9a-f]{40}$/i, HEX64=/^[0-9a-f]{64}$/i;
const SAFE_PATH=/^[A-Za-z0-9_./ -]+$/;
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
/** Prevent caching 404 HTML or an unrelated response as a GLB model. */
export function validateAssetBytes(ext,bytes){
 if(ext!=='.glb')return {format:'TEXT_RESOURCE_UNINSPECTED'};
 assert(bytes.length>=20,'INVALID_GLB_TOO_SHORT');
 assert(bytes.readUInt32LE(0)===0x46546c67,'INVALID_GLB_MAGIC');
 assert(bytes.readUInt32LE(4)===2,'INVALID_GLB_VERSION');
 assert(bytes.readUInt32LE(8)===bytes.length,'INVALID_GLB_LENGTH');
 assert(bytes.readUInt32LE(16)===0x4e4f534a,'INVALID_GLB_FIRST_CHUNK');
 assert(bytes.readUInt32LE(12)%4===0,'INVALID_GLB_ALIGNMENT');
 assert(20+bytes.readUInt32LE(12)<=bytes.length,'INVALID_GLB_JSON_LENGTH');
 return {format:'GLB2'};
}
function assert(ok,code){if(!ok)throw new Error(code)}
export function describeAsset({source,commit,path,expectedSha256}={}){
 const origin=REGISTRY[source];assert(origin,'UNAPPROVED_SOURCE');
 assert(typeof commit==='string'&&HEX40.test(commit),'INVALID_COMMIT');
 assert(typeof path==='string'&&path.length>0&&path.length<240&&SAFE_PATH.test(path),'INVALID_PATH');
 const segments=path.split('/');
 assert(segments.every(x=>x&&x!=='.'&&x!=='..')&&!path.startsWith('/')&&!path.includes('//'),'UNSAFE_PATH');
 const ext=path.slice(path.lastIndexOf('.')).toLowerCase();
 assert(origin.allowed.includes(ext),'UNAPPROVED_FORMAT');
 if(expectedSha256!=null)assert(typeof expectedSha256==='string'&&HEX64.test(expectedSha256),'INVALID_SHA256');
 const url=`https://raw.githubusercontent.com/${origin.owner}/${origin.repo}/${commit.toLowerCase()}/${segments.map(encodeURIComponent).join('/')}`;
 const key=sha256(Buffer.from(`${source}\0${commit.toLowerCase()}\0${path}`));
 return Object.freeze({source,commit:commit.toLowerCase(),path,ext,url,key,expectedSha256:expectedSha256?.toLowerCase()??null,license:origin.license});
}
export class AssetCache {
 constructor(cacheRoot,{fetchFn=globalThis.fetch,maxBytes=16*1024*1024}={}){
  assert(typeof cacheRoot==='string'&&cacheRoot.length>0,'INVALID_CACHE_ROOT');
  assert(typeof fetchFn==='function','FETCH_UNAVAILABLE');
  assert(Number.isSafeInteger(maxBytes)&&maxBytes>0,'INVALID_MAX_BYTES');
  this.root=resolve(cacheRoot);this.fetchFn=fetchFn;this.maxBytes=maxBytes;
  this.inflight=new Map();
 }
 async getAsset(input){
  const item=describeAsset(input);
  if(this.inflight.has(item.key))return this.inflight.get(item.key);
  const op=this.#load(item).finally(()=>this.inflight.delete(item.key));
  this.inflight.set(item.key,op);
  return op;
 }
 async getAssetOrFallback(input,fallbackFn){
  try{return await this.getAsset(input)}catch(error){
   assert(typeof fallbackFn==='function','FALLBACK_NOT_AVAILABLE');
   return {kind:'FALLBACK_NOT_VERIFIED_ASSET',error:error.message,resource:await fallbackFn(),verified:false};
  }
 }
 async #load(item){
  const metaPath=join(this.root,'manifests',item.key+'.json');
  try{
   const previous=JSON.parse(await readFile(metaPath,'utf8'));
   assert(previous.key===item.key&&HEX64.test(previous.sha256)&&previous.bytes>0,'CACHE_METADATA_INVALID');
   if(item.expectedSha256)assert(item.expectedSha256===previous.sha256,'CACHE_EXPECTED_SHA_MISMATCH');
   const objectPath=join(this.root,'objects',previous.sha256+item.ext);
   const bytes=await readFile(objectPath);
   assert(bytes.length===previous.bytes&&sha256(bytes)===previous.sha256,'CACHE_CORRUPTED');
   validateAssetBytes(item.ext,bytes);
   return {kind:'CACHE_HIT',path:objectPath,sha256:previous.sha256,bytes:previous.bytes,source:item.source,license:item.license,verified:true,sourceUrl:item.url};
  }catch(error){
   if(item.expectedSha256 && error.message==='CACHE_EXPECTED_SHA_MISMATCH')throw error;
   // Absent, corrupt or untrusted cache entries must be fetched again.
  }
  const resp=await this.fetchFn(item.url);
  assert(resp?.ok===true,'FETCH_FAILED_'+(resp?.status??'UNKNOWN'));
  const length=Number(resp.headers?.get?.('content-length'));
  if(Number.isFinite(length)&&length>this.maxBytes)throw Error('REMOTE_SIZE_LIMIT');
  assert(resp.body && typeof resp.body.getReader==='function','RESPONSE_NOT_STREAMABLE');
  const reader=resp.body.getReader(),parts=[];let total=0;
  try{
   while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;
    if(total>this.maxBytes){await reader.cancel();throw Error('STREAM_SIZE_LIMIT')}
    parts.push(Buffer.from(value));}
  }finally{reader.releaseLock()}
  assert(total>0,'EMPTY_ASSET');
  const bytes=Buffer.concat(parts,total),sum=sha256(bytes);
  validateAssetBytes(item.ext,bytes);
  if(item.expectedSha256)assert(sum===item.expectedSha256,'CHECKSUM_MISMATCH');
  const objectPath=join(this.root,'objects',sum+item.ext);
  await mkdir(join(this.root,'objects'),{recursive:true});
  await mkdir(join(this.root,'manifests'),{recursive:true});
  const tmp=objectPath+'.'+randomUUID()+'.tmp';
  try{await writeFile(tmp,bytes,{flag:'wx'});await rename(tmp,objectPath)}finally{await rm(tmp,{force:true}).catch(()=>{})}
  const meta={version:1,key:item.key,source:item.source,commit:item.commit,path:item.path,sha256:sum,bytes:bytes.length,license:item.license,url:item.url};
  const metaTemp=metaPath+'.'+randomUUID()+'.tmp';
  try{await writeFile(metaTemp,JSON.stringify(meta,null,2)+'\n',{flag:'wx'});await rename(metaTemp,metaPath)}finally{await rm(metaTemp,{force:true}).catch(()=>{})}
  return {kind:'DOWNLOADED',path:objectPath,sha256:sum,bytes:bytes.length,source:item.source,license:item.license,verified:true,sourceUrl:item.url};
 }
}
const ownScript=process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href;
if(ownScript){
 const [cacheRoot,source,commit,path,expectedSha256]=process.argv.slice(2);
 if(!cacheRoot||!source||!commit||!path){console.error('Usage: node asset-cache.mjs CACHE_DIR SOURCE COMMIT PATH [EXPECTED_SHA256]');process.exitCode=2}
 else new AssetCache(cacheRoot).getAsset({source,commit,path,expectedSha256}).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error('ASSET_CACHE_ERROR:',e.message);process.exitCode=1});
}
