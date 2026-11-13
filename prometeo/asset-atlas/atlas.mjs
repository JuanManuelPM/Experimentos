import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const SOURCE_SHA='3ddcc695adbba9fb918cf31b7c139b3f95b76910';
const SOURCE_ROOT='https://raw.githubusercontent.com/Hidencod/tge-assets/'+SOURCE_SHA+'/';
const $=id=>document.getElementById(id);
const locallyMirrored=new Set();
let catalog=[],active=null,allPacks=[],renderer=null,controls=null,model=null,mixer=null,loadSeq=0,clock=new THREE.Clock();
let camera,scene,fill,stageWidth=0,stageHeight=0,gpu=false;
const manager=new THREE.LoadingManager();
const loader=new GLTFLoader(manager);
const formatSize=n=>(n/1024).toFixed(1)+' KB';
const suffix=m=>m.id;
const thumbnail=m=>SOURCE_ROOT+m.thumb;
const uri=m=>locallyMirrored.has(m.id)?'./models/'+m.id+'.glb':SOURCE_ROOT+m.file;
const dis=msg=>{$('status').textContent=msg};
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function createRenderer(){
 const canvas=$('view');
 try{
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'default'});
  if(!gl)throw new Error('WEBGL2_UNAVAILABLE');
  renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true});
  renderer.setClearColor(0x18231e);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x202d29);
  scene.fog=new THREE.Fog(0x202d29,8,18);
  camera=new THREE.PerspectiveCamera(40,1,.01,80);camera.position.set(3.1,2.4,4.4);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=1;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.52;
  scene.add(new THREE.HemisphereLight(0xdde8ff,0x6b5947,2.1));
  fill=new THREE.DirectionalLight(0xf2cca1,2.7);fill.position.set(-3,6,5);scene.add(fill);
  const right=new THREE.DirectionalLight(0x9ec9c3,1.4);right.position.set(2,3,-4);scene.add(right);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(2.6,48),new THREE.MeshStandardMaterial({color:0x26392f,roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.018;scene.add(ground);
  scene.userData.ground=ground;
  gpu=true;dis('WEBGL2 / LISTO');
 }catch(e){gpu=false;canvas.style.display='none';dis('SIN WEBGL · VISTA 2D');$('metadata').textContent='El navegador no tiene WebGL2; las miniaturas siguen funcionando.';}
}
function resize(){
 if(!gpu||!renderer)return;
 const s=$('stage'),w=Math.max(100,s.clientWidth),h=Math.max(100,s.clientHeight);
 if(w!==stageWidth||h!==stageHeight){stageWidth=w;stageHeight=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
}
function set2D(m){
 $('stage').querySelector('#static-preview')?.remove();
 if(gpu)return;
 const im=document.createElement('img');im.id='static-preview';im.alt=m.name;im.src=thumbnail(m);
 im.style.cssText='position:absolute;inset:12% 22%;object-fit:contain;width:56%;height:70%;opacity:.9;pointer-events:none';
 $('stage').prepend(im);
}
async function show(m){
 const seq=++loadSeq;active=m;
 document.querySelectorAll('.asset').forEach(b=>b.classList.toggle('active',b.dataset.id===m.id));
 $('selection').textContent=m.name.toUpperCase();
 $('metadata').textContent=m.packName+' · CC0 · '+formatSize(m.size)+' · GLB';
 $('download').onclick=()=>{window.open(uri(m),'_blank','noopener,noreferrer')};
 set2D(m);
 if(!gpu)return;
 dis('CARGANDO GLB');
 try{
   let gltf;
   try{gltf=await loader.loadAsync(uri(m))}
   catch(err){if(locallyMirrored.has(m.id))gltf=await loader.loadAsync(SOURCE_ROOT+m.file);else throw err;}
   if(seq!==loadSeq)return;
   if(model)scene.remove(model);if(mixer)mixer.stopAllAction();
   model=new THREE.Group();const item=gltf.scene;
   const b=new THREE.Box3().setFromObject(item);const size=new THREE.Vector3();b.getSize(size);
   const center=new THREE.Vector3();b.getCenter(center);
   item.position.set(-center.x,-b.min.y,-center.z);model.add(item);
   const height=Math.max(size.x,size.y,size.z,0.00001);model.scale.setScalar(2/height);
   scene.add(model);
   mixer=gltf.animations.length?new THREE.AnimationMixer(item):null;
   if(mixer){mixer.clipAction(gltf.animations[0]).play();}
   const displayHeight=size.y*2/height;
   controls.target.set(0,displayHeight*.42,0);
   camera.position.set(2.6,Math.max(1.65,displayHeight*1.3),3.2);
   controls.update();
   dis('OK · '+(gltf.animations.length?gltf.animations.length+' CLIPS':'SIN ANIMACIONES'));
   $('metadata').textContent=m.packName+' · CC0 · '+formatSize(m.size)+' · '+gltf.animations.length+' clips';
 }catch(e){dis('NO SE PUDO CARGAR');$('metadata').textContent='Archivo original: '+m.file;console.warn('[ATLAS]',m.id,e);}
}
function list(){
 const q=$('search').value.trim().toLocaleLowerCase(),pack=$('pack').value;
 const filtered=catalog.filter(m=>(!pack||m.pack===pack)&&(!q||(m.name+' '+m.packName).toLowerCase().includes(q)));
 $('count').textContent=filtered.length.toLocaleString('es-AR')+' RESULTADOS · '+catalog.length.toLocaleString('es-AR')+' MODELOS DISPONIBLES · MOSTRANDO 120';
 const grid=$('grid');grid.replaceChildren();
 const fragment=document.createDocumentFragment();
 for(const m of filtered.slice(0,120)){
  const el=document.createElement('button');el.type='button';el.className='asset';el.dataset.id=m.id;
  el.setAttribute('aria-label','Inspeccionar '+m.name);
  el.innerHTML='<img loading="lazy" alt="" src="'+thumbnail(m)+'"><strong>'+escapeHTML(m.name)+'</strong><small>'+escapeHTML(m.packName)+'</small>';
  el.addEventListener('click',()=>show(m));fragment.append(el);
 }
 grid.append(fragment);
 if(active)document.querySelectorAll('.asset').forEach(b=>b.classList.toggle('active',b.dataset.id===active.id));
}
async function start(){
 createRenderer();
 try{
  const source=await (await fetch(SOURCE_ROOT+'catalog.json',{cache:'force-cache'})).json();
  allPacks=source.packs.map(p=>({id:p.id,name:p.name,count:p.models.length}));
  for(const p of allPacks){const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name+' ('+p.count+')';$('pack').append(opt);}
  catalog=source.packs.flatMap(p=>p.models.map(m=>({...m,pack:p.id,packName:p.name})));
  if(catalog.length!==1883)throw Error('INVENTORY_MISMATCH actual='+catalog.length);
  list();
  const first=catalog.find(m=>m.id==='furniture-kit/televisionvintage')||catalog[0];
  if(first)show(first);
 }catch(e){dis('ERROR DE INVENTARIO');$('count').textContent='Error: '+e.message;console.error(e);}
 $('search').addEventListener('input',list);$('pack').addEventListener('change',list);
 $('reset').addEventListener('click',()=>{if(active)show(active)});
}
function frame(){
 requestAnimationFrame(frame);
 const dt=Math.min(.07,clock.getDelta());
 if(gpu){resize();mixer?.update(dt);model&&(model.rotation.y+=dt*.08);controls.update();renderer.render(scene,camera);}
}
start();frame();
window.__ATLAS_DIAGNOSTICS__=()=>({catalogCount:catalog.length,packCount:allPacks.length,webgl2:gpu,selection:active?.id||null,animatedClips:mixer?mixer._actions.length:0,mirroredModels:locallyMirrored.size,sourceCommit:SOURCE_SHA});
