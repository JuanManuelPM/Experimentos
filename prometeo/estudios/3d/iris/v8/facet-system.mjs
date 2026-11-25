// IRIS V8: connected, broad polygon patches on the existing skinned anatomy.
import * as T from 'three';
import {PlanarFace,PRESETS7,FIELDS,HAIR,STYLES,recipe as planarRecipe} from '../v7/planar-system.mjs';
export {FIELDS,HAIR,STYLES};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+v)?+v:0));
export const DEFAULT_FACET={amount:.93,size:.68,shape:.65};
export const PRESETS8=Object.fromEntries(Object.entries(PRESETS7).map(([k,r])=>[k,{...r,sculpt:{...r.sculpt,amount:1},facet:{...DEFAULT_FACET}}]));
export function recipe(raw={}){let r=planarRecipe(raw);r.facet=Object.fromEntries(Object.entries(DEFAULT_FACET).map(([k,v])=>[k,clamp(raw.facet?.[k]??v)]));return r}
const get=(m,i)=>m.getVertexPosition(i,new T.Vector3()).applyMatrix4(m.matrixWorld);
const raw=(a,i,k)=>a.isInterleavedBufferAttribute?a.data.array[i*a.data.stride+a.offset+k]:a.array[i*a.itemSize+k];
const cross=(a,b,c)=>b.clone().sub(a).cross(c.clone().sub(a));
function inverseDelta(m,i,d){let p=d.clone().applyMatrix3(new T.Matrix3().setFromMatrix4(m.matrixWorld).invert());if(!m.isSkinnedMesh)return p;let o=m.applyBoneTransform(i,new T.Vector3()),a=m.applyBoneTransform(i,new T.Vector3(1,0,0)).sub(o),b=m.applyBoneTransform(i,new T.Vector3(0,1,0)).sub(o),c=m.applyBoneTransform(i,new T.Vector3(0,0,1)).sub(o),M=new T.Matrix3().set(a.x,b.x,c.x,a.y,b.y,c.y,a.z,b.z,c.z);return Math.abs(M.determinant())<1e-8?new T.Vector3():p.applyMatrix3(M.invert())}
function copyAttribute(a,ids){let C=a.isInterleavedBufferAttribute?a.data.array.constructor:a.array.constructor,arr=new C(ids.length*a.itemSize);for(let j=0;j<ids.length;j++)for(let k=0;k<a.itemSize;k++)arr[j*a.itemSize+k]=raw(a,ids[j],k);let b=new T.BufferAttribute(arr,a.itemSize,a.normalized);b.name=a.name;return b}
function partition(mesh,top,settings){
 const g=mesh.geometry,p=g.attributes.position,idx=g.index?.array||Uint32Array.from({length:p.count},(_,i)=>i),world=Array.from({length:p.count},(_,i)=>get(mesh,i)),local=Array.from({length:p.count},(_,i)=>new T.Vector3().fromBufferAttribute(p,i));
 const weld=new Map(),wids=[],groups=[];for(let i=0;i<p.count;i++){let q=local[i],k=[q.x,q.y,q.z].map(v=>Math.round(v*1e6)).join(':');if(!weld.has(k)){weld.set(k,groups.length);groups.push([])}let n=weld.get(k);wids[i]=n;groups[n].push(i)}
 const faces=[],edges=new Map(),low=top-.305,eye=top-.105,lip=top-.183;
 for(let j=0;j<idx.length;j+=3){let ids=[idx[j],idx[j+1],idx[j+2]],a=world[ids[0]],b=world[ids[1]],c=world[ids[2]],center=a.clone().add(b).add(c).multiplyScalar(1/3),wn=cross(a,b,c),area=wn.length(),ln=cross(...ids.map(i=>local[i]));wn.normalize();let f={id:j/3,ids,center,wn,ln,area,neighbors:[],eligible:center.y>low&&area>1e-10};faces.push(f);if(!f.eligible)continue;for(let k=0;k<3;k++){let x=wids[ids[k]],y=wids[ids[(k+1)%3]],key=Math.min(x,y)+':'+Math.max(x,y);let old=edges.get(key);if(old!==undefined){f.neighbors.push(old);faces[old].neighbors.push(f.id)}else edges.set(key,f.id)}}
 let label=new Int32Array(faces.length).fill(-1),patches=[],radius=.010+settings.size*.021,cos=.86-settings.size*.23,limit=Math.round(12+settings.size*85);
 // Largest triangles first; region growth follows connected faces and rejects unrelated orientations.
 let seeds=faces.filter(f=>f.eligible).sort((a,b)=>b.area-a.area||a.id-b.id);
 for(let seed of seeds){if(label[seed.id]>=0)continue;let id=patches.length,queue=[seed.id],members=[],normal=new T.Vector3(),centroid=new T.Vector3(),area=0;label[seed.id]=id;
  for(let at=0;at<queue.length;at++){let f=faces[queue[at]];members.push(f.id);normal.addScaledVector(f.wn,f.area);centroid.addScaledVector(f.center,f.area);area+=f.area;for(let n of f.neighbors){if(queue.length>=limit)break;let q=faces[n];if(label[n]>=0||!q.eligible||q.center.distanceTo(seed.center)>radius||q.wn.dot(seed.wn)<cos)continue;label[n]=id;queue.push(n)}}
  patches.push({members,n:normal.normalize(),c:centroid.multiplyScalar(1/Math.max(area,1e-15)),area})
 }
 // Merge small fragments into an adjacent compatible larger plane. No change to connectivity.
 for(let i=0;i<patches.length;i++){let q=patches[i];if(!q.members.length||q.members.length>3)continue;let best=-1,score=-1;for(let f of q.members)for(let j of faces[f].neighbors){let k=label[j],b=patches[k];if(k===i||k<0||!b?.members.length||b.members.length<=3||b.members.length>limit*1.3)continue;let v=q.n.dot(b.n);if(v>.66&&v>score){score=v;best=k}}if(best>=0){let b=patches[best];for(let f of q.members){label[f]=best;b.members.push(f)}b.c.multiplyScalar(b.area).addScaledVector(q.c,q.area).multiplyScalar(1/(b.area+q.area));b.n.multiplyScalar(b.area).addScaledVector(q.n,q.area).normalize();b.area+=q.area;q.members=[]}}
 return {g,p,idx,world,local,groups,wids,faces,label,patches,eye,lip,top}
}
function reshape(mesh,data,settings){
 const {g,p,idx,world,groups,wids,faces,label,patches,eye,lip,top}=data;
 // A common point belongs to several planes. Move it once using the area-weighted projection,
 // never independently per patch. This retains the same surface and avoids seams.
 const sum=groups.map(()=>new T.Vector3()),weights=new Float64Array(groups.length);
 for(let f of faces){let k=label[f.id];if(k<0)continue;let patch=patches[k];if(patch.members.length<4)continue;for(let i of f.ids){let j=wids[i],v=world[i],d=patch.c.clone().sub(v).dot(patch.n);sum[j].addScaledVector(patch.n,clamp(d,-.012,.012)*f.area);weights[j]+=f.area}}
 let before=p.array.slice(),offset=new Map(),limit=.0095;
 for(let j=0;j<groups.length;j++){if(weights[j]<=0)continue;let v=world[groups[j][0]],ax=Math.abs(v.x);
  // Keep lid rims, lips, nostril floor, ear junctions and neck out of the strong projection.
  let protectedEye=Math.abs(v.y-eye)<.028&&ax>.017&&ax<.080;
  let protectedMouth=Math.abs(v.y-lip)<.020&&ax<.043;
  let protectedNoseFloor=v.y<eye-.044&&v.y>eye-.077&&ax<.025;
  if(protectedEye||protectedMouth||protectedNoseFloor||v.y<top-.275||ax>.078)continue;
  let d=sum[j].multiplyScalar(settings.shape*settings.amount/weights[j]);if(d.length()>limit)d.setLength(limit);if(d.length()<.00005)continue;
  // Every coincident UV seam copy receives the same world displacement.
  for(let i of groups[j])offset.set(i,inverseDelta(mesh,i,d))
 }
 let affected=faces.filter(f=>f.ids.some(i=>offset.has(i))),scale=1,qa={};
 for(let a=0;a<8;a++,scale*=.63){
  p.array.set(before);for(let [i,d] of offset)p.setXYZ(i,before[3*i]+d.x*scale,before[3*i+1]+d.y*scale,before[3*i+2]+d.z*scale);
  let after=new Map([...offset.keys()].map(i=>[i,get(mesh,i)])),bad=0,max=0;
  for(let [i,v] of after)max=Math.max(max,v.distanceTo(world[i]));
  for(let f of affected){let [a,b,c]=f.ids.map(i=>after.get(i)||world[i]),n=cross(a,b,c),r=n.length()/Math.max(f.area,1e-15);if(f.area>1e-10&&(n.normalize().dot(f.wn)<.25||r<.3||r>2.5))bad++}
  qa={scale:+scale.toFixed(3),bad,maxMM:+(max*1000).toFixed(2),changed:offset.size};if(!bad&&max<.011)break
 }
 if(qa.bad||qa.maxMM>=11){p.array.set(before);qa={scale:0,bad:qa.bad,maxMM:0,changed:0,fallback:true}}
 p.needsUpdate=true;g.computeBoundingSphere();return qa
}
function renderGeometry(data,amount){
 const {g,idx,faces,label,patches}=data,p=g.attributes.position,normal=g.attributes.normal;
 const normalPatches=patches.map(()=>new T.Vector3());
 for(let f of faces){let k=label[f.id];if(k<0)continue;let q=f.ids.map(i=>new T.Vector3().fromBufferAttribute(p,i));normalPatches[k].add(cross(...q))}
 normalPatches.forEach(n=>n.normalize());
 // Split only the corners between different connected plane groups, not each triangle.
 const ids=[],out=[],assigned=[],cache=new Map();
 for(let j=0;j<idx.length;j++){let i=idx[j],k=label[Math.floor(j/3)],key=i+':'+k,n=cache.get(key);if(n===undefined){n=ids.length;cache.set(key,n);ids.push(i);assigned.push(k)}out.push(n)}
 let geo=new T.BufferGeometry();for(let [key,a] of Object.entries(g.attributes))geo.setAttribute(key,copyAttribute(a,ids));
 if(normal){let a=new Float32Array(ids.length*3);for(let j=0;j<ids.length;j++){let i=ids[j],k=assigned[j],n=new T.Vector3().fromBufferAttribute(normal,i).normalize();if(k>=0&&normalPatches[k].lengthSq()>.01){let v=normalPatches[k].clone();if(v.dot(n)<0)v.negate();n.lerp(v,amount).normalize()}a.set(n.toArray(),j*3)}geo.setAttribute('normal',new T.BufferAttribute(a,3))}
 for(let [key,arr] of Object.entries(g.morphAttributes))geo.morphAttributes[key]=arr.map(a=>copyAttribute(a,ids));
 geo.morphTargetsRelative=g.morphTargetsRelative;geo.setIndex(out);for(let q of g.groups)geo.addGroup(q.start,q.count,q.materialIndex);geo.setDrawRange(g.drawRange.start,g.drawRange.count);geo.computeBoundingSphere();
 let active=patches.filter(p=>p.members.length);return {geo,stats:{planes:active.length,planeTriangles:active.reduce((n,p)=>n+p.members.length,0),largePlanes:active.filter(p=>p.members.length>=8).length,renderVertices:ids.length,sourceVertices:g.attributes.position.count,triangles:idx.length/3}}
}
export class FacetedFace extends PlanarFace{
 constructor(scene){super(scene);this.identity=recipe(PRESETS8.iris);this.facetConfig={...DEFAULT_FACET};this.facetStats={status:'not initialized'};this.proxy=null}
 async load(){this.facetConfig={...this.identity.facet};await super.load();this.identity.facet={...this.facetConfig};return this}
 dropProxy(){if(this.proxy){this.proxy.removeFromParent();this.proxy.geometry.dispose();this.proxy=null}if(this.body)this.body.visible=true}
 sculpt(){this.dropProxy();super.sculpt();if(this.original){this.identity.facet={...this.facetConfig};this.buildFacets()}}
 buildFacets(){
  let s=this.facetConfig;if(!s||s.amount===0){this.facetStats={status:'original',planes:0,changed:0};return}let body=this.body;this.group.updateMatrixWorld(true);for(let m of this.parts)m.skeleton?.update();let h=this.frameBounds();if(h.isEmpty()){this.facetStats={status:'bounds unavailable'};return}
  const data=partition(body,h.max.y,s);let qa=reshape(body,data,s),result=renderGeometry(data,s.amount);
  const proxy=body.isSkinnedMesh?new T.SkinnedMesh(result.geo,body.material):new T.Mesh(result.geo,body.material);proxy.name='IRIS broad polygon render mesh';proxy.position.copy(body.position);proxy.quaternion.copy(body.quaternion);proxy.scale.copy(body.scale);proxy.frustumCulled=false;proxy.castShadow=body.castShadow;proxy.receiveShadow=body.receiveShadow;if(body.isSkinnedMesh){proxy.bindMode=body.bindMode;proxy.bind(body.skeleton,body.bindMatrix);proxy.bindMatrixInverse.copy(body.bindMatrixInverse)}proxy.morphTargetDictionary={...body.morphTargetDictionary};proxy.morphTargetInfluences=body.morphTargetInfluences;body.parent.add(proxy);body.visible=false;this.proxy=proxy;
  this.facetStats={status:'faceted',...result.stats,...qa};this.updateBrows();
 }
 setFacet(raw){this.facetConfig=recipe({facet:{...this.facetConfig,...raw}}).facet;this.identity.facet={...this.facetConfig};this.sculpt();return this.facetStats}
 async setRecipe(raw){this.facetConfig=recipe(raw).facet;this.dropProxy();await super.setRecipe(raw);this.identity.facet={...this.facetConfig};return this.identity}
 setStyle(name,override){let r=super.setStyle(name,override);this.identity.facet={...this.facetConfig};return r}
 setFace(k,v,commit=true){if(commit)this.dropProxy();super.setFace(k,v,commit);this.identity.facet={...this.facetConfig};if(this.proxy)this.proxy.morphTargetInfluences=this.body.morphTargetInfluences}
 setExpression(e){super.setExpression(e);if(this.proxy)this.proxy.morphTargetInfluences=this.body.morphTargetInfluences}
}
