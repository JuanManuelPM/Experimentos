import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {resolveClip} from './clip-resolver.mjs';
import {sceneStatusText} from './scene-status.mjs';

const status=document.getElementById('status');
const count=document.getElementById('count');
const root=document.getElementById('stage');
const state={loaded:0,total:4,failed:[],clips:[],mixer:null,action:null,paused:false,requested:'Idle',clipError:null,activeClipName:null,settled:false};
let renderer;
try {
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  root.appendChild(renderer.domElement);
} catch(error) {
  status.textContent='No se pudo iniciar WebGL: '+String(error.message||error);
  throw error;
}
const scene=new THREE.Scene();
scene.background=new THREE.Color('#182933');
scene.fog=new THREE.Fog('#182933',15,40);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,100);
camera.position.set(7,5.5,12);
const orbit=new OrbitControls(camera,renderer.domElement);
orbit.target.set(0,1,0);orbit.enableDamping=true;orbit.minDistance=3;orbit.maxDistance=26;
orbit.maxPolarAngle=Math.PI*.48;orbit.update();
scene.add(new THREE.HemisphereLight('#d3e9eb','#4b504c',2.4));
const light=new THREE.DirectionalLight('#f9dea8',3);light.position.set(-6,12,6);scene.add(light);
const accent=new THREE.PointLight('#74b5c6',16,26);accent.position.set(8,5,-5);scene.add(accent);
const mat=new THREE.MeshStandardMaterial({color:'#344448',roughness:1});
const ground=new THREE.Mesh(new THREE.CircleGeometry(10,96),mat);
ground.rotation.x=-Math.PI/2;ground.position.y=-.025;scene.add(ground);
const outline=new THREE.Mesh(new THREE.RingGeometry(9.5,9.57,96),new THREE.MeshBasicMaterial({color:'#a18a69',side:THREE.DoubleSide}));
outline.rotation.x=-Math.PI/2;outline.position.y=.02;scene.add(outline);
const glb=new GLTFLoader();
function positionModel(model,x,z,height,rotation=0){
  model.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().setFromObject(model);
  if(bounds.isEmpty())throw Error('ASSET_EMPTY');
  const scale=height/Math.max(bounds.getSize(new THREE.Vector3()).y,.001);
  model.scale.multiplyScalar(scale);
  model.updateWorldMatrix(true,true);
  const after=new THREE.Box3().setFromObject(model);
  const center=after.getCenter(new THREE.Vector3());
  model.position.add(new THREE.Vector3(x-center.x,-after.min.y,z-center.z));
  model.rotation.y+=rotation;scene.add(model);return model;
}
function updateStatus(){status.textContent=sceneStatusText(state)}
function report(name,error){
  if(error)state.failed.push(name+' '+String(error.message||error));
  else state.loaded++;
  count.textContent=state.loaded+' / '+state.total+' originales';
  updateStatus();
  document.body.dataset.loaded=String(state.loaded);
}
function setClip(name){
  state.requested=name;
  for(const btn of document.querySelectorAll('[data-anim]'))btn.setAttribute('aria-pressed',String(btn.dataset.anim===name));
  if(!state.mixer)return;
  let clip;
  try{clip=resolveClip(state.clips,name)}catch(e){state.clipError='Error de animación: '+e.message;updateStatus();return}
  if(!clip){state.clipError='Clip '+name+' no encontrado';updateStatus();return}
  state.clipError=null;state.activeClipName=clip.name;
  if(state.action)state.action.fadeOut(.24);
  state.action=state.mixer.clipAction(clip);state.action.reset().fadeIn(.24).play();
  updateStatus();
}
async function loadFox(){
  try {
    const f=await glb.loadAsync('./assets/Fox.glb');
    const hasSkin=[];f.scene.traverse(o=>{if(o.isSkinnedMesh)hasSkin.push(o)});
    if(!hasSkin.length||!f.animations?.length)throw Error('FOX_NO_SKELETAL_CLIPS');
    positionModel(f.scene,0,0,2.8,Math.PI*.12);
    state.clips=f.animations;state.mixer=new THREE.AnimationMixer(f.scene);
    report('Fox.glb');setClip(state.requested);
  }catch(e){report('Fox.glb',e)}
}
async function loadGlb(name,path,x,z,height,angle=0){
  try {const f=await glb.loadAsync(path);positionModel(f.scene,x,z,height,angle);report(name)}
  catch(e){report(name,e)}
}
async function loadObj(){
  try{
    const materials=await new MTLLoader().setResourcePath('./assets/').loadAsync('./assets/anvil.mtl');
    materials.preload();
    const objLoader=new OBJLoader();objLoader.setMaterials(materials);
    const model=await objLoader.loadAsync('./assets/anvil.obj');
    positionModel(model,3.7,1.7,1.5,-.15);report('Anvil OBJ/MTL');
  }catch(e){report('Anvil OBJ/MTL',e)}
}
document.querySelectorAll('[data-anim]').forEach(btn=>btn.onclick=()=>setClip(btn.dataset.anim));
document.getElementById('reset').onclick=()=>{camera.position.set(7,5.5,12);orbit.target.set(0,1,0);orbit.update()};
document.getElementById('pause').onclick=e=>{
  state.paused=!state.paused;
  e.currentTarget.setAttribute('aria-pressed',String(state.paused));
  e.currentTarget.textContent=state.paused?'Reanudar':'Pausar';
};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
if(matchMedia('(prefers-reduced-motion: reduce)').matches){state.paused=true;document.getElementById('pause').setAttribute('aria-pressed','true');document.getElementById('pause').textContent='Reanudar';}
const clock=new THREE.Clock();
function tick(){
  requestAnimationFrame(tick);
  const dt=Math.min(clock.getDelta(),.05);
  if(state.mixer&&!state.paused)state.mixer.update(dt);
  orbit.update();renderer.render(scene,camera);
}
tick();
Promise.all([loadFox(),loadGlb('Oak.glb','./assets/Oak.glb',-4,-1.5,4.5,.4),loadGlb('Chair.glb','./assets/Chair.glb',3.3,-2,2,Math.PI),loadObj()]).then(()=>{
  document.body.dataset.settled='true';
  state.settled=true;
  updateStatus();
});
