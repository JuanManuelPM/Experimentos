import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {config} from './scene-config.mjs';
import {phaseAt,samplePath,clearanceToCar,cameraPose} from './traffic-core.mjs';
const $=id=>document.getElementById(id);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;$('app').appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x46536c);scene.fog=new THREE.FogExp2(0x46536c,0.016);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.08,110);
scene.add(new THREE.HemisphereLight(0xe4e3ff,0x7b5a4e,2.1));
const sun=new THREE.DirectionalLight(0xffae6b,3.3);sun.position.set(-13,17,-21);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-21;sun.shadow.camera.right=21;sun.shadow.camera.top=21;sun.shadow.camera.bottom=-21;scene.add(sun);
const mat=(color,roughness=1,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const place=(geometry,material,pos,shadow=false)=>{const m=new THREE.Mesh(geometry,material);m.position.set(...pos);m.receiveShadow=true;m.castShadow=shadow;scene.add(m);return m};
// Road, sidewalk, zebra and signal are supporting/blockout forms, not substitute NPC assets.
place(new THREE.PlaneGeometry(90,90),mat('#645e6b'),[0,-.055,0]).rotation.x=-Math.PI/2;
place(new THREE.BoxGeometry(80,.10,7.7),mat('#333e49'),[0,0,0]);
for(const z of [-6.3,6.3]){place(new THREE.BoxGeometry(80,.25,4.5),mat('#b6a391'),[0,.095,z]);}
for(let n=0;n<8;n++){let stripe=place(new THREE.PlaneGeometry(.29,7.0),mat('#e5d5ba'),[-1.45+n*.41,.059,0]);stripe.rotation.x=-Math.PI/2;}
for(const z of [-.38,.38]){for(let i=-12;i<12;i++){const mark=place(new THREE.PlaneGeometry(.55,.045),mat('#d5b378'),[i*1.85,.057,z]);mark.rotation.x=-Math.PI/2;}}
// Single retro shopfront as distant support only; no claims of authored city assets.
const shopMaterials=[mat('#604f55'),mat('#846b6b'),mat('#91837b'),mat('#6b6374')];
for(const [ix,x,z,w,h] of [[0,-10,10,6,8],[1,5,10,9,8],[2,14,10,6,10],[3,-11,-11,8,7],[1,10,-11,9,9]]){
 place(new THREE.BoxGeometry(w,h,4),shopMaterials[ix],[x,h/2+.2,z]);
 for(let col=-Math.floor(w/2)+1;col<=Math.floor(w/2)-1;col+=1.4){for(let lev=1;lev<h-1;lev+=1.8){place(new THREE.PlaneGeometry(.65,.95),mat((ix+Math.round(lev))%2?'#c3b2a1':'#3a5160',.2),[x+col,lev,z<0? z+2.012:z-2.012]).rotation.y=z<0?0:Math.PI;}}
}
const signal=new THREE.Group();scene.add(signal);signal.position.set(2.52,0,-3.98);
const pole=new THREE.Mesh(new THREE.CylinderGeometry(.065,.077,3.25,12),mat('#262e35',.7,.5));pole.position.y=1.65;signal.add(pole);
const housing=new THREE.Mesh(new THREE.BoxGeometry(.38,.93,.28),mat('#242b33',.8));housing.position.set(0,3.15,0);signal.add(housing);
const lenses={};for(const [i,k,c] of [[0,'RED',0xff4329],[1,'AMBER',0xf5ad33],[2,'GREEN',0x3af79e]]){
 const lens=new THREE.Mesh(new THREE.CircleGeometry(.119,22),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:0.04,roughness:.35}));lens.position.set(0,3.43-i*.284,.146);signal.add(lens);lenses[k]=lens;}
