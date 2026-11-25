// V6 visual layer. V5 anatomy and expression engine is reused without copying or mutating its source.
import * as T from 'three';
import {FaceSystem,PRESETS,FIELDS,HAIR,recipe as anatomyRecipe,weights as anatomyWeights} from '../v5/face-system.mjs';
export {FIELDS,HAIR};
export const STYLES={
 minimal:{label:'Escultura',planes:.7,graphic:.85,browMass:.82,hairMass:1,texture:.2,shadow:.65},
 ink:{label:'Gráfico',planes:.9,graphic:1,browMass:1,hairMass:1,texture:.08,shadow:.95},
 soft:{label:'Suave',planes:.35,graphic:.45,browMass:.5,hairMass:.8,texture:.55,shadow:.3},
 base:{label:'Original V5',planes:0,graphic:0,browMass:0,hairMass:0,texture:1,shadow:0}
};
export const PRESETS6={
 iris:{...PRESETS.iris,face:{...PRESETS.iris.face,forehead:-.2,cheekbones:.53,jaw_width:-.12,chin:.12,eye_size:-.18,eye_tilt:.38,lips:.54,nose_length:.06},hair:'short04',browColor:'#d0c5b4',skin:'#b08e76',irisColor:'#303a3a',restBlink:.31,style:'minimal'},
 soter:{...PRESETS.soter,face:{...PRESETS.soter.face,jaw_width:.55,chin:.38,cheekbones:.45,eye_tilt:-.16,nose_length:.20},style:'minimal',restBlink:.16},
 nara:{...PRESETS.nara,face:{...PRESETS.nara.face,eye_size:.37,cheekbones:.10,chin:-.22},style:'soft',restBlink:.08}
};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+x)?+x:0));
export function recipe(raw={}){let r=anatomyRecipe(raw);r.style=Object.hasOwn(STYLES,raw.style)?raw.style:'minimal';r.styleProfile={...STYLES[r.style]};for(let k of ['planes','graphic','browMass','hairMass','texture','shadow'])if(raw.styleProfile?.[k]!=null)r.styleProfile[k]=clamp(raw.styleProfile[k]);return r}
const matList=m=>[].concat(m.material||[]), has=(m,n)=>matList(m).some(a=>a.name===n);
const vertex=(m,i,v=new T.Vector3())=>m.getVertexPosition(i,v).applyMatrix4(m.matrixWorld);
const smooth=(a,b,t)=>{let x=clamp((t-a)/(b-a));return x*x*(3-2*x)};
function materialMap(tex,kind){
 if(!tex?.image)return tex;try{let img=tex.image,w=img.width||img.videoWidth,h=img.height||img.videoHeight;if(!w||!h)return tex;
 let size=kind==='skin'?384:256,c=document.createElement('canvas');c.width=Math.min(size,w);c.height=Math.max(1,Math.round(h*c.width/w));let ctx=c.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=true;ctx.drawImage(img,0,0,c.width,c.height);let p=ctx.getImageData(0,0,c.width,c.height),a=p.data;
 if(kind==='hair'){let W=c.width,H=c.height,alpha=new Uint8Array(W*H),max=new Uint8Array(W*H);for(let i=0;i<alpha.length;i++)alpha[i]=a[4*i+3];for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)v=Math.max(v,alpha[Math.max(0,Math.min(H-1,y+dy))*W+Math.max(0,Math.min(W-1,x+dx))]);max[y*W+x]=v}for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=255;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)v=Math.min(v,max[Math.max(0,Math.min(H-1,y+dy))*W+Math.max(0,Math.min(W-1,x+dx))]);let i=(y*W+x)*4,l=.2126*a[i]+.7152*a[i+1]+.0722*a[i+2];let tone=235+(l-128)*.08;a[i]=a[i+1]=a[i+2]=tone;a[i+3]=Math.round(255*smooth(.18,.64,v/255))}}
 else if(kind==='skin'){for(let i=0;i<a.length;i+=4){let l=.2126*a[i]+.7152*a[i+1]+.0722*a[i+2];for(let k=0;k<3;k++)a[i+k]=Math.round(a[i+k]*.82+l*.18)}}
 else if(kind==='iris'){for(let i=0;i<a.length;i+=4){let l=.2126*a[i]+.7152*a[i+1]+.0722*a[i+2],v=30+205*smooth(14/255,165/255,l/255);a[i]=a[i+1]=a[i+2]=v}}
 ctx.putImageData(p,0,0);if(kind==='skin'){let d=document.createElement('canvas');d.width=c.width;d.height=c.height;let g=d.getContext('2d');g.filter='blur(1.1px)';g.drawImage(c,0,0);c=d}
 const out=tex.clone();out.source=new T.Source(c);out.needsUpdate=true;return out}catch(e){return tex}
}
function saved(a){if(!a.userData.v6Original)a.userData.v6Original={map:a.map,normalMap:a.normalMap,roughnessMap:a.roughnessMap,metalnessMap:a.metalnessMap,aoMap:a.aoMap,roughness:a.roughness,metalness:a.metalness,opacity:a.opacity,alphaTest:a.alphaTest,visible:a.visible,compile:a.onBeforeCompile,key:a.customProgramCacheKey};return a.userData.v6Original}
function stylizedLight(a,strength){a.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>',String.raw`#include <lights_fragment_end>
 vec3 pLight = reflectedLight.directDiffuse / max(diffuseColor.rgb,vec3(0.035));
 float pLum=dot(pLight,vec3(0.2126,0.7152,0.0722));
 float pBand=0.17+0.32*smoothstep(0.10,0.25,pLum)+0.46*smoothstep(0.48,0.68,pLum)+0.55*smoothstep(0.98,1.32,pLum);
 reflectedLight.directDiffuse *= mix(1.0,clamp(pBand/max(pLum,0.025),0.65,1.28),STRENGTH);
`.replace('STRENGTH',strength.toFixed(3)))};a.customProgramCacheKey=()=> 'prometeo-soft-planes-'+strength.toFixed(3)}
export class StyledFace extends FaceSystem{
 constructor(scene){super(scene);this.identity=recipe(PRESETS6.iris);this.r=anatomyRecipe(this.identity);this.ribbons=[];this.styleStats={};this.clayOn=false}
 effective(){let r=anatomyRecipe(this.identity),s=this.identity.styleProfile,p=s.planes;for(let [k,v] of Object.entries({cheekbones:.14,jaw_width:.06,chin:.06,nose_length:-.09,nose_width:-.04,forehead:-.08}))r.face[k]=clamp(r.face[k]+p*v,-.75,.75);return r}
 async load(){this.r=this.effective();await super.load();this.identity.hair=this.r.hair;this.refreshStyle(true);return this}
 async setRecipe(raw){this.identity=recipe(raw);await super.setRecipe(this.effective());this.identity.hair=this.r.hair;this.refreshStyle(true);return this.identity}
 setStyle(name,override){this.identity=recipe({...this.identity,style:name,styleProfile:override});this.r=this.effective();super.applyShape();this.refreshStyle(true);return this.identity}
 setFace(k,value,commit=true){this.identity.face[k]=clamp(value,-.75,.75);this.r=this.effective();let w=anatomyWeights(this.r);for(let m of [...this.parts,...this.hairParts])for(let [n,v] of Object.entries(w)){let i=m.morphTargetDictionary?.[n];if(i!==undefined)m.morphTargetInfluences[i]=v}if(commit)this.refreshStyle(true);else this.updateBrows()}
 refreshStyle(rebuild){const s=this.identity.styleProfile,base=this.identity.style==='base',stats={hiddenLashes:0,skinMapsSimplified:0,solidHair:0,graphicEyes:0,ribbonVertices:0};this.group.updateMatrixWorld(true);for(let m of this.parts)m.skeleton?.update();for(let m of [...this.parts,...this.hairParts]){
 m.visible=true;for(let a of matList(m)){let o=saved(a),n=a.name;
 Object.assign(a,{map:o.map,normalMap:o.normalMap,roughnessMap:o.roughnessMap,metalnessMap:o.metalnessMap,aoMap:o.aoMap,roughness:o.roughness,metalness:o.metalness,opacity:o.opacity,alphaTest:o.alphaTest,visible:o.visible,onBeforeCompile:o.compile,customProgramCacheKey:o.key});
 if(!base){
 if(n==='Skin'){if(s.texture<.85){a.userData.v6Skin??=materialMap(o.map,'skin');a.map=a.userData.v6Skin;stats.skinMapsSimplified++}a.normalMap=null;a.roughnessMap=null;a.metalnessMap=null;a.roughness=.91;a.metalness=0;stylizedLight(a,s.shadow*.55)}
 if(n==='Eye'&&s.graphic>.4){a.map=null;a.color.set('#d8d5cb');a.roughness=.72;stats.graphicEyes++}
 if(n==='Iris'&&s.graphic>.4){a.userData.v6Iris??=materialMap(o.map,'iris');a.map=a.userData.v6Iris;a.roughness=.68;stats.graphicEyes++}
 if(n==='Cornea'&&s.graphic>.65){a.opacity=.025;a.roughness=.48}
 if(/^Hair/.test(n)&&s.hairMass>.65){a.userData.v6Hair??=materialMap(o.map,'hair');a.map=a.userData.v6Hair;a.color.set(this.identity.hairColor);a.normalMap=null;a.roughnessMap=null;a.roughness=.92;a.alphaTest=.30;stats.solidHair++}
 if(n==='Eyelash'&&s.graphic>.5){a.visible=false;stats.hiddenLashes++}
 }a.needsUpdate=true;
 }
 }
 if(rebuild)this.buildBrows();for(let b of this.ribbons)b.mesh.visible=!base;let success=this.ribbons.length===2&&!base;for(let m of this.parts.filter(m=>has(m,'Eyebrow')))for(let a of matList(m))if(a.name==='Eyebrow')a.visible=!success;stats.ribbonVertices=this.ribbons.reduce((n,b)=>n+b.mesh.geometry.attributes.position.count,0);stats.brows=success?'surface-bound':'authored';this.styleStats=stats;
 if(this.clayOn)this.clay(true);this.updateBrows()
 }
 buildBrows(){for(let b of this.ribbons){b.mesh.removeFromParent();b.mesh.geometry.dispose();b.mesh.material.dispose()}this.ribbons=[];if(this.identity.style==='base'||this.identity.styleProfile.browMass<.4)return;
 const body=this.body,brows=this.parts.filter(m=>has(m,'Eyebrow'));if(!body||!brows.length)return;let boxes=[new T.Box3(),new T.Box3()],p=new T.Vector3();for(let m of brows)for(let i=0;i<m.geometry.attributes.position.count;i++){vertex(m,i,p);if(Number.isFinite(p.x+p.y+p.z))boxes[p.x<0?0:1].expandByPoint(p)}
 if(boxes.some(b=>b.isEmpty()))return;const y0=Math.min(...boxes.map(b=>b.min.y))-.012,y1=Math.max(...boxes.map(b=>b.max.y))+.012;
 let P=Array.from({length:body.geometry.attributes.position.count},(_,i)=>vertex(body,i));let ix=body.geometry.index?.array||null,N=ix?.length||P.length,tris=[];
 for(let i=0;i<N;i+=3){let ids=ix?[ix[i],ix[i+1],ix[i+2]]:[i,i+1,i+2],a=P[ids[0]],b=P[ids[1]],c=P[ids[2]];if(!a||!b||!c||Math.max(a.y,b.y,c.y)<y0||Math.min(a.y,b.y,c.y)>y1)continue;let d=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(d)>1e-10)tris.push({ids,a,b,c,d})}
 function attach(x,y){let best=null,z=-Infinity;for(let t of tris){let {a,b,c,d}=t,u=((b.y-c.y)*(x-c.x)+(c.x-b.x)*(y-c.y))/d,v=((c.y-a.y)*(x-c.x)+(a.x-c.x)*(y-c.y))/d,w=1-u-v;if(Math.min(u,v,w)<-1e-5)continue;let nz=a.z*u+b.z*v+c.z*w;if(nz>z){z=nz;best={ids:t.ids,w:[u,v,w],z}}}return best}
 let made=[];for(let side=0;side<2;side++){let box=boxes[side],c=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3()),sign=side?1:-1;let inner=Math.max(.008,Math.min(Math.abs(box.min.x),Math.abs(box.max.x))),outer=Math.max(Math.abs(box.min.x),Math.abs(box.max.x)),width=outer-inner;if(width<.016||width>.09)continue;let span=Math.min(.054,width*.94),u0=inner+width*.025,U=24,V=4,anchors=[],indices=[],mass=this.identity.styleProfile.browMass;
 for(let i=0;i<=U;i++){let t=i/U,x=sign*(u0+span*t),arch=(.003+.003*mass)*Math.exp(-((t-.70)**2)/.055),yc=c.y-.001+arch-.0025*t;let thick=(.003+.0035*mass)*(1-.78*smooth(.53,1,t))*(.78+.22*smooth(0,.08,t));for(let j=0;j<=V;j++){let q=j/V,y=yc+(q-.5)*thick,hit=attach(x,y);if(hit&&Math.abs(hit.z-c.z)<.045)anchors.push({...hit,relief:.00035+.0011*Math.sin(Math.PI*q)*(.5+.5*Math.sin(Math.PI*t))});else anchors.push(null)}}
 if(anchors.some(x=>!x))continue;
 for(let i=0;i<U;i++)for(let j=0;j<V;j++){let k=i*(V+1)+j;indices.push(k,k+V+1,k+1,k+1,k+V+1,k+V+2)}
 let geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(anchors.length*3),3));geo.setIndex(indices);let mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color:this.identity.browColor,roughness:.9,metalness:0,side:T.DoubleSide}));mesh.name='Graphic brow '+side;mesh.frustumCulled=false;this.scene.add(mesh);made.push({mesh,anchors});
 }
 if(made.length!==2){for(let b of made){b.mesh.removeFromParent();b.mesh.geometry.dispose();b.mesh.material.dispose()}return}this.ribbons=made;this.updateBrows()
 }
 updateBrows(){if(!this.ribbons?.length)return;this.group.updateMatrixWorld(true);this.body.skeleton?.update();let cache=new Map(),at=i=>{if(!cache.has(i))cache.set(i,vertex(this.body,i));return cache.get(i)};for(let b of this.ribbons){let a=b.mesh.geometry.attributes.position;for(let i=0;i<b.anchors.length;i++){let {ids,w,relief}=b.anchors[i],p=at(ids[0]),q=at(ids[1]),r=at(ids[2]),n=q.clone().sub(p).cross(r.clone().sub(p)).normalize();if(n.z<0)n.negate();let v=p.clone().multiplyScalar(w[0]).addScaledVector(q,w[1]).addScaledVector(r,w[2]).addScaledVector(n,relief);a.setXYZ(i,v.x,v.y,v.z)}a.needsUpdate=true;b.mesh.geometry.computeVertexNormals();b.mesh.geometry.computeBoundingSphere()}}
 setExpression(e){super.setExpression(e);this.updateBrows()}
 clay(on){this.clayOn=on;for(let m of [...this.parts,...this.hairParts])for(let a of matList(m)){if(!a.color)continue;if(on){a.userData.v6BeforeClay??={color:a.color.clone(),map:a.map,normal:a.normalMap};a.color.set('#b7ad9b');a.map=null;a.normalMap=null}else{let o=a.userData.v6BeforeClay;if(o){a.color.copy(o.color);a.map=o.map;a.normalMap=o.normal;delete a.userData.v6BeforeClay}}a.needsUpdate=true}for(let b of this.ribbons)b.mesh.material.color.set(on?'#b7ad9b':this.identity.browColor)}
 wire(on){super.wire(on);for(let b of this.ribbons)b.mesh.material.wireframe=on}
 stats(){return {...this.styleStats,...this.capabilities(),style:this.identity.style}}
}
