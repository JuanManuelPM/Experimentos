import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {SCHEMA, MAX_ASSET_BYTES, validateDocument, sampleTrack, putKey, compareDocuments, round, clamp} from './scene-core.mjs';

const $ = id => document.getElementById(id);
const v3 = arr => new THREE.Vector3().fromArray(arr);
const q4 = arr => new THREE.Quaternion().fromArray(arr);
const fn = (n,d=0) => Number.isFinite(Number(n)) ? Number(n) : d;
const uid = () => 'n_' + crypto.randomUUID().replace(/-/g,'').slice(0,18);
const SOURCE_SHA = '3ddcc695adbba9fb918cf31b7c139b3f95b76910';
const ASSET_BASE = 'https://raw.githubusercontent.com/Hidencod/tge-assets/' + SOURCE_SHA + '/';
const STORAGE = 'prometeo.forja.escena.09.v2';
const loader = new GLTFLoader();
const scene = new THREE.Scene();
scene.background = new THREE.Color('#27362f');
scene.fog = new THREE.Fog('#27362f',32,100);
const world = new THREE.Group(); world.name = 'FORJA_ESCENA'; scene.add(world);
const editorCamera = new THREE.PerspectiveCamera(48,1,.03,350);
editorCamera.position.set(10,7,12);
const renderer = new THREE.WebGLRenderer({canvas:$('canvas'),antialias:true,powerPreference:'default'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const orbit = new OrbitControls(editorCamera,$('canvas'));
orbit.enableDamping=true;orbit.dampingFactor=.07;orbit.target.set(0,1.1,0);
orbit.minDistance=.45;orbit.maxDistance=120;
const gizmo = new TransformControls(editorCamera,$('canvas'));
scene.add(gizmo.getHelper());
gizmo.setMode('translate');
const ground = new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:'#283e31',roughness:1}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.012;ground.receiveShadow=true;scene.add(ground);
const grid = new THREE.GridHelper(160,160,'#587866','#3e5848');
grid.position.y=.005;grid.material.opacity=.28;grid.material.transparent=true;scene.add(grid);
scene.add(new THREE.HemisphereLight('#c5dbee','#4b5342',1.9));
const studioLight = new THREE.DirectionalLight('#f0d1a6',2.5);studioLight.position.set(-10,16,7);studioLight.castShadow=true;studioLight.shadow.mapSize.set(1024,1024);
studioLight.shadow.camera.left=-18;studioLight.shadow.camera.right=18;studioLight.shadow.camera.top=18;studioLight.shadow.camera.bottom=-18;scene.add(studioLight);
const fillLight = new THREE.DirectionalLight('#8ec2b5',.8);fillLight.position.set(11,6,-11);scene.add(fillLight);
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), clock = new THREE.Clock();
const assets = new Map(), tracks = new Map();
let selected = null, playing = false, previewCamera = null, duration=8, time=0, busy=false;
let projectName='Estudio cinético',history=[],cursor=-1,lastPointer=null,modelCount=0,booted=false;
const status = text => { $('status').textContent=text; };
const activeCamera = () => previewCamera || editorCamera;
const setBusy=(yes,message='')=>{busy=yes;$('overlay').hidden=!yes;$('overlay').textContent=message||'PROCESANDO PROYECTO';};
function numberText(n){return round(n).toFixed(2);}
function setTransform(o,data){
  o.name=String(data.name||o.name||data.kind).slice(0,80);
  o.userData.editId=data.uid; o.userData.kind=data.kind;
  o.position.fromArray(data.p);o.quaternion.fromArray(data.q);o.scale.fromArray(data.s);
}
function transformOf(o){return {p:o.position.toArray().map(round),q:o.quaternion.toArray().map(round),s:o.scale.toArray().map(round)}}
function makePrimitive(shape,color='#c69d65'){
  let geometry;
  if(shape==='sphere')geometry=new THREE.SphereGeometry(.58,32,20);
  else if(shape==='torus')geometry=new THREE.TorusGeometry(.8,.16,18,72);
  else if(shape==='cylinder')geometry=new THREE.CylinderGeometry(.5,.6,1.25,36);
  else geometry=new THREE.BoxGeometry(1,1,1);
  const mesh=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({color,metalness:.22,roughness:.32,clearcoat:.36,clearcoatRoughness:.25}));
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.shape=shape;
  return mesh;
}
function makeKind(kind,n={}){
  let o;
  if(kind==='primitive')o=makePrimitive(n.shape||'box',n.color||'#c69d65');
  else if(kind==='light'){
    o=n.lightType==='directional'?new THREE.DirectionalLight(n.color||'#fff0d6',n.intensity??2):new THREE.PointLight(n.color||'#f5d5a2',n.intensity??18,100);
  }else if(kind==='camera')o=new THREE.PerspectiveCamera(n.fov||50,1,.03,300);
  else o=new THREE.Group();
  return o;
}
function markGLBTree(o){
  o.userData.editId=uid();o.userData.kind='glb-child';
  o.children.forEach(markGLBTree);
}
function makeNode(kind,name){
  const o=makeKind(kind,{shape:kind==='primitive'?'box':null});
  o.name=name||kind;o.userData.editId=uid();o.userData.kind=kind;
  return o;
}
function encode(buffer){
  const bytes=new Uint8Array(buffer);let output='';
  for(let i=0;i<bytes.length;i+=8192) output+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(output);
}
function decode(data){
  const str=atob(data),out=new Uint8Array(str.length);
  for(let i=0;i<str.length;i++)out[i]=str.charCodeAt(i);
  return out.buffer;
}
function countAssets(){let total=0;for(const b64 of assets.values())total+=Math.floor(b64.length*.75);return total}
async function parseGLB(base64){
  const result=await loader.parseAsync(decode(base64),'');
  const root=result.scene;
  markGLBTree(root);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  return root;
}
function captureNode(o){
  const kind=o.userData.kind||'group';
  const n={uid:o.userData.editId,kind,name:o.name||kind,...transformOf(o),children:o.children.map(captureNode)};
  if(kind==='primitive'){n.shape=o.userData.shape||'box';n.color='#'+o.material.color.getHexString()}
  if(kind==='light'){n.lightType=o.isDirectionalLight?'directional':'point';n.intensity=round(o.intensity);n.color='#'+o.color.getHexString()}
  if(kind==='camera')n.fov=round(o.fov);
  if(kind==='glb')n.asset=o.userData.assetKey;
  return n;
}
function collectUsed(nodes,result=new Set()){
  for(const n of nodes){if(n.kind==='glb')result.add(n.asset);collectUsed(n.children,result)}
  return result;
}
function documentNow(){
  const nodes=world.children.map(captureNode);
  const used=collectUsed(nodes);
  return {schema:SCHEMA,name:projectName,duration:round(duration),time:round(time),assets:Object.fromEntries([...used].map(id=>[id,assets.get(id)])),nodes,tracks:[...tracks].map(([nodeId,keys])=>({uid:nodeId,keys:JSON.parse(JSON.stringify(keys))})).sort((a,b)=>a.uid.localeCompare(b.uid)),source:{editor:'FORJA Escena 09',originalForja:'prometeo.forja.scene/v1',three:'0.181.0'}};
}
function captureCompact(){const o=documentNow();delete o.assets;return JSON.stringify(o)}
function cacheDocument(){
  try{
    const json=JSON.stringify(documentNow());
    if(json.length>2_600_000){$('save-status').textContent='EXPORTÁ JSON: SUPERA ALMACENAMIENTO LOCAL';return;}
    localStorage.setItem(STORAGE,json);$('save-status').textContent='AUTOGUARDADO LOCAL';
  }catch(e){$('save-status').textContent='SIN AUTOGUARDADO: EXPORTÁ JSON'}
}
function historyButtons(){$('undo').disabled=busy||cursor<=0;$('redo').disabled=busy||cursor>=history.length-1}
function commit(label){
  if(busy)return;
  const compact=captureCompact();
  if(history[cursor]===compact)return;
  history=history.slice(0,cursor+1);history.push(compact);
  if(history.length>35)history.shift();
  cursor=history.length-1;historyButtons();cacheDocument();
  if(label)status(label);
}
function findById(id){let found=null;world.traverse(o=>{if(o.userData.editId===id)found=o});return found}
function countNodes(){let n=0;world.traverse(o=>{if(o!==world)n++});return n}
function isDescendant(parent,possibleChild){let p=parent;while(p&&p!==scene){if(p===possibleChild)return true;p=p.parent}return false}
function setSelected(o){
  selected=o||null;gizmo.detach();
  if(o&&!previewCamera)gizmo.attach(o);
  drawTree();showInspector();drawKeys();
}
function drawTree(){
  const f=document.createDocumentFragment();let n=0;
  const draw=(o,depth)=>{
    n++;const b=document.createElement('button');b.className='tree-row'+(selected===o?' active':'');b.type='button';b.setAttribute('role','treeitem');
    b.style.paddingLeft=(7+Math.min(depth,18)*13)+'px';
    const icon=document.createElement('span');icon.className='tree-icon';
    icon.textContent=o.userData.kind==='glb'?'⬡':o.userData.kind==='light'?'☼':o.userData.kind==='camera'?'◉':o.userData.kind==='primitive'?'◆':'◇';
    const name=document.createElement('span');name.textContent=o.name||o.type;
    b.append(icon,name);b.onclick=()=>setSelected(o);f.append(b);
    for(const c of o.children)draw(c,depth+1);
  };
  world.children.forEach(o=>draw(o,0));$('tree').replaceChildren(f);
  $('node-count').textContent=n+' NODOS';
}
function showInspector(){
  const o=selected;
  $('no-selection').hidden=!!o;$('properties').hidden=!o;
  if(!o)return;
  $('node-name').value=o.name;
  const p=o.position,r=o.rotation,s=o.scale;
  const vals={px:p.x,py:p.y,pz:p.z,rx:THREE.MathUtils.radToDeg(r.x),ry:THREE.MathUtils.radToDeg(r.y),rz:THREE.MathUtils.radToDeg(r.z),sx:s.x,sy:s.y,sz:s.z};
  for(const [id,x] of Object.entries(vals))$(id).value=String(round(x));
  const options=$('parent');options.replaceChildren();
  const add=(id,text)=>{const op=document.createElement('option');op.value=id;op.textContent=text;options.append(op)};
  add('root','ESCENA');
  world.traverse(p=>{
    if(p===world||p===o||isDescendant(p,o))return;
    if(p.userData.kind==='group'||p.userData.kind==='glb')add(p.userData.editId,p.name);
  });
  options.value=o.parent===world?'root':o.parent?.userData.editId||'root';
  const protectedChild=o.userData.kind==='glb-child';
  options.disabled=protectedChild;
  $('material-field').hidden=!o.isMesh||o.userData.kind!=='primitive';
  if(o.isMesh&&o.material?.color)$('material-color').value='#'+o.material.color.getHexString();
  $('intensity-field').hidden=!o.isLight;
  if(o.isLight)$('intensity').value=String(o.intensity);
  $('fov-field').hidden=!o.isPerspectiveCamera;
  if(o.isPerspectiveCamera)$('fov').value=String(o.fov);
  $('duplicate').disabled=protectedChild;
  $('remove').disabled=protectedChild;
}
function drawKeys(){
  const lane=$('key-lane');lane.replaceChildren();
  const keys=selected?tracks.get(selected.userData.editId)||[]:[];
  for(const key of keys){
    const b=document.createElement('button');b.className='key-marker';b.type='button';
    b.style.left=String(key.t/duration*100)+'%';b.title='Ir a '+numberText(key.t)+' s';
    b.onclick=()=>seek(key.t);lane.append(b);
  }
  $('key').disabled=!selected;
  $('del-key').disabled=!selected||!keys.some(k=>Math.abs(k.t-time)<.02);
}
function updateTimeUI(){
  $('time').textContent=numberText(time)+' s';$('scrub').value=String(time);drawKeys();
}
function seek(t){
  time=clamp(fn(t),0,duration);
  for(const [id,keys] of tracks){
    const o=findById(id),pose=sampleTrack(keys,time);if(!o||!pose)continue;
    o.position.fromArray(pose.p);o.quaternion.fromArray(pose.q);o.scale.fromArray(pose.s);
  }
  updateTimeUI();
  if(selected&&document.activeElement?.tagName!=='INPUT')showInspector();
}
function pause(){playing=false;$('play').textContent='▶ REPRODUCIR'}
function togglePlay(){playing=!playing;$('play').textContent=playing?'Ⅱ PAUSAR':'▶ REPRODUCIR'}
async function buildNode(n){
  let o;
  if(n.kind==='glb'){
    const base64=assets.get(n.asset);
    if(!base64)throw Error('Archivo GLB no incluido: '+n.asset);
    o=new THREE.Group();o.userData.assetKey=n.asset;
    const imported=await parseGLB(base64);
    if(n.children.length!==1)throw Error('Raíz GLB con estructura distinta');
    patchImported(imported,n.children[0]);
    o.add(imported);
  }else if(n.kind==='glb-child'){
    throw Error('Un nodo interno de GLB necesita su fuente original');
  }else{
    o=makeKind(n.kind,n);
    if(n.kind==='primitive')o.userData.shape=n.shape||'box';
    if(n.kind==='group')for(const child of n.children)o.add(await buildNode(child));
  }
  setTransform(o,n);
  return o;
}
function patchImported(o,n){
  if(n.kind!=='glb-child'||o.children.length!==n.children.length)throw Error('Cambió la topología interna del GLB');
  setTransform(o,n);
  n.children.forEach((child,i)=>patchImported(o.children[i],child));
}
async function loadDocument(input,{record=true}={}){
  validateDocument(input);
  const oldAssets=new Map(assets);
  try{
    for(const [k,v] of Object.entries(input.assets))assets.set(k,v);
    const staged=[];
    setBusy(true,'RECONSTRUYENDO ESCENA Y PIVOTES…');
    for(const n of input.nodes)staged.push(await buildNode(n));
    setSelected(null);
    world.clear();
    staged.forEach(o=>world.add(o));
    tracks.clear();
    input.tracks.forEach(t=>tracks.set(t.uid,t.keys));
    projectName=String(input.name||'Sin título').slice(0,64);
    $('project-name').value=projectName;
    duration=input.duration;
    $('duration').value=String(duration);$('scrub').max=String(duration);$('end-time').textContent=duration+' s';
    pause();time=0;seek(fn(input.time));
    drawTree();showInspector();setBusy(false);
    if(record)commit('PROYECTO ABIERTO · '+countNodes()+' NODOS');
    else status('ESCENA RESTAURADA · '+countNodes()+' NODOS');
    return true;
  }catch(e){
    assets.clear();oldAssets.forEach((v,k)=>assets.set(k,v));
    setBusy(false);status('ERROR DE IMPORTACIÓN: '+e.message);
    throw e;
  }
}
function newProject(){
  pause();setSelected(null);world.clear();tracks.clear();assets.clear();
  projectName='Escena sin título';$('project-name').value=projectName;
  duration=8;$('duration').value='8';$('scrub').max='8';$('end-time').textContent='8 s';seek(0);drawTree();commit('NUEVA ESCENA VACÍA');
}
function register(kind,name,parent=world){
  const o=makeNode(kind,name);
  parent.add(o);
  setSelected(o);commit('NODO CREADO · '+o.name);return o;
}
function addFromToolbar(value){
  pause();
  const parent=selected?.userData.kind==='group'?selected:world;
  const kinds={group:'group',box:'primitive',sphere:'primitive',torus:'primitive',cylinder:'primitive',point:'light',directional:'light',camera:'camera'};
  const kind=kinds[value];if(!kind)return;
  const label={group:'Grupo',box:'Volumen',sphere:'Esfera',torus:'Anillo',cylinder:'Columna',point:'Luz puntual',directional:'Luz direccional',camera:'Cámara de escena'}[value];
  let o;
  if(kind==='primitive'){
    o=makePrimitive(value,'#c69d65');o.userData.kind='primitive';o.userData.editId=uid();o.name=label;
  }else if(kind==='light'){
    o=makeKind('light',{lightType:value,intensity:value==='directional'?2:22});
    o.userData.kind='light';o.userData.editId=uid();o.name=label;o.position.set(1,4,2);
  }else o=makeNode(kind,label);
  parent.add(o);setSelected(o);commit('NODO CREADO · '+label);
}
function removeSelected(){
  if(!selected||selected.userData.kind==='glb-child')return;
  pause();const o=selected;
  const ids=new Set();o.traverse(item=>ids.add(item.userData.editId));
  for(const id of ids)tracks.delete(id);
  o.parent.remove(o);setSelected(null);commit('NODO ELIMINADO');
}
async function duplicateSelected(){
  if(!selected||selected.userData.kind==='glb-child')return;
  pause();const copy=captureNode(selected);
  const replaceIds=n=>{n.uid=uid();n.children.forEach(replaceIds)};
  replaceIds(copy);
  try{
    const cloned=await buildNode(copy);
    cloned.position.x+=1.2;selected.parent.add(cloned);setSelected(cloned);commit('NODO DUPLICADO');
  }catch(e){status('NO SE PUDO DUPLICAR: '+e.message)}
}
function updateProperty(){
  if(!selected)return;
  pause();
  const o=selected;
  o.position.set(fn($('px').value,o.position.x),fn($('py').value,o.position.y),fn($('pz').value,o.position.z));
  o.rotation.set(THREE.MathUtils.degToRad(fn($('rx').value)),THREE.MathUtils.degToRad(fn($('ry').value)),THREE.MathUtils.degToRad(fn($('rz').value)));
  o.scale.set(...['sx','sy','sz'].map(id=>{const v=fn($(id).value,1);return Math.abs(v)<.0001?.0001:v}));
  if(o.isPerspectiveCamera)o.updateProjectionMatrix();
  commit('TRANSFORMACIÓN ACTUALIZADA');showInspector();
}
function reparent(){
  const o=selected;if(!o||o.userData.kind==='glb-child')return;
  const id=$('parent').value,newParent=id==='root'?world:findById(id);
  if(!newParent||newParent===o||isDescendant(newParent,o))return;
  pause();newParent.attach(o);setSelected(o);commit('JERARQUÍA ACTUALIZADA SIN MOVER EL OBJETO');
}
function focusSelected(){
  if(!selected)return;
  previewCamera=null;orbit.enabled=true;gizmo.camera=editorCamera;gizmo.attach(selected);
  const box=new THREE.Box3().setFromObject(selected);
  const center=new THREE.Vector3(),size=new THREE.Vector3();
  if(box.isEmpty())center.copy(selected.getWorldPosition(center));
  else box.getCenter(center);
  box.getSize(size);
  const d=clamp(Math.max(size.length()*1.7,3),3,70);
  orbit.target.copy(center);editorCamera.position.copy(center).add(new THREE.Vector3(d*.7,d*.5,d));
  orbit.update();$('use-camera').classList.remove('active');
}
function chooseCamera(){
  if(previewCamera){previewCamera=null;orbit.enabled=true;gizmo.camera=editorCamera;if(selected)gizmo.attach(selected);$('use-camera').classList.remove('active');resize();status('VISTA DE EDICIÓN');return}
  let found=null;world.traverse(o=>{if(o.isPerspectiveCamera&&!found)found=o});
  if(!found){status('AGREGÁ UNA CÁMARA A LA ESCENA');return}
  previewCamera=found;gizmo.detach();orbit.enabled=false;
  $('use-camera').classList.add('active');resize();status('VISTA DESDE '+found.name);
}
function setMode(mode){
  gizmo.setMode(mode);
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
}
function addKey(){
  if(!selected)return;
  pause();
  const id=selected.userData.editId,keys=tracks.get(id)||[];
  tracks.set(id,putKey(keys,{t:round(time),...transformOf(selected)}));
  drawKeys();commit('KEYFRAME · '+numberText(time)+' s');
}
function deleteKey(){
  if(!selected)return;
  pause();
  const id=selected.userData.editId,keys=tracks.get(id)||[];
  const remaining=keys.filter(k=>Math.abs(k.t-time)>=.02);
  if(remaining.length===keys.length)return;
  if(remaining.length)tracks.set(id,remaining);else tracks.delete(id);
  drawKeys();commit('KEYFRAME ELIMINADO');
}
async function testRoundTrip(){
  pause();const before=documentNow();
  try{
    validateDocument(before);
    await loadDocument(before,{record:false});
    const after=documentNow();
    const matches=compareDocuments(before,after);
    status(matches?'PASS · IDA/VUELTA: NODOS, PIVOTES, TIEMPOS Y GLB IDÉNTICOS':'FAIL · DIFERENCIAS EN SERIALIZACIÓN');
    if(!matches)console.warn('FORJA ROUNDTRIP',before,after);
    return matches;
  }catch(e){status('FAIL · IDA/VUELTA: '+e.message);return false}
}
async function importGLB(file){
  if(!file)return;
  if(file.size>MAX_ASSET_BYTES-countAssets())throw Error('Límite total de GLB: 24 MB');
  const buffer=await file.arrayBuffer(),data=encode(buffer);
  const key='asset_'+uid();
  assets.set(key,data);
  const glb=await parseGLB(data);
  const group=new THREE.Group();
  group.name=file.name.replace(/\.glb$/i,'').slice(0,80)||'GLB importado';
  group.userData.kind='glb';group.userData.editId=uid();group.userData.assetKey=key;
  group.add(glb);
  world.add(group);setSelected(group);commit('GLB IMPORTADO · '+file.name);
}
function download(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
}
function saveProject(){
  pause();
  try{
    const doc=documentNow();validateDocument(doc);
    const blob=new Blob([JSON.stringify(doc,null,2)],{type:'application/json'});
    download(blob,'forja-escena-09-'+new Date().toISOString().slice(0,10)+'.json');
    status('PROYECTO EXPORTADO · '+countNodes()+' NODOS · '+blob.size.toLocaleString('es-AR')+' BYTES');
  }catch(e){status('NO SE PUDO EXPORTAR: '+e.message)}
}
async function migrateLegacy(old){
  if(!Array.isArray(old.items)||old.items.length>45)throw Error('FORJA v1: máximo 45 instancias por importación');
  const response=await fetch(ASSET_BASE+'catalog.json');
  if(!response.ok)throw Error('No se pudo consultar catálogo CC0 histórico');
  const catalogue=await response.json();
  const byId=new Map(catalogue.packs.flatMap(p=>p.models.map(m=>[m.id,m])));
  const staged=new THREE.Group(),newAssets={};
  for(let i=0;i<old.items.length;i++){
    const item=old.items[i],model=byId.get(item.id);
    if(!model?.file)throw Error('No existe el modelo original: '+item.id);
    const key='legacy_'+item.id.replace(/[^a-zA-Z0-9]/g,'_');
    let data=newAssets[key]||assets.get(key);
    if(!data){
      const r=await fetch(ASSET_BASE+model.file);
      if(!r.ok)throw Error('No se pudo recuperar '+item.id);
      const bytes=await r.arrayBuffer();
      data=encode(bytes);newAssets[key]=data;
    }
    const glb=await parseGLB(data);
    const box=new THREE.Box3().setFromObject(glb),dim=new THREE.Vector3(),center=new THREE.Vector3();
    box.getSize(dim);box.getCenter(center);
    if(dim.y<.00001)throw Error('Modelo sin altura '+item.id);
    const group=new THREE.Group();group.userData.kind='glb';group.userData.editId=uid();group.userData.assetKey=key;group.name=item.id;
    glb.position.set(-center.x,-box.min.y,-center.z);
    group.add(glb);
    const p=Array.isArray(item.p)?item.p:[0,0,0];
    group.position.set(fn(p[0]),fn(p[1]),fn(p[2]));
    group.rotation.y=fn(item.r);
    const base=fn(item.h,2)/dim.y;
    const s=Array.isArray(item.s)?item.s:[item.s??1,item.s??1,item.s??1];
    group.scale.set(...s.map(x=>clamp(fn(x,1)*base,.001,300)));
    staged.add(group);
    status('IMPORTANDO FORJA V1 · '+(i+1)+' / '+old.items.length);
  }
  const nodes=staged.children.map(captureNode);
  return {schema:SCHEMA,name:String(old.name||'FORJA v1 migrada').slice(0,64),duration:8,time:0,assets:{...Object.fromEntries(assets),...newAssets},nodes,tracks:[],source:{editor:'FORJA Escena 09',migratedFrom:'prometeo.forja.scene/v1',catalogueCommit:SOURCE_SHA,limitation:'Clips originales GLB no se convierten a tracks de keyframes nuevos'}};
}
function buildDemo(){
  pause();assets.clear();tracks.clear();world.clear();setSelected(null);
  projectName='SALA DE RESONANCIA';$('project-name').value=projectName;
  duration=8;$('duration').value='8';$('scrub').max='8';$('end-time').textContent='8 s';
  const group=makeNode('group','01 · Resonador / ensamblaje');
  const base=makePrimitive('cylinder','#364b42');base.name='Pedestal cerámico';base.userData.kind='primitive';base.userData.editId=uid();base.position.y=.28;base.scale.set(2.7,.45,2.7);
  const ring=makePrimitive('torus','#caa66c');ring.name='Aro principal / animado';ring.userData.kind='primitive';ring.userData.editId=uid();ring.position.y=2.1;ring.scale.set(1.4,1.4,1.4);
  const ring2=makePrimitive('torus','#afc6bb');ring2.name='Órbita transversal';ring2.userData.kind='primitive';ring2.userData.editId=uid();ring2.rotation.y=Math.PI/2;ring2.position.y=2.1;ring2.scale.set(1.08,1.08,1.08);
  const nucleus=makePrimitive('sphere','#e8c599');nucleus.name='Núcleo / cobre';nucleus.userData.kind='primitive';nucleus.userData.editId=uid();nucleus.position.y=2.1;nucleus.scale.set(.54,.54,.54);
  group.add(base,ring,ring2,nucleus);
  const light=makeNode('light','Luz de acento');light.position.set(2.5,4.5,2);light.intensity=27;
  const sceneCamera=makeNode('camera','Plano principal / 45°');sceneCamera.position.set(6,4.5,7);sceneCamera.lookAt(0,1.5,0);
  world.add(group,light,sceneCamera);
  const key0={t:0,...transformOf(ring)},key8={t:8,p:key0.p.slice(),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI*.98,0)).toArray(),s:key0.s.slice()};
  tracks.set(ring.userData.editId,[key0,key8]);
  const orb0={t:0,...transformOf(ring2)},orb8={t:8,p:orb0.p.slice(),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI*.98,Math.PI/2,0)).toArray(),s:orb0.s.slice()};
  tracks.set(ring2.userData.editId,[orb0,orb8]);
  seek(0);drawTree();setSelected(ring);commit('DEMO ORIGINAL · KEYFRAMES REALES');
}
function resize(){
  const rect=$('viewport').getBoundingClientRect(),w=Math.max(200,Math.floor(rect.width)),h=Math.max(140,Math.floor(rect.height));
  renderer.setSize(w,h,false);editorCamera.aspect=w/h;editorCamera.updateProjectionMatrix();
  if(previewCamera){previewCamera.aspect=w/h;previewCamera.updateProjectionMatrix()}
}
function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(.06,clock.getDelta());
  if(playing){time+=dt;if(time>duration)time=time%duration;seek(time)}
  orbit.update();renderer.render(scene,activeCamera());
}
gizmo.addEventListener('dragging-changed',e=>{orbit.enabled=!e.value&&!previewCamera;if(e.value)pause()});
gizmo.addEventListener('objectChange',()=>{if(selected)showInspector()});
gizmo.addEventListener('mouseUp',()=>{commit('TRANSFORMACIÓN DESDE GIZMO')});
const canvas=$('canvas');
canvas.addEventListener('pointerdown',e=>{lastPointer=[e.clientX,e.clientY]});
canvas.addEventListener('pointerup',e=>{
  if(!lastPointer||Math.hypot(e.clientX-lastPointer[0],e.clientY-lastPointer[1])>6||gizmo.dragging||busy){lastPointer=null;return}
  lastPointer=null;
  const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  raycaster.setFromCamera(pointer,activeCamera());
  const hits=raycaster.intersectObjects(world.children,true);
  const first=hits.find(h=>h.object.userData.editId);
  if(first)setSelected(first.object);
});
window.addEventListener('resize',resize);
new ResizeObserver(resize).observe($('viewport'));
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addFromToolbar(b.dataset.add));
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('deselect').onclick=()=>setSelected(null);
$('new').onclick=()=>newProject();
$('demo').onclick=()=>buildDemo();
$('save').onclick=()=>saveProject();
$('load').onclick=()=>$('json-file').click();
$('import-glb').onclick=()=>$('glb-file').click();
$('json-file').addEventListener('change',async e=>{
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  if(file.size>34*1024*1024){status('JSON DEMASIADO GRANDE');return}
  try{
    const input=JSON.parse(await file.text());
    const doc=input.schema==='prometeo.forja.scene/v1'?await migrateLegacy(input):input;
    await loadDocument(doc);
  }catch(err){status('NO SE PUDO ABRIR: '+err.message);console.error(err)}
});
$('glb-file').addEventListener('change',async e=>{
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  try{await importGLB(file)}catch(err){status('GLB NO IMPORTADO: '+err.message);console.error(err)}
});
$('project-name').addEventListener('change',e=>{projectName=e.target.value.trim().slice(0,64)||'Sin título';commit('NOMBRE ACTUALIZADO')});
$('node-name').addEventListener('change',e=>{if(!selected)return;selected.name=e.target.value.trim().slice(0,80)||'Nodo';drawTree();commit('NOMBRE DE NODO ACTUALIZADO')});
for(const id of ['px','py','pz','rx','ry','rz','sx','sy','sz'])$(id).addEventListener('change',updateProperty);
$('parent').addEventListener('change',reparent);
$('material-color').addEventListener('change',e=>{if(!selected?.isMesh||selected.userData.kind!=='primitive')return;selected.material.color.set(e.target.value);commit('MATERIAL ACTUALIZADO')});
$('intensity').addEventListener('change',e=>{if(!selected?.isLight)return;selected.intensity=clamp(fn(e.target.value,2),0,500);commit('INTENSIDAD ACTUALIZADA')});
$('fov').addEventListener('change',e=>{if(!selected?.isPerspectiveCamera)return;selected.fov=clamp(fn(e.target.value,50),12,110);selected.updateProjectionMatrix();commit('ÓPTICA ACTUALIZADA')});
$('remove').onclick=removeSelected;$('duplicate').onclick=duplicateSelected;$('focus').onclick=focusSelected;
$('reset-view').onclick=()=>{previewCamera=null;gizmo.camera=editorCamera;if(selected)gizmo.attach(selected);orbit.enabled=true;orbit.target.set(0,1,0);editorCamera.position.set(10,7,12);$('use-camera').classList.remove('active');resize();status('VISTA REINICIADA')};
$('use-camera').onclick=chooseCamera;
$('play').onclick=togglePlay;$('key').onclick=addKey;$('del-key').onclick=deleteKey;$('roundtrip').onclick=testRoundTrip;
$('scrub').addEventListener('input',e=>{pause();seek(Number(e.target.value))});
$('duration').addEventListener('change',e=>{
  const maxKey=Math.max(1,...[...tracks.values()].flatMap(keys=>keys.map(k=>k.t)));
  duration=clamp(Math.max(fn(e.target.value,8),maxKey),1,3600);
  e.target.value=String(duration);$('scrub').max=String(duration);$('end-time').textContent=duration+' s';
  seek(clamp(time,0,duration));commit('DURACIÓN ACTUALIZADA');
});
async function stepHistory(delta){
  const next=cursor+delta;if(busy||next<0||next>=history.length)return;
  const target=JSON.parse(history[next]),needed=collectUsed(target.nodes);
  target.assets=Object.fromEntries([...needed].map(k=>[k,assets.get(k)]));
  try{await loadDocument(target,{record:false});cursor=next;historyButtons();cacheDocument();status('HISTORIAL '+(cursor+1)+' / '+history.length)}catch(e){status('ERROR DE HISTORIAL: '+e.message)}
}
$('undo').onclick=()=>stepHistory(-1);$('redo').onclick=()=>stepHistory(1);
document.addEventListener('keydown',e=>{
  if(/input|textarea|select/i.test(document.activeElement?.tagName||''))return;
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&(e.code==='KeyZ'||e.code==='KeyY')){e.preventDefault();stepHistory(e.code==='KeyY'||e.shiftKey?1:-1);return}
  if(e.code==='KeyW')setMode('translate');if(e.code==='KeyE')setMode('rotate');if(e.code==='KeyR')setMode('scale');
  if(e.code==='Space'){e.preventDefault();togglePlay()}
  if(e.code==='Delete'||e.code==='Backspace')removeSelected();
  if(e.code==='Escape')setSelected(null);
});
async function start(){
  $('gpu').textContent=renderer.capabilities.isWebGL2?'GPU · WEBGL2':'GPU · WEBGL';
  resize();frame();
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(saved?.schema===SCHEMA){await loadDocument(saved,{record:false});history=[captureCompact()];cursor=0;historyButtons();status('AUTOGUARDADO RECUPERADO');}
    else{buildDemo();status('LISTO · DEMO ORIGINAL ABIERTA');}
  }catch(e){buildDemo();status('DEMO ABIERTA · RECUPERACIÓN LOCAL FALLÓ: '+e.message)}
  booted=true;
}
window.__FORJA_ESCENA_09__={
  diagnostic:()=>({schema:SCHEMA,ready:booted,nodes:countNodes(),assets:assets.size,tracks:tracks.size,duration,time,playing,sourceCommit:SOURCE_SHA,webgl2:renderer.capabilities.isWebGL2}),
  snapshot:documentNow,roundTrip:testRoundTrip,load:loadDocument,seek
};
start();
