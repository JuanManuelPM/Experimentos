#!/usr/bin/env node
/* GLB v2 animation and rig inspector. Zero dependencies; no rendering and no third-party copying. */
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const MAGIC=0x46546c67,JSON_CHUNK=0x4e4f534a,BIN_CHUNK=0x004e4942;
export function inspectGLB(data,filename='<memory>'){
 const buf=Buffer.isBuffer(data)?data:Buffer.from(data);
 function guard(ok,message){if(!ok)throw Error(`${filename}: ${message}`)}
 guard(buf.length>=20,'GLB_TOO_SHORT');guard(buf.readUInt32LE(0)===MAGIC,'INVALID_GLTF_MAGIC');
 guard(buf.readUInt32LE(4)===2,'UNSUPPORTED_GLB_VERSION');guard(buf.readUInt32LE(8)===buf.length,'DECLARED_LENGTH_MISMATCH');
 let offset=12,doc=null,bin=null,chunks=[];
 while(offset<buf.length){guard(offset+8<=buf.length,'TRUNCATED_CHUNK_HEADER');let len=buf.readUInt32LE(offset),type=buf.readUInt32LE(offset+4);offset+=8;guard((len%4)===0,'UNALIGNED_CHUNK');guard(offset+len<=buf.length,'TRUNCATED_CHUNK');let part=buf.subarray(offset,offset+len);offset+=len;chunks.push({type,length:len});if(type===JSON_CHUNK){guard(doc===null,'DUPLICATE_JSON_CHUNK');try{doc=JSON.parse(part.toString('utf8').replace(/\u0000+$/g,'').trim())}catch(e){throw Error(`${filename}: INVALID_GLTF_JSON: ${e.message}`)}}if(type===BIN_CHUNK){guard(bin===null,'DUPLICATE_BIN_CHUNK');bin=part}}
 guard(chunks[0]?.type===JSON_CHUNK && doc && typeof doc==='object','FIRST_CHUNK_NOT_JSON');
 const nodes=Array.isArray(doc.nodes)?doc.nodes:[],skins=Array.isArray(doc.skins)?doc.skins:[],meshes=Array.isArray(doc.meshes)?doc.meshes:[],clips=Array.isArray(doc.animations)?doc.animations:[],accessors=Array.isArray(doc.accessors)?doc.accessors:[],views=Array.isArray(doc.bufferViews)?doc.bufferViews:[];
 const jointIndices=new Set(skins.flatMap(s=>Array.isArray(s.joints)?s.joints:[]));
 const skinnedNodes=nodes.filter(n=>Number.isInteger(n.skin)&&n.skin>=0&&n.skin<skins.length).length;
 const weightedPrimitives=meshes.reduce((n,m)=>n+(m.primitives||[]).filter(p=>p.attributes?.JOINTS_0!==undefined&&p.attributes?.WEIGHTS_0!==undefined).length,0);
 const warnings=[];if(skins.length && !skinnedNodes)warnings.push('SKINS_EXIST_BUT_NO_SKINNED_NODES');if(skins.length && !weightedPrimitives)warnings.push('SKINS_EXIST_BUT_NO_JOINT_ATTRIBUTES');
 function rangeFromAccessor(index){const a=accessors[index];if(!a || a.type!=='SCALAR'){return null}if(Array.isArray(a.min)&&Array.isArray(a.max)&&Number.isFinite(a.min[0])&&Number.isFinite(a.max[0]))return {min:a.min[0],max:a.max[0],source:'ACCESSOR_MINMAX'};
  if(a.componentType!==5126||!Number.isInteger(a.count)||a.count<=0||a.sparse||!Number.isInteger(a.bufferView))return null;
  const v=views[a.bufferView];if(!v||v.buffer!==0||!bin)return null;const stride=v.byteStride||4,start=(v.byteOffset||0)+(a.byteOffset||0);
  if(stride<4||start<0||start+(a.count-1)*stride+4>bin.length||start+a.count*4>bin.length && stride===4)return null;
  let low=Infinity,high=-Infinity;for(let i=0;i<a.count;i++){const z=bin.readFloatLE(start+i*stride);if(!Number.isFinite(z))return null;low=Math.min(low,z);high=Math.max(high,z)}return {min:low,max:high,source:'BIN_FLOAT32'};
 }
 const animations=clips.map((clip,i)=>{const channels=Array.isArray(clip.channels)?clip.channels:[],samplers=Array.isArray(clip.samplers)?clip.samplers:[];const targets=new Set(),targetPaths=new Set(),timelines=[];let jointChannels=0,missingTargets=0;
  for(const c of channels){const node=c.target?.node;if(Number.isInteger(node)&&node>=0&&node<nodes.length){targets.add(node);if(jointIndices.has(node))jointChannels++}else missingTargets++;if(typeof c.target?.path==='string')targetPaths.add(c.target.path);const sampler=samplers[c.sampler];if(sampler){const range=rangeFromAccessor(sampler.input);if(range)timelines.push(range)}}
  const duration=timelines.length?Math.max(...timelines.map(r=>r.max))-Math.min(...timelines.map(r=>r.min)):null;
  return {index:i,name:clip.name||`animation_${i}`,channels:channels.length,targets:[...targets].sort((a,b)=>a-b),target_paths:[...targetPaths].sort(),joint_channels:jointChannels,missing_targets:missingTargets,duration_seconds:duration===null?null:+duration.toFixed(5),duration_source:timelines.length?(timelines.every(r=>r.source===timelines[0].source)?timelines[0].source:'MIXED'):'UNKNOWN',classification:channels.length===0?'EMPTY_CLIP':jointChannels&&skinnedNodes&&weightedPrimitives?'SKINNED_CLIP':'NODE_CLIP'};
 });
 let classification=animations.some(a=>a.classification==='SKINNED_CLIP')?'SKINNED_CLIP':animations.some(a=>a.classification==='NODE_CLIP')?'NODE_CLIP':animations.length?'EMPTY_CLIPS_ONLY':'STATIC';
 if(animations.some(a=>a.missing_targets))warnings.push('ANIMATION_CHANNELS_WITH_UNRESOLVED_NODE');
 return {file:filename,bytes:buf.length,format:'GLB',version:2,skins:skins.length,joints:jointIndices.size,skinned_nodes:skinnedNodes,weighted_primitives:weightedPrimitives,animation_count:clips.length,classification,animations,warnings,limitation:'Structural glTF checks only. Runtime AnimationMixer/WebGL playback NOT_RUN.'};
}
export function inspectFiles(paths){return paths.map(p=>{try{return inspectGLB(readFileSync(p),p)}catch(e){return {file:p,error:String(e.message)}}})}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const args=process.argv.slice(2),json=args.includes('--json'),files=args.filter(x=>x!=='--json');if(!files.length){console.error('Usage: node glb-inspect.mjs [--json] Fox.glb animal-cat.glb ...');process.exitCode=2}else{const rows=inspectFiles(files);if(json)console.log(JSON.stringify(rows,null,2));else for(const x of rows)console.log(x.error?`ERROR ${x.error}`:`${x.file}: ${x.classification}; skins=${x.skins} joints=${x.joints} clips=${x.animation_count}; ${x.animations.map(a=>`${a.name}(${a.duration_seconds??'?'}s,${a.classification})`).join(', ')}`);if(rows.some(x=>x.error))process.exitCode=1}}