const walkSig=new THREE.Mesh(new THREE.BoxGeometry(.26,.33,.16),mat('#202e37'));walkSig.position.set(.32,2.3,0);signal.add(walkSig);
const walkLED=new THREE.Mesh(new THREE.PlaneGeometry(.15,.18),new THREE.MeshBasicMaterial({color:0xff4933}));walkLED.position.set(.32,2.3,.083);signal.add(walkLED);
const personRoot=new THREE.Group(),carRoot=new THREE.Group();scene.add(personRoot,carRoot);
let personMixer=null,carMixer=null,sceneTime=0,playing=true,last=performance.now();
function normalizeAsset(gltf,desiredHeight,rotation){
 const root=gltf.scene;root.rotation.y=rotation;root.updateMatrixWorld(true);
 let b=new THREE.Box3().setFromObject(root);let size=b.getSize(new THREE.Vector3());
 if(size.y<=0||!Number.isFinite(size.y))throw Error('INVALID_MODEL_BOUNDS');
 let scale=desiredHeight/size.y;root.scale.multiplyScalar(scale);root.updateMatrixWorld(true);
 b.setFromObject(root);let c=b.getCenter(new THREE.Vector3());
 root.position.x-=c.x;root.position.z-=c.z;root.position.y-=b.min.y;
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 return root;
}
function fetchGLB(path){return new Promise((resolve,reject)=>new GLTFLoader().load(path,resolve,undefined,reject));}
async function load(){
 try{
  const [human,truck]=await Promise.all([fetchGLB(config.glb.person),fetchGLB(config.glb.vehicle)]);
  if(!human.scene||!truck.scene||!human.animations.length)throw Error('GLB_SKIN_OR_ANIMATION_MISSING');
  personRoot.add(normalizeAsset(human,1.77,Math.PI));carRoot.add(normalizeAsset(truck,2.15,-Math.PI/2));
  personMixer=new THREE.AnimationMixer(human.scene);personMixer.clipAction(human.animations[0]).play();
  if(truck.animations.length){carMixer=new THREE.AnimationMixer(truck.scene);carMixer.clipAction(truck.animations[0]).play();}
  $('load').style.display='none';$('asset-status').textContent='2 GLB · CARGADOS';
  window.__PROMETEO_FIRST_ARTICLE__={assetsLoaded:2,personSkinned:!!human.scene.getObjectByProperty('isSkinnedMesh',true),humanClips:human.animations.length,vehicleMeshes:truck.scene.children.length,license:'CC-BY-4.0',visualApproval:false};
 }catch(e){$('load').classList.add('error');$('load').innerHTML='NO SE PUDO CARGAR EL ARTÍCULO 01<small>'+String(e.message||e).replace(/[<>]/g,'')+'<br>El prototipo no sustituye los modelos faltantes por primitivas.</small>';console.error('PROMETEO FIRST ARTICLE LOAD FAILED',e);}
}
load();
function renderAt(t,dt){
 const person=samplePath(t,config.pedestrian),truck=samplePath(t,config.vehicle),phase=phaseAt(t,config.phases,config.duration);
 personRoot.position.set(person.x,0,person.z);carRoot.position.set(truck.x,0,truck.z);
 // Forward +Z for pedestrian; car heading +X requires intrinsic GLB heading visual QA.
 personRoot.rotation.y=person.speed>.04?Math.atan2(person.v.x,person.v.z):0;
 if(personMixer&&person.speed>.08)personMixer.update(Math.min(.05,dt));
 if(carMixer&&truck.speed>.08)carMixer.update(Math.min(.05,dt));
 for(const [name,lens] of Object.entries(lenses)){lens.material.emissiveIntensity=name===phase.cars?2.8:.015;}
 walkLED.material.color.set(phase.walk==='GREEN'?'#34feac':'#ff463d');
 const pose=cameraPose(t,person);camera.position.set(pose.x,pose.y,pose.z);camera.lookAt(pose.look.x,pose.look.y,pose.look.z);
 $('phase').textContent=phase.label;$('dot').style.background=phase.cars==='GREEN'?'#44ef9e':phase.cars==='AMBER'?'#ffb047':'#ff655b';
 $('clock').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:19';$('scrub').value=String(t);$('pos').textContent=t.toFixed(1)+'s';
 const clearance=clearanceToCar(person,truck,config.vehicleExtent.halfX,config.vehicleExtent.halfZ,config.personRadius);
 if(clearance<-.01){console.error('COLLISION_BOUNDARY',t,clearance);}
 renderer.render(scene,camera);
}
function tick(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;if(playing)sceneTime+=dt;if(sceneTime>=config.duration)sceneTime=0;
 renderAt(sceneTime,dt);requestAnimationFrame(tick);}requestAnimationFrame(tick);
$('toggle').addEventListener('click',()=>{playing=!playing;$('toggle').textContent=playing?'PAUSA':'REPRODUCIR'});
$('restart').addEventListener('click',()=>{sceneTime=0;});$('scrub').addEventListener('input',e=>{sceneTime=+e.target.value;});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
