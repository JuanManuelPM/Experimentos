import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {loadCatalog,normalizeTransform} from './catalog-v2.mjs';

const SOURCE_SHA='3ddcc695adbba9fb918cf31b7c139b3f95b76910';
const OLD_STORAGE='prometeo.forja.scene.v1';
const STORAGE='prometeo.forja.scene.v2';
const SCHEMA='prometeo.forja.scene/v2';
const OLD_SCHEMA='prometeo.forja.scene/v1';
const pendingTemplates=new Map();
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const finite=(v,def=0)=>Number.isFinite(Number(v))?Number(v):def;
const short=(id)=>id.split('/').at(-1).replaceAll('-',' ').replaceAll('_',' ');
const state={catalog:[],byId:new Map(),objects:[],selected:null,sceneName:'Mi primera escena',
  busy:false,working:false,loading:0,failed:0,clips:0,playing:true,mode:'translate',
  snap:false,renderer:null,camera:null,scene:null,world:null,controls:null,transform:null,
  history:[],cursor:-1,request:0,loadedModels:new Map(),webgl:false};
const gltfLoader=new GLTFLoader();
const clock=new THREE.Clock();
const picker=new THREE.Raycaster(),mouse=new THREE.Vector2(),floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
let toastTimer=0;
let idCounter=0;

function toast(text){
  const el=$('toast');el.textContent=text;el.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500);
}
function status(text){$('status').textContent=text}
function setLoading(on,message='',fraction=0){
 $('loading-overlay').hidden=!on;
 $('loading-text').textContent=message;
 $('loading-progress').style.width=Math.round(fraction*100)+'%';
}
function setBusy(flag){state.busy=flag;document.querySelectorAll('.presets button').forEach(b=>b.disabled=flag);
 $('new-scene').disabled=flag;$('clear-scene').disabled=flag;$('save-button').disabled=flag}
