import * as T from "three";
import {GLTFExporter} from "three/addons/exporters/GLTFExporter.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {LowPolyFace} from "../iris/v11-3/clean.mjs";
import {profiles,outfits,newProfile,build,pose,inspect} from "../../../character-system-v2/models.mjs";
import {CLIPS,motionSample} from "./motions.mjs";
import {createChair} from "../../../asset-lab/chair-01/chair.mjs";
import {VERSION,actorRecipe,faceRecipe,canonicalUV,pigments,anchorPosition,IDENTITIES,NOSES,sampleAction,sampleScene,CAFE,DEFAULT_ACTION,ease,clamp} from "./contract.mjs";

export const HEAD_URL=new URL("../iris/v11-3/head.json",import.meta.url);
export const loadHead=()=>fetch(HEAD_URL).then(r=>{if(!r.ok)throw Error("head.json: "+r.status);return r.json()});
const V=a=>new T.Vector3(...a);
const mat=(color,roughness=.8)=>new T.MeshStandardMaterial({color,roughness});
export class AnchoredFace extends LowPolyFace{
 paintAtlas(){
  const g=this.head.geometry,p=g.attributes.position;
  // Rest-space material coordinates never regenerated from deformed XYZ.
  g.setAttribute("uv",new T.Float32BufferAttribute(this.data.positions.flatMap(canonicalUV),2));
  if(!this.atlas){this.atlas=document.createElement("canvas");this.atlas.width=this.atlas.height=256;this.atlasTexture=new T.CanvasTexture(this.atlas);this.atlasTexture.colorSpace=T.SRGBColorSpace}
  const ctx=this.atlas.getContext("2d"),n=this.atlas.width;ctx.fillStyle="#ffffff";ctx.fillRect(0,0,n,n);
  this.anatomicalAnchors??=pigments(this.data);
  for(let a of this.anatomicalAnchors){let [u,v]=a.uv;ctx.save();ctx.translate(u*n,(1-v)*n);ctx.scale(a.rx*n,a.ry*n);const grad=ctx.createRadialGradient(0,0,0,0,0,1);grad.addColorStop(0,a.color);grad.addColorStop(.45,a.color);grad.addColorStop(1,"rgba(255,255,255,0)");ctx.globalAlpha=a.alpha;ctx.fillStyle=grad;ctx.fillRect(-1,-1,2,2);ctx.restore()}
  this.atlasTexture.needsUpdate=true;this.skinMaterial.map=this.clay||this.textureEnabled===false?null:this.atlasTexture;this.skinMaterial.needsUpdate=true;
 }
 landmark(id){const a=this.anatomicalAnchors.find(x=>x.id===id);if(!a)throw Error("Unknown landmark "+id);let p=this.head.geometry.attributes.position;return anchorPosition(a,Array.from({length:p.count},(_,i)=>this.head.getVertexPosition(i,new T.Vector3()).toArray()))}
}
const urban={...outfits[1],id:"urban",name:"Urbano / prueba de vestuario",outer:"#e1dac7",under:"#e1dac7",lower:"#465a68",boot:"#d8d3c7",dark:"#363d3e",clear:.013,hem:.88,gap:0,sleeve:1,bootTop:.10};
const WARDROBE=[urban,outfits[0],outfits[1],outfits[3],outfits[4]],BODY=[...profiles,newProfile];
function addHair(face,kind,color){
 const g=face.head.geometry,p=g.attributes.position,idx=g.index.array;
 const old=face.group.getObjectByName("scalp-hair");if(old){old.geometry.dispose();old.material.dispose();old.removeFromParent()}
 if(kind===0)return;
 let pos=[],line=(x,z)=>kind===1?.72:kind===2?.68-.12*Math.max(0,x/.33):.57+.12*Math.max(0,z/.405);
 for(let i=0;i<idx.length;i+=3){
  let a=[idx[i],idx[i+1],idx[i+2]].map(j=>new T.Vector3().fromBufferAttribute(p,j));
  if(a.every(v=>v.y>=line(v.x,v.z)))for(let v of a){v.x*=1.035;v.y+=.009;v.z*=1.04;pos.push(...v.toArray())}
 }
 let h=new T.BufferGeometry();h.setAttribute("position",new T.Float32BufferAttribute(pos,3));h.computeVertexNormals();let m=new T.Mesh(h,mat(color));m.name="scalp-hair";face.group.add(m);
}
export class Actor{
 constructor(data,input={}){
  this.recipe=actorRecipe(input);this.root=new T.Group();this.root.name=this.recipe.id;
  this.profile=BODY[this.recipe.body];this.outfit=WARDROBE[this.recipe.outfit];this.source=build(this.profile,this.outfit);
  this.bones=[];this.lookup={};this.parts=[];this.rests=[];
  for(let def of this.source.bones){let b=new T.Bone();b.name=def.name;b.position.fromArray(def.position);let parent=this.lookup[def.parent];if(parent)b.position.sub(V(this.source.bones.find(x=>x.name===def.parent).position));(parent||this.root).add(b);this.bones.push(b);this.lookup[b.name]=b;this.rests.push(b.position.clone())}
  this.root.updateMatrixWorld(true);this.skeleton=new T.Skeleton(this.bones);
  let skip=/^(identity-head|identity-hair|eye-.*|mouth)$/;
  for(let q of this.source.meshes){
   if(q.slot==="covered-anatomy"||skip.test(q.name)||q.name==="open-hood"||q.name==="hood-v2"||q.name==="helmet-shell"||q.name==="gold-visor")continue;
   const g=new T.BufferGeometry();
   g.setAttribute("position",new T.Float32BufferAttribute(q.positions,3));g.setAttribute("uv",new T.Float32BufferAttribute(q.uv,2));g.setAttribute("skinIndex",new T.Uint16BufferAttribute(q.joints,4));g.setAttribute("skinWeight",new T.Float32BufferAttribute(q.weights,4));g.setIndex(q.indices);g.computeVertexNormals();
   let skin=q.slot==="anatomy"||this.outfit.id==="urban"&&q.name.includes("-sleeve-");
   let m=new T.SkinnedMesh(g,new T.MeshStandardMaterial({color:skin?this.recipe.skin:q.color,roughness:q.rough,metalness:q.metal||0,side:T.DoubleSide}));m.name=q.name;m.userData.originalColor=m.material.color.getHex();m.castShadow=m.receiveShadow=true;m.frustumCulled=false;this.root.add(m);m.bind(this.skeleton,new T.Matrix4());this.parts.push(m);
  }
  this.face=new AnchoredFace(this.lookup.head,data);
  let s=this.profile.h/1.75,scale=.26/.84*s;
  this.face.group.scale.setScalar(scale);this.face.group.position.set(0,-.08*s-.065*scale,-.035*scale);
  this.face.head.castShadow=true;this.face.head.receiveShadow=true;
  this.edit(this.recipe);this.apply("idle",0);this.root.updateMatrixWorld(true);
 }
 edit(raw){this.recipe=actorRecipe({...this.recipe,...raw});this.face.setRecipe(faceRecipe(this.recipe));this.face.setExpression({browL:this.recipe.browL,browR:this.recipe.browR,blink:this.recipe.blink,lookX:this.recipe.lookX,lookY:this.recipe.lookY,mouth:this.recipe.mouth,smile:this.recipe.smile});addHair(this.face,this.recipe.hair,this.recipe.brow)}
 setClay(on){this.face.setClay(on);let h=this.face.group.getObjectByName("scalp-hair");if(h)h.visible=!on;for(let m of this.parts)m.material.color.set(on?0xbcb4a5:m.userData.originalColor)}
 apply(mode,t,blend=1){const p=pose(t,mode),idle=pose(t,"idle");for(let i=0;i<this.bones.length;i++){let b=this.bones[i],a=idle.rotations[b.name]||[0,0,0],r=p.rotations[b.name]||[0,0,0];b.rotation.set(...a.map((x,k)=>x+(r[k]-x)*blend));b.position.copy(this.rests[i])}this.lookup.pelvis.position.y-=(p.pelvisDrop*blend+idle.pelvisDrop*(1-blend));this.root.updateMatrixWorld(true)}
 applyMotion(id,time){const p=motionSample(id,time);for(let i=0;i<this.bones.length;i++){let b=this.bones[i];b.rotation.set(...(p.rotations[b.name]||[0,0,0]));b.position.copy(this.rests[i])}this.lookup.pelvis.position.y-=p.pelvisDrop;this.root.updateMatrixWorld(true);return p}
 clips(){return CLIPS.map(c=>{let frames=Math.ceil(c.duration*30),times=Array.from({length:frames+1},(_,i)=>c.duration*i/frames),samples=times.map(t=>motionSample(c.id,t)),tracks=[];for(let b of this.bones){let q=[];for(let s of samples)q.push(...new T.Quaternion().setFromEuler(new T.Euler(...(s.rotations[b.name]||[0,0,0]))).toArray());tracks.push(new T.QuaternionKeyframeTrack(b.name+".quaternion",times,q))}let p=[];for(let s of samples){let v=this.rests[this.bones.indexOf(this.lookup.pelvis)].clone();v.y-=s.pelvisDrop;p.push(...v.toArray())}tracks.push(new T.VectorKeyframeTrack("pelvis.position",times,p));return new T.AnimationClip(c.id,c.duration,tracks)})}
 lookAt(world){const local=this.root.worldToLocal(world.clone());const dx=local.x,dz=Math.max(.14,local.z),dy=local.y-this.profile.h*.80;this.lookup.head.rotation.y=clamp(Math.atan2(dx,dz),-.6,.6);this.lookup.head.rotation.x=clamp(-Math.atan2(dy,Math.hypot(dx,dz)),-.38,.38)}
 // Candidate CCD on the actual wrist chain; exposes residual rather than claiming contact.
 aimHand(target,side="R",grip=0){
  const hand=this.lookup["hand_"+side],shoulder=this.lookup["upperArm_"+side],elbow=this.lookup["lowerArm_"+side];
  const palm=new T.Vector3(side==="R"?-.026:.026,-.039,0),v=new T.Vector3(),w=new T.Vector3(),origin=new T.Vector3(),q=new T.Quaternion(),worldQ=new T.Quaternion(),parentQ=new T.Quaternion();
  for(let j=0;j<12;j++)for(let b of [elbow,shoulder]){this.root.updateMatrixWorld(true);b.getWorldPosition(origin);hand.localToWorld(v.copy(palm)).sub(origin);w.copy(target).sub(origin);if(v.lengthSq()<1e-10||w.lengthSq()<1e-10)continue;q.setFromUnitVectors(v.normalize(),w.normalize());b.getWorldQuaternion(worldQ);b.parent.getWorldQuaternion(parentQ);b.quaternion.copy(parentQ.invert().multiply(q.multiply(worldQ)));this.root.updateMatrixWorld(true)}
  for(let i=0;i<5;i++)for(let j=1;j<=2;j++){let f=this.lookup["finger"+i+"_0"+j+"_"+side];if(f)f.rotation.x=(i===0?.45:1.05)*grip}
  this.root.updateMatrixWorld(true);return hand.localToWorld(palm).distanceTo(target);
 }
 action(a,t,prop){this.root.position.fromArray(a.root);this.root.rotation.y=a.yaw;
  if(a.walk)this.apply("walk",t*1.55,1);else this.apply("sit",t*.3,a.sit);
  this.lookAt(V(a.look));this.root.updateMatrixWorld(true);
  let error=null;
  const mouthZ=this.face.surface(0,.365)??.31,mouth=this.face.group.localToWorld(new T.Vector3(0,.365,mouthZ)),forward=new T.Vector3(0,0,1).applyAxisAngle(new T.Vector3(0,1,0),a.cupYaw),center=mouth.clone().addScaledVector(forward,.044);center.y-=.043;
  prop.position.copy(V(a.origin).lerp(center,a.blendCup));prop.rotation.set(a.tilt,a.cupYaw,0,"YXZ");
  if(a.aim){const palm=new T.Vector3(-.026,-.039,0),rest=this.lookup.hand_R.localToWorld(palm),grip=new T.Vector3(-.063,.012,0).applyQuaternion(prop.quaternion).add(prop.position),target=rest.lerp(grip,a.reachWeight);error=this.aimHand(target,"R",a.grip)}
  return error;
 }
 async exportGLB(){let temp=[];for(let m of this.face.pool.filter(m=>m.visible)){let g=m.geometry,copy=new T.BufferGeometry(),n=g.drawRange.count;for(let k of ["position","normal"]){let a=g.attributes[k];copy.setAttribute(k,new T.BufferAttribute(a.array.slice(0,n*3),3))}temp.push([m,g,copy]);m.geometry=copy}try{return await new GLTFExporter().parseAsync(this.root,{binary:true,onlyVisible:true,animations:this.clips()})}finally{for(let [m,g,c] of temp){m.geometry=g;c.dispose()}}}
 dispose(){this.face.dispose();for(let p of this.parts){p.geometry.dispose();p.material.dispose()}this.root.removeFromParent()}
}
export async function loadGLB(buffer){return new Promise((resolve,reject)=>new GLTFLoader().parse(buffer,"",resolve,reject))}
export function makeRenderer(host){
 const scene=new T.Scene();scene.background=new T.Color("#7c837c");const camera=new T.PerspectiveCamera(40,1,.025,80);
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;host.append(renderer.domElement);
 const key=new T.DirectionalLight("#ffe0ba",2.6);key.position.set(-3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6});key.shadow.normalBias=.015;scene.add(key,new T.HemisphereLight("#f9ead7","#67665d",1.3));const fill=new T.DirectionalLight("#c7d7ee",.65);fill.position.set(4,3,-3);scene.add(fill);
 let profile="clean";function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();let s=profile==="ps1"?Math.min(1,320/Math.max(w,h)):profile==="ps2"?Math.min(1,720/Math.max(w,h)):1;renderer.setSize(Math.round(w*s),Math.round(h*s),false);renderer.domElement.style.imageRendering=profile==="ps1"?"pixelated":"auto"}
 new ResizeObserver(resize).observe(host);resize();
 return {scene,camera,renderer,key,view:profileName=>{profile=profileName;resize()},render:()=>renderer.render(scene,camera)};
}
export function box(parent,w,h,d,x,y,z,color){let m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
export function floor(scene,color="#a09b8c"){let m=new T.Mesh(new T.PlaneGeometry(40,40),mat(color));m.rotation.x=-Math.PI/2;m.receiveShadow=true;scene.add(m);return m}
export function chair(scene,position,yaw){let c=createChair(T,{seatHeight:.45});c.root.position.fromArray(position);c.root.rotation.y=yaw;scene.add(c.root);return c}
export function table(scene,x=0,z=.55,width=.75,depth=.67){let g=new T.Group();box(g,width,.045,depth,0,.79,0,"#754e34");for(let i of [-1,1])for(let j of [-1,1])box(g,.045,.77,.045,i*(width/2-.06),.385,j*(depth/2-.06),"#392d28");g.position.set(x,0,z);scene.add(g);return g}
export function cup(scene){
 let g=new T.Group(),outer=new T.LatheGeometry([new T.Vector2(0,-.03),new T.Vector2(.035,-.03),new T.Vector2(.043,-.022),new T.Vector2(.046,.047),new T.Vector2(.041,.047),new T.Vector2(.038,-.016),new T.Vector2(0,-.016)],20),body=new T.Mesh(outer,mat("#e6dbbd",.3));body.castShadow=true;g.add(body);let handle=new T.Mesh(new T.TorusGeometry(.024,.006,6,16),mat("#e6dbbd",.3));handle.position.set(-.052,.012,0);g.add(handle);let coffee=new T.Mesh(new T.CircleGeometry(.037,24),mat("#352016",.55));coffee.rotation.x=-Math.PI/2;coffee.position.y=.029;g.add(coffee);g.name="cup-ceramic";scene.add(g);return g;
}
function label(scene,text,x,y,z,w,h){const c=document.createElement("canvas");c.width=512;c.height=128;let a=c.getContext("2d");a.fillStyle="#302c27";a.fillRect(0,0,512,128);a.fillStyle="#e2d8af";a.font="bold 46px Georgia";a.textAlign="center";a.fillText(text,256,78);let tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;let m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);scene.add(m);return m}
export function cafe(scene){
 floor(scene,"#9f9a83");
 for(let x=-4;x<4;x++)for(let z=-3;z<3;z++)box(scene,.49,.009,.49,x*.5+.25,.004,z*.5+.25,(x+z)%2?"#786c57":"#b9ad91");
 box(scene,5,2.8,.16,0,1.4,-1.6,"#a58c6d");box(scene,5,.65,.13,0,.325,-1.49,"#5b4938");box(scene,.12,2.8,3,-2.5,1.4,-.1,"#b3a186");box(scene,4.9,.18,.18,0,2.75,-1.48,"#66523b");
 for(let x of [-1.5,-.5,.5,1.5]){box(scene,.84,1.16,.05,x,1.8,-1.48,"#344f54");box(scene,.90,.05,.06,x,1.22,-1.44,"#614b34");box(scene,.90,.05,.06,x,2.38,-1.44,"#614b34");box(scene,.05,1.2,.06,x,1.8,-1.42,"#614b34")}
 box(scene,1.8,1,.54,1.35,.5,-1.05,"#674933");box(scene,1.85,.06,.60,1.35,1.03,-1.05,"#c6bfa6");
 for(let i=0;i<5;i++){let m=new T.Mesh(new T.TorusGeometry(.065,.027,7,12,Math.PI*1.65),mat("#b88142"));m.rotation.x=-Math.PI/2;m.position.set(.8+i*.22,1.1,-1.05);scene.add(m)}
 label(scene,"CAFÉ • BUENOS AIRES",0,2.58,-1.39,2.15,.34);
 table(scene,0,0,.69,.89);
}
export function cameraAt(cam,kind,angle=0){
 let views={general:[[3.2,2.6,4.0],[0,.95,0]],medium:[[1.9,1.65,2.3],[0,1,0]],close:[[.55,1.4,1.35],[0,1.1,0]],detail:[[.25,1.05,.9],[0,.86,0]],follow:[[2.7,1.7,.2],[0,.95,0]]};
 let [p,f]=views[kind]||views.general;let v=V(p).applyAxisAngle(new T.Vector3(0,1,0),angle);cam.position.copy(v);cam.lookAt(V(f));
}
export const SOURCE={body:"character-system-v2/models.mjs",face:"iris/v11-3/clean.mjs",head:"Quaternius CC0-1.0; upstream blob a74f94183952267a874c24ac73c4d2382fd0187d",chair:"prometeo/prop/arc-chair@0.1.0"};
