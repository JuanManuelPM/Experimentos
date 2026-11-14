import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const SOURCE_SHA='3ddcc695adbba9fb918cf31b7c139b3f95b76910';
const ROOT='https://raw.githubusercontent.com/Hidencod/tge-assets/'+SOURCE_SHA+'/';
const STORAGE='prometeo.forja.scene.v1';
const SCHEMA='prometeo.forja.scene/v1';
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
  r:clamp(finite(v.r),-Math.PI*8,Math.PI*8),s:(Array.isArray(v.s)?v.s:[v.s,v.s,v.s]).map(x=>clamp(finite(x,1),.05,20)),
  h:clamp(finite(v.h,2),.02,90)};
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
 return {uid:e.uid,id:e.asset.id,p:e.root.position.toArray().map(x=>Number(x.toFixed(4))),
  r:Number(e.root.rotation.y.toFixed(5)),s:e.root.scale.toArray().map(x=>Number((x/e.baseScale).toFixed(5))),h:e.h};
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
  grid.visible=!document.documentElement.classList.contains('forja-compact')||document.documentElement.dataset.forjaMode==='edit';
  state.transform=new TransformControls(state.camera,canvas);
  state.transform.setMode('translate');
  state.scene.add(state.transform.getHelper());
  state.transform.addEventListener('dragging-changed',event=>{state.controls.enabled=!event.value});
  state.transform.addEventListener('objectChange',()=>{updateInspector()});
  state.transform.addEventListener('mouseUp',()=>{historyPush()});
  // Reentrada UX: visualizar sin gizmos; editar conserva selección e historial.
  document.addEventListener('forja:mode-change',event=>{
    const editing=event.detail?.mode==='edit';
    grid.visible=!document.documentElement.classList.contains('forja-compact')||editing;
    if(!editing)state.transform.detach();
    else{const chosen=state.objects.find(x=>x.uid===state.selected);if(chosen)state.transform.attach(chosen.root)}
  });
  window.addEventListener('resize',()=>{
    grid.visible=!document.documentElement.classList.contains('forja-compact')||document.documentElement.dataset.forjaMode==='edit';
  });
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
 const uri=ROOT+asset.file;
 const promise=gltfLoader.loadAsync(uri).catch(e=>{state.loadedModels.delete(asset.id);throw e});
 state.loadedModels.set(asset.id,promise);return promise;
}
async function addAsset(asset,opts={},silent=false){
 if(!state.webgl){toast('NO HAY WEBGL2: ABRÍ EN NAVEGADOR COMPATIBLE');return null}
 if(state.busy&&!silent)return null;
 const h=clamp(finite(opts.h,defaultHeight(asset)),.02,90);
 status('CARGANDO '+short(asset.id).toUpperCase());
 try{
  const data=await modelTemplate(asset);
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
  root.rotation.y=finite(opts.r);
  const components=Array.isArray(opts.s)?opts.s:[opts.s,opts.s,opts.s];
  root.scale.set(...components.map(x=>baseScale*clamp(finite(x,1),.05,20)));
  const mixer=data.animations.length?new THREE.AnimationMixer(model):null;
  if(mixer){const clip=data.animations.find(x=>/idle|walk|run/i.test(x.name))||data.animations[0];mixer.clipAction(clip).play()}
  const entry={uid,asset,h,root,baseScale,mixer,clips:data.animations};
  state.world.add(root);state.objects.push(entry);
  if(!silent){select(uid);historyPush();status('MODELO AÑADIDO · '+short(asset.id));toast('AÑADIDO: '+short(asset.id))}
  metrics();renderObjects();return entry;
 }catch(e){state.failed++;status('FALLÓ LA CARGA DE '+short(asset.id));toast('No se pudo cargar '+short(asset.id));console.warn('FORJA MODEL',asset.id,e);return null}
}
function select(uid){
 const e=state.objects.find(x=>x.uid===uid)||null;
 state.selected=e?.uid||null;
 state.transform?.detach();
 if(e)state.transform?.attach(e.root);
 updateInspector();renderObjects();
 if(e&&document.documentElement.classList.contains('forja-compact'))$('inspector-panel').classList.add('open');
}
function updateInspector(){
 const e=state.objects.find(x=>x.uid===state.selected);
 const inputs=['pos-x','pos-y','pos-z','rot','scale'];
 $('selected-title').textContent=e?short(e.asset.id).toUpperCase():'NINGUNO';
 $('selected-info').textContent=e?e.asset.packName+' · '+e.clips.length+' clips · CC0':'Tocá un objeto para editarlo';
 const values=e?[e.root.position.x,e.root.position.y,e.root.position.z,THREE.MathUtils.radToDeg(e.root.rotation.y),e.root.scale.x/e.baseScale]:[];
 inputs.forEach((id,i)=>{$(id).disabled=!e;$(id).value=e?String(Number(values[i].toFixed(3))):''});
 for(const id of ['delete','duplicate','focus'])$(id).disabled=!e;
}
function updateProperty(){
 const e=state.objects.find(x=>x.uid===state.selected);if(!e)return;
 const old=[e.root.position.x,e.root.position.y,e.root.position.z,THREE.MathUtils.radToDeg(e.root.rotation.y),e.root.scale.x/e.baseScale];
 const ids=['pos-x','pos-y','pos-z','rot','scale'];
 const a=ids.map((id,i)=>finite($(id).value,old[i]));
 e.root.position.set(clamp(a[0],-250,250),clamp(a[1],-80,150),clamp(a[2],-250,250));
 e.root.rotation.y=THREE.MathUtils.degToRad(clamp(a[3],-1440,1440));
 e.root.scale.setScalar(e.baseScale*clamp(a[4],.05,20));
 historyPush();updateInspector();
}
function removeSelected(){
 if(!state.selected)return;const at=state.objects.findIndex(x=>x.uid===state.selected);
 if(at<0)return;state.transform.detach();const [e]=state.objects.splice(at,1);
 state.world.remove(e.root);e.mixer?.stopAllAction();state.selected=null;
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
function resetCamera(){
 if(!state.objects.length){state.controls.target.set(0,1,0);state.camera.position.set(12,9,17);state.controls.update();return}
 const bounds=new THREE.Box3().setFromObject(state.world);
 const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const fovy=THREE.MathUtils.degToRad(state.camera.fov);
 const fovx=2*Math.atan(Math.tan(fovy/2)*Math.max(.35,state.camera.aspect));
 const halfHeight=Math.max(1,size.y*.55+size.z*.18),halfWidth=Math.max(1,size.x*.55+size.z*.25);
 const distance=Math.min(180,Math.max(10,halfHeight/Math.tan(fovy/2),halfWidth/Math.tan(fovx/2))*1.18);
 state.controls.target.copy(center);
 state.camera.position.copy(center).add(new THREE.Vector3(.9,.7,1).normalize().multiplyScalar(distance));
 state.controls.maxDistance=Math.max(110,distance*1.6);
 state.camera.far=Math.max(240,distance*6);
 state.camera.updateProjectionMatrix();state.controls.update();
}
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
 if(input.schema!==SCHEMA)throw Error('ESQUEMA NO COMPATIBLE');
 const seen=new Set();
 const out=input.items.map(v=>{
  const n=normItem(v);if(!n)throw Error('MODELO NO EXISTE EN EL CATÁLOGO: '+String(v?.id));
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
 const previous=snapshot();
 const oldName=state.sceneName;
 try{
  state.transform?.detach();state.selected=null;
  for(const e of state.objects){state.world.remove(e.root);e.mixer?.stopAllAction()}
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
  metrics();renderObjects();resetCamera();
  if(remember){state.busy=false;historyPush();state.busy=true}else saveLocal();
  toast('ESCENA LISTA: '+loaded+' / '+safe.items.length+' OBJETOS');
  if(loaded!==safe.items.length)status('ESCENA PARCIAL · '+(safe.items.length-loaded)+' FALTANTES');
  else status('ESCENA EDITABLE · '+loaded+' OBJETOS');
  return true;
 }catch(e){console.error(e);toast('ERROR AL ABRIR ESCENA');
  for(const prior of state.objects){state.world.remove(prior.root);prior.mixer?.stopAllAction()}
  state.objects=[];state.selected=null;state.sceneName=oldName;$('scene-name').value=oldName;
  for(const item of previous.items){const asset=state.byId.get(item.id);if(asset)await addAsset(asset,item,true)}
  metrics();renderObjects();updateInspector();return false;
 }finally{setBusy(false);setLoading(false);historyButtons()}
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
 const items=p.items.filter(x=>state.byId.has(x[0])).map(([id,x,y,z,h,r],i)=>({uid:'preset-'+i+'-'+key,id,p:[x,y,z],h,r,s:1}));
 return {schema:SCHEMA,name:p.name,items};
}
function download(content,name,mime){
 const bytes=content instanceof Blob?content:new Blob([content],{type:mime});
 const url=URL.createObjectURL(bytes),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),12000);
}
function exportJSON(){
 const out={...snapshot(),source:{repo:'Hidencod/tge-assets',commit:SOURCE_SHA,license:'CC0'},savedAt:new Date().toISOString()};
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
let pageSize=60;
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
  const img=document.createElement('img');img.loading='lazy';img.alt='';img.src=ROOT+m.thumb;
  img.onerror=()=>{img.onerror=null;img.removeAttribute('src');img.style.background='#394f43'};
  const t=document.createElement('strong');t.textContent=m.name;
  const meta=document.createElement('small');meta.textContent=m.packName;
  const plus=document.createElement('span');plus.className='add-symbol';plus.textContent='+';
  b.append(img,t,meta,plus);
  b.addEventListener('click',async()=>{await addAsset(m,{p:[(state.objects.length%5-2)*1.5,0,3]});
   if(document.documentElement.classList.contains('forja-compact'))$('library-panel').classList.remove('open')});
  b.addEventListener('dragstart',e=>e.dataTransfer.setData('text/forja-asset-id',m.id));
  f.append(b);
 }
 $('asset-list').replaceChildren(f);
 $('more-assets').disabled=matches.length<=pageSize;
 $('more-assets').textContent=matches.length>pageSize?'VER MÁS ('+Math.min(pageSize,matches.length)+' / '+matches.length+')':'TODOS LOS RESULTADOS';
}
async function initCatalog(){
 status('RECUPERANDO 1.883 MODELOS');init3D();
 try{
  const res=await fetch(ROOT+'catalog.json',{cache:'force-cache'});
  if(!res.ok)throw Error('HTTP_'+res.status);
  const raw=await res.json();
  if(!Array.isArray(raw.packs))throw Error('CATÁLOGO INVÁLIDO');
  state.catalog=raw.packs.flatMap(pack=>(pack.models||[]).map(m=>({...m,pack:pack.id,packName:pack.name})));
  if(state.catalog.length!==1883)throw Error('CONTEO INESPERADO: '+state.catalog.length);
  state.byId=new Map(state.catalog.map(m=>[m.id,m]));
  for(const p of raw.packs){
   const o=document.createElement('option');o.value=p.id;o.textContent=p.name+' ('+p.models.length+')';$('pack').append(o);
  }
  $('model-total').textContent='1.883 GLB · 19 COLECCIONES';
  renderLibrary();status(state.webgl?'CATÁLOGO REAL · 1.883 RECURSOS':'CATÁLOGO 2D · WEBGL2 NO DISPONIBLE');
  let prev=null;try{prev=JSON.parse(localStorage.getItem(STORAGE)||'null')}catch{}
  if(prev?.schema===SCHEMA&&Array.isArray(prev.items)){
   // Un proyecto vacío guardado es una decisión válida: no se pisa con un preset.
   if(prev.items.length)await replaceScene(prev,{remember:false});
   else{
    state.sceneName=String(prev.name||'Escena sin título').slice(0,64);
    $('scene-name').value=state.sceneName;
    metrics();
   }
  }else if(state.webgl){
   // Primera visita: mostrar una obra real, no un editor vacío con paneles.
   await replaceScene(makePreset('barrio'),{remember:false});
  }
  state.history=[snapshot()];state.cursor=0;historyButtons();
 }catch(e){status('FALLÓ EL CATÁLOGO · '+e.message);toast('NO PUDO LEER EL CATÁLOGO');console.error(e)}
}
function wire(){
 $('search').addEventListener('input',()=>{pageSize=60;renderLibrary()});
 $('pack').addEventListener('change',()=>{pageSize=60;renderLibrary()});
 $('more-assets').addEventListener('click',()=>{pageSize+=60;renderLibrary()});
 document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{if(state.busy)return;replaceScene(makePreset(b.dataset.preset))}));
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
 $('snap').addEventListener('click',snap);
 $('camera-reset').addEventListener('click',resetCamera);
 $('play-animations').addEventListener('click',()=>{state.playing=!state.playing;metrics()});
 $('scene-name').addEventListener('change',e=>{state.sceneName=(e.target.value.trim()||'Escena sin título').slice(0,64);historyPush();metrics()});
 for(const id of ['pos-x','pos-y','pos-z','rot','scale'])$(id).addEventListener('change',updateProperty);
 $('undo').addEventListener('click',async()=>{if(state.busy||state.cursor<=0)return;state.cursor--;await replaceScene(state.history[state.cursor],{remember:false});historyButtons()});
 $('redo').addEventListener('click',async()=>{if(state.busy||state.cursor>=state.history.length-1)return;state.cursor++;await replaceScene(state.history[state.cursor],{remember:false});historyButtons()});
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
  try{localStorage.removeItem(STORAGE);toast('AUTO-GUARDADO ELIMINADO; ESTA ESCENA SIGUE ABIERTA')}catch{toast('NO SE PUDO BORRAR')}
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
 diagnostic:()=>({schema:'prometeo.forja.diagnostic/v1',webgl2:state.webgl,catalog:state.catalog.length,loadedTemplates:state.loadedModels.size,instances:state.objects.length,clips:state.objects.reduce((n,e)=>n+e.clips.length,0),failed:state.failed,sourceCommit:SOURCE_SHA,saved:!!localStorage.getItem(STORAGE),note:'No sustituye validación visual en navegador con GPU'}),
 snapshot,loadPreset:async name=>replaceScene(makePreset(name)),add:async id=>addAsset(state.byId.get(id)),export:exportJSON
};
