// IRIS V9 — deliberately authored bilateral macroplanes; no triangle clustering.
import * as T from 'three';
import {StyledFace,PRESETS6,FIELDS,HAIR,STYLES,recipe as styleRecipe} from '../v6/style-system.mjs';
export {FIELDS,HAIR,STYLES};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+n)?+n:0));
const S=(a,b,x)=>{let t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export const DEFAULT_DESIGN={amount:.9,shape:.78,neck:.85,scalp:true};
// All coordinates in interocular half-span units. x is reflected across the midline.
// cx,cy, half widths, rotation slope, nx,ny,nz, priority. These are art direction, not discovered clusters.
export const ATLAS=[
 ['forehead',0,1.05,.48,.74,0,0,.19,1,1],
 ['forehead-side',.75,1.04,.52,.70,0,.48,.18,1,1],
 ['temple',1.19,.40,.40,.68,-.16,.87,.12,.48,1],
 ['brow-plane',.66,.35,.47,.24,.10,.25,-.26,1,.65],
 ['nose-bridge',0,-.10,.14,.61,0,0,.05,1,2.8],
 ['nose-side',.25,-.17,.16,.47,-.08,.75,.05,.66,2],
 ['nose-tip',0,-.68,.26,.17,0,0,.20,1,2.2],
 ['cheekbone',.79,-.48,.49,.25,.29,.37,.40,1,1.65],
 ['cheek',.88,-.86,.46,.35,-.21,.60,-.07,1,1.45],
 ['jaw',.86,-1.35,.49,.32,-.31,.70,-.30,.79,1.2],
 ['chin',0,-1.67,.47,.25,0,0,-.13,1,1.45],
 ['chin-side',.51,-1.66,.33,.24,.24,.50,-.38,.85,1.1],
 ['neck-front',0,-2.10,.48,.47,0,0,.02,1,.85],
 ['neck-side',.65,-2.10,.36,.48,0,.73,.02,.70,.8]
];
export function recipe(raw={}){let r=styleRecipe(raw);r.design={...DEFAULT_DESIGN,...raw.design};for(let k of ['amount','shape','neck'])r.design[k]=clamp(r.design[k]);r.design.scalp=!!r.design.scalp;return r}
export const PRESETS9=Object.fromEntries(Object.entries(PRESETS6).map(([k,r])=>[k,recipe({...r,design:{...DEFAULT_DESIGN,scalp:k==='iris'||k==='soter'}})]));
const mats=m=>[].concat(m.material||[]),get=(m,i)=>m.getVertexPosition(i,new T.Vector3()).applyMatrix4(m.matrixWorld);
function mask(r,x,y){let u=Math.abs(x)-r[1],v=y-r[2]-u*r[5];return (1-S(.73,1.08,Math.abs(u)/r[3]))*(1-S(.70,1.08,Math.abs(v)/r[4]))*r[9]}
function protect(x,y){let a=Math.abs(x);let eye=(1-S(.19,.33,Math.abs(y)))*S(.23,.38,a)*(1-S(1.01,1.20,a));let mouth=(1-S(.21,.34,Math.abs(y+1.20)))*(1-S(.47,.70,a));let nose=(1-S(.12,.23,Math.abs(y+.81)))*(1-S(.27,.43,a));return 1-Math.max(eye,mouth,nose)}
function inverseDelta(m,i,d){let p=d.clone().applyMatrix3(new T.Matrix3().setFromMatrix4(m.matrixWorld).invert());if(!m.isSkinnedMesh)return p;let o=m.applyBoneTransform(i,new T.Vector3()),a=m.applyBoneTransform(i,new T.Vector3(1,0,0)).sub(o),b=m.applyBoneTransform(i,new T.Vector3(0,1,0)).sub(o),c=m.applyBoneTransform(i,new T.Vector3(0,0,1)).sub(o),M=new T.Matrix3().set(a.x,b.x,c.x,a.y,b.y,c.y,a.z,b.z,c.z);return Math.abs(M.determinant())<1e-8?new T.Vector3():p.applyMatrix3(M.invert())}
const num=x=>Number(x).toFixed(5);
function shaderFor(mat,config,hairColor,topY){
 const amount=config.amount,scalp=config.scalp&&amount>0,base=mat.userData.v9Shader;
 if(!base)return;
 mat.onBeforeCompile=s=>{
  // Do not run the older quantized lighting pass: it competes with large clean planes.
  s.vertexShader='attribute vec3 irisAtlas;\nvarying vec3 vIrisAtlas;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvIrisAtlas = irisAtlas;');
  let code=ATLAS.map(r=>'{float w=pmMask(a,y,'+[r[1],r[2],r[3],r[4],r[5],r[9]].map(num).join(',')+'); vec3 n=normalize(vec3('+num(r[6])+'*signX,'+num(r[7])+','+num(r[8])+')); total+=w; sum+=n*w;}').join('\n');
  s.fragmentShader='varying vec3 vIrisAtlas;\nfloat pmMask(float x,float y,float cx,float cy,float rx,float ry,float slope,float priority){float u=x-cx;float v=y-cy-u*slope;return (1.0-smoothstep(0.73,1.08,abs(u)/rx))*(1.0-smoothstep(0.70,1.08,abs(v)/ry))*priority;}\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n'+
   'float x=vIrisAtlas.x;float y=vIrisAtlas.y;float a=abs(x);float signX=sign(x);float total=0.0;vec3 sum=vec3(0.0);\n'+code+
   '\nfloat eye=(1.0-smoothstep(0.19,0.33,abs(y)))*smoothstep(0.23,0.38,a)*(1.0-smoothstep(1.01,1.20,a));float mouth=(1.0-smoothstep(0.21,0.34,abs(y+1.20)))*(1.0-smoothstep(0.47,0.70,a));float nostril=(1.0-smoothstep(0.12,0.23,abs(y+0.81)))*(1.0-smoothstep(0.27,0.43,a));float safety=1.0-max(eye,max(mouth,nostril));\n'+
   'if(total>0.0001){vec3 authored=normalize(mat3(viewMatrix)*normalize(sum));float front=smoothstep(-0.25,0.42,vIrisAtlas.z);float agree=smoothstep(0.08,0.42,dot(normal,authored));normal=normalize(mix(normal,authored,'+num(amount)+'*min(total,1.0)*safety*front*agree));}');
  if(scalp){let c=new T.Color(hairColor);s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat aa=abs(vIrisAtlas.x);float zz=vIrisAtlas.z;float hairline=mix('+num(topY-.49)+','+num(topY-.78)+',smoothstep(0.55,1.35,aa));hairline=mix(hairline,0.40,smoothstep(0.15,-0.75,zz));float cap=smoothstep(hairline-0.018,hairline+0.018,vIrisAtlas.y);diffuseColor.rgb=mix(diffuseColor.rgb,vec3('+[c.r,c.g,c.b].map(num).join(',')+'),cap);'.replace('smoothstep(0.15,-0.75,zz)','(1.0-smoothstep(-0.75,0.15,zz))'))}
 };
 mat.customProgramCacheKey=()=>['iris-v9',amount,scalp,hairColor,topY.toFixed(3)].join(':');mat.needsUpdate=true;
}
export class AuthoredFace extends StyledFace{
 constructor(scene){super(scene);this.identity=recipe(PRESETS9.iris);this.designConfig={...DEFAULT_DESIGN};this.designStats={status:'loading'};this.original=null}
 async load(){this.designConfig={...this.identity.design};await super.load();this.capture();this.identity.design={...this.designConfig};this.applyDesign();return this}
 capture(){let g=this.body.geometry;this.original={position:g.attributes.position.array.slice(),normal:g.attributes.normal?.array.slice()}}
 restore(){if(!this.original)return;let g=this.body.geometry;g.attributes.position.array.set(this.original.position);g.attributes.position.needsUpdate=true;if(this.original.normal){g.attributes.normal.array.set(this.original.normal);g.attributes.normal.needsUpdate=true}}
 async setRecipe(raw){this.designConfig=recipe(raw).design;this.restore();await super.setRecipe(raw);this.identity.design={...this.designConfig};this.applyDesign();return this.identity}
 setStyle(n,o){this.restore();let r=super.setStyle(n,o);this.identity.design={...this.designConfig};this.applyDesign();return r}
 setFace(k,v,commit=true){this.restore();super.setFace(k,v,commit);this.identity.design={...this.designConfig};if(commit)this.applyDesign()}
 setDesign(d){this.designConfig=recipe({design:{...this.designConfig,...d}}).design;this.identity.design={...this.designConfig};this.applyDesign();return this.designStats}
 applyDesign(){
  if(!this.original)return;this.restore();let m=this.body,g=m.geometry,p=g.attributes.position,cfg=this.designConfig;
  this.group.updateMatrixWorld(true);for(let q of this.parts)q.skeleton?.update();
  let eyes=new T.Box3();for(let q of this.parts.filter(q=>mats(q).some(a=>['Eye','Iris'].includes(a.name))))for(let i=0;i<q.geometry.attributes.position.count;i++)eyes.expandByPoint(get(q,i));
  let h=this.frameBounds();if(eyes.isEmpty()||h.isEmpty()){this.designStats={status:'fallback: landmarks'};return}
  let ec=eyes.getCenter(new T.Vector3()),span=clamp(eyes.getSize(new T.Vector3()).x/2,.035,.075),center=h.getCenter(new T.Vector3()),topY=(h.max.y-ec.y)/span;
  this.portraitBounds={eyeY:ec.y,top:h.max.y,cut:ec.y-2.25*span,span,centerZ:center.z};
  let before=Array.from({length:p.count},(_,i)=>get(m,i)),atlas=before.map(v=>new T.Vector3((v.x-ec.x)/span,(v.y-ec.y)/span,(v.z-center.z)/span));
  g.setAttribute('irisAtlas',new T.Float32BufferAttribute(atlas.flatMap(v=>v.toArray()),3));
  // Use bilateral plane offsets fitted to the actual source, keeping fixed authored normals.
  let planes=ATLAS.map(r=>{let n=new T.Vector3(r[6],r[7],r[8]).normalize(),sum=0,w=0;for(let v of atlas){let t=mask(r,v.x,v.y)*S(.30,.72,v.z)*protect(v.x,v.y);if(t<.1)continue;let q=new T.Vector3(Math.abs(v.x),v.y,v.z);sum+=n.dot(q)*t;w+=t}return{r,n,offset:w>0?sum/w:0,valid:w>0}});
  let groups=new Map(),src=this.original.position;for(let i=0;i<p.count;i++){let k=[src[3*i],src[3*i+1],src[3*i+2]].map(x=>Math.round(x*1e6)).join(':');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(i)}
  let deltas=new Map(),desired=0;
  for(let ids of groups.values()){let i=ids[0],v=atlas[i],a=Math.abs(v.x),f=S(.15,.65,v.z),safety=protect(v.x,v.y),sum=new T.Vector3(),weight=0;
   if(v.y>-1.94&&v.y<topY+.1&&a<1.55&&f>0&&safety>0){for(let {r,n,offset,valid} of planes){if(!valid||r[0].startsWith('neck'))continue;let w=mask(r,v.x,v.y);if(w<.001)continue;let d=clamp(offset-n.dot(new T.Vector3(a,v.y,v.z)),-.16,.16);sum.z+=d*n.z*w;sum.x+=d*n.x*w*Math.sign(v.x)*.40;weight+=w}if(weight>0)sum.multiplyScalar(cfg.amount*cfg.shape*f*safety/Math.max(1,weight))}
   // Smoothly taper only the neck below the jaw; draw the underside back, avoiding mouth and chin front.
   let nmask=(1-S(-2.20,-1.78,v.y))*S(-2.65,-2.35,v.y);
   sum.x-=Math.sign(v.x)*Math.max(0,a-.43)*.28*nmask*cfg.neck*cfg.amount;
   sum.z-=Math.max(0,v.z-.34)*.26*nmask*cfg.neck*cfg.amount;
   let d=sum.multiplyScalar(span);if(d.length()>.009)d.setLength(.009);if(d.length()<.00003)continue;desired=Math.max(desired,d.length());for(let j of ids)deltas.set(j,inverseDelta(m,j,d))
  }
  const idx=g.index?.array||Uint32Array.from({length:p.count},(_,i)=>i),affected=[];for(let i=0;i<idx.length;i+=3){let a=idx[i],b=idx[i+1],c=idx[i+2];if(deltas.has(a)||deltas.has(b)||deltas.has(c))affected.push([a,b,c])}
  const cross=(a,b,c)=>b.clone().sub(a).cross(c.clone().sub(a));let scale=1,bad=0,max=0;
  for(let attempt=0;attempt<8;attempt++,scale*=.64){p.array.set(src);for(let [i,d] of deltas)p.setXYZ(i,src[3*i]+d.x*scale,src[3*i+1]+d.y*scale,src[3*i+2]+d.z*scale);let after=new Map([...deltas.keys()].map(i=>[i,get(m,i)]));bad=0;max=0;for(let [i,v] of after)max=Math.max(max,v.distanceTo(before[i]));for(let [a,b,c] of affected){let n=cross(before[a],before[b],before[c]),q=cross(after.get(a)||before[a],after.get(b)||before[b],after.get(c)||before[c]),l=n.length(),r=q.length();if(l>1e-10&&(n.dot(q)/Math.max(1e-18,l*r)<.25||r/l<.30||r/l>2.5))bad++}if(!bad&&max<.010)break}
  if(bad){this.restore();max=0;scale=0}p.needsUpdate=true;g.computeBoundingSphere();
  // Only the skin material of the host geometry receives the atlas. Other meshes stay original.
  for(let a of mats(m)){if(a.name!=='Skin')continue;a.userData.v9Shader??={compile:a.onBeforeCompile,key:a.customProgramCacheKey};if(cfg.amount>0){a.normalMap=null;a.roughnessMap=null;a.roughness=.93;shaderFor(a,cfg,this.identity.hairColor,topY)}else{a.onBeforeCompile=a.userData.v9Shader.compile;a.customProgramCacheKey=a.userData.v9Shader.key;a.needsUpdate=true}}
  let scalp=cfg.scalp&&cfg.amount>0&&/^short/.test(this.identity.hair);if(cfg.scalp&&!scalp&&cfg.amount>0){for(let a of mats(m))if(a.name==='Skin')shaderFor(a,{...cfg,scalp:false},this.identity.hairColor,topY)}
  for(let q of this.hairParts)q.visible=!scalp;
  this.designStats={status:bad?'geometry fallback / planes active':'authored',regions:22,atlasRules:ATLAS.length,changed:bad?0:deltas.size,maxMM:+(max*1000).toFixed(2),guard:bad?'FALLBACK':'PASS',scale:+scale.toFixed(3),scalp:scalp?'graphic shaved': 'authored hair',span:+span.toFixed(4),cut:+this.portraitBounds.cut.toFixed(4)};
  this.updateBrows();
 }
}