function normItem(v){
 if(!v||typeof v.id!=='string'||!state.byId.has(v.id))return null;
 const p=Array.isArray(v.p)?v.p:[0,0,0];
 const importedUid=typeof v.uid==='string'&&/^[a-z0-9-]{1,60}$/i.test(v.uid)?v.uid:null;
 const seq=/^obj-(\d+)$/.exec(importedUid||'');if(seq)idCounter=Math.max(idCounter,Number(seq[1]));
 return {uid:importedUid||'obj-'+(++idCounter),
  id:v.id,p:[clamp(finite(p[0]),-250,250),clamp(finite(p[1]),-80,150),clamp(finite(p[2]),-250,250)],
  ...normalizeTransform(v),
  h:clamp(finite(v.h,2),.02,90),clip:typeof v.clip==='string'?v.clip.slice(0,120):null,clipTime:clamp(finite(v.clipTime),0,3600)};
}
function defaultHeight(asset){
 if(asset.pack==='city-kit-commercial'||asset.pack==='city-kit-suburban')return 6.5;
 if(asset.pack==='car-kit')return 1.6;
 if(asset.pack==='city-kit-roads')return .20;
 if(asset.pack==='nature-kit')return 3.5;
 if(asset.pack==='cube-pets'||asset.pack.includes('characters'))return 1;
 if(asset.pack==='furniture-kit')return 1.6;
 return 1.8;
}
function itemOf(e){
 return {uid:e.uid,id:e.asset.id,sourceCommit:e.asset.sourceCommit,p:e.root.position.toArray().map(x=>Number(x.toFixed(4))),
  r3:e.root.rotation.toArray().slice(0,3).map(x=>Number(x.toFixed(5))),s:e.root.scale.toArray().map(x=>Number((x/e.baseScale).toFixed(5))),h:e.h,clip:e.clipName||null,clipTime:Number((e.mixer&&e.clipName?e.mixer.existingAction(e.clips.find(c=>c.name===e.clipName))?.time||0:0).toFixed(3))};
}
function snapshot(){return {schema:SCHEMA,name:state.sceneName,items:state.objects.map(itemOf)}}
function saveLocal(){
 try{localStorage.setItem(STORAGE,JSON.stringify(snapshot()));return true}
 catch(e){console.warn('FORJA SAVE',e);return false}
}
function historyPush(){
 if(state.busy)return;
 const current=JSON.stringify(snapshot());
 if(state.cursor>=0&&JSON.stringify(state.history[state.cursor])===current)return;
 state.history=state.history.slice(0,state.cursor+1);
 state.history.push(JSON.parse(current));
 if(state.history.length>50)state.history.shift();
 state.cursor=state.history.length-1;
 saveLocal();historyButtons();
}
function historyButtons(){
 $('undo').disabled=state.busy||state.cursor<=0;
 $('redo').disabled=state.busy||state.cursor>=state.history.length-1;
}
function metrics(){
 const clips=state.objects.reduce((n,e)=>n+(e.clips?.length||0),0);
 $('world-count').textContent=state.objects.length+' OBJETOS';
 $('clip-count').textContent=clips+' CLIPS';
 $('objects-label').textContent=state.objects.length+' INSTANCIAS';
 $('project-badge').textContent=state.sceneName.toUpperCase();
 $('empty-state').hidden=state.objects.length>0;
 $('play-animations').setAttribute('aria-pressed',String(state.playing));
 $('play-animations').firstChild.textContent=state.playing?'Ⅱ ':'▶ ';
}
function init3D(){
 const canvas=$('canvas');
 try{
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'default'});
  if(!gl)throw Error('WEBGL2 NO DISPONIBLE');
  state.renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,powerPreference:'default'});
  state.renderer.outputColorSpace=THREE.SRGBColorSpace;
  state.renderer.toneMapping=THREE.ACESFilmicToneMapping;
  state.renderer.toneMappingExposure=1.35;
  state.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.45));
  state.scene=new THREE.Scene();
  state.scene.background=new THREE.Color(0x28342e);
  state.scene.fog=new THREE.Fog(0x28342e,30,115);
  state.camera=new THREE.PerspectiveCamera(47,1,.02,240);
  state.camera.position.set(12,9,17);
  const world=new THREE.Group();world.name='FORJA_CONTENT';state.scene.add(world);state.world=world;
  state.controls=new OrbitControls(state.camera,canvas);
  state.controls.enableDamping=true;state.controls.dampingFactor=.07;
  state.controls.maxPolarAngle=Math.PI*.495;
  state.controls.minDistance=.8;state.controls.maxDistance=110;
  state.controls.target.set(0,1,0);
  state.scene.add(new THREE.HemisphereLight(0xe5edeb,0x5b6052,2.1));
  const key=new THREE.DirectionalLight(0xf6d7a8,2.6);key.position.set(-12,20,9);state.scene.add(key);
  const rim=new THREE.DirectionalLight(0x9dcbbf,1.4);rim.position.set(13,9,-13);state.scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x243c30,roughness:1}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.045;floor.name='EDITOR_FLOOR';state.scene.add(floor);
  const grid=new THREE.GridHelper(100,100,0x668073,0x3b5948);
  grid.position.y=-.035;grid.material.transparent=true;grid.material.opacity=.25;state.scene.add(grid);
  state.transform=new TransformControls(state.camera,canvas);
  state.transform.setMode('translate');
  state.scene.add(state.transform.getHelper());
  state.transform.addEventListener('dragging-changed',event=>{state.controls.enabled=!event.value});
  state.transform.addEventListener('objectChange',()=>{updateInspector()});
  state.transform.addEventListener('mouseUp',()=>{historyPush()});
  state.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();state.webgl=false;status('CONTEXTO WEBGL PERDIDO')});
  state.renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
  window.addEventListener('resize',resize);
  state.webgl=true;resize();
  $('render-status').textContent='GPU · WEBGL2';
  let pointerDown=null;
  canvas.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY}});
  canvas.addEventListener('pointerup',e=>{
   if(!pointerDown||state.transform.dragging)return;
   const moved=Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y);pointerDown=null;
   if(moved>6)return;
   const hits=ray(e.clientX,e.clientY).intersectObjects(state.world.children,true);
   const uid=hits.map(h=>{let p=h.object;while(p&&p!==state.world){if(p.userData.instanceUid)return p.userData.instanceUid;p=p.parent}return null}).find(Boolean);
   if(uid)select(uid);
  });
  canvas.addEventListener('dragover',e=>e.preventDefault());
  canvas.addEventListener('drop',async e=>{
   e.preventDefault();
   if(state.busy)return;
   const id=e.dataTransfer?.getData('text/forja-asset-id');
   const asset=state.byId.get(id);if(!asset)return;
   const point=new THREE.Vector3();
   ray(e.clientX,e.clientY).ray.intersectPlane(floorPlane,point);
   await addAsset(asset,{p:[clamp(point.x,-60,60),0,clamp(point.z,-60,60)]});
  });
  function frame(){
   requestAnimationFrame(frame);
   if(!state.webgl)return;
   const dt=Math.min(.08,clock.getDelta());
   if(state.playing)for(const o of state.objects)o.mixer?.update(dt);
   const active=state.objects.find(o=>o.uid===state.selected);
   if(active?.mixer&&!$('clip-editor').hidden&&state.playing){const clip=active.clips.find(c=>c.name===active.clipName);if(clip?.duration>0){const value=active.mixer.time%clip.duration;$('clip-time').value=String(value);$('clip-time-label').textContent=value.toFixed(2)+' s'}}
   state.controls.update();
   state.renderer.render(state.scene,state.camera);
  }
  frame();metrics();
 }catch(e){state.webgl=false;status('SIN GPU · CATÁLOGO DISPONIBLE');$('render-status').textContent='GPU · NO DISPONIBLE';toast(e.message)}
}
function resize(){
 if(!state.renderer)return;const s=$('stage');
 const w=Math.max(200,s.clientWidth),h=Math.max(200,s.clientHeight);
 state.renderer.setSize(w,h,false);state.camera.aspect=w/h;state.camera.updateProjectionMatrix();
}
function ray(x,y){
 const b=$('canvas').getBoundingClientRect();
 mouse.set(((x-b.left)/b.width)*2-1,-((y-b.top)/b.height)*2+1);
 picker.setFromCamera(mouse,state.camera);return picker;
}
async function modelTemplate(asset){
 if(state.loadedModels.has(asset.id))return state.loadedModels.get(asset.id);
 const uri=asset.url;
 const promise=gltfLoader.loadAsync(uri).catch(e=>{state.loadedModels.delete(asset.id);throw e});
 state.loadedModels.set(asset.id,promise);return promise;
}
async function addAsset(asset,opts={},silent=false){
 if(!asset){toast('MODELO NO DISPONIBLE');return null}
 const generation=state.request;if(state.objects.length>=150){toast('LÍMITE DE 150 INSTANCIAS');return null}
 if(!state.webgl){toast('NO HAY WEBGL2: ABRÍ EN NAVEGADOR COMPATIBLE');return null}
 if(state.busy&&!silent)return null;
 const h=clamp(finite(opts.h,defaultHeight(asset)),.02,90);
 status('CARGANDO '+short(asset.id).toUpperCase());
 try{
  pendingTemplates.set(asset.id,(pendingTemplates.get(asset.id)||0)+1);
  const data=await modelTemplate(asset);
  if(generation!==state.request)return null;
  if(state.objects.length>=150)throw Error('LÍMITE DE 150 INSTANCIAS');
  const model=SkeletonUtils.clone(data.scene);
  const box=new THREE.Box3().setFromObject(model),dims=new THREE.Vector3(),center=new THREE.Vector3();
  box.getSize(dims);box.getCenter(center);
  if(!Number.isFinite(dims.y)||dims.y<.00001)throw Error('GEOMETRÍA SIN ALTURA');
  const root=new THREE.Group();
  const uid=opts.uid||'obj-'+(++idCounter);
  root.userData.instanceUid=uid;root.userData.assetId=asset.id;root.name='SCENE:'+asset.id;
  model.position.set(-center.x,-box.min.y,-center.z);
  root.add(model);const baseScale=h/dims.y;
  const p=opts.p||[0,0,0];
  root.position.set(finite(p[0]),finite(p[1]),finite(p[2]));
  root.rotation.set(...normalizeTransform(opts).r3);
  const components=normalizeTransform(opts).s;
  root.scale.set(...components.map(x=>baseScale*clamp(finite(x,1),.05,20)));
  const mixer=data.animations.length?new THREE.AnimationMixer(model):null;
  const activeClip=mixer?(data.animations.find(x=>x.name===opts.clip)||data.animations.find(x=>/idle|walk|run/i.test(x.name))||data.animations[0]):null;
  if(mixer){mixer.clipAction(activeClip).play();mixer.setTime(clamp(finite(opts.clipTime),0,activeClip.duration))}
  const entry={uid,asset,h,root,baseScale,mixer,clips:data.animations,clipName:activeClip?.name||null};
  state.world.add(root);state.objects.push(entry);
  if(!silent){select(uid);historyPush();status('MODELO AÑADIDO · '+short(asset.id));toast('AÑADIDO: '+short(asset.id))}
  metrics();renderObjects();return entry;
 }catch(e){state.failed++;status('FALLÓ LA CARGA DE '+short(asset.id));toast('No se pudo cargar '+short(asset.id));console.warn('FORJA MODEL',asset.id,e);return null}
 finally{unpin(asset.id);trimTemplates()}
}
function unpin(id){const n=(pendingTemplates.get(id)||1)-1;if(n)pendingTemplates.set(id,n);else pendingTemplates.delete(id)}
function trimTemplates(){
 const used=new Set(state.objects.map(e=>e.asset.id));
 for(const [id,promise] of state.loadedModels){if(state.loadedModels.size<=32)break;if(used.has(id)||pendingTemplates.has(id))continue;state.loadedModels.delete(id);promise.then(data=>{const resources=new Set();data.scene.traverse(x=>{if(x.geometry)resources.add(x.geometry);for(const m of Array.isArray(x.material)?x.material:[x.material])if(m){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v)}});resources.forEach(x=>x.dispose?.())}).catch(()=>{});}
}
function releaseEntry(e){e.mixer?.stopAllAction();e.mixer?.uncacheRoot(e.root.children[0]);e.root.traverse(x=>{if(x.isSkinnedMesh)x.skeleton?.dispose()});}
function select(uid){
 const e=state.objects.find(x=>x.uid===uid)||null;
 state.selected=e?.uid||null;
 state.transform?.detach();
 if(e)state.transform?.attach(e.root);
 updateInspector();renderObjects();
 if(e&&window.matchMedia('(max-width:800px)').matches)$('inspector-panel').classList.add('open');
}
function updateInspector(){
 const e=state.objects.find(x=>x.uid===state.selected);
 const inputs=['pos-x','pos-y','pos-z','rot','scale'];
 $('selected-title').textContent=e?short(e.asset.id).toUpperCase():'NINGUNO';
 $('selected-info').textContent=e?e.asset.packName+' · '+e.clips.length+' clips · CC0':'Tocá un objeto para editarlo';
 const values=e?[e.root.position.x,e.root.position.y,e.root.position.z,THREE.MathUtils.radToDeg(e.root.rotation.y),e.root.scale.x/e.baseScale]:[];
 inputs.forEach((id,i)=>{$(id).disabled=!e;$(id).value=e?String(Number(values[i].toFixed(3))):''});
 for(const id of ['delete','duplicate','focus'])$(id).disabled=!e;
 updateClipInspector(e);
}
function updateClipInspector(e){
 const panel=$('clip-editor');if(!panel)return;panel.hidden=!e||!e.clips?.length;if(panel.hidden)return;
 const sel=$('clip-select');sel.replaceChildren();
 for(const c of e.clips){const opt=document.createElement('option');opt.value=c.name;opt.textContent=c.name;sel.append(opt)}
 sel.value=e.clipName||e.clips[0].name;
 const clip=e.clips.find(c=>c.name===sel.value)||e.clips[0];
 $('clip-time').max=String(clip.duration);$('clip-time').value=String(Math.min(clip.duration,e.mixer?.time||0));
 $('clip-duration').textContent=clip.duration.toFixed(2)+' s';$('clip-time-label').textContent=(e.mixer?.time||0).toFixed(2)+' s';
}
function selectClip(name){
 const e=state.objects.find(x=>x.uid===state.selected);if(!e?.mixer)return;
 const clip=e.clips.find(c=>c.name===name);if(!clip)return;
 e.mixer.stopAllAction();e.mixer.time=0;e.clipName=clip.name;e.mixer.clipAction(clip).reset().play();
 updateClipInspector(e);historyPush();
}
function scrubClip(value){
 const e=state.objects.find(x=>x.uid===state.selected);if(!e?.mixer)return;
 const clip=e.clips.find(c=>c.name===e.clipName);if(!clip)return;
 state.playing=false;e.mixer.setTime(clamp(finite(value),0,clip.duration));
 $('clip-time-label').textContent=e.mixer.time.toFixed(2)+' s';metrics();
}
function updateProperty(changed){
 const e=state.objects.find(x=>x.uid===state.selected);if(!e)return;
 const old=[e.root.position.x,e.root.position.y,e.root.position.z,THREE.MathUtils.radToDeg(e.root.rotation.y),e.root.scale.x/e.baseScale];
 const ids=['pos-x','pos-y','pos-z','rot','scale'];
 const a=ids.map((id,i)=>finite($(id).value,old[i]));
 e.root.position.set(clamp(a[0],-250,250),clamp(a[1],-80,150),clamp(a[2],-250,250));
 if(changed==='rot')e.root.rotation.y=THREE.MathUtils.degToRad(clamp(a[3],-1440,1440));
 if(changed==='scale')e.root.scale.setScalar(e.baseScale*clamp(a[4],.05,20));
 historyPush();updateInspector();
}
function removeSelected(){
 if(!state.selected)return;const at=state.objects.findIndex(x=>x.uid===state.selected);
 if(at<0)return;state.transform.detach();const [e]=state.objects.splice(at,1);
 state.world.remove(e.root);releaseEntry(e);trimTemplates();state.selected=null;
 renderObjects();updateInspector();metrics();historyPush();
}
async function duplicateSelected(){
 const e=state.objects.find(x=>x.uid===state.selected);if(!e||state.busy)return;
 const i=itemOf(e);i.uid='obj-'+(++idCounter);i.p[0]+=1.1;i.p[2]+=1.1;
 await addAsset(e.asset,i);
}
function renderObjects(){
 const f=document.createDocumentFragment();
 state.objects.forEach((e,i)=>{
  const b=document.createElement('button');b.type='button';b.className='object-item'+(e.uid===state.selected?' active':'');
  const symbol=document.createElement('span');symbol.textContent=String(i+1).padStart(2,'0');
  const div=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('small');
  strong.textContent=short(e.asset.id);small.textContent=e.asset.packName+' · '+e.clips.length+' clips';
  div.append(strong,small);b.append(symbol,div);b.addEventListener('click',()=>select(e.uid));f.append(b);
 });
 $('object-list').replaceChildren(f);metrics();
}
function focus(){
 const e=state.objects.find(x=>x.uid===state.selected);
 if(!e)return;const bounds=new THREE.Box3().setFromObject(e.root);
 const target=new THREE.Vector3();bounds.getCenter(target);
 const size=new THREE.Vector3();bounds.getSize(size);
 const d=clamp(Math.max(size.x,size.y,size.z)*2.2,3,85);
 state.controls.target.copy(target);state.camera.position.copy(target.clone().add(new THREE.Vector3(d*.72,d*.52,d)));
 state.controls.update();
}
function resetCamera(){state.controls.target.set(0,1,0);state.camera.position.set(12,9,17);state.controls.update()}
function setMode(mode){
 if(!['translate','rotate','scale'].includes(mode))return;
 state.mode=mode;state.transform?.setMode(mode);
 document.querySelectorAll('[data-mode]').forEach(el=>el.classList.toggle('active',el.dataset.mode===mode));
}
function snap(){
 state.snap=!state.snap;
 state.transform?.setTranslationSnap(state.snap ? 0.5 : null);
 state.transform?.setRotationSnap(state.snap ? THREE.MathUtils.degToRad(15) : null);
 state.transform?.setScaleSnap(state.snap ? 0.1 : null);
 $('snap').setAttribute('aria-pressed',String(state.snap));
 $('snap').classList.toggle('active',state.snap);
}
function validateProject(input){
 if(!input||!Array.isArray(input.items)||input.items.length>150)throw Error('PROYECTO INVÁLIDO O DEMASIADO GRANDE');
 if(![SCHEMA,OLD_SCHEMA].includes(input.schema))throw Error('ESQUEMA NO COMPATIBLE');
 const seen=new Set();
 const out=input.items.map(v=>{
  const n=normItem(v);if(!n)throw Error('MODELO NO EXISTE EN EL CATÁLOGO: '+String(v?.id));
  if(v.sourceCommit&&v.sourceCommit!==state.byId.get(v.id).sourceCommit)throw Error('VERSIÓN DE MODELO NO DISPONIBLE: '+v.id);
  if(seen.has(n.uid))n.uid='obj-'+(++idCounter);
  seen.add(n.uid);return n;
 });
 return {schema:SCHEMA,name:String(input.name||'Escena importada').slice(0,64),items:out};
}
async function replaceScene(data,{remember=true}={}){
 if(state.busy)return false;
 if(!state.webgl){status('CATÁLOGO 2D · GPU NO DISPONIBLE');toast('ESTE NAVEGADOR NO PUEDE EDITAR 3D SIN WEBGL2');return false;}
 let safe;
 try{safe=validateProject(data)}catch(e){toast(e.message);return false}
 state.request++;setBusy(true);setLoading(true,'PREPARANDO ESCENA',0);
 const oldEntries=state.objects.slice();
 const oldName=state.sceneName;
 try{
  state.transform?.detach();state.selected=null;
  for(const e of state.objects){state.world.remove(e.root);pendingTemplates.set(e.asset.id,(pendingTemplates.get(e.asset.id)||0)+1)}
  state.objects=[];state.sceneName=safe.name;$('scene-name').value=safe.name;
  renderObjects();updateInspector();
  let done=0;
  const queue=safe.items.slice();
  const tasks=Array.from({length:3},async()=>{
   while(queue.length){
    const item=queue.shift(),asset=state.byId.get(item.id);
    await addAsset(asset,item,true);
    done++;setLoading(true,'CARGANDO '+done+' / '+safe.items.length+' MODELOS',done/Math.max(1,safe.items.length));
   }
  });await Promise.all(tasks);
  const loaded=state.objects.length;
  if(loaded!==safe.items.length)throw Error('MODELOS FALTANTES: '+(safe.items.length-loaded));
  oldEntries.forEach(releaseEntry);
  metrics();renderObjects();resetCamera();
  if(remember){state.busy=false;historyPush();state.busy=true}else saveLocal();
  toast('ESCENA LISTA: '+loaded+' / '+safe.items.length+' OBJETOS');
  if(loaded!==safe.items.length)status('ESCENA PARCIAL · '+(safe.items.length-loaded)+' FALTANTES');
  else status('ESCENA EDITABLE · '+loaded+' OBJETOS');
  return true;
 }catch(e){console.error(e);toast('ERROR AL ABRIR ESCENA');
  for(const prior of state.objects){state.world.remove(prior.root);releaseEntry(prior)}
  state.objects=oldEntries;state.selected=null;state.sceneName=oldName;$('scene-name').value=oldName;
  for(const entry of oldEntries)state.world.add(entry.root);
  status('ESCENA ANTERIOR CONSERVADA · '+e.message);
  metrics();renderObjects();updateInspector();return false;
 }finally{oldEntries.forEach(e=>unpin(e.asset.id));trimTemplates();setBusy(false);setLoading(false);historyButtons()}
}
const PRESETS={
 barrio:{name:'El barrio que no duerme',items:[
  ['city-kit-commercial/building-a',-9,0,-12,7,0],['city-kit-commercial/building-h',9,0,-13,7,Math.PI],
  ['city-kit-suburban/building-type-a',-10,0,3,5.5,0],['city-kit-roads/road-straight',0,0,-4,.18,0],
  ['car-kit/truck',-2,0,2,1.7,0],['car-kit/hatchback-sports',2,0,-9,1.35,Math.PI],
  ['nature-kit/tree-oak',-7,0,13,4.5,0],['nature-kit/tree-oak',8,0,12,4.0,1],
  ['cube-pets/animal-cat',2,0,8,.72,1]
 ]},
 interior:{name:'Interior 03:17',items:[
  ['furniture-kit/loungesofa',-2,0,-1,1.4,0],['furniture-kit/televisionvintage',2,0,-2,1.2,Math.PI],
  ['furniture-kit/tablecoffee',0,0,0,.7,0],['furniture-kit/lamproundfloor',-4,0,-3,2,0],
  ['furniture-kit/bookcaseopen',-4,0,-5,2.7,0],['furniture-kit/pottedplant',3,0,2,1.2,0],
  ['cube-pets/animal-cat',-1,0,3,.95,1]
 ]},
 bosque:{name:'Bosque nocturno',items:[
  ['nature-kit/tree-oak',-9,0,-7,5,0],['nature-kit/tree-oak-dark',8,0,-12,5.4,1],
  ['nature-kit/tree-oak-fall',-8,0,8,4.3,0],['nature-kit/tree-palm',7,0,9,4.5,.2],
  ['nature-kit/rock-larged',-1,0,3,1.2,0],['cube-pets/animal-fox',1,0,-2,1.15,1],
  ['cube-pets/animal-dog',4,0,5,.95,0]
 ]}
};
function makePreset(key){
 const p=PRESETS[key];if(!p)return;
 const items=p.items.map(([id,x,y,z,h,r],i)=>({uid:'preset-'+i+'-'+key,id,p:[x,y,z],h,r,s:1}));
 return {schema:SCHEMA,name:p.name,items};
}
function download(content,name,mime){
 const bytes=content instanceof Blob?content:new Blob([content],{type:mime});
 const url=URL.createObjectURL(bytes),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),12000);
}
function exportJSON(){
 const out={...snapshot(),sources:[...new Map(state.objects.map(e=>[e.asset.source,{source:e.asset.source,commit:e.asset.sourceCommit,license:e.asset.license}])).values()],savedAt:new Date().toISOString()};
 download(JSON.stringify(out,null,2),'prometeo-forja-'+Date.now()+'.json','application/json');toast('PROYECTO JSON GUARDADO');
}
async function exportGLB(){
 if(!state.webgl||state.busy||!state.objects.length){toast('NO HAY ESCENA PARA EXPORTAR');return}
 const b=$('export-glb');b.disabled=true;b.textContent='EXPORTANDO...';
 try{
  const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
  const exporter=new GLTFExporter();
  const result=await exporter.parseAsync(state.world,{binary:true,trs:true,onlyVisible:true,maxTextureSize:1024});
  if(!(result instanceof ArrayBuffer)||result.byteLength<100)throw Error('GLB VACÍO');
  download(new Blob([result],{type:'model/gltf-binary'}),'prometeo-forja-escena.glb','model/gltf-binary');
  toast('GLB EXPORTADO · GEOMETRÍA Y MATERIALES (SIN TIMELINE)');
 }catch(e){console.error(e);toast('ERROR DE EXPORTACIÓN GLB: '+e.message)}
 finally{b.disabled=false;b.textContent='↓ EXPORTAR GLB'}
}
let pageSize=12;
function renderLibrary(){
 const q=$('search').value.toLowerCase().trim();
 const pack=$('pack').value;
 const words=q.split(/\s+/).filter(Boolean);
 const matches=state.catalog.filter(m=>(!pack||m.pack===pack)&&words.every(t=>(m.name+' '+m.packName+' '+m.id).toLowerCase().includes(t)));
 $('result-count').textContent=matches.length.toLocaleString('es-AR')+' RESULTADOS';
 const f=document.createDocumentFragment();
 for(const m of matches.slice(0,pageSize)){
  const b=document.createElement('button');b.type='button';b.className='asset';
  b.draggable=true;b.title='Agregar '+m.name+' al mundo';b.dataset.assetId=m.id;
  const img=document.createElement('img');img.loading='lazy';img.alt='';if(m.thumbUrl)img.src=m.thumbUrl;else{img.alt='Sin miniatura';img.style.background='#394f43'}
  img.onerror=()=>{img.onerror=null;img.removeAttribute('src');img.style.background='#394f43'};
  const t=document.createElement('strong');t.textContent=m.name;
  const meta=document.createElement('small');meta.textContent=m.packName+' · '+m.format.toUpperCase()+(m.availability==='partial'?' · PARCIAL':'');
  const plus=document.createElement('span');plus.className='add-symbol';plus.textContent='+';
  b.append(img,t,meta,plus);
  b.addEventListener('click',async()=>{await addAsset(m,{p:[(state.objects.length%5-2)*1.5,0,3]});
   if(window.matchMedia('(max-width:800px)').matches)$('library-panel').classList.remove('open')});
  b.addEventListener('dragstart',e=>e.dataTransfer.setData('text/forja-asset-id',m.id));
  f.append(b);
 }
 $('asset-list').replaceChildren(f);
 $('more-assets').disabled=matches.length<=pageSize;
 $('more-assets').textContent=matches.length>pageSize?'VER MÁS ('+Math.min(pageSize,matches.length)+' / '+matches.length+')':'TODOS LOS RESULTADOS';
}
async function initCatalog(){
 status('RECUPERANDO CATÁLOGOS');init3D();
 try{
  const data=await loadCatalog();state.catalog=data.models;state.byId=new Map(state.catalog.map(m=>[m.id,m]));
  for(const [alias,id] of data.aliases)state.byId.set(alias,state.byId.get(id));
  const packs=new Map();for(const m of state.catalog){const p=packs.get(m.pack)||{name:m.packName,n:0};p.n++;packs.set(m.pack,p)}
  for(const [id,p] of packs){const o=document.createElement('option');o.value=id;o.textContent=p.name+' ('+p.n+')';$('pack').append(o)}
  $('model-total').textContent=state.catalog.length.toLocaleString('es-AR')+' REFERENCIAS · '+packs.size+' COLECCIONES';
  $('catalog-state').textContent='Atlas: '+data.sources.atlas+' · Quaternius: '+data.sources.quaternius+' · '+data.stats.duplicates+' GLB idénticos · '+data.stats.unsupported+' formatos no compatibles';
  state.catalogInfo=data;renderLibrary();
  status(state.catalog.length?(state.webgl?'CATÁLOGOS · '+state.catalog.length+' REFERENCIAS':'CATÁLOGO 2D · WEBGL2 NO DISPONIBLE'):'CATÁLOGO NO DISPONIBLE · REINTENTÁ RECARGANDO');
  let prev=null;try{prev=JSON.parse(localStorage.getItem(STORAGE)||localStorage.getItem(OLD_STORAGE)||'null')}catch{}
  if([SCHEMA,OLD_SCHEMA].includes(prev?.schema)&&prev.items?.length){
   const ok=await replaceScene(prev,{remember:false});if(!ok)status('AUTO-GUARDADO CONSERVADO · FALTAN RECURSOS');
  }
  state.history=[snapshot()];state.cursor=0;historyButtons();
 }catch(e){status('FALLÓ EL CATÁLOGO · '+e.message);toast('NO PUDO LEER EL CATÁLOGO');console.error(e)}
}
function wire(){
 $('mixed-preset').addEventListener('click',async()=>{try{const res=await fetch('./scene-mixed.json');if(!res.ok)throw Error('HTTP '+res.status);await replaceScene(await res.json())}catch(e){toast('ERROR EJEMPLO · '+e.message)}});
 $('search').addEventListener('input',()=>{pageSize=12;renderLibrary()});
 $('pack').addEventListener('change',()=>{pageSize=12;renderLibrary()});
 $('more-assets').addEventListener('click',()=>{pageSize+=12;renderLibrary()});
 document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{if(state.busy)return;replaceScene(makePreset(b.dataset.preset))}));
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
 $('snap').addEventListener('click',snap);
 $('camera-reset').addEventListener('click',resetCamera);
 $('play-animations').addEventListener('click',()=>{state.playing=!state.playing;metrics()});
 $('clip-select').addEventListener('change',e=>selectClip(e.target.value));
 $('clip-time').addEventListener('input',e=>scrubClip(e.target.value));
 $('clip-time').addEventListener('change',historyPush);
 $('scene-name').addEventListener('change',e=>{state.sceneName=(e.target.value.trim()||'Escena sin título').slice(0,64);historyPush();metrics()});
 for(const id of ['pos-x','pos-y','pos-z','rot','scale'])$(id).addEventListener('change',()=>updateProperty(id));
 $('undo').addEventListener('click',async()=>{if(state.busy||state.cursor<=0)return;const next=state.cursor-1;if(await replaceScene(state.history[next],{remember:false}))state.cursor=next;historyButtons()});
 $('redo').addEventListener('click',async()=>{if(state.busy||state.cursor>=state.history.length-1)return;const next=state.cursor+1;if(await replaceScene(state.history[next],{remember:false}))state.cursor=next;historyButtons()});
 $('delete').addEventListener('click',removeSelected);
 $('duplicate').addEventListener('click',duplicateSelected);
 $('focus').addEventListener('click',focus);
 $('save-button').addEventListener('click',exportJSON);
 $('import-button').addEventListener('click',()=>$('import-file').click());
 $('import-file').addEventListener('change',async e=>{
  const file=e.target.files?.[0];e.target.value='';if(!file||file.size>2e6){toast('ARCHIVO NO VÁLIDO O MUY GRANDE');return}
  try{await replaceScene(JSON.parse(await file.text()))}catch(err){toast('JSON INVÁLIDO: '+err.message)}
 });
 $('export-glb').addEventListener('click',exportGLB);
 $('new-scene').addEventListener('click',()=>{if(state.busy)return;replaceScene({schema:SCHEMA,name:'Escena sin título',items:[]})});
 $('clear-scene').addEventListener('click',()=>{if(state.busy)return;replaceScene({schema:SCHEMA,name:state.sceneName,items:[]})});
 $('reset-scene').addEventListener('click',()=>{
  try{localStorage.removeItem(STORAGE);localStorage.setItem(STORAGE,JSON.stringify({schema:SCHEMA,name:'Escena sin título',items:[]}));toast('AUTO-GUARDADO V2 REINICIADO; V1 PRESERVADO')}catch{toast('NO SE PUDO BORRAR')}
 });
 $('toggle-library').addEventListener('click',()=>$('library-panel').classList.toggle('open'));
 $('close-library').addEventListener('click',()=>$('library-panel').classList.remove('open'));
 $('toggle-inspector').addEventListener('click',()=>$('inspector-panel').classList.toggle('open'));
 $('close-inspector').addEventListener('click',()=>$('inspector-panel').classList.remove('open'));
 document.addEventListener('keydown',e=>{
  if(/input|textarea|select/i.test(document.activeElement?.tagName||''))return;
  if((e.ctrlKey||e.metaKey)&&(e.code==='KeyY'||e.code==='KeyZ'&&e.shiftKey)){e.preventDefault();$('redo').click();return}
  if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'){e.preventDefault();$('undo').click();return}
  if(e.code==='KeyW')setMode('translate');
  if(e.code==='KeyE')setMode('rotate');
  if(e.code==='KeyR')setMode('scale');
  if(e.code==='Delete'||e.code==='Backspace')removeSelected();
  if(e.code==='Escape'){state.transform?.detach();select(null)}
 });
}
wire();initCatalog();
window.__FORJA__={
 diagnostic:()=>({schema:'prometeo.forja.diagnostic/v1',webgl2:state.webgl,catalog:state.catalog.length,loadedTemplates:state.loadedModels.size,instances:state.objects.length,clips:state.objects.reduce((n,e)=>n+e.clips.length,0),failed:state.failed,sourceCommit:SOURCE_SHA,catalogSources:state.catalogInfo?.sources,rendererMemory:state.renderer?.info.memory,renderCalls:state.renderer?.info.render.calls,saved:!!localStorage.getItem(STORAGE),note:'No sustituye validación visual en navegador con GPU'}),
 snapshot,loadPreset:async name=>replaceScene(makePreset(name)),add:async id=>addAsset(state.byId.get(id)),export:exportJSON
};
