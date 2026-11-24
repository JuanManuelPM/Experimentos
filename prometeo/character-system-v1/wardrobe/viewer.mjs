
import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {profiles,outfits,build,pose,inspect} from './models.mjs';
const query=new URLSearchParams(location.search),initial=outfits.findIndex(o=>o.id===query.get('outfit')),index=initial<0?0:initial,p=profiles.find(p=>p.id===query.get('profile'))||profiles[0];
const scene=new THREE.Scene();scene.background=new THREE.Color(0xc5c3bd);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.append(renderer.domElement);
const camera=new THREE.PerspectiveCamera(37,1,.05,50);
scene.add(new THREE.HemisphereLight(0xfff4e8,0x687782,2.05));
for(const [col,intensity,pos] of [[0xffebd9,3.0,[3,5,4]],[0xd0e3ff,1.7,[-3,3,-4]],[0xffffff,.75,[-3,2,4]]]){let l=new THREE.DirectionalLight(col,intensity);l.position.set(...pos);if(intensity===3){l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.camera.left=-2;l.shadow.camera.right=2;l.shadow.camera.top=2;l.shadow.camera.bottom=-2;l.shadow.bias=-.0003}scene.add(l)}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xc5c3bd,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const actor=new THREE.Group();actor.name='WardrobeCharacter';scene.add(actor);
const source=build(p,outfits[index]),bones=[],lookup={};
for(const def of source.bones){let b=new THREE.Bone();b.name=def.name;const parent=def.parent&&lookup[def.parent];b.position.fromArray(def.position);if(parent)b.position.sub(new THREE.Vector3().fromArray(source.bones.find(x=>x.name===def.parent).position));(parent||actor).add(b);bones.push(b);lookup[b.name]=b;}
actor.updateMatrixWorld(true);const skeleton=new THREE.Skeleton(bones);const rests=bones.map(b=>b.position.clone());
const mats=new Map();function material(q){let k=[q.color,q.rough,q.metal].join('|');if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({color:q.color,roughness:q.rough,metalness:q.metal,side:THREE.DoubleSide}));return mats.get(k)}
function part(q){let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(q.positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(q.uv,2));g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(q.joints,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(q.weights,4));g.setIndex(q.indices);g.computeVertexNormals();let m=new THREE.SkinnedMesh(g,material(q));m.name=q.name;m.userData={slot:q.slot};m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;actor.add(m);m.bind(skeleton,new THREE.Matrix4());return m}
const anatomy=source.meshes.filter(q=>q.slot==='anatomy').map(part);
const loaded=new Map();function equip(i){if(!loaded.has(i)){let m=i===index?source:build(p,outfits[i]);loaded.set(i,m.meshes.filter(q=>!['anatomy','covered-anatomy'].includes(q.slot)).map(part));}for(const [n,parts] of loaded)for(const part of parts)part.visible=n===i;return i}
let current=equip(index);equip((index+1)%outfits.length);equip(index);
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
function apply(a,b,blend){for(let i=0;i<bones.length;i++){let bone=bones[i],v=a.rotations[bone.name]||[0,0,0],w=b.rotations[bone.name]||[0,0,0];bone.rotation.set(...v.map((x,j)=>x+(w[j]-x)*blend));bone.position.copy(rests[i])}lookup.pelvis.position.y-=a.pelvisDrop+(b.pelvisDrop-a.pelvisDrop)*blend}
const actions=['action','flex','action','walk','crouch'];
const clock=performance.now();let frames=[],first=false;
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/Math.max(1,innerHeight);camera.updateProjectionMatrix()}window.addEventListener('resize',resize);resize();
function clip(mode){let tracks=[],times=Array.from({length:61},(_,i)=>i/30);for(const b of bones){let values=[];for(let t of times){let v=pose(t/2,mode).rotations[b.name]||[0,0,0],q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...v));values.push(...q.toArray())}tracks.push(new THREE.QuaternionKeyframeTrack(b.name+'.quaternion',times,values))}const values=[];for(let t of times){let v=rests[bones.indexOf(lookup.pelvis)].clone();v.y-=pose(t/2,mode).pelvisDrop;values.push(...v.toArray())}tracks.push(new THREE.VectorKeyframeTrack('pelvis.position',times,values));return new THREE.AnimationClip(mode,2,tracks)}
const clips=['idle','walk','sit','flex','crouch','action'].map(clip);
window.__WARDROBE__={source,inspect:inspect(source),clips,metrics:()=>({frames:frames.length,medianMs:frames.slice().sort((a,b)=>a-b)[Math.floor(frames.length/2)],drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles}),exportGLB:async()=>{let old=bones.map(b=>({p:b.position.clone(),q:b.quaternion.clone()}));for(let i=0;i<bones.length;i++){bones[i].position.copy(rests[i]);bones[i].quaternion.identity()}actor.updateMatrixWorld(true);try{return await new GLTFExporter().parseAsync(actor,{binary:true,onlyVisible:true,animations:clips})}finally{for(let i=0;i<bones.length;i++){bones[i].position.copy(old[i].p);bones[i].quaternion.copy(old[i].q)}}},equip:i=>current=equip(i)};
let last=clock;
function tick(now){const dt=now-last;last=now;if(dt<200){frames.push(dt);if(frames.length>300)frames.shift()}let t=((now-clock)/1000)%26,phase=(now-clock)/1800;let orbit=t<8?Math.PI*2*smooth(t/8):0,angle=orbit+.20;let detail=smooth((t-8)/1.6)*(1-smooth((t-11)/1.6)),distance=3.5-detail*1.5;let target=p.h*.51+detail*.28;camera.position.set(Math.sin(angle)*distance,target+.14,Math.cos(angle)*distance);camera.lookAt(0,target,0);let idle=pose(phase,'idle'),act=pose(phase,actions[index]),walk=pose(phase,'walk');if(t<13)apply(idle,idle,0);else if(t<17)apply(idle,act,smooth((t-13)/.7)*(1-smooth((t-16.2)/.8)));else apply(idle,walk,smooth((t-17)/.8)*(1-smooth((t-24.7)/1.3)));let wanted=t>=21&&t<23?(index+1)%outfits.length:index;if(wanted!==current)current=equip(wanted);renderer.render(scene,camera);if(!first){first=true;document.body.dataset.render='WEBGL_FRAME_RENDERED'}requestAnimationFrame(tick)}
requestAnimationFrame(tick);
